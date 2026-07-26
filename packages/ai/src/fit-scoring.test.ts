import { describe, expect, it } from 'vitest';
import { calculateWeightedFitScore } from './fit-scoring';

describe('deterministic fit scoring', () => {
  it('applies the PRD weights instead of trusting model arithmetic', () => {
    expect(calculateWeightedFitScore({ agencyServiceFit: 100, problemSeverity: 50, businessMaturity: 0, likelyProjectValue: 0, evidenceQuality: 0, outreachReadiness: 0 })).toEqual({ overallScore: 40, scoreLabel: 'Needs more research' });
  });
  it.each([[79, 'Worth pursuing'], [80, 'High potential'], [59, 'Needs more research'], [39, 'Low fit']] as const)('labels a uniform score of %i', (score, label) => {
    expect(calculateWeightedFitScore({ agencyServiceFit: score, problemSeverity: score, businessMaturity: score, likelyProjectValue: score, evidenceQuality: score, outreachReadiness: score }).scoreLabel).toBe(label);
  });
});
