import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const PLATFORM_ROLES = [
  'platform_owner',
  'platform_ops',
  'support_agent',
  'billing_admin',
  'readonly_auditor',
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const platformRoleAssignments = pgTable('platform_role_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').$type<PlatformRole>().notNull(),
  grantedBy: uuid('granted_by').references(() => users.id, { onDelete: 'set null' }),
  grantReason: text('grant_reason'),
  source: text('source').default('manual').notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedBy: uuid('revoked_by').references(() => users.id, { onDelete: 'set null' }),
  revokeReason: text('revoke_reason'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userRoleUnique: unique('platform_role_assignments_user_role_unique').on(table.userId, table.role),
  userActiveIdx: index('platform_role_assignments_user_active_idx').on(table.userId, table.revokedAt),
  roleActiveIdx: index('platform_role_assignments_role_active_idx').on(table.role, table.revokedAt),
}));
