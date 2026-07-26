import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { organizations } from './org';
import { analysisJobs } from './analysis';
import { reports, reportFindings } from './report';
import { users } from './auth';

export const aiRuns = pgTable('ai_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  analysisJobId: uuid('analysis_job_id').references(() => analysisJobs.id, { onDelete: 'cascade' }),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }),
  purpose: text('purpose'),
  provider: text('provider'),
  model: text('model'),
  promptVersion: text('prompt_version'),
  inputHash: text('input_hash'),
  status: text('status'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  latencyMs: integer('latency_ms'),
  retryCount: integer('retry_count').default(0),
  fallbackUsed: boolean('fallback_used').default(false),
  errorCode: text('error_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const promptVersions = pgTable('prompt_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  purpose: text('purpose').notNull(),
  version: text('version').notNull(),
  templateHash: text('template_hash'),
  schemaVersion: text('schema_version'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const findingFeedback = pgTable('finding_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  findingId: uuid('finding_id').references(() => reportFindings.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  feedback: text('feedback'), // useful, inaccurate, irrelevant, unclear
  reason: text('reason'),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reportFeedback = pgTable('report_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  overallUsefulness: integer('overall_usefulness'),
  timeSavedEstimate: text('time_saved_estimate'),
  usedForOutreach: boolean('used_for_outreach').default(false),
  usedForCall: boolean('used_for_call').default(false),
  usedForProposal: boolean('used_for_proposal').default(false),
  comments: text('comments'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const usageEvents = pgTable('usage_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  eventName: text('event_name').notNull(),
  properties: jsonb('properties'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ orgCreatedIdx: index('usage_events_org_created_idx').on(table.organizationId, table.createdAt), eventCreatedIdx: index('usage_events_event_created_idx').on(table.eventName, table.createdAt) }));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  details: jsonb('details'),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ orgCreatedIdx: index('audit_logs_org_created_idx').on(table.organizationId, table.createdAt), actionCreatedIdx: index('audit_logs_action_created_idx').on(table.action, table.createdAt) }));
