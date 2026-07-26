import { pgTable, uuid, text, timestamp, jsonb, integer, numeric, boolean, unique, index } from 'drizzle-orm/pg-core';
import { analysisJobs } from './analysis';
import { prospects } from './prospect';

export const sourcePages = pgTable('source_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisJobId: uuid('analysis_job_id').references(() => analysisJobs.id, { onDelete: 'cascade' }).notNull(),
  prospectId: uuid('prospect_id').references(() => prospects.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  canonicalUrl: text('canonical_url'),
  pageType: text('page_type'),
  title: text('title'),
  metaDescription: text('meta_description'),
  statusCode: integer('status_code'),
  contentType: text('content_type'),
  language: text('language'),
  extractedText: text('extracted_text'),
  extractedData: jsonb('extracted_data'),
  contentHash: text('content_hash'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }),
  fetchDurationMs: integer('fetch_duration_ms'),
  isPrimary: boolean('is_primary').default(false),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
}, (table) => ({
  jobUrlUnique: unique('source_pages_job_url_unique').on(table.analysisJobId, table.url),
  jobFetchedIdx: index('source_pages_job_fetched_idx').on(table.analysisJobId, table.fetchedAt),
}));

export const technicalChecks = pgTable('technical_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisJobId: uuid('analysis_job_id').references(() => analysisJobs.id, { onDelete: 'cascade' }).notNull(),
  prospectId: uuid('prospect_id').references(() => prospects.id, { onDelete: 'cascade' }).notNull(),
  checkKey: text('check_key').notNull(),
  category: text('category'),
  status: text('status'),
  value: jsonb('value'),
  severity: text('severity'),
  sourceUrl: text('source_url'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  jobCheckUnique: unique('technical_checks_job_check_unique').on(table.analysisJobId, table.checkKey),
  jobStatusIdx: index('technical_checks_job_status_idx').on(table.analysisJobId, table.status),
}));

export const pagespeedResults = pgTable('pagespeed_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisJobId: uuid('analysis_job_id').references(() => analysisJobs.id, { onDelete: 'cascade' }).notNull(),
  strategy: text('strategy').notNull(),
  performanceScore: numeric('performance_score'),
  accessibilityScore: numeric('accessibility_score'),
  seoScore: numeric('seo_score'),
  bestPracticesScore: numeric('best_practices_score'),
  metrics: jsonb('metrics'),
  opportunities: jsonb('opportunities'),
  rawSummary: jsonb('raw_summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  jobStrategyUnique: unique('pagespeed_results_job_strategy_unique').on(table.analysisJobId, table.strategy),
}));

import { relations } from 'drizzle-orm';
import { findingSources } from './report';

export const sourcePagesRelations = relations(sourcePages, ({ many }) => ({
  findings: many(findingSources),
}));
