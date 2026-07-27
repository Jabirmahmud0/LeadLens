export type AIErrorCode =
  | 'AI_INPUT_TOO_LARGE'
  | 'AI_RATE_LIMITED'
  | 'AI_AUTH_FAILED'
  | 'AI_MODEL_UNAVAILABLE'
  | 'AI_BAD_REQUEST'
  | 'AI_PROVIDER_UNAVAILABLE';

export class AIProviderError extends Error {
  constructor(
    message: string,
    readonly code: AIErrorCode,
    readonly retryable: boolean,
    readonly provider: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export function normalizeAIError(provider: string, error: unknown): AIProviderError {
  if (error instanceof AIProviderError) return error;
  const rawMessage = error instanceof Error ? error.message : String(error || 'Unknown provider error');
  const status = readStatus(error, rawMessage);
  const normalized = rawMessage.toLowerCase();

  if (status === 413 || normalized.includes('request too large') || normalized.includes('context length')) {
    return new AIProviderError(`${provider} rejected an oversized request.`, 'AI_INPUT_TOO_LARGE', false, provider, status);
  }
  if (status === 429 || normalized.includes('rate limit') || normalized.includes('too many requests') || normalized.includes('resource_exhausted') || normalized.includes('quota')) {
    return new AIProviderError(`${provider} is temporarily rate limited.`, 'AI_RATE_LIMITED', true, provider, status);
  }
  if (status === 401 || status === 403 || normalized.includes('api key') || normalized.includes('permission_denied')) {
    return new AIProviderError(`${provider} credentials were rejected.`, 'AI_AUTH_FAILED', false, provider, status);
  }
  if (status === 404 || (normalized.includes('model') && normalized.includes('not found'))) {
    return new AIProviderError(`${provider} model is unavailable.`, 'AI_MODEL_UNAVAILABLE', false, provider, status);
  }
  if (status === 400) {
    return new AIProviderError(`${provider} rejected the request format.`, 'AI_BAD_REQUEST', false, provider, status);
  }
  return new AIProviderError(`${provider} is temporarily unavailable.`, 'AI_PROVIDER_UNAVAILABLE', status === undefined || status >= 500, provider, status);
}

function readStatus(error: unknown, message: string): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = Number((error as { status?: unknown }).status);
    if (Number.isInteger(status)) return status;
  }
  const matched = message.match(/(?:^|\s)(4\d\d|5\d\d)(?:\s|\{|$)/);
  return matched ? Number(matched[1]) : undefined;
}
