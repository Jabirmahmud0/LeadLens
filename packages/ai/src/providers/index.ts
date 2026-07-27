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
