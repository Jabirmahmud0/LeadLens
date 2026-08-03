import { redirect } from 'next/navigation';
import { isPurchasablePlanKey } from '@leadlens/shared';
import { getSession } from '@/lib/auth/session';
import { getStripe } from '@/lib/billing/stripe';
import { syncStripeSubscription } from '@/lib/billing/subscriptions';
import { PlanSelection } from './PlanSelection';

export const metadata = { title: 'Choose your plan | LeadLens' };

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ checkout?: string; session_id?: string }> }) {
  const session = await getSession();
  if (!session?.organization) redirect('/login');

  const params = await searchParams;
  let checkoutError: string | null = null;
  let checkoutConfirmed = false;
  if (params.checkout === 'success' && params.session_id) {
    try {
      const checkout = await getStripe().checkout.sessions.retrieve(params.session_id);
      const subscriptionId = typeof checkout.subscription === 'string' ? checkout.subscription : checkout.subscription?.id;
      if (checkout.status !== 'complete' || checkout.client_reference_id !== session.organization.id || checkout.mode !== 'subscription' || !subscriptionId) {
        throw new Error('Checkout does not match this workspace');
      }
      await syncStripeSubscription(subscriptionId, new Date());
      checkoutConfirmed = true;
    } catch (caught) {
      checkoutError = caught instanceof Error ? caught.message : 'Unable to confirm the subscription';
    }
  }
  if (checkoutConfirmed) redirect('/onboarding/identity?checkout=success');

  const pendingPlan = isPurchasablePlanKey(session.organization.pendingBillingPlan ?? '')
    ? session.organization.pendingBillingPlan as 'solo' | 'agency'
    : 'free';

  if (session.organization.billingOnboardingCompleted && pendingPlan === 'free') redirect('/billing');

  return <PlanSelection initialPlan={pendingPlan} checkoutCancelled={params.checkout === 'cancelled'} checkoutError={checkoutError} />;
}
