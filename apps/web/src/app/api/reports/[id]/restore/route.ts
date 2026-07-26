import { NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';

const Input = z.object({ section: z.enum(['summary', 'outreach', 'proposal']) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = Input.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid restore request' }, { status: 400 });
  const { id } = await params;
  const report = await db.query.reports.findFirst({ where: and(eq(schema.reports.id, id), eq(schema.reports.organizationId, session.organization.id)) });
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [original] = await db.select().from(schema.reportVersions).where(and(eq(schema.reportVersions.analysisJobId, report.analysisJobId), eq(schema.reportVersions.organizationId, session.organization.id), eq(schema.reportVersions.section, parsed.data.section), eq(schema.reportVersions.source, 'generated'))).orderBy(asc(schema.reportVersions.version)).limit(1);
  if (!original) return NextResponse.json({ error: 'Original version is unavailable' }, { status: 404 });
  const content = original.content as any;
  await db.transaction(async (tx) => {
    if (parsed.data.section === 'summary') await tx.update(schema.reports).set({ title: content.title, executiveSummary: content.executiveSummary, opportunityThesis: content.opportunityThesis, recommendedAction: content.recommendedAction, version: report.version + 1, updatedAt: new Date() }).where(eq(schema.reports.id, report.id));
    if (parsed.data.section === 'outreach') {
      const rows = await tx.select().from(schema.reportOutreach).where(eq(schema.reportOutreach.reportId, report.id));
      for (const row of rows) { const body = row.channel === 'linkedin' ? content.linkedInMessage : row.channel === 'whatsapp' ? content.whatsappMessage : content.emailBody; await tx.update(schema.reportOutreach).set({ userEditedBody: body || row.body, updatedAt: new Date() }).where(eq(schema.reportOutreach.id, row.id)); }
    }
    if (parsed.data.section === 'proposal') await tx.update(schema.proposalStarters).set({ problemStatement: content.problemStatement, objectives: content.objectives?.join('\n') || '', scope: content.proposedScope, phases: content.phases?.join('\n') || '', successMetrics: content.successMetrics?.join('\n') || '', assumptions: content.assumptions?.join('\n') || '', nextStep: content.nextStep, updatedAt: new Date() }).where(eq(schema.proposalStarters.reportId, report.id));
    if (parsed.data.section !== 'summary') await tx.update(schema.reports).set({ version: report.version + 1, updatedAt: new Date() }).where(eq(schema.reports.id, report.id));
    await tx.insert(schema.usageEvents).values({ organizationId: session.organization!.id, userId: session.user.id, eventName: 'report_version_restored', properties: { analysisId: report.analysisJobId, section: parsed.data.section } });
  });
  return NextResponse.json({ success: true });
}
