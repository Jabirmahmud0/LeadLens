import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { AIProvider, AIOptions } from './index';
import { AIProviderError, normalizeAIError } from '../errors';
import { DEFAULT_MAX_OUTPUT_TOKENS } from '../prompt-budget';

const DEFAULT_AI_REQUEST_TIMEOUT_MS = 20_000;

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  readonly managesCredentialRotation = true;
  private readonly clients: GoogleGenAI[];
  private readonly modelCandidates: string[];
  private activeModelName: string;

  get modelName() { return this.activeModelName; }

  constructor(apiKeys?: string | string[], modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite') {
    const keys = parseGeminiApiKeys(apiKeys);
    if (keys.length === 0) {
      throw new Error('GEMINI_API_KEYS or GEMINI_API_KEY is not set');
    }

    const timeout = readPositiveInteger(process.env.AI_REQUEST_TIMEOUT_MS, DEFAULT_AI_REQUEST_TIMEOUT_MS);
    this.clients = keys.map((key) => new GoogleGenAI({
      apiKey: key,
      // LeadLens owns provider failover. A single SDK request must not silently
      // expand into another retry tree beneath it.
      httpOptions: { timeout, retryOptions: { attempts: 1 } },
    }));
    this.modelCandidates = getGeminiModelCandidates(modelName);
    this.activeModelName = this.modelCandidates[0];
  }

  async generate<T>(prompt: string, schema: z.ZodSchema<T>, options?: AIOptions) {
    const start = Date.now();
    
    const jsonSchema = z.toJSONSchema(schema);
    const fullPrompt = `${prompt}\n\nYou MUST return ONLY valid JSON matching this schema:\n${JSON.stringify(jsonSchema, null, 2)}`;

    const startIndex = nextGeminiStartIndex(this.clients.length);
    let result: Awaited<ReturnType<GoogleGenAI['models']['generateContent']>> | undefined;
    let lastError: ReturnType<typeof normalizeAIError> | undefined;

    const orderedModels = [this.activeModelName, ...this.modelCandidates.filter((model) => model !== this.activeModelName)];
    modelLoop: for (const modelName of orderedModels) {
      let modelUnavailable = false;
      for (let offset = 0; offset < this.clients.length; offset++) {
        const clientIndex = (startIndex + offset) % this.clients.length;
        const client = this.clients[clientIndex];

        try {
          result = await client.models.generateContent({
            model: modelName,
            contents: fullPrompt,
            config: {
              responseMimeType: 'application/json',
              maxOutputTokens: options?.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
            }
          });
          this.activeModelName = modelName;
          break modelLoop;
        } catch (error) {
          lastError = normalizeAIError(this.name, error);
          console.warn(`Gemini ${modelName} credential slot ${clientIndex + 1}/${this.clients.length} failed${safeStatus(error)} (${lastError.code})`);
          if (lastError.code === 'AI_MODEL_UNAVAILABLE') {
            modelUnavailable = true;
            break;
          }
          if (lastError.code === 'AI_INPUT_TOO_LARGE' || lastError.code === 'AI_BAD_REQUEST') throw lastError;
          // Quota and credential failures can be key-specific. Network, timeout,
          // and provider 5xx failures are not, so trying every key only stalls.
          if (lastError.code !== 'AI_RATE_LIMITED' && lastError.code !== 'AI_AUTH_FAILED') throw lastError;
        }
      }
      if (!modelUnavailable && !result) throw lastError;
    }

    if (!result) {
      throw lastError || new Error(`Gemini request failed across ${this.clients.length} configured credential slots`);
    }

    const text = result.text || '';
    
    const latencyMs = Date.now() - start;
    
    try {
      const parsed = JSON.parse(text);
      const data = schema.parse(parsed);
      
      return {
        data,
        tokens: {
          input: result.usageMetadata?.promptTokenCount || 0,
          output: result.usageMetadata?.candidatesTokenCount || 0
        },
        latencyMs
      };
    } catch (e: unknown) {
      console.error('Failed to parse Gemini output:', text);
      throw new AIProviderError(
        `Gemini returned output that does not match the expected schema: ${e instanceof Error ? e.message : 'Invalid structured output'}`,
        'AI_BAD_REQUEST',
        false,
        this.name
      );
    }
  }
}

let geminiRotationCursor = 0;

export function parseGeminiApiKeys(apiKeys?: string | string[]): string[] {
  const configured = apiKeys ?? process.env.GEMINI_API_KEYS ?? process.env.GEMINI_API_KEY ?? '';
  const values = Array.isArray(configured) ? configured : configured.split(',');
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function getGeminiModelCandidates(configuredModel: string): string[] {
  return [...new Set([configuredModel.trim(), 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'].filter(Boolean))];
}

export function nextGeminiStartIndex(poolSize: number): number {
  if (!Number.isInteger(poolSize) || poolSize < 1) {
    throw new Error('Gemini credential pool must contain at least one key');
  }
  const index = geminiRotationCursor % poolSize;
  geminiRotationCursor = (geminiRotationCursor + 1) % poolSize;
  return index;
}

function safeStatus(error: unknown): string {
  if (typeof error !== 'object' || error === null || !('status' in error)) return '';
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' || typeof status === 'string' ? ` (status ${status})` : '';
}

function readPositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
