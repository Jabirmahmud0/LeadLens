'use server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@leadlens/database';
import { requireSession } from '@/lib/auth/session';

export async function deleteAnalysis(id: string) {
  const session = await requireSession();
  if (!session.organization) throw new Error('Unauthorized');
  await db.delete(schema.analysisJobs).where(and(eq(schema.analysisJobs.id, id), eq(schema.analysisJobs.organizationId, session.organization.id)));
  revalidatePath('/analyses');
}
