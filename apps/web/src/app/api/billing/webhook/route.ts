import { NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { and, eq, ne, sql } from 'drizzle-orm';
import type Stripe from 'stripe';
import { getStripe, getStripeWebhookSecret } from '@/lib/billing/stripe';
import { subscriptionIdFromInvoice, syncStripeSubscription } from '@/lib/billing/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function objectId(object: Stripe.Event.Data.Object): string | null {
  return 'id' in object && typeof object.id === 'string' ? object.id : null;
}

function checkoutSubscriptionId(session: Stripe.Checkout.Session): string | null {
  return typeof session.subscription === 'string' ? session.subscription : session.subscription?.id ?? null;
}

async function processEvent(event: Stripe.Event) {
  const occurredAt = new Date(event.created * 1000);
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode !== 'subscription') return;
      const subscriptionId = checkoutSubscriptionId(session);
      if (subscriptionId) await syncStripeSubscription(subscriptionId, occurredAt);
      return;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused':
    case 'customer.subscription.resumed':
      await syncStripeSubscription(event.data.object.id, occurredAt);
      return;
    case 'invoice.paid':
    case 'invoice.payment_failed':
    case 'invoice.payment_action_required':
    case 'invoice.finalization_failed': {
      const subscriptionId = subscriptionIdFromInvoice(event.data.object);
      if (subscriptionId) await syncStripeSubscription(subscriptionId, occurredAt);
      return;
    }
    default:
      return;
  }
}

export async function POST(request: Request) {
  let event: Stripe.Event;
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    event = getStripe().webhooks.constructEvent(await request.text(), signature, getStripeWebhookSecret());
  } catch (error) {
    console.error('[stripe-webhook] Signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
  }

  const [inserted] = await db.insert(schema.stripeBillingEvents).values({
    stripeEventId: event.id,
    eventType: event.type,
    stripeObjectId: objectId(event.data.object),
    apiVersion: event.api_version,
    livemode: event.livemode,
    eventCreatedAt: new Date(event.created * 1000),
  }).onConflictDoNothing().returning({ stripeEventId: schema.stripeBillingEvents.stripeEventId });

  if (!inserted) {
    const existing = await db.query.stripeBillingEvents.findFirst({
      where: eq(schema.stripeBillingEvents.stripeEventId, event.id),
    });
    if (existing?.status === 'processed') return NextResponse.json({ received: true, duplicate: true });
  }

  await db.update(schema.stripeBillingEvents).set({
    status: 'processing',
    attempts: sql`${schema.stripeBillingEvents.attempts} + 1`,
    lastError: null,
  }).where(and(
    eq(schema.stripeBillingEvents.stripeEventId, event.id),
    ne(schema.stripeBillingEvents.status, 'processed'),
  ));

  try {
    await processEvent(event);
    await db.update(schema.stripeBillingEvents).set({ status: 'processed', processedAt: new Date(), lastError: null })
      .where(eq(schema.stripeBillingEvents.stripeEventId, event.id));
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown webhook processing error';
    console.error(`[stripe-webhook] ${event.id} failed:`, error);
    await db.update(schema.stripeBillingEvents).set({ status: 'failed', lastError: message.slice(0, 2000) })
      .where(eq(schema.stripeBillingEvents.stripeEventId, event.id));
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
