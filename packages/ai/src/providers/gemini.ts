import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AIProvider, AIOptions } from './index';
import { normalizeAIError } from '../errors';
import { DEFAULT_MAX_OUTPUT_TOKENS } from '../prompt-budget';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  readonly managesCredentialRotation = true;
  private readonly clients: GoogleGenerativeAI[];
  private readonly modelCandidates: string[];
  private activeModelName: string;

  get modelName() { return this.activeModelName; }

  constructor(apiKeys?: string | string[], modelName = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite') {
    const keys = parseGeminiApiKeys(apiKeys);
    if (keys.length === 0) {
      throw new Error('GEMINI_API_KEYS or GEMINI_API_KEY is not set');
    }

    this.clients = keys.map((key) => new GoogleGenerativeAI(key));
    this.modelCandidates = getGeminiModelCandidates(modelName);
    this.activeModelName = this.modelCandidates[0];
  }

  async generate<T>(prompt: string, schema: z.ZodSchema<T>, options?: AIOptions) {
    const start = Date.now();
    
    // We must convert Zod schema to Gemini's Schema format
    // A simplified conversion using zod-to-json-schema (or we can just rely on JSON format instruction + zod parse)
    // Gemini supports responseSchema since v0.13.0, but passing raw JSON schema from zodToJsonSchema might need mapping.
    // To keep it robust, we'll ask for JSON and just parse it, or pass the JSON schema directly.
    const jsonSchema = zodToJsonSchema(schema as any) as object;
    
    // As of latest SDK, we can pass responseSchema. But to be safe and simple, we'll instruct JSON and parse.
    // Actually, passing `responseSchema` is best if the SDK supports it.
    
    // Provide the JSON schema in the prompt to guide the model
    const fullPrompt = `${prompt}\n\nYou MUST return ONLY valid JSON matching this schema:\n${JSON.stringify(jsonSchema, null, 2)}`;

    const startIndex = nextGeminiStartIndex(this.clients.length);
    let result: Awaited<ReturnType<ReturnType<GoogleGenerativeAI['getGenerativeModel']>['generateContent']>> | undefined;
    let lastError: ReturnType<typeof normalizeAIError> | undefined;

    const orderedModels = [this.activeModelName, ...this.modelCandidates.filter((model) => model !== this.activeModelName)];
    modelLoop: for (const modelName of orderedModels) {
      let modelUnavailable = false;
      for (let offset = 0; offset < this.clients.length; offset++) {
        const clientIndex = (startIndex + offset) % this.clients.length;
        const model = this.clients[clientIndex].getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
          }
        });

        try {
          result = await model.generateContent(fullPrompt);
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
        }
      }
      if (!modelUnavailable && !result) throw lastError;
    }

    if (!result) {
      throw lastError || new Error(`Gemini request failed across ${this.clients.length} configured credential slots`);
    }

    const response = result.response;
    const text = response.text();
    
    const latencyMs = Date.now() - start;
    
    try {
      const parsed = JSON.parse(text);
      const data = schema.parse(parsed);
      
      return {
        data,
        tokens: {
          input: response.usageMetadata?.promptTokenCount || 0,
          output: response.usageMetadata?.candidatesTokenCount || 0
        },
        latencyMs
      };
    } catch (e: unknown) {
      console.error('Failed to parse Gemini output:', text);
      throw new Error(`Gemini parse error: ${e instanceof Error ? e.message : 'Invalid structured output'}`);
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
  return [...new Set([configuredModel.trim(), 'gemini-3.1-flash-lite', 'gemini-flash-lite-latest'].filter(Boolean))];
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
