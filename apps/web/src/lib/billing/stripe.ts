import 'server-only';

import Stripe from 'stripe';
import { BILLING_PLANS, type PurchasablePlanKey } from '@leadlens/shared';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Stripe is not configured: STRIPE_SECRET_KEY is missing');
  stripeClient ??= new Stripe(secretKey, { appInfo: { name: 'LeadLens', version: '1.0.0' } });
  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Stripe is not configured: STRIPE_WEBHOOK_SECRET is missing');
  return secret;
}

export function getStripePriceId(plan: PurchasablePlanKey): string {
  const value = plan === 'solo' ? process.env.STRIPE_PRICE_SOLO_MONTHLY : process.env.STRIPE_PRICE_AGENCY_MONTHLY;
  if (!value) throw new Error(`Stripe is not configured: price for ${BILLING_PLANS[plan].name} is missing`);
  return value;
}

export function getPlanForStripePrice(priceId: string): PurchasablePlanKey | null {
  if (priceId === process.env.STRIPE_PRICE_SOLO_MONTHLY) return 'solo';
  if (priceId === process.env.STRIPE_PRICE_AGENCY_MONTHLY) return 'agency';
  return null;
}

export function getApplicationUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return new URL(configured).origin;
  if (process.env.NODE_ENV === 'production') throw new Error('NEXT_PUBLIC_APP_URL is required in production');
  return 'http://localhost:3000';
}

export function getPublicBillingError(error: unknown, fallback: string): string {
  if (process.env.NODE_ENV !== 'production' && error instanceof Error) return error.message;
  return fallback;
}
