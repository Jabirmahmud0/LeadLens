import { describe, expect, it } from 'vitest';
import { nextGeminiStartIndex, parseGeminiApiKeys } from './gemini';

describe('Gemini credential rotation', () => {
  it('parses, trims, and de-duplicates a comma-separated pool', () => {
    expect(parseGeminiApiKeys(' first,second, first, ,third ')).toEqual([
      'first',
      'second',
      'third',
    ]);
  });

  it('accepts an explicit array of keys', () => {
    expect(parseGeminiApiKeys(['first', ' second ', 'first'])).toEqual(['first', 'second']);
  });

  it('advances through every slot before wrapping', () => {
    const indexes = Array.from({ length: 7 }, () => nextGeminiStartIndex(3));
    expect(indexes).toEqual([0, 1, 2, 0, 1, 2, 0]);
  });

  it('rejects an empty pool', () => {
    expect(() => nextGeminiStartIndex(0)).toThrow('at least one key');
  });
});
