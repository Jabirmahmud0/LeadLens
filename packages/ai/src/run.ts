import { z } from 'zod';
import { db } from '@leadlens/database';
import { aiRuns } from '@leadlens/database/src/schema/ai';
import { AIOptions, AIProvider } from './providers';
import { createHash } from 'node:crypto';
import { AIProviderError, normalizeAIError } from './errors';
import { fitPromptToBudget } from './prompt-budget';

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
  const boundedPrompt = fitPromptToBudget(prompt, options.maxPromptChars);
  let attempt = 0;
  const maxRetries = options.maxRetries ?? 2;
  const primaryMaxRetries = options.primaryProvider.managesCredentialRotation ? 0 : maxRetries;
  let primaryFailure: AIProviderError | undefined;
  
  // Try primary provider
  while (attempt <= primaryMaxRetries) {
    try {
      const { data, tokens, latencyMs } = await options.primaryProvider.generate(boundedPrompt, schema, options);
      
      // Log run
      await logRun(options, options.primaryProvider, tokens, latencyMs, attempt, false, 'success', undefined, boundedPrompt);
      
      return data;
    } catch (error: unknown) {
      const failure = normalizeAIError(options.primaryProvider.name, error);
      primaryFailure = failure;
      attempt++;
      console.warn(`Primary provider ${options.primaryProvider.name} failed (attempt ${attempt}):`, failure.code);
      if (!failure.retryable || attempt > primaryMaxRetries) {
        await logRun(options, options.primaryProvider, { input: 0, output: 0 }, 0, attempt - 1, false, 'failed', failure.code, boundedPrompt);
        break; // Drop to fallback
      }
      await retryDelay(attempt);
    }
  }

  // Try fallback if available
  if (options.fallbackProvider) {
    attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const { data, tokens, latencyMs } = await options.fallbackProvider.generate(boundedPrompt, schema, options);
        
        await logRun(options, options.fallbackProvider, tokens, latencyMs, attempt, true, 'success', undefined, boundedPrompt);
        
        return data;
      } catch (error: unknown) {
        const failure = normalizeAIError(options.fallbackProvider.name, error);
        attempt++;
        console.warn(`Fallback provider ${options.fallbackProvider.name} failed (attempt ${attempt}):`, failure.code);
        if (!failure.retryable || attempt > maxRetries) {
          await logRun(options, options.fallbackProvider, { input: 0, output: 0 }, 0, attempt - 1, true, 'failed', failure.code, boundedPrompt);
          const primaryDetail = primaryFailure ? `${primaryFailure.provider}: ${primaryFailure.message}` : 'primary provider unavailable';
          throw new Error(`AI generation could not complete (${primaryDetail}; ${failure.provider}: ${failure.message}).`);
        }
        await retryDelay(attempt);
      }
    }
  }

  if (primaryFailure) throw new Error(`AI generation could not complete (${primaryFailure.provider}: ${primaryFailure.message}).`);
  throw new Error('AI generation could not complete because no provider was available.');
}

async function retryDelay(attempt: number) {
  await new Promise((resolve) => setTimeout(resolve, Math.min(1_500, 250 * (2 ** Math.max(0, attempt - 1)))));
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
      model: provider.modelName,
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
