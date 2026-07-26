import * as React from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import { PricingSimulator } from './PricingSimulator';
import styles from './pricing.module.css';

export const metadata = {
  title: 'Pricing | LeadLens',
};

const faqs = [
  ['What counts as an analysis?', 'An analysis is counted when you submit a prospect URL to generate an Opportunity Brief. Reprocessing the same URL within 24 hours does not consume another credit.'],
  ['Can I change or cancel my subscription?', 'Yes. You can upgrade, downgrade, or cancel from your dashboard. Custom arrangements may have separate terms agreed with your organization.'],
  ['What is included in a white-labeled export?', 'Eligible plans can remove LeadLens branding from exported Opportunity Briefs so the final deliverable can use your agency identity.'],
  ['Can my whole team use one workspace?', 'Paid team plans support multiple seats so sales, strategy, and account teams can work from the same evidence and editable briefs.'],
];

export default function PricingPage() {
  return (
    <div className={`${styles.page} min-h-screen bg-[#fbfcf8] text-[#10251d]`}>
      <section className={`${styles.hero} relative mx-auto max-w-[1600px] px-6 pb-20 pt-40 lg:px-12 lg:pb-24 lg:pt-44`}>
        <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className={styles.reveal}>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm"><span className={styles.pulse} /> Start free, scale when the workflow proves useful</div>
            <h1 className={`${styles.display} mt-7 max-w-4xl text-[clamp(3.8rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.07em]`}>Pricing that follows<br /><span className="text-emerald-700">your pipeline.</span></h1>
          </div>
          <div className={`${styles.reveal} ${styles.delay} lg:pb-2`}>
            <p className="max-w-xl text-lg leading-8 text-[#587066] sm:text-xl">Choose based on monthly prospect volume, team size, and how your agency delivers the final brief.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[[Gauge, 'Usage based', 'Match your volume'], [ShieldCheck, 'No lock-in', 'Change as needed'], [Sparkles, 'Full workflow', 'Every core stage']].map(([Icon, title, text]) => { const IconComponent = Icon as typeof Gauge; return <div key={title as string} className="border-l border-[#cfe0d3] pl-3"><IconComponent className="size-4 text-emerald-600" /><p className="mt-3 text-xs font-semibold">{title as string}</p><p className="mt-1 text-[10px] text-[#789084]">{text as string}</p></div>; })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#dce6df] bg-white px-6 py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1400px]"><PricingSimulator /></div>
      </section>

      <section className="border-t border-[#dce6df] bg-[#f1f7f2] px-6 py-24 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Before you choose</p><h2 className={`${styles.display} mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.055em]`}>Clear answers.<br />No fine-print maze.</h2><p className="mt-5 max-w-sm leading-7 text-[#60766b]">The essentials about credits, billing, exports, and team access.</p></div>
          <div className="divide-y divide-[#d6e3d9] border-y border-[#d6e3d9]">
            {faqs.map(([question, answer], index) => (
              <details key={question} className="group py-1" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-semibold text-[#16352a] marker:content-none">{question}<ChevronDown className="size-4 shrink-0 text-emerald-700 transition-transform group-open:rotate-180" /></summary>
                <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-[#60766b]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#d5e3d9] bg-white px-6 py-16 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Not sure yet?</p><p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Start on the free plan and learn from a real prospect.</p></div><Link href="/register" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#166534] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d]">Start free <Check className="size-4" /></Link></div>
      </section>
    </div>
  );
}
