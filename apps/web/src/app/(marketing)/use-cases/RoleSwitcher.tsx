'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@leadlens/ui';
import { ArrowRight, Brain, Briefcase, CheckCircle2, Crown, LineChart, SearchCode, Target, TrendingUp, Users } from 'lucide-react';
import styles from './use-cases.module.css';

type Role = 'founder' | 'sales' | 'strategy' | 'account';

const ROLES = [
  { id: 'founder', label: 'Agency Founder', short: 'Founder', icon: Crown },
  { id: 'sales', label: 'Sales Representative', short: 'Sales', icon: Briefcase },
  { id: 'strategy', label: 'Strategist', short: 'Strategy', icon: Brain },
  { id: 'account', label: 'Account Manager', short: 'Accounts', icon: Users },
] as const;

const ROLE_CONTENT = {
  founder: {
    challenge: 'Senior people spend too much time assembling free audits, while pitch quality varies from one opportunity to the next.',
    solution: 'Standardize how evidence is gathered and shaped without removing your team’s commercial judgment.',
    feature: 'A repeatable pitch system',
    description: 'Every prospect moves through the same evidence, matching, and brief workflow—with sources and limitations preserved.',
    icon: TrendingUp,
    metric: '14',
    metricLabel: 'durable workflow stages',
    outcomes: [['Consistent research quality', '96%'], ['Less senior-team preparation', '82%'], ['Reusable pitch process', '91%']],
    cta: 'Scale the pitch process',
  },
  sales: {
    challenge: 'Generic outreach and thin call preparation make it difficult to earn attention or lead a useful first conversation.',
    solution: 'Start from specific, source-linked observations and use hypotheses as questions to validate—not facts to claim.',
    feature: 'A credible reason to reach out',
    description: 'Move from prospect URL to call plan and channel-specific outreach while keeping the underlying evidence visible.',
    icon: SearchCode,
    metric: '3',
    metricLabel: 'outreach channels prepared',
    outcomes: [['Specific opening angle', '94%'], ['Evidence-linked talking points', '88%'], ['Editable call questions', '84%']],
    cta: 'Prepare the next call',
  },
  strategy: {
    challenge: 'Manual page reviews, signal gathering, and deck preparation consume the time that should go into strategic judgment.',
    solution: 'Let LeadLens collect bounded website evidence and organize the first draft; your strategist decides what matters.',
    feature: 'Evidence before interpretation',
    description: 'Review observations, hypotheses, sources, confidence, and missing information in one structured workspace.',
    icon: Target,
    metric: '8',
    metricLabel: 'public pages reviewed by default',
    outcomes: [['Bounded source coverage', '92%'], ['Observation labels', '100%'], ['Editable opportunity logic', '86%']],
    cta: 'Streamline research',
  },
  account: {
    challenge: 'Quick client reviews and competitor checks interrupt delivery work but can also hide valuable expansion opportunities.',
    solution: 'Turn the request into a structured brief, validate the evidence, and use the result to frame an account conversation.',
    feature: 'Expansion with a clear rationale',
    description: 'Connect validated findings to existing services, relevant proof, and an editable proposal direction.',
    icon: LineChart,
    metric: '1',
    metricLabel: 'shared account opportunity',
    outcomes: [['Structured client review', '93%'], ['Service expansion match', '85%'], ['Proposal-ready direction', '79%']],
    cta: 'Find account opportunities',
  },
};

export function RoleSwitcher() {
  const [activeRole, setActiveRole] = React.useState<Role>('founder');
  const [paused, setPaused] = React.useState(false);
  const content = ROLE_CONTENT[activeRole];
  const activeNumber = ROLES.findIndex((role) => role.id === activeRole) + 1;
  const FeatureIcon = content.icon;

  React.useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      const currentIndex = ROLES.findIndex((role) => role.id === activeRole);
      setActiveRole(ROLES[(currentIndex + 1) % ROLES.length].id);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [activeRole, paused]);

  return (
    <div
      className="grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <aside className="rounded-[1.5rem] border border-[#d8e4db] bg-[#f2f7f3] p-3 lg:self-start" aria-label="Agency roles">
        <div className="flex items-center justify-between px-3 pb-3 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#789084]">Select your role</p>
          <span className="flex items-center gap-1.5 text-[9px] font-semibold text-emerald-700"><span className={cn('size-1.5 rounded-full bg-emerald-500', paused ? '' : 'animate-pulse')} />{paused ? 'Paused' : 'Auto'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {ROLES.map((role, index) => {
            const Icon = role.icon;
            const active = role.id === activeRole;
            return (
              <button
                key={role.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveRole(role.id)}
                className={cn('group relative flex min-h-16 items-center gap-3 overflow-hidden rounded-xl p-3 text-left transition-all', active ? 'bg-[#16352a] text-white shadow-lg shadow-emerald-950/10' : 'text-[#52675e] hover:bg-white hover:text-[#16352a]')}
              >
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg transition-colors', active ? 'bg-white/10 text-emerald-300' : 'bg-white text-emerald-700 shadow-sm')}><Icon className="size-4" /></span>
                <span className="min-w-0"><span className={cn('block font-mono text-[9px]', active ? 'text-emerald-300' : 'text-[#91a49a]')}>0{index + 1}</span><span className="mt-0.5 block truncate text-xs font-semibold sm:text-sm">{role.label}</span></span>
                {active && <ArrowRight className="ml-auto hidden size-4 text-emerald-300 lg:block" />}
                {active && <span className={styles.roleProgress} style={{ animationPlayState: paused ? 'paused' : 'running' }} />}
              </button>
            );
          })}
        </div>
      </aside>

      <div key={activeRole} className={`${styles.switchPanel} overflow-hidden rounded-[1.75rem] border border-[#d8e4db] bg-white shadow-[0_28px_70px_-50px_rgba(20,83,45,0.5)]`}>
        <div className="grid border-b border-[#e0e9e2] lg:grid-cols-2">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">What gets in the way</p><span className="font-mono text-[10px] text-[#91a49a]">ROLE 0{activeNumber}</span></div>
            <p className="mt-5 text-xl font-semibold leading-8 tracking-[-0.025em] text-[#16352a] sm:text-2xl">{content.challenge}</p>
          </div>
          <div className="border-t border-[#e0e9e2] bg-[#eef7f0] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">What changes with LeadLens</p>
            <p className="mt-5 text-lg leading-8 text-[#365246]">{content.solution}</p>
            <Link href="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-600">{content.cta}<ArrowRight className="size-4" /></Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#16352a] text-emerald-300"><FeatureIcon className="size-5" /></span>
            <h3 className="mt-7 text-3xl font-semibold tracking-[-0.04em] text-[#10251d]">{content.feature}</h3>
            <p className="mt-4 max-w-lg leading-7 text-[#60766b]">{content.description}</p>
            <div className="mt-8 space-y-4">
              {content.outcomes.map(([label, score], index) => (
                <div key={label}>
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#365246]">{label}</span><span className="text-[10px] font-bold text-emerald-700">{score}</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf3ee]"><div className={`${styles.outcomeBar} h-full rounded-full ${index === 0 ? 'bg-emerald-600' : 'bg-emerald-300'}`} style={{ width: score }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between border-t border-[#e0e9e2] bg-[#f7faf7] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#789084]">Role-specific output</p><p className="mt-4 text-7xl font-semibold tracking-[-0.07em] text-[#166534]">{content.metric}</p><p className="mt-2 max-w-[200px] text-sm leading-6 text-[#60766b]">{content.metricLabel}</p></div>
            <div className="mt-14 rounded-2xl border border-[#dbe6de] bg-white p-4">
              <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-4" /></span><div><p className="text-xs font-semibold text-[#16352a]">Human review stays in the loop</p><p className="mt-0.5 text-[10px] text-[#789084]">Edit before anything leaves the team.</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
