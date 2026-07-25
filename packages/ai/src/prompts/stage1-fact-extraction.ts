import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';

export const Stage1Schema = z.object({
  companyName: z.string().describe('The name of the company'),
  industry: z.string().describe('The industry the company operates in'),
  offerings: z.array(z.string()).describe('List of products or services offered'),
  audience: z.string().describe('Who their target audience is'),
  businessModel: z.string().describe('B2B, B2C, D2C, SaaS, Agency, etc.'),
  contactChannels: z.array(z.string()).describe('Emails, phone numbers, contact forms found'),
  socialLinks: z.array(z.string()).describe('Social media profiles found'),
  copyrightYear: z.string().describe('The year in the footer copyright if available'),
  technologiesUsed: z.array(z.string()).describe('Technologies detected on the site')
});

export type Stage1Output = z.infer<typeof Stage1Schema>;

export async function runStage1FactExtraction(
  extractedText: string,
  technologies: any[],
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage1Output> {
  const prompt = `
You are an expert business analyst. Your task is to extract factual information about a company based solely on the provided website text and detected technologies.

Website Text:
${extractedText.substring(0, 15000) /* truncate to fit context if needed */}

Detected Technologies:
${JSON.stringify(technologies)}

Extract the required facts. Do not invent information. If something is not found, leave it empty or provide a best guess based ONLY on the text.
`;

  return runAI(prompt, Stage1Schema, {
    ...options,
    purpose: 'stage1_fact_extraction',
    promptVersion: '1.0'
  });
}
