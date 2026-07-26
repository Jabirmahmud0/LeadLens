import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { organizations } from './org';
import { users } from './auth';

export const prospects = pgTable('prospects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  companyName: text('company_name'),
  websiteUrl: text('website_url').notNull(),
  normalizedDomain: text('normalized_domain').notNull(),
  industry: text('industry'),
  countryCode: text('country_code'),
  locationText: text('location_text'),
  contactName: text('contact_name'),
  contactRole: text('contact_role'),
  contactEmail: text('contact_email'),
  contactProfileUrl: text('contact_profile_url'),
  notes: text('notes'),
  status: text('status').default('new').notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  pinnedAt: timestamp('pinned_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    orgCreatedAtIdx: index('prospects_org_created_at_idx').on(table.organizationId, table.createdAt),
    orgDomainIdx: index('prospects_org_domain_idx').on(table.organizationId, table.normalizedDomain),
    orgStatusIdx: index('prospects_org_status_idx').on(table.organizationId, table.status),
  };
});

export const prospectCompetitors = pgTable('prospect_competitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  prospectId: uuid('prospect_id').references(() => prospects.id, { onDelete: 'cascade' }).notNull(),
  competitorUrl: text('competitor_url').notNull(),
  normalizedDomain: text('normalized_domain').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
