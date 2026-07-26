'use server';

import { db, queries, schema } from '@leadlens/database';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const SaveOutreachSchema = z.object({
  outreachId: z.string().uuid(),
  newBody: z.string().trim().min(1).max(20_000),
});

export async function saveOutreachBody(outreachId: string, newBody: string) {
  try {
    const session = await getSession();
    if (!session?.organization) return { success: false, error: 'Unauthorized' };

    const input = SaveOutreachSchema.safeParse({ outreachId, newBody });
    if (!input.success) return { success: false, error: 'Invalid outreach content' };

    const ownsOutreach = await queries.reports.organizationOwnsOutreach(
      input.data.outreachId,
      session.organization.id,
    );
    if (!ownsOutreach) return { success: false, error: 'Not found' };

    const [current] = await db.select({ body: schema.reportOutreach.userEditedBody, generatedBody: schema.reportOutreach.body, channel: schema.reportOutreach.channel, analysisJobId: schema.reports.analysisJobId, reportId: schema.reports.id, version: schema.reports.version }).from(schema.reportOutreach).innerJoin(schema.reports, eq(schema.reportOutreach.reportId, schema.reports.id)).where(and(eq(schema.reportOutreach.id, input.data.outreachId), eq(schema.reports.organizationId, session.organization.id))).limit(1);
    if (!current) return { success: false, error: 'Not found' };
    await db.transaction(async (tx) => {
      const nextVersion = current.version + 1;
      await tx.insert(schema.reportVersions).values({ organizationId: session.organization!.id, analysisJobId: current.analysisJobId, version: nextVersion, section: `outreach:${current.channel || 'email'}`, source: 'edit', content: { body: current.body || current.generatedBody || '' } });
      await tx.update(schema.reportOutreach).set({ userEditedBody: input.data.newBody, updatedAt: new Date() }).where(eq(schema.reportOutreach.id, input.data.outreachId));
      await tx.update(schema.reports).set({ version: nextVersion, updatedAt: new Date() }).where(eq(schema.reports.id, current.reportId));
      await tx.insert(schema.usageEvents).values({ organizationId: session.organization!.id, userId: session.user.id, eventName: 'report_section_edited', properties: { analysisId: current.analysisJobId, section: 'outreach' } });
    });
    
    // In a real app we'd trigger a revalidatePath here, but it depends on the exact route
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unable to save outreach' };
  }
}
