import { db, schema } from '@leadlens/database';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { Badge, ScoreRing } from '@leadlens/ui';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Gauge,
  Globe2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { ReportFeedback } from './ReportFeedback';

export default async function ReportOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  if (!session.organization) notFound();

  const report = await db.query.reports.findFirst({
    where: and(eq(schema.reports.analysisJobId, id), eq(schema.reports.organizationId, session.organization.id)),
    with: {
      prospect: true,
      scores: true,
      primaryService: true,
      findings: { orderBy: (finding, { asc }) => asc(finding.sortOrder) },
    },
  });
  if (!report) notFound();

  const visibleFindings = report.findings.filter((finding) => !finding.isHidden);
  const topFindings = visibleFindings.slice(0, 3);
  const scoreCategories = [
    { label: 'Agency fit', value: report.scores.find((score) => score.category === 'agencyServiceFit')?.score || 0 },
    { label: 'Problem severity', value: report.scores.find((score) => score.category === 'problemSeverity')?.score || 0 },
    { label: 'Business maturity', value: report.scores.find((score) => score.category === 'businessMaturity')?.score || 0 },
    { label: 'Project value', value: report.scores.find((score) => score.category === 'likelyProjectValue')?.score || 0 },
  ];

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="report-reveal flex flex-col gap-6 border-b border-[#d8e5db] pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant="success" className="border-emerald-200 bg-emerald-50 text-emerald-800">Ready to use</Badge>
            <span className="text-xs font-medium text-[#71877b]">Generated {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(report.createdAt)}</span>
          </div>
          <h1 className="max-w-4xl text-[clamp(2rem,4vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-[#10251d]">
            {report.title?.replace(/^Intelligence Report:\s*/i, '') || 'Opportunity report'}
          </h1>
          <a href={report.prospect.websiteUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors duration-300 ease-out hover:text-emerald-900">
            <Globe2 className="size-4" />{report.prospect.websiteUrl}<ArrowUpRight className="size-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Metric label="Fit score" value={String(report.overallScore || 0)} suffix="/100" />
          <Metric label="Verified issues" value={String(visibleFindings.length)} />
          <Metric label="Confidence" value={report.confidence || '—'} />
        </div>
      </header>

      <div className="mt-8 grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-7">
          <section className="report-reveal relative overflow-hidden rounded-[1.75rem] border border-[#c8ddcd] bg-[#e4f2e7] p-7 text-[#10251d] shadow-[0_24px_70px_rgba(31,67,46,0.06)] sm:p-9">
            <div aria-hidden="true" className="absolute -right-16 -top-20 size-64 rounded-full border border-white/40 bg-emerald-300/30 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                <Target className="size-4" />Opportunity thesis
              </div>
              <p className="mt-6 max-w-4xl text-xl font-medium leading-relaxed tracking-[-0.015em] text-[#16352a] sm:text-2xl">
                {report.opportunityThesis || 'The strongest opportunity will become clearer as more evidence is verified.'}
              </p>
            </div>
          </section>

          <section className="report-reveal rounded-[1.5rem] border border-white/80 bg-white/78 p-6 shadow-[0_18px_60px_rgba(31,67,46,0.08)] backdrop-blur-xl sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e4f2e7] text-emerald-700"><Sparkles className="size-5" /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#71877b]">Executive perspective</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#16352a]">Why this account deserves attention</h2>
                <p className="mt-4 text-[15px] leading-7 text-[#486257]">{report.executiveSummary || 'No executive summary is available.'}</p>
              </div>
            </div>
          </section>

          <section className="report-reveal">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Evidence-backed priorities</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[#10251d]">Critical findings</h2>
              </div>
              <Link href={`/analyses/${id}/report/findings`} className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition-all duration-300 ease-out hover:gap-2.5 hover:text-emerald-900">
                View evidence map <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid gap-3">
              {topFindings.map((finding, index) => {
                const theme = findingTheme(finding.severity);
                return (
                  <article key={finding.id} className="group rounded-2xl border border-[#dce8df] bg-white/82 p-5 shadow-[0_10px_32px_rgba(31,67,46,0.055)] backdrop-blur transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#c8ddcd] hover:shadow-[0_18px_46px_rgba(31,67,46,0.1)]">
                    <div className="flex items-start gap-4">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${theme.icon}`}>{String(index + 1).padStart(2, '0')}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#16352a]">{finding.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${theme.badge}`}>{finding.severity || 'observed'}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#60766b]">{finding.observation || 'Open the evidence map for details.'}</p>
                      </div>
                      <ArrowUpRight className="mt-1 size-4 shrink-0 text-[#9aada2] transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                    </div>
                  </article>
                );
              })}
              {!topFindings.length && <div className="rounded-2xl border border-dashed border-[#cbdacf] bg-white/60 p-8 text-center text-sm text-[#71877b]">No visible findings were recorded.</div>}
            </div>
          </section>

          <ReportFeedback reportId={report.id} />
        </div>

        <aside className="space-y-5 xl:sticky xl:top-32">
          <section className="report-reveal rounded-[1.75rem] border border-white/90 bg-white/82 p-6 shadow-[0_20px_60px_rgba(31,67,46,0.1)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#71877b]">Opportunity fit</p>
                <p className="mt-1 text-sm font-semibold text-[#16352a]">Signal strength</p>
              </div>
              <Gauge className="size-5 text-emerald-700" />
            </div>
            <div className="my-6 flex justify-center">
              <ScoreRing score={Number(report.overallScore || 0)} size={142} strokeWidth={9} label={report.scoreLabel || 'Evaluating'} />
            </div>
            <div className="space-y-4 border-t border-[#e1ebe3] pt-5">
              {scoreCategories.map((category) => (
                <div key={category.label}>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-[#60766b]">{category.label}</span><span className="font-bold text-[#16352a]">{category.value}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#e6eee8]"><div className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400" style={{ width: `${Math.min(100, category.value)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="report-reveal rounded-2xl bg-[#f0e7c9] p-6 shadow-[0_14px_40px_rgba(88,72,26,0.09)]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#79631f]"><TrendingUp className="size-4" />Recommended next step</div>
            <p className="mt-4 text-sm font-semibold leading-6 text-[#3d351c]">{report.recommendedAction || 'Validate the strongest findings in a discovery conversation.'}</p>
          </section>

          {report.primaryService && (
            <section className="report-reveal rounded-2xl border border-[#d7e5da] bg-white/74 p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700"><CheckCircle2 className="size-4" />Primary service match</div>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[#16352a]">{report.primaryService.name}</h3>
              <p className="mt-2 text-xs leading-5 text-[#71877b]">{report.primaryService.summary}</p>
              <Link href={`/analyses/${id}/report/opportunities`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">View rationale <ArrowRight className="size-3.5" /></Link>
            </section>
          )}

          <div className="report-reveal flex items-start gap-3 rounded-2xl border border-[#d7e5da] bg-[#eef5ef]/80 p-4 text-xs leading-5 text-[#60766b]">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            Claims are tied to captured public sources. Verify material details before outreach.
          </div>
        </aside>
      </div>
    </main>
  );
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="min-w-24 rounded-2xl border border-white/90 bg-white/72 px-3 py-3 text-center shadow-[0_10px_34px_rgba(31,67,46,0.07)] backdrop-blur sm:min-w-28 sm:px-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7f9489]">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#16352a]">{value}<span className="text-[10px] text-[#71877b]">{suffix}</span></p>
    </div>
  );
}

function findingTheme(severity: string | null) {
  if (severity === 'high' || severity === 'critical') return { icon: 'bg-rose-50 text-rose-700', badge: 'bg-rose-50 text-rose-700' };
  if (severity === 'medium' || severity === 'warning') return { icon: 'bg-amber-50 text-amber-700', badge: 'bg-amber-50 text-amber-700' };
  return { icon: 'bg-emerald-50 text-emerald-700', badge: 'bg-emerald-50 text-emerald-700' };
}
