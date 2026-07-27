'use server';

import { db, schema } from '@leadlens/database';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { PLATFORM_OWNER_ROLE, requirePlatformRole } from '@/lib/auth/admin';

const grantSchema = z.object({
  email: z.email().trim().toLowerCase(),
  reason: z.string().trim().min(8, 'Provide a short reason').max(300),
});

const revokeSchema = z.object({
  userId: z.uuid(),
  reason: z.string().trim().min(8, 'Provide a short reason').max(300),
});

export async function grantPlatformOwner(formData: FormData) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const parsed = grantSchema.safeParse({
    email: formData.get('email'),
    reason: formData.get('reason'),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid grant request');

  const [target] = await db.select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${parsed.data.email}`)
    .limit(1);
  if (!target) throw new Error('No LeadLens account exists for that email');

  const [existing] = await db.select({
    id: schema.platformRoleAssignments.id,
    revokedAt: schema.platformRoleAssignments.revokedAt,
  }).from(schema.platformRoleAssignments).where(and(
    eq(schema.platformRoleAssignments.userId, target.id),
    eq(schema.platformRoleAssignments.role, PLATFORM_OWNER_ROLE),
  )).limit(1);

  if (existing && !existing.revokedAt) return;

  await db.transaction(async (tx) => {
    if (existing) {
      await tx.update(schema.platformRoleAssignments).set({
        grantedBy: session.user.id,
        grantReason: parsed.data.reason,
        source: 'manual',
        grantedAt: new Date(),
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
        updatedAt: new Date(),
      }).where(eq(schema.platformRoleAssignments.id, existing.id));
    } else {
      await tx.insert(schema.platformRoleAssignments).values({
        userId: target.id,
        role: PLATFORM_OWNER_ROLE,
        grantedBy: session.user.id,
        grantReason: parsed.data.reason,
        source: 'manual',
      });
    }

    await tx.insert(schema.auditLogs).values({
      userId: session.user.id,
      action: 'platform_role_granted',
      details: {
        targetUserId: target.id,
        targetEmail: target.email,
        role: PLATFORM_OWNER_ROLE,
        reason: parsed.data.reason,
      },
    });
  });

  revalidatePath('/admin');
}

export async function revokePlatformOwner(formData: FormData) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const parsed = revokeSchema.safeParse({
    userId: formData.get('userId'),
    reason: formData.get('reason'),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid revoke request');
  if (parsed.data.userId === session.user.id) throw new Error('You cannot revoke your own platform-owner access');

  const [target] = await db.select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, parsed.data.userId))
    .limit(1);
  if (!target) throw new Error('User not found');

  const [assignment] = await db.select({ id: schema.platformRoleAssignments.id })
    .from(schema.platformRoleAssignments)
    .where(and(
      eq(schema.platformRoleAssignments.userId, target.id),
      eq(schema.platformRoleAssignments.role, PLATFORM_OWNER_ROLE),
      isNull(schema.platformRoleAssignments.revokedAt),
    ))
    .limit(1);
  if (!assignment) return;

  await db.transaction(async (tx) => {
    await tx.update(schema.platformRoleAssignments).set({
      revokedAt: new Date(),
      revokedBy: session.user.id,
      revokeReason: parsed.data.reason,
      updatedAt: new Date(),
    }).where(eq(schema.platformRoleAssignments.id, assignment.id));

    await tx.insert(schema.auditLogs).values({
      userId: session.user.id,
      action: 'platform_role_revoked',
      details: {
        targetUserId: target.id,
        targetEmail: target.email,
        role: PLATFORM_OWNER_ROLE,
        reason: parsed.data.reason,
      },
    });
  });

  revalidatePath('/admin');
}
