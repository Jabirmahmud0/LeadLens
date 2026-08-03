export const BILLING_PLAN_KEYS = ['free', 'solo', 'agency', 'growth'] as const;

export type BillingPlanKey = (typeof BILLING_PLAN_KEYS)[number];
export type PurchasablePlanKey = Extract<BillingPlanKey, 'solo' | 'agency'>;

export interface BillingPlan {
  key: BillingPlanKey;
  name: string;
  priceLabel: string;
  monthlyPriceCents: number | null;
  monthlyAnalyses: number | null;
  includedSeats: number | null;
  whiteLabelExport: boolean;
  purchasable: boolean;
  description: string;
  features: readonly string[];
}

export const BILLING_PLANS: Record<BillingPlanKey, BillingPlan> = {
  free: {
    key: 'free',
    name: 'Hobby',
    priceLabel: '$0',
    monthlyPriceCents: 0,
    monthlyAnalyses: 5,
    includedSeats: 1,
    whiteLabelExport: false,
    purchasable: false,
    description: 'Explore the complete workflow with a small prospect list.',
    features: ['5 analyses per month', '1 workspace seat', 'Standard web export'],
  },
  solo: {
    key: 'solo',
    name: 'Solo',
    priceLabel: '$49',
    monthlyPriceCents: 4900,
    monthlyAnalyses: 50,
    includedSeats: 3,
    whiteLabelExport: false,
    purchasable: true,
    description: 'For independent consultants with an active sales pipeline.',
    features: ['50 analyses per month', 'Up to 3 team seats', 'Case-study matching', 'Standard web export'],
  },
  agency: {
    key: 'agency',
    name: 'Agency',
    priceLabel: '$199',
    monthlyPriceCents: 19900,
    monthlyAnalyses: 200,
    includedSeats: 10,
    whiteLabelExport: true,
    purchasable: true,
    description: 'For growing agencies coordinating sales and strategy.',
    features: ['200 analyses per month', 'Up to 10 team seats', 'White-labeled exports', 'Advanced service matching'],
  },
  growth: {
    key: 'growth',
    name: 'Growth',
    priceLabel: 'Custom',
    monthlyPriceCents: null,
    monthlyAnalyses: null,
    includedSeats: null,
    whiteLabelExport: true,
    purchasable: false,
    description: 'For larger organizations with higher volume and governance needs.',
    features: ['Custom analysis volume', 'Custom seat allocation', 'Integration planning', 'Dedicated onboarding'],
  },
};

export function isBillingPlanKey(value: string): value is BillingPlanKey {
  return BILLING_PLAN_KEYS.includes(value as BillingPlanKey);
}

export function isPurchasablePlanKey(value: string): value is PurchasablePlanKey {
  return value === 'solo' || value === 'agency';
}
