'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@leadlens/ui';
import { ArrowRight, Check, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { BILLING_PLANS } from '@leadlens/shared';
import styles from './pricing.module.css';

type PlanTier = 'free' | 'solo' | 'agency' | 'growth';

const PLANS: Array<{ id: PlanTier; name: string; price: string; cadence?: string; description: string; features: readonly string[]; action: string }> = [
  { id: 'free', ...BILLING_PLANS.free, price: BILLING_PLANS.free.priceLabel, cadence: '/ month', action: 'Start free' },
  { id: 'solo', ...BILLING_PLANS.solo, price: BILLING_PLANS.solo.priceLabel, cadence: '/ month', action: 'Choose Solo' },
  { id: 'agency', ...BILLING_PLANS.agency, price: BILLING_PLANS.agency.priceLabel, cadence: '/ month', action: 'Choose Agency' },
  { id: 'growth', ...BILLING_PLANS.growth, price: BILLING_PLANS.growth.priceLabel, action: 'Discuss Growth' },
];

function planHref(plan: PlanTier) {
  if (plan === 'growth') return 'mailto:leadlens@saevix.dev?subject=LeadLens%20Growth%20plan';
  return plan === 'free' ? '/register' : `/register?plan=${plan}`;
}

export function PricingSimulator() {
  const [prospects, setProspects] = React.useState(10);
  const [teamSize, setTeamSize] = React.useState(1);
  const [needsExport, setNeedsExport] = React.useState(false);

  const recommendedPlan: PlanTier = React.useMemo(() => {
    if (teamSize > 10 || prospects > 200) return 'growth';
    if (teamSize > 3 || prospects > 50 || needsExport) return 'agency';
    if (teamSize > 1 || prospects > 10) return 'solo';
    return 'free';
  }, [teamSize, prospects, needsExport]);

  const recommended = PLANS.find((plan) => plan.id === recommendedPlan)!;

  return (
    <div>
      <div className="grid overflow-hidden rounded-[1.75rem] border border-[#cfe0d3] bg-[#f2f7f3] shadow-[0_28px_70px_-52px_rgba(20,83,45,0.48)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="bg-white p-6 sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Plan finder</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">How does your team prospect?</h2></div><span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 sm:block">Updates live</span></div>

          <div className="mt-10 space-y-10">
            <div>
              <div className="flex items-end justify-between gap-4"><label htmlFor="analysis-volume" className="text-xs font-semibold text-[#52675e]">Analyses each month</label><span className="text-3xl font-semibold tracking-[-0.04em] text-[#16352a]">{prospects === 500 ? '500+' : prospects}</span></div>
              <input id="analysis-volume" type="range" min="0" max="500" step="10" value={prospects} onChange={(event) => setProspects(Number(event.target.value))} className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfebe2] accent-emerald-700" />
              <div className="mt-2 flex justify-between text-[9px] font-bold uppercase tracking-wider text-[#91a49a]"><span>0</span><span>250</span><span>500+</span></div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4"><label htmlFor="team-size" className="text-xs font-semibold text-[#52675e]">People collaborating</label><span className="text-3xl font-semibold tracking-[-0.04em] text-[#16352a]">{teamSize === 50 ? '50+' : teamSize} <small className="text-sm font-medium text-[#789084]">{teamSize === 1 ? 'seat' : 'seats'}</small></span></div>
              <input id="team-size" type="range" min="1" max="50" value={teamSize} onChange={(event) => setTeamSize(Number(event.target.value))} className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#dfebe2] accent-emerald-700" />
              <div className="mt-2 flex justify-between text-[9px] font-bold uppercase tracking-wider text-[#91a49a]"><span>1</span><span>25</span><span>50+</span></div>
            </div>
          </div>

          <div className="mt-9 flex items-center justify-between gap-5 border-t border-[#e0e9e2] pt-7"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FileText className="size-4" /></span><div><label htmlFor="white-label-toggle" className="text-sm font-semibold text-[#16352a]">White-labeled exports</label><p className="mt-1 text-xs leading-5 text-[#789084]">Deliver the brief using your agency identity.</p></div></div><button id="white-label-toggle" type="button" role="switch" aria-checked={needsExport} onClick={() => setNeedsExport((value) => !value)} className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2', needsExport ? 'bg-emerald-700' : 'bg-[#d7e2da]')}><span className={cn('absolute left-0 top-1 size-5 rounded-full bg-white shadow-sm transition-transform', needsExport ? 'translate-x-6' : 'translate-x-1')} /></button></div>
        </div>

        <div key={recommendedPlan} className={`${styles.recommendation} flex flex-col justify-between bg-[#16352a] p-6 text-white sm:p-8 lg:p-10`} aria-live="polite">
          <div><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Recommended for you</p><Sparkles className="size-5 text-emerald-300" /></div><p className="mt-7 text-5xl font-semibold tracking-[-0.055em]">{recommended.name}</p><div className="mt-3 flex items-end gap-2"><span className="text-2xl font-semibold text-emerald-300">{recommended.price}</span>{recommended.cadence && <span className="pb-1 text-xs text-[#b9d3c3]">{recommended.cadence}</span>}</div><p className="mt-5 max-w-md text-sm leading-6 text-[#b9d3c3]">{recommended.description}</p></div>
          <div className="mt-12"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Why this fits</p><ul className="mt-4 space-y-3 text-xs text-white">{[`${prospects || 0} monthly analyses`, `${teamSize} collaborating ${teamSize === 1 ? 'seat' : 'seats'}`, needsExport ? 'White-labeled output required' : 'Standard output works'].map((reason) => <li key={reason} className="flex items-center gap-2"><Check className="size-3.5 text-emerald-300" />{reason}</li>)}</ul><Link href={planHref(recommendedPlan)} className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-emerald-800 transition-transform hover:-translate-y-0.5">{recommended.action}<ArrowRight className="size-4" /></Link></div>
        </div>
      </div>

      <div className="mt-20"><div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Compare plans</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em]">A plan for each stage of growth.</h2></div><p className="max-w-md text-sm leading-6 text-[#60766b]">The highlighted plan follows your calculator choices above.</p></div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => {
            const active = plan.id === recommendedPlan;
            return (
              <article key={plan.id} className={`${styles.planCard} relative flex flex-col rounded-[1.4rem] border p-6 ${active ? 'border-emerald-600 bg-[#f0f8f2] shadow-[0_22px_55px_-42px_rgba(20,83,45,0.55)]' : 'border-[#dce6df] bg-white'}`}>
                {active && <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#166534] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white"><span className="size-1.5 rounded-full bg-emerald-300" />Best fit</span>}
                <p className="text-sm font-semibold text-[#16352a]">{plan.name}</p><div className="mt-6 flex items-end gap-1.5"><span className="text-4xl font-semibold tracking-[-0.055em]">{plan.price}</span>{plan.cadence && <span className="pb-1 text-xs text-[#789084]">{plan.cadence}</span>}</div><p className="mt-4 min-h-16 text-sm leading-6 text-[#60766b]">{plan.description}</p>
                <ul className="mt-7 flex-1 space-y-3 border-t border-[#e0e9e2] pt-6">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs font-medium text-[#365246]"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
                <Link href={planHref(plan.id)} className={cn('mt-8 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-colors', active ? 'bg-[#166534] text-white hover:bg-[#14532d]' : 'bg-[#edf3ee] text-[#16352a] hover:bg-[#e1ebe4]')}>{plan.action}</Link>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
