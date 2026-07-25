import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';
import { Stage2Output } from './stage2-business-classification';
import { Stage3Output } from './stage3-issue-classification';

export const Stage4HypothesisSchema = z.object({
  thesis: z.string().describe('The core hypothesis of why they need help'),
  evidence: z.array(z.string()).describe('Evidence supporting the thesis from findings'),
  buyingSignals: z.array(z.string()).describe('Why they might be ready to buy now'),
  risks: z.array(z.string()).describe('Why they might not buy'),
  requiredProof: z.string().describe('What we need to prove to them to win the deal')
});

export const Stage4Schema = z.object({
  hypotheses: z.array(Stage4HypothesisSchema)
});

export type Stage4Output = z.infer<typeof Stage4Schema>;

export async function runStage4OpportunityHypothesis(
  business: Stage2Output,
  findings: Stage3Output,
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage4Output> {
  const prompt = `
You are an expert sales strategist. Review the business classification and website issues for a prospect, and generate strategic opportunity hypotheses for pitching an agency's services.

Business Classification:
${JSON.stringify(business, null, 2)}

Website Issues:
${JSON.stringify(findings.findings, null, 2)}

Generate 1 to 3 strong hypotheses on how an agency could add massive value to this business.
`;

  return runAI(prompt, Stage4Schema, {
    ...options,
    purpose: 'stage4_opportunity_hypothesis',
    promptVersion: '1.0'
  });
}
