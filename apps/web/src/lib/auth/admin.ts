import 'server-only';

import { db, schema } from '@leadlens/database';
import type { PlatformRole } from '@leadlens/database';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { getSession } from './session';

export const PLATFORM_OWNER_ROLE: PlatformRole = 'platform_owner';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Environment-based owners are bootstrap candidates only. This list never
 * authorizes a request; active database assignments are the authority.
 */
export function getPlatformBootstrapEmails(value = process.env.ADMIN_EMAILS): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map(normalizeEmail)
      .filter(Boolean),
  );
}

export async function getActivePlatformRoles(userId: string): Promise<PlatformRole[]> {
  const assignments = await db.select({ role: schema.platformRoleAssignments.role })
    .from(schema.platformRoleAssignments)
    .where(and(
      eq(schema.platformRoleAssignments.userId, userId),
      isNull(schema.platformRoleAssignments.revokedAt),
    ));

  return assignments.map((assignment) => assignment.role);
}

export async function hasPlatformRole(userId: string, ...allowedRoles: PlatformRole[]): Promise<boolean> {
  if (!allowedRoles.length) return false;

  const [assignment] = await db.select({ id: schema.platformRoleAssignments.id })
    .from(schema.platformRoleAssignments)
    .where(and(
      eq(schema.platformRoleAssignments.userId, userId),
      inArray(schema.platformRoleAssignments.role, allowedRoles),
      isNull(schema.platformRoleAssignments.revokedAt),
    ))
    .limit(1);

  return Boolean(assignment);
}

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  return hasPlatformRole(userId, PLATFORM_OWNER_ROLE);
}

export async function requirePlatformRole(...allowedRoles: PlatformRole[]) {
  const session = await getSession();
  if (!session?.user || !(await hasPlatformRole(session.user.id, ...allowedRoles))) {
    throw new Error('Forbidden');
  }

  return { session, roles: await getActivePlatformRoles(session.user.id) };
}

/**
 * Creates or restores the database assignment for an environment-listed
 * bootstrap account. Call only after that account has authenticated.
 */
export async function ensureBootstrapPlatformOwner(user: { id: string; email: string }): Promise<boolean> {
  if (!getPlatformBootstrapEmails().has(normalizeEmail(user.email))) return false;

  const [existing] = await db.select({
    id: schema.platformRoleAssignments.id,
    revokedAt: schema.platformRoleAssignments.revokedAt,
  }).from(schema.platformRoleAssignments).where(and(
    eq(schema.platformRoleAssignments.userId, user.id),
    eq(schema.platformRoleAssignments.role, PLATFORM_OWNER_ROLE),
  )).limit(1);

  if (existing && !existing.revokedAt) return false;

  await db.transaction(async (tx) => {
    if (existing) {
      await tx.update(schema.platformRoleAssignments).set({
        grantedBy: user.id,
        grantReason: 'Environment bootstrap after authenticated login',
        source: 'environment_bootstrap',
        grantedAt: new Date(),
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
        updatedAt: new Date(),
      }).where(eq(schema.platformRoleAssignments.id, existing.id));
    } else {
      await tx.insert(schema.platformRoleAssignments).values({
        userId: user.id,
        role: PLATFORM_OWNER_ROLE,
        grantedBy: user.id,
        grantReason: 'Environment bootstrap after authenticated login',
        source: 'environment_bootstrap',
      });
    }

    await tx.insert(schema.auditLogs).values({
      userId: user.id,
      action: 'platform_role_bootstrapped',
      details: { role: PLATFORM_OWNER_ROLE, source: 'environment_bootstrap' },
    });
  });

  return true;
}
