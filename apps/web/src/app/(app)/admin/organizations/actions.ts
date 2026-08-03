'use server';

import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { PLATFORM_OWNER_ROLE, requirePlatformRole } from '@/lib/auth/admin';
import { z } from 'zod';

const organizationIdSchema = z.string().uuid();

export async function suspendOrganization(orgId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const organizationId = organizationIdSchema.parse(orgId);

  await db.update(schema.organizations)
    .set({ status: 'suspended', updatedAt: new Date() })
    .where(eq(schema.organizations.id, organizationId));

  await db.insert(schema.auditLogs).values({
    userId: session.user.id,
    action: 'organization_suspended',
    details: { targetOrgId: organizationId },
  });

  revalidatePath('/admin/organizations');
}

export async function reactivateOrganization(orgId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);
  const organizationId = organizationIdSchema.parse(orgId);

  await db.update(schema.organizations)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(schema.organizations.id, organizationId));

  await db.insert(schema.auditLogs).values({
    userId: session.user.id,
    action: 'organization_reactivated',
    details: { targetOrgId: organizationId },
  });

  revalidatePath('/admin/organizations');
}
