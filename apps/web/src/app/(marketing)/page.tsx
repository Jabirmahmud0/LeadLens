import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  FileText,
  Globe2,
  Layers3,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import styles from './home.module.css';

const researchFeed = [
  { label: 'Source captured', title: 'Pricing page', meta: 'Observed · just now', icon: Globe2, tone: 'emerald' },
  { label: 'Finding verified', title: 'CTA path breaks', meta: 'High impact · 3 sources', icon: CheckCircle2, tone: 'forest' },
  { label: 'Service matched', title: 'Conversion strategy', meta: 'Strong fit · 94%', icon: Layers3, tone: 'mint' },
  { label: 'Hypothesis labeled', title: 'Visitor hesitation', meta: 'Needs validation', icon: Sparkles, tone: 'amber' },
  { label: 'Coverage update', title: '8 pages reviewed', meta: 'Good source depth', icon: BarChart3, tone: 'teal' },
  { label: 'Output ready', title: 'Opportunity brief', meta: 'Editable · source linked', icon: FileText, tone: 'lime' },
];

function ProductStage() {
  return (
    <div className={styles.stageWrap}>
      <div className={styles.orbOne} />
      <div className={styles.orbTwo} />

      <div className={`${styles.floatCard} ${styles.floatLeft}`}>
        <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-4" aria-hidden="true" />
        </span>
        <span><strong className="block text-sm text-slate-900">Evidence captured</strong><span className="text-xs text-slate-500">8 public pages reviewed</span></span>
      </div>

      <div className={`${styles.floatCard} ${styles.floatRight}`}>
        <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
          <WandSparkles className="size-4" aria-hidden="true" />
        </span>
        <span><strong className="block text-sm text-slate-900">Brief ready</strong><span className="text-xs text-slate-500">Sources and caveats included</span></span>
      </div>

      <div className={styles.productWindow}>
        <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-rose-300" />
            <span className="size-2.5 rounded-full bg-amber-300" />
            <span className="size-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] text-slate-500 sm:flex">
            <ShieldCheck className="size-3" aria-hidden="true" /> app.leadlens.ai / brief
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Live sample</span>
        </div>

        <div className="grid min-h-[460px] grid-cols-1 bg-[#f5f8f4] md:grid-cols-[160px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-white p-4 md:block">
            <div className="mb-6 flex items-center gap-2.5 px-1">
              <span className="grid size-8 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white">N</span>
              <span><strong className="block text-xs text-slate-900">Northstar</strong><span className="text-[10px] text-slate-400">Opportunity brief</span></span>
            </div>
            <nav className="space-y-1" aria-label="Sample brief navigation">
              {[
                ['Overview', BarChart3, true],
                ['Findings', Search, false],
                ['Opportunities', Layers3, false],
                ['Outreach', Mail, false],
                ['Sources', Globe2, false],
              ].map(([label, Icon, active]) => {
                const IconComponent = Icon as typeof BarChart3;
                return (
                  <div key={label as string} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium ${active ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500'}`}>
                    <IconComponent className="size-3.5" aria-hidden="true" /> {label as string}
                  </div>
                );
              })}
            </nav>
            <div className="mt-24 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Coverage</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[86%] rounded-full bg-emerald-500" /></div>
              <p className="mt-2 text-[10px] text-slate-500">Good source coverage</p>
            </div>
          </aside>

          <main className="relative min-w-0 p-4 sm:p-6 lg:p-7">
            <div className={styles.scanLine} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">Opportunity overview</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">A sharper path to conversion</h2>
                <p className="mt-1 text-xs text-slate-500">Updated just now · 8 pages analyzed</p>
              </div>
              <button className="hidden h-9 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white sm:flex" type="button" tabIndex={-1}>
                Export brief <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Opportunity', 'High', 'text-emerald-700'],
                ['Findings', '12', 'text-slate-950'],
                ['Sources', '18', 'text-slate-950'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <p className="text-[10px] font-medium text-slate-400">{label}</p>
                  <p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-900">Priority findings</p>
                <span className="text-[10px] text-slate-400">Impact × confidence</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ['Conversion path is unclear', 'Observed', 'High', 'bg-emerald-600', 'w-[88%]'],
                  ['Service positioning is broad', 'Observed', 'High', 'bg-teal-500', 'w-[72%]'],
                  ['Measurement may be incomplete', 'Hypothesis', 'Medium', 'bg-amber-400', 'w-[54%]'],
                ].map(([title, kind, impact, color, width]) => (
                  <div key={title} className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-medium text-slate-700">{title}</p>
                        <span className={`hidden rounded px-1.5 py-0.5 text-[8px] font-bold uppercase sm:inline ${kind === 'Observed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{kind}</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color} ${width}`} /></div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500">{impact}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-medium text-emerald-950"><Sparkles className="size-3.5 text-emerald-700" /> Recommended angle: conversion clarity</span>
              <ChevronRight className="size-4 text-emerald-500" />
            </div>
          </main>

          <aside className="hidden border-l border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Evidence trail</p>
            <div className="mt-4 space-y-3">
              {[
                ['Homepage', 'CTA changes by section', 'Verified'],
                ['Services', 'Six offers, equal weight', 'Verified'],
                ['Pricing', 'No persistent next step', 'Verified'],
              ].map(([page, note, status]) => (
                <div key={page} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-slate-700">{page}</span><span className="size-1.5 rounded-full bg-emerald-500" /></div>
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">{note}</p>
                  <p className="mt-2 text-[9px] font-medium text-emerald-600">{status}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-slate-950 p-4 text-white">
              <CircleDot className="size-4 text-emerald-300" />
              <p className="mt-3 text-xs font-semibold">Nothing hidden</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">Sources, limitations, and hypotheses travel with the brief.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SignalTicker() {
  return (
    <section className={styles.feedRail} aria-label="Live example research feed">
      <div className={styles.feedStatus}>
        <span className={styles.feedSignal}><span className={styles.pulseDot} /></span>
        <span><strong>Research feed</strong><small>Signals becoming a brief</small></span>
      </div>
      <div className={styles.ticker}>
        <div className={styles.tickerTrack}>
          {[0, 1].map((copy) => (
            <div key={copy} className={styles.tickerSet} aria-hidden={copy === 1}>
              {researchFeed.map(({ label, title, meta, icon: Icon, tone }) => (
                <article key={`${copy}-${label}`} className={styles.feedCard}>
                  <span className={`${styles.feedIcon} ${styles[`tone${tone[0].toUpperCase()}${tone.slice(1)}`]}`}><Icon className="size-4" aria-hidden="true" /></span>
                  <span className={styles.feedCopy}>
                    <span className={styles.feedLabel}>{label}</span>
                    <strong>{title}</strong>
                    <small>{meta}</small>
                  </span>
                  <span className={styles.feedCheck}><Check className="size-3" aria-hidden="true" /></span>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MarketingHomePage() {
  return (
    <div className={`${styles.page} overflow-hidden bg-[#fbfcf8] text-[#10251d]`}>
      <section className={`${styles.hero} px-5 pb-20 pt-36 sm:px-8 sm:pt-40 lg:px-10 lg:pb-28`}>
        <div className={styles.heroGrid} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 xl:gap-20">
          <div className="text-left">
            <div className={`${styles.reveal} inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur`}>
              <span className={styles.pulseDot} /> Prospect intelligence for digital agencies
            </div>
            <h1 className={`${styles.displayFont} ${styles.reveal} ${styles.delayOne} mt-7 max-w-2xl text-[clamp(3.6rem,6.4vw,6.6rem)] font-semibold leading-[0.91] tracking-[-0.065em] text-[#10251d]`}>
              See what<br />others <span className={styles.accentText}>overlook.</span>
            </h1>
            <p className={`${styles.reveal} ${styles.delayTwo} mt-7 max-w-xl text-lg leading-8 text-[#52675e] sm:text-xl`}>
              Turn a prospect&apos;s public website into a source-backed brief that connects real findings to the services your agency sells.
            </p>

            <form action="/register" method="GET" className={`${styles.reveal} ${styles.delayThree} mt-9 max-w-xl`}>
              <label htmlFor="hero-url" className="sr-only">Prospect website URL</label>
              <div className="flex flex-col gap-2 rounded-2xl border border-[#cddbd3] bg-white p-2 shadow-[0_24px_60px_-28px_rgba(20,83,45,0.32)] focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-100 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                  <Globe2 className="size-5 shrink-0 text-[#7a9186]" aria-hidden="true" />
                  <input id="hero-url" type="url" name="url" required inputMode="url" autoComplete="url" placeholder="Paste a prospect website" className="h-12 min-w-0 flex-1 bg-transparent text-base text-[#10251d] outline-none placeholder:text-[#8ca096]" />
                </div>
                <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
                  Analyze <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </form>
            <div className={`${styles.reveal} ${styles.delayFour} mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#60766b]`}>
              {['No credit card', 'Public data only', 'Editable output'].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" />{item}</span>)}
            </div>
          </div>

          <div className={`${styles.reveal} ${styles.delayTwo} lg:translate-x-4`}>
            <ProductStage />
          </div>
        </div>
      </section>

      <SignalTicker />

      <section className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Less research theater</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">A sales point of view your team can defend.</h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-slate-600 lg:justify-self-end">The useful part is not another score. It is knowing what was observed, why it matters, and which service creates the strongest next conversation.</p>
          </div>

          <div className="mt-16 grid auto-rows-[minmax(260px,auto)] gap-4 lg:grid-cols-12">
            <article className={`${styles.bentoCard} relative overflow-hidden bg-[#edf7f0] p-7 text-[#10251d] sm:p-9 lg:col-span-7 lg:row-span-2`}>
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#166534] text-white"><Search className="size-5" /></span>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    <span className={styles.pulseDot} /> 8 of 8 pages captured
                  </div>
                </div>

                <div className={`${styles.evidenceMap} mt-8 rounded-2xl border border-[#cfe4d6] bg-white p-4 shadow-[0_18px_40px_-32px_rgba(20,83,45,0.45)] sm:p-5`}>
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <span className="flex items-center gap-2.5 text-xs font-semibold text-[#16352a]"><Globe2 className="size-4 text-emerald-700" /> northstarstudio.com</span>
                    <span className="text-[10px] font-semibold text-emerald-700">Crawl complete</span>
                  </div>
                  <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                    {[
                      ['Homepage', '4 findings', 'High impact'],
                      ['Services', '5 findings', 'High impact'],
                      ['Pricing', '3 findings', 'Medium impact'],
                    ].map(([page, findings, impact], index) => (
                      <div key={page} className={`${styles.sourceNode} rounded-xl border border-[#dce9e0] bg-[#f8fbf8] p-3`} style={{ animationDelay: `${index * 140}ms` }}>
                        <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#16352a]">{page}</span><CheckCircle2 className="size-3.5 text-emerald-600" /></div>
                        <p className="mt-4 text-[10px] text-[#668075]">{findings}</p>
                        <p className="mt-1 text-[10px] font-semibold text-emerald-700">{impact}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#16352a] px-3.5 py-3 text-white">
                    <Sparkles className="size-4 shrink-0 text-emerald-300" />
                    <p className="text-xs"><span className="font-semibold">Pattern found:</span> the strongest conversion path breaks between services and pricing.</p>
                  </div>
                </div>

                <div className="mt-auto pt-9">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Evidence first</p>
                  <h3 className="mt-3 max-w-lg text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Every finding keeps its source attached.</h3>
                  <p className="mt-4 max-w-xl leading-7 text-[#52675e]">Review the captured page, separate observations from hypotheses, and surface limitations before the brief leaves your team.</p>
                </div>
              </div>
            </article>

            <article className={`${styles.bentoCard} bg-emerald-50 p-7 sm:p-9 lg:col-span-5`}>
              <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-700 text-white"><Layers3 className="size-5" /></span><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Agency-specific</span></div>
              <h3 className="mt-10 text-2xl font-semibold tracking-[-0.035em]">Match findings to your services.</h3>
              <p className="mt-3 leading-7 text-slate-600">Your catalog shapes the opportunity—not a generic list of recommendations.</p>
              <div className="mt-7 flex flex-wrap gap-2">{['CRO', 'Web design', 'SEO', 'Analytics'].map((tag, i) => <span key={tag} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${i === 0 ? 'border-emerald-200 bg-white text-emerald-800 shadow-sm' : 'border-emerald-100 text-slate-500'}`}>{tag}</span>)}</div>
            </article>

            <article className={`${styles.bentoCard} bg-white p-7 sm:p-9 lg:col-span-5`}>
              <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><ShieldCheck className="size-5" /></span><div><p className="text-sm font-semibold">Trust by default</p><p className="text-xs text-slate-400">Clear evidence labels</p></div></div>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 p-3"><p className="text-[10px] font-bold uppercase text-emerald-700">Observed</p><p className="mt-2 text-xs leading-5 text-slate-700">No CTA on pricing page.</p></div>
                <div className="rounded-xl bg-amber-50 p-3"><p className="text-[10px] font-bold uppercase text-amber-700">Hypothesis</p><p className="mt-2 text-xs leading-5 text-slate-700">Visitors may hesitate.</p></div>
              </div>
            </article>

            <article className={`${styles.bentoCard} bg-white p-7 sm:p-9 lg:col-span-12`}>
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div>
                  <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-700"><FileText className="size-5" /></span>
                  <h3 className="mt-7 text-3xl font-semibold tracking-[-0.04em]">From evidence to the next move.</h3>
                  <p className="mt-3 max-w-md leading-7 text-slate-600">Turn the same researched opportunity into a brief, call plan, outreach draft, and proposal direction.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    ['01', 'Brief', 'Align the team'],
                    ['02', 'Outreach', 'Start relevant'],
                    ['03', 'Proposal', 'Frame the value'],
                  ].map(([number, title, text]) => <div key={number} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="font-mono text-[10px] text-emerald-600">{number}</span><p className="mt-8 text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-xs text-slate-500">{text}</p></div>)}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.workflowSection} border-y border-[#d9e6dc] px-5 py-24 sm:px-8 sm:py-32 lg:px-10`}>
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:pt-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">The research handoff</p>
            <h2 className={`${styles.displayFont} mt-5 max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl`}>A clear path from website to conversation.</h2>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#597066]">Each stage makes the next one more useful. No mystery score, no disconnected AI summary.</p>
            <div className="mt-10 inline-flex items-center gap-3 border-l-2 border-emerald-600 pl-4">
              <span className="text-3xl font-semibold text-[#16352a]">14</span>
              <span className="max-w-[150px] text-xs leading-5 text-[#60766b]">durable stages from crawl to final brief</span>
            </div>
          </div>

          <div className={styles.processStack}>
            {[
              ['01', Globe2, 'Collect the right pages', 'The crawl maps the buying journey and keeps a record of every source.', '8 pages', 'Captured'],
              ['02', Sparkles, 'Connect the commercial signal', 'Findings become prioritized opportunities matched to your service catalog.', '12 findings', 'Matched'],
              ['03', FileText, 'Create the point of view', 'Your team edits the brief, verifies the language, and chooses the next move.', '1 brief', 'Ready'],
            ].map(([number, Icon, title, text, metric, status], index) => {
              const IconComponent = Icon as typeof Globe2;
              return (
                <article key={number as string} className={`${styles.processCard} ${index === 1 ? styles.processOffset : ''}`}>
                  <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e3f5e8] text-emerald-700"><IconComponent className="size-5" /></span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold tracking-wider text-emerald-600">STAGE {number as string}</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#10251d] sm:text-2xl">{title as string}</h3>
                      <p className="mt-2 max-w-lg text-sm leading-6 text-[#60766b]">{text as string}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-[#e0e9e2] pt-4 sm:mt-0 sm:w-28 sm:shrink-0 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                    <span className="text-sm font-semibold text-[#16352a]">{metric as string}</span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />{status as string}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.closeSection} border-b border-[#193f31] px-5 py-20 sm:px-8 sm:py-24 lg:px-10`}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Your next prospect is enough</p>
            <h2 className={`${styles.displayFont} mt-5 max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-white sm:text-7xl`}>Bring the URL.<br /><span className="text-emerald-300">We&apos;ll find the angle.</span></h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#b8d1c3]">Build a research-backed starting point your agency can edit, defend, and use.</p>
          </div>

          <form action="/register" method="GET" className={styles.closeForm}>
            <div className="flex items-center justify-between border-b border-[#dce9e0] pb-5">
              <div><p className="text-sm font-semibold text-[#10251d]">Start with a real prospect</p><p className="mt-1 text-xs text-[#6c8177]">Public website data only</p></div>
              <span className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Globe2 className="size-4" /></span>
            </div>
            <label htmlFor="closing-url" className="mt-7 block text-xs font-bold uppercase tracking-[0.14em] text-[#60766b]">Prospect website</label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input id="closing-url" type="url" name="url" required inputMode="url" placeholder="https://prospect.com" className="h-12 min-w-0 flex-1 rounded-xl border border-[#cad9cf] bg-[#f8fbf8] px-4 text-sm text-[#10251d] outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
              <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d]">Build my brief <ArrowRight className="size-4" /></button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              {['Source linked', 'Fully editable', 'Free to start'].map((item) => <span key={item} className="rounded-lg bg-[#f1f7f2] px-2 py-2 text-[10px] font-semibold text-[#52675e]">{item}</span>)}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
