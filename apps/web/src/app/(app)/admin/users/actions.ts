'use server';

import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { PLATFORM_OWNER_ROLE, requirePlatformRole } from '@/lib/auth/admin';

export async function suspendUser(userId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  if (userId === session.user.id) throw new Error('Cannot suspend your own account');

  await db.update(schema.users)
    .set({ status: 'suspended', updatedAt: new Date() })
    .where(eq(schema.users.id, userId));

  await db.insert(schema.auditLogs).values({
    userId: session.user.id,
    action: 'user_suspended',
    details: { targetUserId: userId },
  });

  revalidatePath('/admin/users');
}

export async function reactivateUser(userId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);

  await db.update(schema.users)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(schema.users.id, userId));

  await db.insert(schema.auditLogs).values({
    userId: session.user.id,
    action: 'user_reactivated',
    details: { targetUserId: userId },
  });

  revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  if (userId === session.user.id) throw new Error('Cannot delete your own account');

  // Soft delete
  await db.update(schema.users)
    .set({ status: 'deleted', updatedAt: new Date() })
    .where(eq(schema.users.id, userId));

  await db.insert(schema.auditLogs).values({
    userId: session.user.id,
    action: 'user_deleted',
    details: { targetUserId: userId },
  });

  revalidatePath('/admin/users');
}
