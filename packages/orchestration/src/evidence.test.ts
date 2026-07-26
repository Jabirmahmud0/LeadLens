import { describe, expect, it } from 'vitest';
import { locateExactEvidence } from './evidence';

describe('citation evidence validation', () => {
  it('returns source offsets only for an exact stored excerpt', () => expect(locateExactEvidence('Pricing starts at $99 per month.', 'starts at $99')).toEqual({ excerpt: 'starts at $99', start: 8, end: 21 }));
  it('rejects a plausible but unsupported model excerpt', () => expect(locateExactEvidence('Contact our team.', 'Revenue grew 40%')).toBeNull());
});
