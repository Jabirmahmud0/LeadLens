import { Groq } from 'groq-sdk';
import { z } from 'zod';
import { AIProvider, AIOptions } from './index';
import { AIProviderError, normalizeAIError } from '../errors';
import { DEFAULT_MAX_OUTPUT_TOKENS } from '../prompt-budget';

const DEFAULT_AI_REQUEST_TIMEOUT_MS = 20_000;

export class GroqProvider implements AIProvider {
  name = 'groq';
  private groq: Groq;
  readonly modelName: string;

  constructor(apiKey?: string, modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b') {
    const key = apiKey || process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY is not set');
    
    const configuredTimeout = Number(process.env.AI_REQUEST_TIMEOUT_MS);
    const timeout = Number.isInteger(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : DEFAULT_AI_REQUEST_TIMEOUT_MS;
    this.groq = new Groq({ apiKey: key, timeout, maxRetries: 0 });
    this.modelName = modelName;
  }

  async generate<T>(prompt: string, schema: z.ZodSchema<T>, options?: AIOptions) {
    const start = Date.now();
    const jsonSchema = z.toJSONSchema(schema);
    
    const fullPrompt = `${prompt}\n\nYou MUST return ONLY valid JSON matching this schema:\n${JSON.stringify(jsonSchema, null, 2)}`;
    
    let completion;
    try {
      completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: fullPrompt }],
        model: this.modelName,
        temperature: options?.temperature ?? 0.2,
        max_completion_tokens: options?.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' }
      });
    } catch (error) {
      throw normalizeAIError(this.name, error);
    }

    const choice = completion.choices[0];
    const text = choice?.message?.content || '';
    const latencyMs = Date.now() - start;

    try {
      const parsed = JSON.parse(text);
      const data = schema.parse(parsed);

      return {
        data,
        tokens: {
          input: completion.usage?.prompt_tokens || 0,
          output: completion.usage?.completion_tokens || 0
        },
        latencyMs
      };
    } catch (e: unknown) {
      console.error('Failed to parse Groq output:', text);
      throw new AIProviderError(
        `Groq returned output that does not match the expected schema: ${e instanceof Error ? e.message : 'Invalid structured output'}`,
        'AI_BAD_REQUEST',
        false,
        this.name
      );
    }
  }
}
