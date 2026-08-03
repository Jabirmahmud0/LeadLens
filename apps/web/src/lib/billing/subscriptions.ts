import 'server-only';

import { BILLING_PLANS, type BillingPlanKey } from '@leadlens/shared';
import { db, schema } from '@leadlens/database';
import { and, count, desc, eq, gte, lt, lte } from 'drizzle-orm';
import type Stripe from 'stripe';
import { getPlanForStripePrice, getStripe } from './stripe';

const PAID_ACCESS_STATUSES = new Set(['active', 'trialing', 'past_due']);
const PERIOD_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

export interface OrganizationEntitlement {
  planKey: BillingPlanKey;
  status: string;
  periodStart: Date;
  periodEnd: Date;
  analysisLimit: number;
  subscription: typeof schema.organizationSubscriptions.$inferSelect | null;
}

function freePeriod(now: Date) {
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { periodStart, periodEnd };
}

export async function getOrganizationEntitlement(organizationId: string, now = new Date()): Promise<OrganizationEntitlement> {
  const [subscription, organization] = await Promise.all([
    db.query.organizationSubscriptions.findFirst({
      where: eq(schema.organizationSubscriptions.organizationId, organizationId),
    }),
    db.query.organizations.findFirst({
      columns: { adminPlanOverride: true, adminPlanOverrideExpiresAt: true },
      where: eq(schema.organizations.id, organizationId),
    }),
  ]);
  const overridePlan = organization?.adminPlanOverride;
  const overrideExpiresAt = organization?.adminPlanOverrideExpiresAt;
  const overrideIsActive = (overridePlan === 'free' || overridePlan === 'solo' || overridePlan === 'agency')
    && (!overrideExpiresAt || overrideExpiresAt > now);

  if (overrideIsActive) {
    const period = freePeriod(now);
    return {
      planKey: overridePlan,
      status: 'admin_override',
      ...period,
      analysisLimit: BILLING_PLANS[overridePlan].monthlyAnalyses!,
      subscription: subscription ?? null,
    };
  }
  const retainsPaidAccess = subscription
    && PAID_ACCESS_STATUSES.has(subscription.status)
    && subscription.currentPeriodEnd.getTime() + PERIOD_GRACE_MS > now.getTime();

  if (retainsPaidAccess && (subscription.planKey === 'solo' || subscription.planKey === 'agency')) {
    const plan = BILLING_PLANS[subscription.planKey];
    return {
      planKey: subscription.planKey,
      status: subscription.status,
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
      analysisLimit: plan.monthlyAnalyses!,
      subscription,
    };
  }

  const period = freePeriod(now);
  return {
    planKey: 'free',
    status: subscription?.status ?? 'free',
    ...period,
    analysisLimit: BILLING_PLANS.free.monthlyAnalyses!,
    subscription: subscription ?? null,
  };
}

export async function getBillingOverview(organizationId: string) {
  const entitlement = await getOrganizationEntitlement(organizationId);
  const usage = await db.query.organizationUsagePeriods.findFirst({
    where: and(
      eq(schema.organizationUsagePeriods.organizationId, organizationId),
      eq(schema.organizationUsagePeriods.periodStart, entitlement.periodStart),
      gte(schema.organizationUsagePeriods.periodEnd, entitlement.periodEnd),
    ),
    orderBy: [desc(schema.organizationUsagePeriods.periodStart)],
  });
  let analysesUsed = usage?.analysesUsed;
  if (analysesUsed === undefined) {
    const [existingUsage] = await db.select({ value: count() }).from(schema.analysisJobs).where(and(
      eq(schema.analysisJobs.organizationId, organizationId),
      gte(schema.analysisJobs.createdAt, entitlement.periodStart),
      lt(schema.analysisJobs.createdAt, entitlement.periodEnd),
    ));
    analysesUsed = existingUsage.value;
  }
  return { ...entitlement, analysesUsed };
}

function idOf(value: string | { id: string } | null): string | null {
  return typeof value === 'string' ? value : value?.id ?? null;
}

export async function syncStripeSubscription(subscriptionId: string, eventCreatedAt: Date) {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] });
  const item = subscription.items.data[0];
  if (!item) throw new Error(`Stripe subscription ${subscription.id} has no subscription item`);
  const planKey = getPlanForStripePrice(item.price.id);
  if (!planKey) throw new Error(`Stripe subscription ${subscription.id} uses an unknown price ${item.price.id}`);

  const stripeCustomerId = idOf(subscription.customer);
  if (!stripeCustomerId) throw new Error(`Stripe subscription ${subscription.id} has no customer`);

  const billingAccount = await db.query.organizationBillingAccounts.findFirst({
    where: eq(schema.organizationBillingAccounts.stripeCustomerId, stripeCustomerId),
  });
  const metadataOrganizationId = subscription.metadata.organizationId;
  const organizationId = billingAccount?.organizationId ?? metadataOrganizationId;
  if (!organizationId) throw new Error(`Stripe subscription ${subscription.id} is not linked to an organization`);
  if (billingAccount && metadataOrganizationId && billingAccount.organizationId !== metadataOrganizationId) {
    throw new Error(`Stripe customer ${stripeCustomerId} organization metadata does not match LeadLens`);
  }

  if (!billingAccount) {
    await db.insert(schema.organizationBillingAccounts).values({
      organizationId,
      stripeCustomerId,
    }).onConflictDoNothing();
  }

  const periodStart = new Date(item.current_period_start * 1000);
  const periodEnd = new Date(item.current_period_end * 1000);
  const values = {
    organizationId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId,
    stripePriceId: item.price.id,
    planKey,
    status: subscription.status,
    quantity: item.quantity ?? 1,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    latestStripeEventCreatedAt: eventCreatedAt,
    updatedAt: new Date(),
  };

  await db.insert(schema.organizationSubscriptions).values(values).onConflictDoUpdate({
    target: schema.organizationSubscriptions.organizationId,
    set: values,
    setWhere: lte(schema.organizationSubscriptions.latestStripeEventCreatedAt, eventCreatedAt),
  });

  await db.update(schema.organizations).set({
    pendingBillingPlan: null,
    billingOnboardingCompleted: true,
    updatedAt: new Date(),
  }).where(eq(schema.organizations.id, organizationId));
}

export function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const legacy = (invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }).subscription;
  if (legacy) return idOf(legacy);
  const parent = invoice.parent;
  return parent?.type === 'subscription_details' && parent.subscription_details
    ? idOf(parent.subscription_details.subscription)
    : null;
}
