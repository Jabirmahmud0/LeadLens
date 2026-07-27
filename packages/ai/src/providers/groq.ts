import { Groq } from 'groq-sdk';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AIProvider, AIOptions } from './index';

export class GroqProvider implements AIProvider {
  name = 'groq';
  private groq: Groq;
  readonly modelName: string;

  constructor(apiKey?: string, modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b') {
    const key = apiKey || process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY is not set');
    
    this.groq = new Groq({ apiKey: key });
    this.modelName = modelName;
  }

  async generate<T>(prompt: string, schema: z.ZodSchema<T>, options?: AIOptions) {
    const start = Date.now();
    const jsonSchema = zodToJsonSchema(schema as any);
    
    const fullPrompt = `${prompt}\n\nYou MUST return ONLY valid JSON matching this schema:\n${JSON.stringify(jsonSchema, null, 2)}`;
    
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: fullPrompt }],
      model: this.modelName,
      temperature: options?.temperature ?? 0.2,
      max_completion_tokens: options?.maxTokens ?? 8192,
      response_format: { type: 'json_object' }
    });

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
    } catch (e: any) {
      console.error('Failed to parse Groq output:', text);
      throw new Error(`Groq parse error: ${e.message}`);
    }
  }
}
