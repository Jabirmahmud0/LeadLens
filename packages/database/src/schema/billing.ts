import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { organizations } from './org';

export const organizationBillingAccounts = pgTable('organization_billing_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  billingEmail: text('billing_email'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationUnique: unique('organization_billing_accounts_org_unique').on(table.organizationId),
  customerUnique: unique('organization_billing_accounts_customer_unique').on(table.stripeCustomerId),
}));

export const organizationSubscriptions = pgTable('organization_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  planKey: text('plan_key').notNull(),
  status: text('status').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  cancelAt: timestamp('cancel_at', { withTimezone: true }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  latestStripeEventCreatedAt: timestamp('latest_stripe_event_created_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationUnique: unique('organization_subscriptions_org_unique').on(table.organizationId),
  subscriptionUnique: unique('organization_subscriptions_stripe_subscription_unique').on(table.stripeSubscriptionId),
  customerIdx: index('organization_subscriptions_customer_idx').on(table.stripeCustomerId),
  statusIdx: index('organization_subscriptions_status_idx').on(table.status),
}));

export const organizationUsagePeriods = pgTable('organization_usage_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  planKey: text('plan_key').notNull(),
  analysisLimit: integer('analysis_limit').notNull(),
  analysesUsed: integer('analyses_used').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  organizationPeriodUnique: unique('organization_usage_periods_org_start_unique').on(table.organizationId, table.periodStart),
  organizationEndIdx: index('organization_usage_periods_org_end_idx').on(table.organizationId, table.periodEnd),
  analysisLimitPositive: check('organization_usage_periods_limit_positive', sql`${table.analysisLimit} > 0`),
  analysesUsedNonnegative: check('organization_usage_periods_used_nonnegative', sql`${table.analysesUsed} >= 0`),
}));

export const stripeBillingEvents = pgTable('stripe_billing_events', {
  stripeEventId: text('stripe_event_id').primaryKey(),
  eventType: text('event_type').notNull(),
  stripeObjectId: text('stripe_object_id'),
  apiVersion: text('api_version'),
  livemode: boolean('livemode').notNull(),
  status: text('status').default('received').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  lastError: text('last_error'),
  eventCreatedAt: timestamp('event_created_at', { withTimezone: true }).notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
}, (table) => ({
  statusReceivedIdx: index('stripe_billing_events_status_received_idx').on(table.status, table.receivedAt),
}));
