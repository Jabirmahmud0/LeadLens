import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const report = await db.query.reports.findFirst({
    where: and(eq(schema.reports.id, id), eq(schema.reports.organizationId, session.organization.id)),
    columns: { id: true, analysisJobId: true, prospectId: true },
  });
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await db.delete(schema.analysisJobs).where(and(
    eq(schema.analysisJobs.id, report.analysisJobId),
    eq(schema.analysisJobs.organizationId, session.organization.id),
  ));
  await db.update(schema.prospects).set({ status: 'new', updatedAt: new Date() }).where(and(
    eq(schema.prospects.id, report.prospectId),
    eq(schema.prospects.organizationId, session.organization.id),
  ));
  return NextResponse.json({ success: true });
}
