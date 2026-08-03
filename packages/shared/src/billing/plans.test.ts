import { describe, expect, it } from 'vitest';
import { BILLING_PLANS, isBillingPlanKey, isPurchasablePlanKey } from './plans';

describe('billing plan catalog', () => {
  it('keeps the published subscription allowances in one catalog', () => {
    expect(BILLING_PLANS.free.monthlyAnalyses).toBe(5);
    expect(BILLING_PLANS.solo.monthlyAnalyses).toBe(50);
    expect(BILLING_PLANS.agency.monthlyAnalyses).toBe(200);
    expect(BILLING_PLANS.agency.monthlyPriceCents).toBe(19900);
  });

  it('only permits self-service checkout for Stripe-backed plans', () => {
    expect(isPurchasablePlanKey('solo')).toBe(true);
    expect(isPurchasablePlanKey('agency')).toBe(true);
    expect(isPurchasablePlanKey('free')).toBe(false);
    expect(isPurchasablePlanKey('growth')).toBe(false);
    expect(isBillingPlanKey('unknown')).toBe(false);
  });
});
