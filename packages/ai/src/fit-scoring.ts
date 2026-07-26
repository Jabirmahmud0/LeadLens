export interface FitBreakdown { agencyServiceFit: number; problemSeverity: number; businessMaturity: number; likelyProjectValue: number; evidenceQuality: number; outreachReadiness: number }
export const FIT_SCORE_WEIGHTS: Record<keyof FitBreakdown, number> = { agencyServiceFit: 0.30, problemSeverity: 0.20, businessMaturity: 0.15, likelyProjectValue: 0.15, evidenceQuality: 0.10, outreachReadiness: 0.10 };
export function calculateWeightedFitScore(breakdown: FitBreakdown) {
  const overallScore = Math.round(Object.entries(FIT_SCORE_WEIGHTS).reduce((total, [category, weight]) => total + breakdown[category as keyof FitBreakdown] * weight, 0));
  const scoreLabel = overallScore >= 80 ? 'High potential' : overallScore >= 60 ? 'Worth pursuing' : overallScore >= 40 ? 'Needs more research' : 'Low fit';
  return { overallScore, scoreLabel } as const;
}
