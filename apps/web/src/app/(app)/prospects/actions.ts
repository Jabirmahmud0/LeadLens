'use server';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db, schema } from '@leadlens/database';
import { requireSession } from '@/lib/auth/session';

export async function updateProspectState(id: string, action: 'pin' | 'unpin' | 'archive' | 'restore') {
  const session = await requireSession();
  if (!session.organization) throw new Error('Unauthorized');
  const values = action === 'pin' ? { pinnedAt: new Date() } : action === 'unpin' ? { pinnedAt: null } : action === 'archive' ? { archivedAt: new Date(), status: 'archived' } : { archivedAt: null, status: 'new' };
  await db.update(schema.prospects).set({ ...values, updatedAt: new Date() }).where(and(eq(schema.prospects.id, id), eq(schema.prospects.organizationId, session.organization.id)));
  await db.insert(schema.auditLogs).values({ organizationId: session.organization.id, userId: session.user.id, action: `prospect_${action}`, details: { prospectId: id } });
  revalidatePath('/prospects');
}
