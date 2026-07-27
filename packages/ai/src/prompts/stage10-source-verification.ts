import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';

export const MAX_EVIDENCE_EXCERPT_LENGTH = 500;

export const Stage10VerifiedFindingSchema = z.object({
  findingIndex: z.number().int().nonnegative().describe('The zero-based index of the finding being verified'),
  citations: z.array(z.object({
    sourcePageId: z.string().uuid(),
    // Provider output is normalized after parsing. Keeping this field tolerant
    // prevents one verbose but otherwise valid citation from failing the report.
    evidenceExcerpt: z.string().describe(`An exact source excerpt of at most ${MAX_EVIDENCE_EXCERPT_LENGTH} characters`),
  })).describe('Evidence selected only from the supplied source page IDs'),
  confidence: z.number().min(0).max(100).describe('Confidence in this finding based on the sources'),
  isFactOrInference: z.enum(['fact', 'inference']).describe('Whether this is a hard fact stated on the site or an inference made by the AI')
});

export const Stage10Schema = z.object({
  verifiedFindings: z.array(Stage10VerifiedFindingSchema),
  limitations: z.array(z.string()).describe('Things we could not verify or that are missing from the data'),
  unsupportedAreas: z.array(z.string()).describe('Claims or findings that lack strong evidence')
});

export type Stage10Output = z.infer<typeof Stage10Schema>;

export function normalizeStage10Output(output: Stage10Output): Stage10Output {
  return {
    ...output,
    verifiedFindings: output.verifiedFindings.map((finding) => ({
      ...finding,
      citations: finding.citations.map((citation) => ({
        ...citation,
        evidenceExcerpt: citation.evidenceExcerpt.slice(0, MAX_EVIDENCE_EXCERPT_LENGTH),
      })),
    })),
  };
}

export async function runStage10SourceVerification(
  allFindings: any,
  sourcePages: any[],
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage10Output> {
  const usableSources = sourcePages.filter((source) => typeof source.extractedText === 'string' && source.extractedText.length > 0).slice(0, 8);
  const charactersPerSource = Math.max(700, Math.floor(7_000 / Math.max(1, usableSources.length)));
  const boundedSources = usableSources.map((source) => ({
    id: source.id,
    url: source.url,
    title: source.title,
    extractedText: source.extractedText.slice(0, charactersPerSource),
    errorMessage: source.errorMessage,
  }));
  const indexedFindings = Array.isArray(allFindings)
    ? allFindings.slice(0, 20).map((finding, findingIndex) => ({ findingIndex, ...finding }))
    : [];

  const prompt = `
You are an expert fact-checker and QA auditor. Review the AI-generated findings and verify them against the provided source pages.

All Findings to Verify:
${JSON.stringify(indexedFindings, null, 2)}

Source Pages:
${JSON.stringify(boundedSources, null, 2)}

Use only the supplied findingIndex and source page id values. Include one short exact evidence excerpt for every citation. Each evidenceExcerpt MUST be ${MAX_EVIDENCE_EXCERPT_LENGTH} characters or fewer. Label inferences clearly and identify unsupported claims.
`;

  const output = await runAI(prompt, Stage10Schema, {
    ...options,
    purpose: 'stage10_source_verification',
    promptVersion: '1.1',
    maxTokens: 1_800,
  });
  return normalizeStage10Output(output);
}
