import { describe, expect, it } from 'vitest';
import { normalizeAIError } from './errors';
import { DEFAULT_MAX_OUTPUT_TOKENS, fitPromptToBudget } from './prompt-budget';

describe('AI reliability guards', () => {
  it('bounds arbitrary website prompts while preserving task instructions at the end', () => {
    const prompt = `${'source '.repeat(4_000)}FINAL INSTRUCTIONS`;
    const bounded = fitPromptToBudget(prompt, 1_000);

    expect(bounded.length).toBeLessThanOrEqual(1_000);
    expect(bounded).toContain('source');
    expect(bounded).toContain('FINAL INSTRUCTIONS');
    expect(bounded).toContain('omitted');
  });

  it('reserves a free-tier-safe default output budget', () => {
    expect(DEFAULT_MAX_OUTPUT_TOKENS).toBeLessThanOrEqual(2_048);
  });

  it('classifies oversized requests as non-retryable without leaking provider details', () => {
    const failure = normalizeAIError('groq', new Error('413 request too large for org_secret_identifier'));

    expect(failure.code).toBe('AI_INPUT_TOO_LARGE');
    expect(failure.retryable).toBe(false);
    expect(failure.message).not.toContain('org_secret_identifier');
  });

  it('classifies quota failures as retryable', () => {
    const failure = normalizeAIError('gemini', Object.assign(new Error('RESOURCE_EXHAUSTED'), { status: 429 }));
    expect(failure.code).toBe('AI_RATE_LIMITED');
    expect(failure.retryable).toBe(true);
  });
});
