import { z } from 'zod';
import { runAI, RunAIOptions } from '../run';
import { Stage5Output } from './stage5-agency-match';
import { Stage4Output } from './stage4-opportunity-hypothesis';

export const Stage9Schema = z.object({
  problemStatement: z.string().describe('The core problem the prospect faces'),
  objectives: z.array(z.string()).describe('What we will achieve for them'),
  proposedScope: z.string().describe('High-level summary of the proposed scope of work'),
  phases: z.array(z.string()).describe('The phases of the project (e.g. Discovery, Execution, Handoff)'),
  successMetrics: z.array(z.string()).describe('How we will measure success (KPIs)'),
  relevantCaseStudyId: z.string().optional().describe('The ID of the best case study to include'),
  risks: z.array(z.string()).describe('Project risks and dependencies'),
  assumptions: z.array(z.string()).describe('Assumptions we are making about their business or technical setup'),
  nextStep: z.string().describe('The immediate next step to move the deal forward')
});

export type Stage9Output = z.infer<typeof Stage9Schema>;

export async function runStage9ProposalAngle(
  serviceMatch: Stage5Output,
  hypotheses: Stage4Output,
  caseStudies: any[],
  options: Omit<RunAIOptions, 'purpose' | 'promptVersion'>
): Promise<Stage9Output> {
  const prompt = `
You are an expert agency solutions architect and pitch specialist. Based on the matched services and opportunity hypotheses, draft the angle and structure for a winning proposal.

Opportunity Hypotheses:
${JSON.stringify(hypotheses.hypotheses, null, 2)}

Service Matches:
${JSON.stringify(serviceMatch.serviceMatches, null, 2)}

Available Agency Case Studies:
${JSON.stringify(caseStudies, null, 2)}

Create a compelling proposal narrative. If a case study is highly relevant, provide its exact ID in \`relevantCaseStudyId\`.
`;

  return runAI(prompt, Stage9Schema, {
    ...options,
    purpose: 'stage9_proposal_angle',
    promptVersion: '1.0'
  });
}
