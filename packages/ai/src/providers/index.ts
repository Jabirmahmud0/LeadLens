import { z } from 'zod';

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  maxPromptChars?: number;
}

export interface AIProvider {
  name: string;
  modelName: string;
  managesCredentialRotation?: boolean;
  generate<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: AIOptions
  ): Promise<{ data: T; tokens: { input: number; output: number }; latencyMs: number }>;
}

export function orderAIProviders(
  geminiProvider: AIProvider,
  groqProvider?: AIProvider,
  preferredProvider = process.env.AI_PRIMARY_PROVIDER,
): { primaryProvider: AIProvider; fallbackProvider?: AIProvider } {
  const preferred = preferredProvider?.trim().toLowerCase();
  if (preferred === 'groq' && groqProvider) {
    return { primaryProvider: groqProvider, fallbackProvider: geminiProvider };
  }
  return { primaryProvider: geminiProvider, fallbackProvider: groqProvider };
}
