import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';
import { Stage1Output } from './stage1-fact-extraction';

export const Stage2Schema = z.object({
  primaryCategory: z.string().describe('The primary category or industry of the business'),
  secondaryCategory: z.string().describe('Secondary category or niche'),
  businessMaturity: z.enum(['Startup', 'Growing', 'Established', 'Enterprise']),
  targetMarket: z.string().describe('Who their target market is'),
  revenueModel: z.string().describe('How they make money (e.g. SaaS subscriptions, one-off sales, consulting)'),
  growthSignals: z.array(z.string()).describe('Signals that they are growing (e.g. hiring, new features)'),
  risks: z.array(z.string()).describe('Potential business risks or weaknesses')
});

export type Stage2Output = z.infer<typeof Stage2Schema>;

export async function runStage2BusinessClassification(
  facts: Stage1Output,
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage2Output> {
  const prompt = `
You are an expert business strategist. Based on the following extracted facts about a company, classify their business model and maturity.

Company Facts:
${JSON.stringify(facts, null, 2)}

Provide a classification of this business. Be precise and analytical.
`;

  return runAI(prompt, Stage2Schema, {
    ...options,
    purpose: 'stage2_business_classification',
    promptVersion: '1.0'
  });
}
