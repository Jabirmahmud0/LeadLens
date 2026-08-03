import { BILLING_PLANS, isPurchasablePlanKey } from '@leadlens/shared';
import { getSession } from '@/lib/auth/session';
import { getBillingOverview } from '@/lib/billing/subscriptions';
import { ArrowRight, CalendarDays, Check, CircleAlert, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import { redirect } from 'next/navigation';
import { AutomaticCheckout, CheckoutButton, PortalButton } from './BillingActions';

export const metadata = { title: 'Billing | LeadLens' };

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ plan?: string; checkout?: string }> }) {
  const session = await getSession();
  if (!session?.organization) redirect('/login');
  const overview = await getBillingOverview(session.organization.id);
  const params = await searchParams;
  const automaticPlan = params.plan && isPurchasablePlanKey(params.plan) ? params.plan : undefined;
  const currentPlan = BILLING_PLANS[overview.planKey];
  const percent = Math.min(100, Math.round((overview.analysesUsed / overview.analysisLimit) * 100));
  const isOwner = session.role === 'owner';
  const hasLiveSubscription = Boolean(overview.subscription && ['active', 'trialing', 'past_due', 'incomplete', 'paused'].includes(overview.subscription.status));
  const canOpenPortal = Boolean(overview.subscription);

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_88%_0%,#dff8e8_0,transparent_28%),linear-gradient(180deg,#fbfdf9_0%,#f2f8f3_100%)] px-5 py-8 text-[#10251d] sm:px-8 lg:px-10">
      <AutomaticCheckout plan={automaticPlan} />
      <div className="mx-auto max-w-6xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-[#cfe1d4] bg-white p-7 shadow-[0_30px_80px_-58px_rgba(20,83,45,.55)] sm:p-10">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-emerald-100/70 blur-2xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Workspace billing</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Simple capacity for a growing pipeline.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[#60766b]">Your organization shares one plan and one analysis allowance. Stripe securely handles invoices, payment methods, and cancellation.</p></div>
            <div className="rounded-2xl border border-[#d7e5db] bg-[#f4f9f5] p-5">
              <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#60766b]">Current plan</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">{overview.status.replaceAll('_', ' ')}</span></div>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{currentPlan.name}</p>
              <p className="mt-1 text-xs text-[#789084]">{currentPlan.priceLabel}{currentPlan.monthlyPriceCents ? ' / month' : ''}</p>
              <div className="mt-5"><PortalButton disabled={!isOwner || !canOpenPortal} /></div>
            </div>
          </div>
        </header>

        {params.checkout === 'success' && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900"><Check className="size-4" />Payment received. Stripe is synchronizing your subscription now.</div>}
        {!isOwner && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"><CircleAlert className="size-4" />Only the organization owner can change billing. You can still view plan usage.</div>}

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-3xl border border-[#d8e6dc] bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Current period</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Analysis allowance</h2></div><span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Gauge className="size-5" /></span></div>
            <div className="mt-8 flex items-end justify-between gap-4"><p className="text-5xl font-semibold tracking-[-0.06em]">{overview.analysesUsed}<span className="text-xl text-[#91a49a]"> / {overview.analysisLimit}</span></p><span className="text-xs font-bold text-emerald-700">{100 - percent}% remaining</span></div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e9f1eb]"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-[width] duration-700" style={{ width: `${percent}%` }} /></div>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#789084]"><CalendarDays className="size-4 text-emerald-600" />Resets {dateFormatter.format(overview.periodEnd)}</div>
          </article>

          <article className="rounded-3xl border border-[#d8e6dc] bg-[#16352a] p-6 text-white sm:p-8">
            <Sparkles className="size-5 text-emerald-300" /><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Included with {currentPlan.name}</p><ul className="mt-5 space-y-3">{currentPlan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-[#d8ebe0]"><Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />{feature}</li>)}</ul>
          </article>
        </section>

        <section className="mt-5">
          <div className="mb-5 flex items-end justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Available plans</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Choose your operating capacity.</h2></div><ShieldCheck className="hidden size-6 text-emerald-600 sm:block" /></div>
          <div className="grid gap-4 md:grid-cols-2">
            {(['solo', 'agency'] as const).map((key) => {
              const plan = BILLING_PLANS[key];
              const isCurrent = overview.planKey === key;
              return <article key={key} className={`rounded-3xl border bg-white p-6 transition-all ${isCurrent ? 'border-emerald-500 shadow-[0_24px_60px_-48px_rgba(20,83,45,.8)]' : 'border-[#d8e6dc] hover:-translate-y-1 hover:border-emerald-300'}`}>
                <div className="flex items-start justify-between"><div><p className="text-xl font-semibold">{plan.name}</p><p className="mt-2 text-4xl font-semibold tracking-[-0.055em]">{plan.priceLabel}<span className="text-xs font-medium text-[#789084]"> / month</span></p></div>{isCurrent && <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase text-emerald-800">Current</span>}</div>
                <p className="mt-4 text-sm leading-6 text-[#60766b]">{plan.description}</p>
                <div className="mt-6"><CheckoutButton plan={key} disabled={!isOwner || hasLiveSubscription || isCurrent}>{isCurrent ? 'Current plan' : `Choose ${plan.name}`}</CheckoutButton></div>
              </article>;
            })}
          </div>
          <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#d8e6dc] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">Need custom volume or governance?</p><p className="mt-1 text-xs text-[#789084]">Growth plans are arranged with the LeadLens team.</p></div><a href="mailto:leadlens@saevix.dev?subject=LeadLens%20Growth%20plan" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">Discuss Growth <ArrowRight className="size-4" /></a></div>
        </section>
      </div>
    </main>
  );
}
