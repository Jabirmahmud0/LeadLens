import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';

const Input = z.object({ section: z.enum(['all', 'summary', 'outreach', 'proposal']), tone: z.enum(['professional', 'consultative', 'aggressive']).optional(), length: z.enum(['quick', 'standard', 'deep']).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = Input.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid regeneration request' }, { status: 400 });
  const { id } = await params;
  const report = await db.query.reports.findFirst({ where: and(eq(schema.reports.id, id), eq(schema.reports.organizationId, session.organization.id)), with: { outreach: true, proposalStarters: true } });
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const sectionSteps: Record<string, string[]> = { all: ['ai_extraction','ai_classification','ai_service_match','ai_fit_score','ai_outreach','ai_call_prep','ai_proposal','ai_verify','save_report'], summary: ['ai_classification','ai_service_match','ai_fit_score','ai_verify','save_report'], outreach: ['ai_outreach','ai_verify','save_report'], proposal: ['ai_proposal','ai_verify','save_report'] };
  const job = await db.query.analysisJobs.findFirst({ where: and(eq(schema.analysisJobs.id, report.analysisJobId), eq(schema.analysisJobs.organizationId, session.organization.id)) });
  if (!job) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  const nextVersion = report.version + 1;
  await db.transaction(async (tx) => {
    await tx.insert(schema.reportVersions).values({ organizationId: session.organization!.id, analysisJobId: report.analysisJobId, version: nextVersion, section: parsed.data.section, source: 'pre_regeneration', content: { summary: { title: report.title, executiveSummary: report.executiveSummary, opportunityThesis: report.opportunityThesis, recommendedAction: report.recommendedAction }, outreach: report.outreach, proposal: report.proposalStarters[0] || null } });
    await tx.delete(schema.analysisJobSteps).where(and(eq(schema.analysisJobSteps.analysisJobId, report.analysisJobId), inArray(schema.analysisJobSteps.stepKey, sectionSteps[parsed.data.section])));
    await tx.update(schema.analysisJobs).set({ status: 'queued', progressPercent: 0, currentStep: null, completedAt: null, failedAt: null, failureCode: null, failureMessage: null, requestedOptions: { ...((job.requestedOptions as object) || {}), ...(parsed.data.tone ? { tone: parsed.data.tone } : {}), ...(parsed.data.length ? { reportDepth: parsed.data.length } : {}) }, updatedAt: new Date() }).where(eq(schema.analysisJobs.id, report.analysisJobId));
    await tx.update(schema.reports).set({ version: nextVersion, updatedAt: new Date() }).where(eq(schema.reports.id, report.id));
    await tx.insert(schema.usageEvents).values({ organizationId: session.organization!.id, userId: session.user.id, eventName: 'report_regenerated', properties: { analysisId: report.analysisJobId, section: parsed.data.section } });
  });
  return NextResponse.json({ success: true, analysisId: report.analysisJobId });
}
