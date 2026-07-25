import { pgTable, uuid, text, timestamp, jsonb, integer, numeric, boolean } from 'drizzle-orm/pg-core';
import { organizations } from './org';
import { prospects } from './prospect';
import { analysisJobs } from './analysis';
import { sourcePages } from './sources';
import { agencyServices } from './agency';

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  prospectId: uuid('prospect_id').references(() => prospects.id, { onDelete: 'cascade' }).notNull(),
  analysisJobId: uuid('analysis_job_id').references(() => analysisJobs.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').default(1).notNull(),
  title: text('title'),
  executiveSummary: text('executive_summary'),
  opportunityThesis: text('opportunity_thesis'),
  overallScore: integer('overall_score'),
  scoreLabel: text('score_label'),
  confidence: text('confidence'),
  primaryServiceId: uuid('primary_service_id').references(() => agencyServices.id),
  secondaryServiceId: uuid('secondary_service_id').references(() => agencyServices.id),
  recommendedAction: text('recommended_action'),
  limitations: text('limitations'),
  generatedAt: timestamp('generated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reportScores = pgTable('report_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(),
  score: integer('score'),
  weight: numeric('weight'),
  explanation: text('explanation'),
  positiveFactors: jsonb('positive_factors'),
  negativeFactors: jsonb('negative_factors'),
  missingInformation: jsonb('missing_information'),
});

export const reportFindings = pgTable('report_findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  observation: text('observation'),
  businessImpact: text('business_impact'),
  recommendation: text('recommendation'),
  severity: text('severity'),
  confidence: text('confidence'),
  evidenceType: text('evidence_type'),
  matchedServiceId: uuid('matched_service_id').references(() => agencyServices.id),
  sortOrder: integer('sort_order').default(0),
  isHidden: boolean('is_hidden').default(false),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const findingSources = pgTable('finding_sources', {
  findingId: uuid('finding_id').references(() => reportFindings.id, { onDelete: 'cascade' }).notNull(),
  sourcePageId: uuid('source_page_id').references(() => sourcePages.id, { onDelete: 'cascade' }).notNull(),
  evidenceExcerpt: text('evidence_excerpt'),
  evidenceLocation: jsonb('evidence_location'),
  supportStrength: text('support_strength'),
});

export const serviceRecommendations = pgTable('service_recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  serviceId: uuid('service_id').references(() => agencyServices.id, { onDelete: 'cascade' }).notNull(),
  rank: integer('rank'),
  matchScore: integer('match_score'),
  rationale: text('rationale'),
  suggestedScope: jsonb('suggested_scope'),
  risks: jsonb('risks'),
  assumptions: jsonb('assumptions'),
});

export const reportOutreach = pgTable('report_outreach', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  channel: text('channel'),
  tone: text('tone'),
  subjectLines: jsonb('subject_lines'),
  opener: text('opener'),
  body: text('body'),
  followUp: text('follow_up'),
  callToAction: text('call_to_action'),
  userEditedBody: text('user_edited_body'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const reportCallQuestions = pgTable('report_call_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  category: text('category'),
  question: text('question'),
  rationale: text('rationale'),
  priority: integer('priority'),
  isChecked: boolean('is_checked').default(false),
  notes: text('notes'),
});

export const reportObjections = pgTable('report_objections', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  objection: text('objection'),
  suggestedResponse: text('suggested_response'),
  confidence: text('confidence'),
  sortOrder: integer('sort_order').default(0),
});

export const proposalStarters = pgTable('proposal_starters', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }).notNull(),
  problemStatement: text('problem_statement'),
  objectives: text('objectives'),
  scope: text('scope'),
  phases: text('phases'),
  successMetrics: text('success_metrics'),
  assumptions: text('assumptions'),
  nextStep: text('next_step'),
  userEditedContent: text('user_edited_content'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
