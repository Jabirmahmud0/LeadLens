import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';
import { Stage4Output } from './stage4-opportunity-hypothesis';

export const Stage5MatchSchema = z.object({
  serviceId: z.string().describe('The ID of the matched service'),
  matchScore: z.number().min(0).max(100),
  rationale: z.string().describe('Why this service is a good fit'),
  suggestedScope: z.string().describe('Suggested scope of work for this service'),
  risks: z.array(z.string()).describe('Risks of pitching this service')
});

export const Stage5Schema = z.object({
  serviceMatches: z.array(Stage5MatchSchema),
  primaryServiceId: z.string().describe('The ID of the single best service to lead with'),
  secondaryServiceId: z.string().optional().describe('The ID of a good secondary service to cross-sell')
});

export type Stage5Output = z.infer<typeof Stage5Schema>;

export async function runStage5AgencyServiceMatching(
  hypotheses: Stage4Output,
  agencyProfile: any,
  services: any[],
  icp: any,
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage5Output> {
  const prompt = `
You are an expert agency sales director. Review the opportunity hypotheses for a prospect, and match them with our agency's services and Ideal Customer Profile (ICP).

Opportunity Hypotheses:
${JSON.stringify(hypotheses.hypotheses, null, 2)}

Agency Profile:
${JSON.stringify(agencyProfile, null, 2)}

Agency Services:
${JSON.stringify(services, null, 2)}

Agency ICP:
${JSON.stringify(icp, null, 2)}

Identify which services we should pitch, score the match, and provide a rationale.
You must use the exact string IDs provided in the Agency Services array for \`serviceId\`, \`primaryServiceId\`, and \`secondaryServiceId\`.
`;

  return runAI(prompt, Stage5Schema, {
    ...options,
    purpose: 'stage5_agency_match',
    promptVersion: '1.0'
  });
}
