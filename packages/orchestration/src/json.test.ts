import { describe, expect, it } from 'vitest';
import { toJsonValue } from './json';

describe('toJsonValue', () => {
  it('stores optional undefined observations as JSON null', () => {
    expect(toJsonValue(undefined)).toBeNull();
  });

  it('removes nested undefined values without damaging the remaining observation', () => {
    expect(toJsonValue({ status: 'observed', optional: undefined })).toEqual({ status: 'observed' });
  });
});
