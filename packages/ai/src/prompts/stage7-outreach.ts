import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';
import { Stage5Output } from './stage5-agency-match';
import { Stage6Output } from './stage6-fit-scoring';
import { Stage4Output } from './stage4-opportunity-hypothesis';

export const Stage7Schema = z.object({
  subjectLines: z.array(z.string()).describe('3-5 compelling email subject lines'),
  emailOpener: z.string().describe('A highly personalized opening hook'),
  emailBody: z.string().describe('The core message highlighting issues and the opportunity'),
  linkedInMessage: z.string().describe('A short, casual outreach message for LinkedIn'),
  whatsappMessage: z.string().describe('A direct message for WhatsApp or SMS'),
  followUpMessage: z.string().describe('A bump/follow-up email for 3 days later'),
  callToAction: z.string().describe('The specific action we want them to take'),
  phrasesToAvoid: z.array(z.string()).describe('Cliché sales phrases not to use with this prospect')
});

export type Stage7Output = z.infer<typeof Stage7Schema>;

export async function runStage7OutreachGeneration(
  hypotheses: Stage4Output,
  serviceMatch: Stage5Output,
  fitScore: Stage6Output,
  agencyProfile: any,
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage7Output> {
  const prompt = `
You are an expert SDR (Sales Development Representative) and copywriter. Draft high-converting outreach materials based on the strategic hypotheses and matched services.

Hypotheses:
${JSON.stringify(hypotheses.hypotheses, null, 2)}

Service Matches:
${JSON.stringify(serviceMatch.serviceMatches, null, 2)}

Fit Score Insights:
${JSON.stringify(fitScore.positiveFactors, null, 2)}

Agency Profile (Voice/Tone guidelines):
${JSON.stringify(agencyProfile, null, 2)}

Draft the outreach sequence. Be concise, value-driven, and highly personalized. DO NOT sound like a typical spammy agency pitch. Use the agency's voice.
`;

  return runAI(prompt, Stage7Schema, {
    ...options,
    purpose: 'stage7_outreach_generation',
    promptVersion: '1.0'
  });
}
