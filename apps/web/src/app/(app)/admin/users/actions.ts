'use server';

import { db, schema } from '@leadlens/database';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { PLATFORM_OWNER_ROLE, requirePlatformRole } from '@/lib/auth/admin';
import { z } from 'zod';
import { BILLING_PLAN_KEYS, type BillingPlanKey } from '@leadlens/shared';

const userIdSchema = z.string().uuid();
const planChangeSchema = z.object({
  userId: z.string().uuid(),
  organizationId: z.string().uuid(),
  planKey: z.enum(BILLING_PLAN_KEYS).refine((value) => value !== 'growth', 'Growth requires a custom contract'),
});

export async function setUserPlanOverride(input: { userId: string; organizationId: string; planKey: BillingPlanKey }) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const parsed = planChangeSchema.parse(input);

  await db.transaction(async (tx) => {
    const [membership] = await tx.select({ id: schema.organizationMembers.id })
      .from(schema.organizationMembers)
      .where(and(
        eq(schema.organizationMembers.userId, parsed.userId),
        eq(schema.organizationMembers.organizationId, parsed.organizationId),
      ))
      .limit(1);
    if (!membership) throw new Error('User is not a member of this workspace');

    const [organization] = await tx.select({
      id: schema.organizations.id,
      previousPlan: schema.organizations.adminPlanOverride,
    }).from(schema.organizations)
      .where(eq(schema.organizations.id, parsed.organizationId))
      .limit(1);
    if (!organization) throw new Error('Workspace no longer exists');

    await tx.update(schema.organizations).set({
      adminPlanOverride: parsed.planKey,
      adminPlanOverrideExpiresAt: null,
      updatedAt: new Date(),
    }).where(eq(schema.organizations.id, parsed.organizationId));
    await tx.insert(schema.auditLogs).values({
      organizationId: parsed.organizationId,
      userId: session.user.id,
      action: 'admin_plan_override_changed',
      details: {
        targetUserId: parsed.userId,
        previousPlan: organization.previousPlan,
        newPlan: parsed.planKey,
        stripeBillingChanged: false,
      },
    });
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/billing');
  revalidatePath('/billing');
  revalidatePath('/dashboard');
}

export async function clearUserPlanOverride(input: { userId: string; organizationId: string }) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const parsed = z.object({ userId: z.string().uuid(), organizationId: z.string().uuid() }).parse(input);

  await db.transaction(async (tx) => {
    const [membership] = await tx.select({ id: schema.organizationMembers.id })
      .from(schema.organizationMembers)
      .where(and(
        eq(schema.organizationMembers.userId, parsed.userId),
        eq(schema.organizationMembers.organizationId, parsed.organizationId),
      ))
      .limit(1);
    if (!membership) throw new Error('User is not a member of this workspace');

    const [existingOrganization] = await tx.select({
      id: schema.organizations.id,
      previousPlan: schema.organizations.adminPlanOverride,
    }).from(schema.organizations).where(eq(schema.organizations.id, parsed.organizationId)).limit(1);
    if (!existingOrganization) throw new Error('Workspace no longer exists');

    await tx.update(schema.organizations).set({
      adminPlanOverride: null,
      adminPlanOverrideExpiresAt: null,
      updatedAt: new Date(),
    }).where(eq(schema.organizations.id, parsed.organizationId));

    await tx.insert(schema.auditLogs).values({
      organizationId: parsed.organizationId,
      userId: session.user.id,
      action: 'admin_plan_override_cleared',
      details: { targetUserId: parsed.userId, previousPlan: existingOrganization.previousPlan, stripeBillingChanged: false },
    });
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/billing');
  revalidatePath('/billing');
  revalidatePath('/dashboard');
}

export async function suspendUser(userId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const targetUserId = userIdSchema.parse(userId);
  if (targetUserId === session.user.id) throw new Error('Cannot suspend your own account');

  await db.transaction(async (tx) => {
    const now = new Date();
    const [updatedUser] = await tx.update(schema.users).set({ status: 'suspended', updatedAt: now }).where(eq(schema.users.id, targetUserId)).returning({ id: schema.users.id });
    if (!updatedUser) throw new Error('User no longer exists');
    await tx.update(schema.sessions).set({ revokedAt: now }).where(eq(schema.sessions.userId, targetUserId));
    await tx.insert(schema.auditLogs).values({ userId: session.user.id, action: 'user_suspended', details: { targetUserId } });
  });

  revalidatePath('/admin/users');
}

export async function reactivateUser(userId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const targetUserId = userIdSchema.parse(userId);

  await db.transaction(async (tx) => {
    const [updatedUser] = await tx.update(schema.users)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(schema.users.id, targetUserId))
      .returning({ id: schema.users.id });
    if (!updatedUser) throw new Error('User no longer exists');
    await tx.insert(schema.auditLogs).values({
      userId: session.user.id,
      action: 'user_reactivated',
      details: { targetUserId },
    });
  });

  revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const targetUserId = userIdSchema.parse(userId);
  if (targetUserId === session.user.id) throw new Error('Cannot delete your own account');

  await db.transaction(async (tx) => {
    const now = new Date();
    const [updatedUser] = await tx.update(schema.users).set({ status: 'deleted', updatedAt: now }).where(eq(schema.users.id, targetUserId)).returning({ id: schema.users.id });
    if (!updatedUser) throw new Error('User no longer exists');
    await tx.update(schema.sessions).set({ revokedAt: now }).where(eq(schema.sessions.userId, targetUserId));
    await tx.insert(schema.auditLogs).values({ userId: session.user.id, action: 'user_deleted', details: { targetUserId } });
  });

  revalidatePath('/admin/users');
}
