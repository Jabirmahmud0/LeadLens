import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';
import { Stage5Output } from './stage5-agency-match';
import { calculateWeightedFitScore } from '../fit-scoring';

export const Stage6BreakdownSchema = z.object({
  agencyServiceFit: z.number().min(0).max(100),
  problemSeverity: z.number().min(0).max(100),
  businessMaturity: z.number().min(0).max(100),
  likelyProjectValue: z.number().min(0).max(100),
  evidenceQuality: z.number().min(0).max(100),
  outreachReadiness: z.number().min(0).max(100)
});

export const Stage6Schema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall 0-100 score of how good a lead this is'),
  scoreLabel: z.enum(['High potential', 'Worth pursuing', 'Needs more research', 'Low fit']),
  confidence: z.number().min(0).max(100).describe('Confidence in this score based on evidence available'),
  scoreBreakdown: Stage6BreakdownSchema,
  positiveFactors: z.array(z.string()).describe('Strong reasons to pursue this lead'),
  negativeFactors: z.array(z.string()).describe('Red flags or weaknesses'),
  missingInformation: z.array(z.string()).describe('Information we wish we had to be more confident')
});

export type Stage6Output = z.infer<typeof Stage6Schema>;

export async function runStage6FitScoring(
  serviceMatch: Stage5Output,
  businessClassification: any,
  issueClassification: any,
  agencyIcp: any,
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage6Output> {
  const prompt = `
You are an expert lead scoring system for an agency. Score the prospect on how well they fit the agency's Ideal Customer Profile (ICP) and the strength of the matched services.

Business Classification:
${JSON.stringify(businessClassification, null, 2)}

Website Issues:
${JSON.stringify(issueClassification.findings, null, 2)}

Service Matches:
${JSON.stringify(serviceMatch.serviceMatches, null, 2)}

Agency ICP:
${JSON.stringify(agencyIcp, null, 2)}

Generate a detailed, objective fit score and breakdown.
`;

  const result = await runAI(prompt, Stage6Schema, {
    ...options,
    purpose: 'stage6_fit_scoring',
    promptVersion: '1.0'
  });

  const { overallScore, scoreLabel } = calculateWeightedFitScore(result.scoreBreakdown);

  return { ...result, overallScore, scoreLabel };
}
