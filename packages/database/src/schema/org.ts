import { pgTable, uuid, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  websiteUrl: text('website_url'),
  logoUrl: text('logo_url'),
  countryCode: text('country_code'),
  timezone: text('timezone'),
  status: text('status').default('active').notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

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
