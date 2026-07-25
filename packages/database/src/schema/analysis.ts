import { pgTable, uuid, text, timestamp, jsonb, integer, unique } from 'drizzle-orm/pg-core';
import { organizations } from './org';
import { prospects } from './prospect';
import { users } from './auth';

export const analysisJobs = pgTable('analysis_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  prospectId: uuid('prospect_id').references(() => prospects.id, { onDelete: 'cascade' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  status: text('status').default('queued').notNull(), // queued, processing, completed, partial, failed, cancelled
  currentStep: text('current_step'),
  progressPercent: integer('progress_percent').default(0),
  requestedOptions: jsonb('requested_options'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),
  failureCode: text('failure_code'),
  failureMessage: text('failure_message'),
  retryCount: integer('retry_count').default(0),
  workerId: text('worker_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const analysisJobSteps = pgTable('analysis_job_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  analysisJobId: uuid('analysis_job_id').references(() => analysisJobs.id, { onDelete: 'cascade' }).notNull(),
  stepKey: text('step_key').notNull(),
  status: text('status').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  attemptCount: integer('attempt_count').default(1),
  inputSummary: jsonb('input_summary'),
  outputSummary: jsonb('output_summary'),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
}, (table) => {
  return {
    jobStepUnique: unique('job_step_unique').on(table.analysisJobId, table.stepKey),
  };
});
