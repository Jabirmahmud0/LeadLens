import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { isPurchasablePlanKey } from '@leadlens/shared';
import { checkRateLimit, RATE_LIMITS } from '@leadlens/auth';
import { eq } from 'drizzle-orm';
import { requireBillingOwner } from '@/lib/billing/auth';
import { getApplicationUrl, getPublicBillingError, getStripe, getStripePriceId } from '@/lib/billing/stripe';

export const runtime = 'nodejs';

const checkoutSchema = z.object({
  plan: z.string().refine(isPurchasablePlanKey, 'Unknown billing plan'),
  source: z.enum(['billing', 'onboarding']).default('billing'),
  requestId: z.string().uuid(),
});
const LIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due', 'incomplete', 'paused'] as const;

export async function POST(request: Request) {
  const auth = await requireBillingOwner();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const parsed = checkoutSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Choose a valid paid plan' }, { status: 400 });

    const { session } = auth;
    const organizationId = session.organization.id;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const isAllowed = await checkRateLimit(ip, organizationId, 'billing_checkout', RATE_LIMITS.billingCheckout.limit, RATE_LIMITS.billingCheckout.windowMinutes);
    if (!isAllowed) return NextResponse.json({ error: 'Too many checkout attempts. Please wait and try again.' }, { status: 429 });
    if (parsed.data.source === 'onboarding') {
      await db.update(schema.organizations).set({ pendingBillingPlan: parsed.data.plan, updatedAt: new Date() })
        .where(eq(schema.organizations.id, organizationId));
    }
    const existingSubscription = await db.query.organizationSubscriptions.findFirst({
      where: eq(schema.organizationSubscriptions.organizationId, organizationId),
    });
    if (existingSubscription && LIVE_SUBSCRIPTION_STATUSES.includes(existingSubscription.status as typeof LIVE_SUBSCRIPTION_STATUSES[number])) {
      await db.update(schema.organizations).set({ pendingBillingPlan: null, billingOnboardingCompleted: true, updatedAt: new Date() })
        .where(eq(schema.organizations.id, organizationId));
      return NextResponse.json({ error: 'This organization already has a subscription. Use Manage billing to change it.' }, { status: 409 });
    }

    const stripe = getStripe();
    let billingAccount = await db.query.organizationBillingAccounts.findFirst({
      where: eq(schema.organizationBillingAccounts.organizationId, organizationId),
    });
    if (!billingAccount) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.organization.name,
        metadata: { organizationId },
      }, { idempotencyKey: `leadlens-customer-${organizationId}` });
      const [created] = await db.insert(schema.organizationBillingAccounts).values({
        organizationId,
        stripeCustomerId: customer.id,
        billingEmail: session.user.email,
      }).onConflictDoNothing().returning();
      billingAccount = created ?? await db.query.organizationBillingAccounts.findFirst({
        where: eq(schema.organizationBillingAccounts.organizationId, organizationId),
      });
    }
    if (!billingAccount) throw new Error('Unable to create the organization billing account');

    const { plan, source, requestId } = parsed.data;
    const appUrl = getApplicationUrl();
    const successPath = source === 'onboarding' ? '/onboarding/plan?checkout=success' : '/billing?checkout=success';
    const cancelPath = source === 'onboarding' ? '/onboarding/plan?checkout=cancelled' : '/billing?checkout=cancelled';
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: billingAccount.stripeCustomerId,
      client_reference_id: organizationId,
      line_items: [{ price: getStripePriceId(plan), quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: { organizationId, planKey: plan },
      subscription_data: { metadata: { organizationId, planKey: plan } },
      success_url: `${appUrl}${successPath}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${cancelPath}`,
    }, { idempotencyKey: `leadlens-checkout-${organizationId}-${requestId}` });

    if (!checkout.url) throw new Error('Stripe did not return a Checkout URL');
    if (source === 'billing') {
      await db.update(schema.organizations).set({ pendingBillingPlan: null, updatedAt: new Date() })
        .where(eq(schema.organizations.id, organizationId));
    }
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error('[billing-checkout]', error);
    return NextResponse.json({ error: getPublicBillingError(error, 'Unable to start secure checkout') }, { status: 503 });
  }
}
