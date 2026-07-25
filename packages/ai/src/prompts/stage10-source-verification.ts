import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';

export const Stage10VerifiedFindingSchema = z.object({
  findingId: z.string().describe('An identifier for the finding being verified'),
  sourceUrls: z.array(z.string().url()).describe('The exact URLs where evidence for this finding was found'),
  confidence: z.number().min(0).max(100).describe('Confidence in this finding based on the sources'),
  isFactOrInference: z.enum(['fact', 'inference']).describe('Whether this is a hard fact stated on the site or an inference made by the AI')
});

export const Stage10Schema = z.object({
  verifiedFindings: z.array(Stage10VerifiedFindingSchema),
  limitations: z.array(z.string()).describe('Things we could not verify or that are missing from the data'),
  unsupportedAreas: z.array(z.string()).describe('Claims or findings that lack strong evidence')
});

export type Stage10Output = z.infer<typeof Stage10Schema>;

export async function runStage10SourceVerification(
  allFindings: any,
  sourcePages: any[],
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage10Output> {
  const prompt = `
You are an expert fact-checker and QA auditor. Review the AI-generated findings and verify them against the provided source pages.

All Findings to Verify:
${JSON.stringify(allFindings, null, 2)}

Source Pages:
${JSON.stringify(sourcePages, null, 2)}

Ensure every claim is backed by a source URL. Label inferences clearly so they are not presented as facts. Identify any limitations or unsupported claims.
`;

  return runAI(prompt, Stage10Schema, {
    ...options,
    purpose: 'stage10_source_verification',
    promptVersion: '1.0'
  });
}
