'use server';

import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { PLATFORM_OWNER_ROLE, requirePlatformRole } from '@/lib/auth/admin';

export async function suspendOrganization(orgId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);

  await db.update(schema.organizations)
    .set({ status: 'suspended', updatedAt: new Date() })
    .where(eq(schema.organizations.id, orgId));

  await db.insert(schema.auditLogs).values({
    userId: session.user.id,
    action: 'organization_suspended',
    details: { targetOrgId: orgId },
  });

  revalidatePath('/admin/organizations');
}

export async function reactivateOrganization(orgId: string) {
  const { session } = await requirePlatformRole(PLATFORM_OWNER_ROLE);

  await db.update(schema.organizations)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(schema.organizations.id, orgId));

  await db.insert(schema.auditLogs).values({
    userId: session.user.id,
    action: 'organization_reactivated',
    details: { targetOrgId: orgId },
  });

  revalidatePath('/admin/organizations');
}
