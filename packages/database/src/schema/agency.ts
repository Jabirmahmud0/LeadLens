import { pgTable, uuid, text, timestamp, jsonb, bigint, boolean, integer } from 'drizzle-orm/pg-core';
import { organizations } from './org';

export const agencyProfiles = pgTable('agency_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  shortDescription: text('short_description'),
  longDescription: text('long_description'),
  teamSizeRange: text('team_size_range'),
  primaryCategory: text('primary_category'),
  industries: jsonb('industries'),
  targetLocations: jsonb('target_locations'),
  projectMinCents: bigint('project_min_cents', { mode: 'number' }),
  projectMaxCents: bigint('project_max_cents', { mode: 'number' }),
  currency: text('currency').default('USD'),
  brandVoice: text('brand_voice'),
  outreachTone: text('outreach_tone'),
  reportDepth: text('report_depth'),
  technicalDetailLevel: text('technical_detail_level'),
  preferredChannels: jsonb('preferred_channels'),
  avoidedPhrases: jsonb('avoided_phrases'),
  setupCompletedAt: timestamp('setup_completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const agencyServices = pgTable('agency_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  summary: text('summary'),
  problemSolved: text('problem_solved'),
  deliverables: jsonb('deliverables'),
  industries: jsonb('industries'),
  disqualifiers: jsonb('disqualifiers'),
  priceMinCents: bigint('price_min_cents', { mode: 'number' }),
  priceMaxCents: bigint('price_max_cents', { mode: 'number' }),
  currency: text('currency').default('USD'),
  priority: integer('priority').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const idealCustomerProfiles = pgTable('ideal_customer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: text('name'),
  companySizeRanges: jsonb('company_size_ranges'),
  industries: jsonb('industries'),
  locations: jsonb('locations'),
  budgetMinCents: bigint('budget_min_cents', { mode: 'number' }),
  budgetMaxCents: bigint('budget_max_cents', { mode: 'number' }),
  preferredSignals: jsonb('preferred_signals'),
  disqualifyingSignals: jsonb('disqualifying_signals'),
  commonProblems: jsonb('common_problems'),
  decisionMakerRoles: jsonb('decision_maker_roles'),
  isDefault: boolean('is_default').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const caseStudies = pgTable('case_studies', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  clientName: text('client_name'),
  clientIndustry: text('client_industry'),
  clientType: text('client_type'),
  problem: text('problem'),
  solution: text('solution'),
  deliverables: jsonb('deliverables'),
  results: text('results'),
  metrics: jsonb('metrics'),
  publicUrl: text('public_url'),
  visibility: text('visibility').default('public'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const caseStudyServices = pgTable('case_study_services', {
  caseStudyId: uuid('case_study_id').references(() => caseStudies.id, { onDelete: 'cascade' }).notNull(),
  serviceId: uuid('service_id').references(() => agencyServices.id, { onDelete: 'cascade' }).notNull(),
});
