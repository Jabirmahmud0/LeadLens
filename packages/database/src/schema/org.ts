import { sql } from 'drizzle-orm';
import { boolean, check, pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  websiteUrl: text('website_url'),
  logoUrl: text('logo_url'),
  countryCode: text('country_code'),
  timezone: text('timezone'),
  pendingBillingPlan: text('pending_billing_plan'),
  adminPlanOverride: text('admin_plan_override'),
  adminPlanOverrideExpiresAt: timestamp('admin_plan_override_expires_at', { withTimezone: true }),
  billingOnboardingCompleted: boolean('billing_onboarding_completed').default(true).notNull(),
  status: text('status').default('active').notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pendingBillingPlanValid: check(
    'organizations_pending_billing_plan_valid',
    sql`${table.pendingBillingPlan} is null or ${table.pendingBillingPlan} in ('solo', 'agency')`,
  ),
  adminPlanOverrideValid: check(
    'organizations_admin_plan_override_valid',
    sql`${table.adminPlanOverride} is null or ${table.adminPlanOverride} in ('free', 'solo', 'agency')`,
  ),
}));

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull().default('owner'),
  status: text('status').notNull().default('active'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  invitedBy: uuid('invited_by').references(() => users.id),
}, (table) => {
  return {
    orgUserUnique: unique('org_user_unique').on(table.organizationId, table.userId),
  };
});
