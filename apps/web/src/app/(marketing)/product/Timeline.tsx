'use client';

import * as React from 'react';
import { cn } from '@leadlens/ui';
import {
  Activity,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Globe2,
  HeartHandshake,
  Mail,
  MessageSquare,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';

const STAGES = [
  {
    id: 'stage-1',
    title: 'Enter website',
    description: 'Paste a prospect URL into LeadLens. The crawler respects robots.txt, stays within a bounded page budget, and records what it can and cannot reach.',
    details: ['No complex configuration required', 'Works with modern CMS platforms', 'Persists bounded evidence for review'],
    icon: Search,
  },
  {
    id: 'stage-2',
    title: 'Collect evidence',
    description: 'LeadLens reviews public pages and records technical, content, UX, positioning, and conversion signals with their source URLs.',
    details: ['Source-linked page observations', 'Mobile and structure checks', 'Coverage and crawl limitations'],
    icon: Activity,
  },
  {
    id: 'stage-3',
    title: 'Diagnose problems',
    description: 'Collected evidence is separated into direct observations and clearly labeled business-impact hypotheses, each with confidence and limitations.',
    details: ['Observation versus inference labels', 'Business-impact translation', 'Impact and confidence prioritization'],
    icon: BrainCircuit,
  },
  {
    id: 'stage-4',
    title: 'Match services',
    description: 'LeadLens connects the strongest diagnosed opportunities to your agency’s services and selected case studies, preserving your commercial context.',
    details: ['Agency-specific service alignment', 'Relevant case-study context', 'Transparent match rationale'],
    icon: HeartHandshake,
  },
  {
    id: 'stage-5',
    title: 'Prepare outreach',
    description: 'An editable Opportunity Brief turns the research into an executive summary, evidence matrix, opportunity narrative, and outreach direction.',
    details: ['Editable before export', 'Email and call preparation', 'Sources travel with the narrative'],
    icon: BookOpen,
  },
  {
    id: 'stage-6',
    title: 'Enter the call',
    description: 'Walk into the conversation with evidence-linked talking points, discovery questions, and a clear view of what still needs validation.',
    details: ['Evidence-linked talking points', 'Editable discovery questions', 'Visible assumptions and limitations'],
    icon: Presentation,
  },
];

function stateClasses(active: string, id: string) {
  return cn(
    'absolute inset-0 overflow-auto p-5 transition-all duration-700 sm:p-7',
    active === id ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-7 scale-[0.97] opacity-0'
  );
}

export function ProductTimeline() {
  const [activeStage, setActiveStage] = React.useState(STAGES[0].id);
  const activeIndex = STAGES.findIndex((stage) => stage.id === activeStage);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveStage(entry.target.id)),
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 }
    );
    STAGES.forEach((stage) => {
      const element = document.getElementById(stage.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20 xl:gap-28">
      <div className="space-y-28 py-24 pb-56 lg:space-y-36 lg:py-32 lg:pb-72">
        {STAGES.map((stage, index) => {
          const isActive = activeStage === stage.id;
          const Icon = stage.icon;
          return (
            <article
              key={stage.id}
              id={stage.id}
              className={cn('relative max-w-xl border-l-2 pl-6 transition-all duration-500 sm:pl-8', isActive ? 'translate-x-0 border-emerald-600 opacity-100' : '-translate-x-2 border-[#e2e9e4] opacity-35')}
            >
              <div className="flex items-center gap-3">
                <span className={cn('grid size-10 place-items-center rounded-xl transition-colors duration-500', isActive ? 'bg-[#166534] text-white shadow-lg shadow-emerald-900/10' : 'bg-[#f1f5f1] text-[#789084]')}><Icon className="size-4" /></span>
                <span className="font-mono text-[10px] font-bold tracking-[0.15em] text-emerald-700">STAGE 0{index + 1}</span>
              </div>
              <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#10251d] sm:text-4xl">{stage.title}</h2>
              <p className="mt-5 text-base leading-7 text-[#60766b] sm:text-lg sm:leading-8">{stage.description}</p>
              <ul className="mt-7 grid gap-3">
                {stage.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2.5 text-sm font-medium text-[#365246]"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />{detail}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="sticky top-28 hidden h-[calc(100vh-9rem)] max-h-[780px] min-h-[590px] py-8 lg:block">
        <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-[#cfddd3] bg-[#eff6f0] shadow-[0_30px_80px_-48px_rgba(20,83,45,0.4)]">
          <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-[#d9e5dc] bg-white/95 px-5 backdrop-blur">
            <div className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-lg bg-[#16352a] text-white"><Target className="size-3.5" /></span><span className="text-xs font-semibold text-[#16352a]">LeadLens investigation</span></div>
            <div className="flex items-center gap-3"><span className="text-[10px] font-semibold text-[#789084]">{activeIndex + 1} / {STAGES.length}</span><div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#e2ebe4]"><div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${((activeIndex + 1) / STAGES.length) * 100}%` }} /></div></div>
          </div>

          <div className="absolute inset-x-0 bottom-0 top-14">
            <div className={stateClasses(activeStage, 'stage-1')}>
              <div className="flex h-full flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">New investigation</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#10251d]">Start with one public website.</h3>
                <div className="mt-7 rounded-2xl border border-[#d5e2d8] bg-white p-5 shadow-sm">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#789084]">Prospect URL</label>
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-emerald-300 bg-[#fbfdfb] p-2 pl-3 ring-4 ring-emerald-50"><Globe2 className="size-4 text-emerald-600" /><span className="min-w-0 flex-1 text-sm font-medium text-[#365246]">northstarstudio.com</span><span className="rounded-lg bg-[#166534] px-3 py-2 text-xs font-semibold text-white">Analyze</span></div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#f1f7f2] p-3"><ShieldCheck className="size-4 text-emerald-600" /><p className="mt-3 text-xs font-semibold">Public pages only</p><p className="mt-1 text-[10px] text-[#789084]">Robots policy respected</p></div>
                    <div className="rounded-xl bg-[#f1f7f2] p-3"><BarChart3 className="size-4 text-emerald-600" /><p className="mt-3 text-xs font-semibold">Bounded crawl</p><p className="mt-1 text-[10px] text-[#789084]">8 pages by default</p></div>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-[#789084]"><Check className="size-3.5 text-emerald-600" /> Workspace and sources are saved automatically</p>
              </div>
            </div>

            <div className={stateClasses(activeStage, 'stage-2')}>
              <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Crawl monitor</p><h3 className="mt-2 text-xl font-semibold">Evidence is arriving</h3></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">6 / 8 pages</span></div>
              <div className="mt-5 rounded-2xl bg-[#16352a] p-5 text-white"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-wider text-emerald-300">Coverage</p><p className="mt-2 text-3xl font-semibold">75%</p></div><Activity className="size-7 text-emerald-300" /></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-emerald-400" /></div></div>
              <div className="mt-4 space-y-2">
                {[
                  ['Homepage', '4 observations', 'Complete'],
                  ['Services', '5 observations', 'Complete'],
                  ['Case studies', '2 observations', 'Complete'],
                  ['Pricing', 'Reviewing structure', 'Scanning'],
                ].map(([page, result, status], index) => <div key={page} className="flex items-center gap-3 rounded-xl border border-[#dae6dd] bg-white p-3"><span className={`size-2 rounded-full ${index === 3 ? 'animate-pulse bg-amber-400' : 'bg-emerald-500'}`} /><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{page}</p><p className="mt-0.5 text-[10px] text-[#789084]">{result}</p></div><span className="text-[9px] font-bold uppercase text-[#789084]">{status}</span></div>)}
              </div>
            </div>

            <div className={stateClasses(activeStage, 'stage-3')}>
              <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Evidence matrix</p><h3 className="mt-2 text-xl font-semibold">What is known—and what is not.</h3></div><BrainCircuit className="size-6 text-emerald-700" /></div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[['High', '4', 'bg-rose-50 text-rose-700'], ['Medium', '5', 'bg-amber-50 text-amber-700'], ['Low', '3', 'bg-emerald-50 text-emerald-700']].map(([label, count, color]) => <div key={label} className={`rounded-xl p-3 ${color}`}><p className="text-[10px] font-bold uppercase">{label}</p><p className="mt-3 text-2xl font-semibold">{count}</p></div>)}
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-emerald-200 bg-white p-4"><div className="flex items-center justify-between"><span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase text-emerald-700">Observed</span><span className="text-[9px] text-[#789084]">3 sources</span></div><p className="mt-3 text-sm font-semibold">Pricing has no persistent next step.</p><p className="mt-2 text-xs leading-5 text-[#60766b]">Verified across pricing and two service pages.</p></div>
                <div className="rounded-2xl border border-amber-200 bg-white p-4"><div className="flex items-center justify-between"><span className="rounded-md bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase text-amber-700">Hypothesis</span><span className="text-[9px] text-[#789084]">Validate in call</span></div><p className="mt-3 text-sm font-semibold">Visitors may hesitate before contacting sales.</p><p className="mt-2 text-xs leading-5 text-[#60766b]">Plausible impact, not represented as fact.</p></div>
              </div>
            </div>

            <div className={stateClasses(activeStage, 'stage-4')}>
              <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Service alignment</p><h3 className="mt-2 text-xl font-semibold">The strongest commercial matches.</h3></div><HeartHandshake className="size-6 text-emerald-700" /></div>
              <div className="mt-5 rounded-2xl border border-[#dae6dd] bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#789084]">Priority opportunity</p><p className="mt-2 text-base font-semibold">Clarify the conversion journey</p><p className="mt-2 text-xs leading-5 text-[#60766b]">Supported by 4 findings across 3 source pages.</p>
              </div>
              <div className="mt-3 space-y-2.5">
                {[
                  ['Conversion strategy', '94%', 'w-[94%]'],
                  ['Landing page redesign', '87%', 'w-[87%]'],
                  ['Measurement setup', '71%', 'w-[71%]'],
                  ['SEO content strategy', '54%', 'w-[54%]'],
                ].map(([service, score, width], index) => <div key={service} className="rounded-xl border border-[#dae6dd] bg-white p-3.5"><div className="flex items-center justify-between"><span className="text-xs font-semibold">{service}</span><span className="text-[10px] font-bold text-emerald-700">{score} fit</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf3ee]"><div className={`h-full rounded-full ${index === 0 ? 'bg-emerald-600' : 'bg-emerald-300'} ${width}`} /></div></div>)}
              </div>
            </div>

            <div className={stateClasses(activeStage, 'stage-5')}>
              <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Opportunity brief</p><h3 className="mt-2 text-xl font-semibold">A point of view your team can edit.</h3></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Draft ready</span></div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-[#d7e3da] bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e2ebe4] px-4 py-3"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-[#16352a] text-white"><BookOpen className="size-3.5" /></span><span className="text-xs font-semibold">Northstar opportunity</span></div><span className="text-[9px] text-[#789084]">Autosaved</span></div>
                <div className="p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Executive summary</p><p className="mt-2 text-sm font-semibold leading-5">Northstar has strong service depth, but the path from interest to contact loses clarity.</p><div className="mt-4 rounded-xl bg-[#f2f7f3] p-3"><p className="text-[9px] font-bold uppercase text-[#789084]">Recommended angle</p><p className="mt-1.5 text-xs font-medium">Make the buying journey easier to understand and measure.</p></div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl border border-[#e0e9e2] p-3"><Mail className="size-4 text-emerald-600" /><p className="mt-3 text-xs font-semibold">Outreach draft</p><p className="mt-1 text-[10px] text-[#789084]">3 channels</p></div><div className="rounded-xl border border-[#e0e9e2] p-3"><FileCheck2 className="size-4 text-emerald-600" /><p className="mt-3 text-xs font-semibold">Export brief</p><p className="mt-1 text-[10px] text-[#789084]">Print or Markdown</p></div></div></div>
              </div>
            </div>

            <div className={stateClasses(activeStage, 'stage-6')}>
              <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Call preparation</p><h3 className="mt-2 text-xl font-semibold">Enter with useful questions.</h3></div><Presentation className="size-6 text-emerald-700" /></div>
              <div className="mt-5 rounded-2xl bg-[#16352a] p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Opening angle</p><p className="mt-3 text-lg font-semibold leading-6">“We noticed your expertise is clear, but the next step changes across key pages.”</p><p className="mt-3 flex items-center gap-1.5 text-[10px] text-[#b9d3c3]"><ExternalLink className="size-3" /> Backed by 3 source pages</p></div>
              <div className="mt-4 space-y-2.5">
                {[
                  ['01', 'How do prospects usually choose which service to discuss?'],
                  ['02', 'Where do qualified enquiries currently drop off?'],
                  ['03', 'How are pricing-page visits measured today?'],
                ].map(([number, question]) => <div key={number} className="flex gap-3 rounded-xl border border-[#dae6dd] bg-white p-3.5"><span className="font-mono text-[10px] font-bold text-emerald-600">{number}</span><p className="text-xs font-medium leading-5">{question}</p></div>)}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-xs font-medium text-emerald-900"><MessageSquare className="size-4 text-emerald-600" /> Keep the conversation consultative, not accusatory.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
