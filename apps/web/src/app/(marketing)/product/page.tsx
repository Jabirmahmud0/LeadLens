import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileSearch, Globe2, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductTimeline } from './Timeline';
import styles from './product.module.css';

export const metadata = {
  title: 'Product Tour | LeadLens',
};

export default function ProductPage() {
  return (
    <div className={`${styles.page} min-h-screen bg-[#fbfcf8] text-[#10251d]`}>
      <section className={`${styles.hero} relative mx-auto w-full max-w-[1600px] px-6 pb-24 pt-40 lg:px-12 lg:pb-28 lg:pt-44`}>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 xl:gap-28">
          <div className={styles.reveal}>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm">
              <span className={styles.pulse} /> From public website to prepared conversation
            </div>
            <h1 className={`${styles.display} mt-7 max-w-3xl text-[clamp(3.8rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.07em]`}>
              The research trail,<br /><span className="text-emerald-700">made visible.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#587066] sm:text-xl">
              LeadLens collects public evidence, labels what is observed versus inferred, and connects the strongest opportunities to what your agency actually sells.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#166534] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d] hover:shadow-lg">
                Start free <ArrowRight className="size-4" />
              </Link>
              <span className="flex items-center gap-2 text-xs font-medium text-[#60766b]"><ShieldCheck className="size-4 text-emerald-600" /> Sources and limitations included</span>
            </div>
          </div>

          <div className={`${styles.reveal} ${styles.delayOne} relative`}>
            <div className={styles.heroGlow} />
            <div className={`${styles.dossier} overflow-hidden rounded-[1.75rem] border border-[#cfddd3] bg-white shadow-[0_36px_90px_-48px_rgba(20,83,45,0.5)]`}>
              <div className="flex items-center justify-between border-b border-[#e1e9e3] px-5 py-4">
                <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#16352a] text-white"><FileSearch className="size-4" /></span><div><p className="text-sm font-semibold">Northstar Studio</p><p className="text-[10px] text-[#789084]">Live analysis workspace</p></div></div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><span className={styles.pulse} />Analyzing</span>
              </div>

              <div className="grid gap-3 bg-[#f5f8f4] p-5 sm:grid-cols-3">
                {[
                  ['Pages', '8', Globe2],
                  ['Findings', '12', CheckCircle2],
                  ['Matches', '4', Layers3],
                ].map(([label, value, Icon]) => {
                  const IconComponent = Icon as typeof Globe2;
                  return <div key={label as string} className="rounded-xl border border-[#dce6df] bg-white p-3.5"><IconComponent className="size-4 text-emerald-600" /><p className="mt-5 text-2xl font-semibold">{value as string}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#789084]">{label as string}</p></div>;
                })}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between"><p className="text-xs font-semibold">Investigation timeline</p><span className="text-[10px] text-emerald-700">Stage 04 of 06</span></div>
                <div className="mt-4 space-y-2.5">
                  {[
                    ['Website mapped', 'Complete', true],
                    ['Evidence classified', 'Complete', true],
                    ['Services matched', 'In progress', false],
                  ].map(([title, status, done]) => (
                    <div key={title as string} className="flex items-center gap-3 rounded-xl border border-[#e0e9e2] px-3.5 py-3">
                      <span className={`grid size-7 place-items-center rounded-lg ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{done ? <CheckCircle2 className="size-3.5" /> : <Sparkles className="size-3.5" />}</span>
                      <span className="min-w-0 flex-1 text-xs font-medium">{title as string}</span><span className="text-[10px] text-[#789084]">{status as string}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-[#16352a] p-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-300">Current signal</p>
                  <p className="mt-2 text-sm font-semibold">Conversion path loses clarity at pricing.</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`${styles.progress} h-full rounded-full bg-emerald-400`} /></div>
                </div>
              </div>
            </div>
            <div className={`${styles.floatNote} absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-xs font-semibold shadow-lg sm:flex`}><ShieldCheck className="size-4 text-emerald-600" /> Hypotheses stay labeled</div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-[#dce6df] bg-white">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
          <ProductTimeline />
        </div>
      </section>

      <section className={`${styles.productClose} border-t border-[#d5e3d9] px-6 py-20 lg:px-12 lg:py-24`}>
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Run the investigation</p>
            <h2 className={`${styles.display} mt-5 max-w-2xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-[#10251d] sm:text-6xl`}>One URL is enough to start.</h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#60766b]">See the evidence trail, opportunity logic, and service matches LeadLens can prepare for your team.</p>
          </div>

          <form action="/register" method="GET" className="rounded-[1.5rem] border border-[#cadbcf] bg-white p-5 shadow-[0_28px_70px_-48px_rgba(20,83,45,0.5)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#e0e9e2] pb-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#16352a] text-white"><FileSearch className="size-4" /></span><div><p className="text-sm font-semibold">New prospect analysis</p><p className="mt-0.5 text-[10px] text-[#789084]">Public website data only</p></div></div><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-700"><span className={styles.pulse} />Ready</span></div>
            <label htmlFor="product-close-url" className="mt-6 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#60766b]">Prospect website</label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row"><div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-[#cad9cf] bg-[#f8fbf8] px-3 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100"><Globe2 className="size-4 shrink-0 text-emerald-600" /><input id="product-close-url" name="url" type="url" required inputMode="url" placeholder="https://prospect.com" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#91a49a]" /></div><button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d]">Analyze <ArrowRight className="size-4" /></button></div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-[#60766b]">{['Sources preserved', 'Editable output', 'Visible limitations'].map((item) => <span key={item} className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-600" />{item}</span>)}</div>
          </form>
        </div>
      </section>
    </div>
  );
}
