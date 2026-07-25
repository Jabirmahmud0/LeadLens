import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';
import { Stage4Output } from './stage4-opportunity-hypothesis';

export const Stage8ObjectionSchema = z.object({
  objection: z.string().describe('A likely objection the prospect will raise'),
  suggestedResponse: z.string().describe('How to overcome this objection')
});

export const Stage8Schema = z.object({
  hypotheses: z.array(z.string()).describe('Summary of the hypotheses we want to validate on the call'),
  priorityQuestions: z.array(z.string()).describe('The top 3 most important questions to ask'),
  technicalQuestions: z.array(z.string()).describe('Questions about their current tech stack and issues'),
  businessQuestions: z.array(z.string()).describe('Questions about their business goals, revenue, and metrics'),
  budgetQuestions: z.array(z.string()).describe('Questions to qualify their budget capacity'),
  timelineQuestions: z.array(z.string()).describe('Questions about their timeline and urgency'),
  stakeholderQuestions: z.array(z.string()).describe('Questions to uncover the decision-making process'),
  warningSignals: z.array(z.string()).describe('Things to listen for that indicate this is a bad lead'),
  objections: z.array(Stage8ObjectionSchema)
});

export type Stage8Output = z.infer<typeof Stage8Schema>;

export async function runStage8DiscoveryPrep(
  reportSummary: any,
  hypotheses: Stage4Output,
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage8Output> {
  const prompt = `
You are an expert enterprise sales account executive preparing for a discovery call. Create a comprehensive call prep sheet based on the prospect report and our hypotheses.

Report Summary:
${JSON.stringify(reportSummary, null, 2)}

Opportunity Hypotheses:
${JSON.stringify(hypotheses.hypotheses, null, 2)}

Generate a discovery call prep sheet that will make the sales rep sound like an industry insider who has done their homework. Focus on open-ended, high-value questions.
`;

  return runAI(prompt, Stage8Schema, {
    ...options,
    purpose: 'stage8_discovery_prep',
    promptVersion: '1.0'
  });
}
