import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';

export const Stage3FindingSchema = z.object({
  title: z.string(),
  category: z.enum(['Conversion', 'Performance', 'UX', 'Accessibility', 'SEO', 'Trust', 'Technology', 'Security']),
  severity: z.enum(['high', 'medium', 'low']),
  observation: z.string().describe('What was observed'),
  evidence: z.string().describe('Proof of the observation'),
  businessImpact: z.string().describe('How this affects their business'),
  recommendation: z.string().describe('How to fix it'),
  confidence: z.number().min(0).max(100),
  sourceUrl: z.string().url().optional()
});

export const Stage3Schema = z.object({
  findings: z.array(Stage3FindingSchema)
});

export type Stage3Output = z.infer<typeof Stage3Schema>;

export async function runStage3IssueClassification(
  technicalChecks: any,
  pagespeed: any,
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage3Output> {
  const prompt = `
You are an expert web auditor and technical SEO specialist. 
Review the following technical checks and PageSpeed Insights scores to identify website issues.

Technical Checks:
${JSON.stringify(technicalChecks, null, 2)}

PageSpeed Results:
${JSON.stringify(pagespeed, null, 2)}

Extract the most critical findings. Do not list more than 10 findings. Prioritize high-severity issues.
`;

  return runAI(prompt, Stage3Schema, {
    ...options,
    purpose: 'stage3_issue_classification',
    promptVersion: '1.0'
  });
}
