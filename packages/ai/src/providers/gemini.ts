import { GoogleGenerativeAI, Schema } from '@google/generative-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AIProvider, AIOptions } from './index';

export class GeminiProvider implements AIProvider {
  name = 'gemini';
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey?: string, modelName = 'gemini-2.5-flash') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set');
    
    this.genAI = new GoogleGenerativeAI(key);
    this.modelName = modelName;
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
    
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 8192,
      }
    });

    // Provide the JSON schema in the prompt to guide the model
    const fullPrompt = `${prompt}\n\nYou MUST return ONLY valid JSON matching this schema:\n${JSON.stringify(jsonSchema, null, 2)}`;
    
    const result = await model.generateContent(fullPrompt);
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
    } catch (e: any) {
      console.error('Failed to parse Gemini output:', text);
      throw new Error(`Gemini parse error: ${e.message}`);
    }
  }
}
