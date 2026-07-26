'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';

const Input = z.object({ proposalId: z.string().uuid(), content: z.string().max(50_000) });

export async function saveProposalContent(proposalId: string, content: string) {
  const session = await getSession();
  if (!session?.organization) return { success: false, error: 'Unauthorized' };
  const parsed = Input.safeParse({ proposalId, content });
  if (!parsed.success) return { success: false, error: 'Invalid proposal content' };
  const [owned] = await db.select({ reportId: schema.reports.id, analysisJobId: schema.reports.analysisJobId, version: schema.reports.version, current: schema.proposalStarters.userEditedContent }).from(schema.proposalStarters).innerJoin(schema.reports, eq(schema.proposalStarters.reportId, schema.reports.id)).where(and(eq(schema.proposalStarters.id, parsed.data.proposalId), eq(schema.reports.organizationId, session.organization.id))).limit(1);
  if (!owned) return { success: false, error: 'Not found' };
  await db.transaction(async tx => {
    const nextVersion = owned.version + 1;
    await tx.insert(schema.reportVersions).values({ organizationId: session.organization!.id, analysisJobId: owned.analysisJobId, version: nextVersion, section: 'proposal:edited', source: 'edit', content: { markdown: owned.current || '' } });
    await tx.update(schema.proposalStarters).set({ userEditedContent: parsed.data.content, updatedAt: new Date() }).where(eq(schema.proposalStarters.id, parsed.data.proposalId));
    await tx.update(schema.reports).set({ version: nextVersion, updatedAt: new Date() }).where(eq(schema.reports.id, owned.reportId));
  });
  return { success: true };
}
