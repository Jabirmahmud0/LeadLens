'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BILLING_PLANS } from '@leadlens/shared';
import { ArrowRight, Check, CircleAlert, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

const PLAN_KEYS = ['free', 'solo', 'agency'] as const;

export function PlanSelection({ initialPlan, checkoutCancelled, checkoutError }: { initialPlan: 'free' | 'solo' | 'agency'; checkoutCancelled: boolean; checkoutError: string | null }) {
  const router = useRouter();
  const [selected, setSelected] = useState<typeof initialPlan>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function continueWithPlan() {
    setLoading(true);
    setError(null);
    try {
      const endpoint = selected === 'free' ? '/api/billing/free' : '/api/billing/checkout';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: selected === 'free' ? undefined : { 'Content-Type': 'application/json' },
        body: selected === 'free' ? undefined : JSON.stringify({ plan: selected, source: 'onboarding', requestId: crypto.randomUUID() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to continue with this plan');
      if (!result.url) throw new Error('No destination was returned');
      window.localStorage.removeItem('leadlens_selected_plan');
      if (result.url.startsWith('/')) router.push(result.url);
      else window.location.assign(result.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to continue with this plan');
      setLoading(false);
    }
  }

  const selectedPlan = BILLING_PLANS[selected];

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_90%_0%,#d8f8e5_0,transparent_30%),linear-gradient(180deg,#fbfdf9_0%,#f1f8f3_100%)] px-5 py-8 text-[#10251d] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-[2rem] border border-[#cfe1d4] bg-white px-6 py-8 shadow-[0_30px_80px_-58px_rgba(20,83,45,.55)] sm:px-9 lg:flex lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700"><Sparkles className="size-4" />Workspace created</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Choose the capacity that fits your pipeline.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#60766b]">Start free or activate a paid workspace through secure Stripe Checkout. You can change or cancel later.</p>
          </div>
          <div className="mt-6 flex shrink-0 items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 lg:mt-0"><ShieldCheck className="size-5 text-emerald-700" /><div><p className="text-xs font-semibold">No charge on this page</p><p className="mt-0.5 text-[10px] text-[#60766b]">Paid plans continue to Stripe.</p></div></div>
        </header>

        {checkoutCancelled && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"><CircleAlert className="size-4" />Checkout was cancelled. Your workspace is safe—choose a plan when ready.</div>}
        {checkoutError && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"><CircleAlert className="size-4" />Payment returned, but the subscription could not be confirmed: {checkoutError}</div>}

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {PLAN_KEYS.map((key) => {
            const plan = BILLING_PLANS[key];
            const active = selected === key;
            return (
              <button key={key} type="button" onClick={() => setSelected(key)} aria-pressed={active} className={`group rounded-[1.75rem] border bg-white p-6 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${active ? 'border-emerald-500 shadow-[0_26px_70px_-48px_rgba(20,83,45,.9)]' : 'border-[#d7e5db] hover:-translate-y-1 hover:border-emerald-300'}`}>
                <div className="flex items-start justify-between gap-4"><div><p className="text-xl font-semibold">{plan.name}</p><p className="mt-3 text-4xl font-semibold tracking-[-0.055em]">{plan.priceLabel}<span className="text-xs font-medium text-[#789084]">{key === 'free' ? ' forever' : ' / month'}</span></p></div><span className={`grid size-6 place-items-center rounded-full border ${active ? 'border-emerald-600 bg-emerald-600' : 'border-[#b8cbbd]'}`}>{active && <Check className="size-3.5 text-white" />}</span></div>
                <p className="mt-4 min-h-12 text-sm leading-6 text-[#60766b]">{plan.description}</p>
                <ul className="mt-6 space-y-3 border-t border-[#e2ebe4] pt-5">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-[#365246]"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
              </button>
            );
          })}
        </section>

        <div className="mt-6 rounded-3xl border border-[#d7e5db] bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div><p className="text-sm font-semibold">Continue with {selectedPlan.name}</p><p className="mt-1 text-xs text-[#789084]">{selected === 'free' ? 'No payment details required.' : `${selectedPlan.priceLabel} per month through secure Stripe Checkout.`}</p></div>
          <div className="mt-4 sm:mt-0 sm:w-64"><button type="button" disabled={loading} onClick={continueWithPlan} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d] disabled:cursor-not-allowed disabled:opacity-60">{loading ? <Loader2 className="size-4 animate-spin" /> : <>Continue <ArrowRight className="size-4" /></>}</button>{error && <p role="alert" className="mt-2 text-xs leading-5 text-rose-700">{error}</p>}</div>
        </div>
      </div>
    </main>
  );
}
