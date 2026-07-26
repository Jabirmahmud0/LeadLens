import { z } from 'zod';
import { db } from '@leadlens/database';
import { aiRuns } from '@leadlens/database/src/schema/ai';
import { AIOptions, AIProvider } from './providers';
import { createHash } from 'node:crypto';

export interface RunAIOptions extends AIOptions {
  jobId?: string;
  reportId?: string;
  organizationId: string;
  purpose: string;
  promptVersion: string;
  primaryProvider: AIProvider;
  fallbackProvider?: AIProvider;
  maxRetries?: number;
}

export async function runAI<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options: RunAIOptions
): Promise<T> {
  let attempt = 0;
  const maxRetries = options.maxRetries ?? 2;
  
  // Try primary provider
  while (attempt <= maxRetries) {
    try {
      const { data, tokens, latencyMs } = await options.primaryProvider.generate(prompt, schema, options);
      
      // Log run
      await logRun(options, options.primaryProvider, tokens, latencyMs, attempt, false, 'success', undefined, prompt);
      
      return data;
    } catch (e: any) {
      attempt++;
      console.warn(`Primary provider ${options.primaryProvider.name} failed (attempt ${attempt}):`, e.message);
      if (attempt > maxRetries) {
        await logRun(options, options.primaryProvider, { input: 0, output: 0 }, 0, attempt - 1, false, 'failed', e.message, prompt);
        break; // Drop to fallback
      }
    }
  }

  // Try fallback if available
  if (options.fallbackProvider) {
    attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const { data, tokens, latencyMs } = await options.fallbackProvider.generate(prompt, schema, options);
        
        await logRun(options, options.fallbackProvider, tokens, latencyMs, attempt, true, 'success', undefined, prompt);
        
        return data;
      } catch (e: any) {
        attempt++;
        console.warn(`Fallback provider ${options.fallbackProvider.name} failed (attempt ${attempt}):`, e.message);
        if (attempt > maxRetries) {
          await logRun(options, options.fallbackProvider, { input: 0, output: 0 }, 0, attempt - 1, true, 'failed', e.message, prompt);
          throw new Error(`Both primary and fallback AI providers failed. Last error: ${e.message}`);
        }
      }
    }
  }

  throw new Error('AI execution failed');
}

async function logRun(
  options: RunAIOptions,
  provider: AIProvider,
  tokens: { input: number; output: number },
  latencyMs: number,
  retryCount: number,
  fallbackUsed: boolean,
  status: string,
  errorCode?: string,
  prompt?: string,
) {
  try {
    await db.insert(aiRuns).values({
      organizationId: options.organizationId,
      analysisJobId: options.jobId,
      reportId: options.reportId,
      purpose: options.purpose,
      provider: provider.name,
      model: (provider as any).modelName || 'unknown',
      promptVersion: options.promptVersion,
      inputHash: prompt ? createHash('sha256').update(prompt).digest('hex') : undefined,
      status,
      inputTokens: tokens.input,
      outputTokens: tokens.output,
      latencyMs,
      retryCount,
      fallbackUsed,
      errorCode,
    });
  } catch (e) {
    console.error('Failed to log AI run:', e);
  }
}
