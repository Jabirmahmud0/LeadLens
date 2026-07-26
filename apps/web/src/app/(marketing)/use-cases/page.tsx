import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Brain, Briefcase, Check, Crown, FileCheck2, Users } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import styles from './use-cases.module.css';

export const metadata = {
  title: 'Use Cases | LeadLens',
};

export default function UseCasesPage() {
  return (
    <div className={`${styles.page} min-h-screen bg-[#fbfcf8] text-[#10251d]`}>
      <section className={`${styles.hero} relative mx-auto max-w-[1600px] px-6 pb-24 pt-40 lg:px-12 lg:pb-28 lg:pt-44`}>
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 xl:gap-28">
          <div className={styles.reveal}>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm"><span className={styles.pulse} /> One research system, shared across the agency</div>
            <h1 className={`${styles.display} mt-7 max-w-3xl text-[clamp(3.8rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.07em]`}>Different roles.<br /><span className="text-emerald-700">One clear view.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#587066] sm:text-xl">Give founders, sales reps, strategists, and account teams the same source-backed opportunity—shaped for the decision each person needs to make.</p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#60766b]">{['Shared evidence', 'Role-specific outputs', 'Editable by your team'].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" />{item}</span>)}</div>
          </div>

          <div className={`${styles.reveal} ${styles.delay} relative mx-auto w-full max-w-xl`}>
            <div className={styles.heroGlow} />
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Founder', 'Standardize the pitch', Crown, 'bg-[#16352a] text-white', 'translate-y-5'],
                ['Sales', 'Enter calls prepared', Briefcase, 'bg-white text-[#10251d]', ''],
                ['Strategy', 'Start from evidence', Brain, 'bg-white text-[#10251d]', 'translate-y-5'],
                ['Accounts', 'Find expansion paths', Users, 'bg-[#dff3e5] text-[#10251d]', ''],
              ].map(([role, outcome, Icon, color, offset]) => {
                const IconComponent = Icon as typeof Crown;
                return <div key={role as string} className={`${styles.roleTile} ${color as string} ${offset as string} rounded-2xl border border-[#d4e1d7] p-5 shadow-[0_20px_50px_-38px_rgba(20,83,45,0.45)]`}><div className="flex items-center justify-between"><IconComponent className="size-5" /><span className="size-2 rounded-full bg-emerald-400" /></div><p className="mt-10 text-xs font-semibold uppercase tracking-wider opacity-60">{role as string}</p><p className="mt-2 text-base font-semibold">{outcome as string}</p></div>;
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#dce6df] bg-white px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Choose a point of view</p><h2 className={`${styles.display} mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl`}>See how the brief changes the work.</h2></div>
          <RoleSwitcher />
        </div>
      </section>

      <section className={`${styles.teamClose} overflow-hidden border-t border-[#d5e3d9] px-6 py-20 lg:px-12 lg:py-24`}>
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">One shared opportunity</p>
            <h2 className={`${styles.display} mt-5 max-w-2xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl`}>One brief.<br />Four next moves.</h2>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#60766b]">Bring every role into the same evidence trail, then let each person act from the view that fits their work.</p>
            <Link href="/register" className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#166534] px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d]">Build a shared brief <ArrowRight className="size-4" /></Link>
          </div>

          <div className={styles.handoffMap}>
            <div className={styles.handoffCenter}><FileCheck2 className="size-5" /><span><strong>Opportunity brief</strong><small>Sources · findings · next moves</small></span></div>
            {[
              ['Founder', 'Position the opportunity', Crown, styles.handoffOne],
              ['Sales', 'Open the conversation', Briefcase, styles.handoffTwo],
              ['Strategy', 'Shape the solution', Brain, styles.handoffThree],
              ['Accounts', 'Expand the relationship', Users, styles.handoffFour],
            ].map(([role, action, Icon, position]) => {
              const IconComponent = Icon as typeof Crown;
              return <div key={role as string} className={`${styles.handoffRole} ${position as string}`}><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><IconComponent className="size-4" /></span><span><strong>{role as string}</strong><small>{action as string}</small></span><Check className="ml-auto size-3.5 text-emerald-600" /></div>;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
