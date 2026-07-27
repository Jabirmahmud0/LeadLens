import { getSession } from '@/lib/auth/session';
import { db, schema } from '@leadlens/database';
import { and, desc, eq, gte } from 'drizzle-orm';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  Globe2,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import styles from './dashboard.module.css';

export const metadata = { title: 'Dashboard | LeadLens' };

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const activityDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

async function getDashboardData(orgId: string) {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [profile, services, icp, caseStudies, topReports, jobs, monthlyJobs] = await Promise.all([
    db.query.agencyProfiles.findFirst({ where: eq(schema.agencyProfiles.organizationId, orgId) }),
    db.query.agencyServices.findMany({ where: eq(schema.agencyServices.organizationId, orgId) }),
    db.query.idealCustomerProfiles.findFirst({ where: eq(schema.idealCustomerProfiles.organizationId, orgId) }),
    db.query.caseStudies.findMany({ where: eq(schema.caseStudies.organizationId, orgId) }),
    db.query.reports.findMany({
      where: eq(schema.reports.organizationId, orgId),
      orderBy: [desc(schema.reports.overallScore), desc(schema.reports.createdAt)],
      limit: 5,
      with: { prospect: true, primaryService: true },
    }),
    db.query.analysisJobs.findMany({
      where: eq(schema.analysisJobs.organizationId, orgId),
      orderBy: [desc(schema.analysisJobs.createdAt)],
      limit: 6,
      with: { prospect: true },
    }),
    db.query.analysisJobs.findMany({
      columns: { id: true },
      where: and(eq(schema.analysisJobs.organizationId, orgId), gte(schema.analysisJobs.createdAt, monthStart)),
    }),
  ]);

  const completeness = [profile, services.length > 0, icp, caseStudies.length > 0]
    .filter(Boolean).length * 25;

  return { profile, services, icp, caseStudies, topReports, jobs, monthlyUsage: monthlyJobs.length, completeness };
}

function statusTone(status: string) {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-800';
  if (status === 'failed') return 'bg-rose-100 text-rose-700';
  if (status === 'processing') return 'bg-amber-100 text-amber-800';
  return 'bg-teal-100 text-teal-800';
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.organization) redirect('/login');

  const { profile, completeness, topReports, services, jobs, monthlyUsage, icp, caseStudies } = await getDashboardData(session.organization.id);
  const monthlyLimit = Math.max(1, Number(process.env.MONTHLY_ANALYSIS_LIMIT ?? 25));
  const quotaPercent = Math.min(100, Math.round((monthlyUsage / monthlyLimit) * 100));
  const activeJobs = jobs.filter((job) => ['queued', 'processing'].includes(job.status));
  const highPotential = topReports.filter((report) => (report.overallScore ?? 0) >= 75).length;
  const name = session.organization.name || session.user?.email?.split('@')[0] || 'your agency';

  const setupItems = [
    { done: Boolean(profile), label: 'Agency identity', detail: 'Positioning and voice', href: '/onboarding/identity', color: 'bg-emerald-500' },
    { done: services.length > 0, label: 'Service catalog', detail: 'Offers LeadLens can match', href: '/onboarding/services', color: 'bg-teal-500' },
    { done: Boolean(icp), label: 'Ideal customer', detail: 'Qualification context', href: '/onboarding/icp', color: 'bg-amber-400' },
    { done: caseStudies.length > 0, label: 'Proof library', detail: 'Case studies for credibility', href: '/onboarding/case-studies', color: 'bg-rose-400' },
  ];
  const nextSetupItem = setupItems.find((item) => !item.done);

  const metrics = [
    { label: 'Analyses this month', value: `${monthlyUsage}/${monthlyLimit}`, note: `${monthlyLimit - monthlyUsage > 0 ? monthlyLimit - monthlyUsage : 0} remaining`, icon: Search, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Briefs ready', value: topReports.length, note: 'Recent opportunity briefs', icon: FileCheck2, tone: 'bg-teal-50 text-teal-700' },
    { label: 'High potential', value: highPotential, note: 'Score of 75 or higher', icon: TrendingUp, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Setup readiness', value: `${completeness}%`, note: completeness === 100 ? 'Context is ready' : 'Improve AI relevance', icon: Target, tone: 'bg-rose-50 text-rose-700' },
  ];

  return (
    <div className="min-h-full bg-[#f6f9f5] text-[#10251d]">
      <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 sm:py-7 xl:px-10 xl:py-9">
        <header className={`${styles.reveal} flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between`}>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <span className={`${styles.liveDot} size-2 rounded-full bg-emerald-500`} /> Workspace overview
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#10251d] sm:text-4xl">
              Welcome back, {name}.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#60766b] sm:text-base">
              Find the strongest sales angle, keep the evidence attached, and move the right prospect forward.
            </p>
          </div>
          <Link href="/new" className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 text-sm font-semibold text-white shadow-[0_14px_32px_-16px_rgba(22,101,52,0.65)] transition-all hover:-translate-y-0.5 hover:bg-[#14532d] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
            <Plus className="size-4" /> Analyze a prospect <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </header>

        <section className={`${styles.reveal} ${styles.delayOne} relative mt-7 overflow-hidden rounded-[28px] border border-[#cfe2d4] bg-gradient-to-br from-[#e7f5e9] via-[#f4faef] to-[#fff7dc] p-6 shadow-[0_28px_70px_-54px_rgba(20,83,45,0.55)] sm:p-8 lg:p-10`}>
          <div className={styles.heroGrid} />
          <div className={`${styles.orb} ${styles.orbOne}`} />
          <div className={`${styles.orb} ${styles.orbTwo}`} />
          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur">
                <Sparkles className="size-3.5" /> Your next opportunity starts with one URL
              </span>
              <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4vw,4.1rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#10251d]">
                Turn a public website into a <span className="text-emerald-700">sales-ready point of view.</span>
              </h2>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#52675e]">
                {['Source-backed findings', 'Matched to your services', 'Ready for outreach'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-600" />{item}</span>
                ))}
              </div>
            </div>

            <div className={`${styles.floatPanel} rounded-2xl border border-white/80 bg-white/85 p-5 shadow-[0_24px_55px_-35px_rgba(20,83,45,0.55)] backdrop-blur sm:p-6`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#789084]">Monthly capacity</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16352a]">{monthlyUsage}<span className="text-base font-medium text-[#8ca096]"> / {monthlyLimit}</span></p>
                </div>
                <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Globe2 className="size-5" /></span>
              </div>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e7eee8]">
                <div className={`${styles.progressFill} h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400`} style={{ '--progress': `${quotaPercent}%` } as React.CSSProperties} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-[#60766b]">
                <span>{activeJobs.length ? `${activeJobs.length} active ${activeJobs.length === 1 ? 'analysis' : 'analyses'}` : 'Queue is clear'}</span>
                <span className="font-semibold text-emerald-700">Renews monthly</span>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.reveal} ${styles.delayTwo} mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4`} aria-label="Workspace metrics">
          {metrics.map(({ label, value, note, icon: Icon, tone }, index) => (
            <article key={label} className="group rounded-2xl border border-[#dce7df] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(20,83,45,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-[#bdd7c4] hover:shadow-[0_24px_55px_-38px_rgba(20,83,45,0.4)]" style={{ animationDelay: `${index * 70}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-medium text-[#789084]">{label}</p><p className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#16352a]">{value}</p></div>
                <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-4.5" /></span>
              </div>
              <p className="mt-3 text-xs text-[#8ca096]">{note}</p>
            </article>
          ))}
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.65fr)]">
          <section className={`${styles.reveal} ${styles.delayThree} overflow-hidden rounded-3xl border border-[#dce7df] bg-white shadow-[0_25px_65px_-52px_rgba(20,83,45,0.5)]`}>
            <div className="flex items-center justify-between gap-4 border-b border-[#e4ece6] px-5 py-5 sm:px-7">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-700">Priority queue</p><h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-[#16352a]">High-potential prospects</h2></div>
              <Link href="/prospects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900">View all <ArrowRight className="size-3.5" /></Link>
            </div>

            {topReports.length === 0 ? (
              <div className={`${styles.emptyPattern} relative min-h-[330px] overflow-hidden p-6 sm:p-8`}>
                <div className="relative z-10 mx-auto flex max-w-md flex-col items-center py-10 text-center">
                  <div className={`${styles.searchOrbit} grid size-16 place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm`}><Search className="size-7" /></div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em] text-[#16352a]">Your opportunity queue is ready.</h3>
                  <p className="mt-3 text-sm leading-6 text-[#60766b]">Analyze the first prospect to reveal evidence, service fit, and a defensible next conversation.</p>
                  <Link href="/new" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#166534] px-5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d]"><Globe2 className="size-4" /> Start with a website</Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#e7eee9]">
                {topReports.map((report) => {
                  const score = report.overallScore ?? 0;
                  return (
                    <Link href={`/analyses/${report.analysisJobId}/report`} key={report.id} className="group grid gap-4 px-5 py-4 transition-colors hover:bg-[#f7faf7] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-7">
                      <span className={`grid size-12 place-items-center rounded-2xl text-sm font-bold ${score >= 75 ? 'bg-emerald-100 text-emerald-800' : score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'}`}>{score}</span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[#16352a] group-hover:text-emerald-800">{report.prospect?.companyName || report.prospect?.normalizedDomain}</h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#789084]">
                          <span>{report.prospect?.normalizedDomain}</span><span className="size-1 rounded-full bg-[#c4d4c9]" />
                          <span>{report.primaryService?.name || 'Opportunity brief'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end"><span className="rounded-full bg-[#f0f6f1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#60766b]">{report.scoreLabel || 'Scored'}</span><span className="text-xs text-[#8ca096]">{shortDate.format(new Date(report.createdAt))}</span><ArrowRight className="size-4 text-[#9aad9f] transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" /></div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <aside className={`${styles.reveal} ${styles.delayFour} rounded-3xl border border-[#d7e4da] bg-[#eef7f0] p-5 shadow-[0_25px_65px_-52px_rgba(20,83,45,0.5)] sm:p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-700">Workspace readiness</p><h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-[#16352a]">Give AI better context</h2></div>
              <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">{completeness}%</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white shadow-inner"><div className={`${styles.progressFill} h-full rounded-full bg-emerald-500`} style={{ '--progress': `${completeness}%` } as React.CSSProperties} /></div>
            <div className="mt-5 space-y-2.5">
              {setupItems.map((item) => (
                <Link key={item.label} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-[#dce9df] bg-white/85 p-3.5 transition-all hover:-translate-y-0.5 hover:border-[#bcd8c4] hover:bg-white hover:shadow-sm">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-[#f4f7f4] text-[#9bad9f]'}`}>{item.done ? <CheckCircle2 className="size-4" /> : <span className={`size-2 rounded-full ${item.color}`} />}</span>
                  <span className="min-w-0 flex-1"><strong className={`block text-sm ${item.done ? 'text-[#789084]' : 'text-[#16352a]'}`}>{item.label}</strong><small className="mt-0.5 block text-[11px] text-[#8ca096]">{item.done ? 'Completed' : item.detail}</small></span>
                  <ArrowRight className="size-3.5 text-[#a1b1a7] transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                </Link>
              ))}
            </div>
            {nextSetupItem ? <Link href={nextSetupItem.href} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-700 hover:text-white">Continue setup <ArrowRight className="size-4" /></Link> : <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white"><CheckCircle2 className="size-4" /> Your workspace is ready</div>}
          </aside>
        </div>

        <section className={`${styles.reveal} ${styles.delayFour} mt-5 rounded-3xl border border-[#dce7df] bg-white p-5 shadow-[0_25px_65px_-52px_rgba(20,83,45,0.5)] sm:p-7`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-teal-700">Activity stream</p><h2 className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-[#16352a]">Recent analyses</h2></div><Link href="/analyses" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Open analysis journal</Link></div>
          {jobs.length === 0 ? (
            <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#cdded2] bg-[#fafcf9] px-5 py-10 text-center"><Clock3 className="size-5 text-[#8ca096]" /><p className="mt-3 text-sm font-semibold text-[#365246]">No activity yet</p><p className="mt-1 text-xs text-[#8ca096]">Your analysis history will appear here.</p></div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-[#e0e9e2] bg-[#fafcf9] p-4 transition-all hover:border-[#c2d8c8] hover:bg-white hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusTone(job.status)}`}>{job.status}</span>{job.status === 'failed' ? <CircleAlert className="size-4 text-rose-500" /> : job.status === 'completed' ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Activity className="size-4 text-amber-600" />}</div>
                  <p className="mt-4 truncate text-sm font-semibold text-[#16352a]">{job.prospect?.companyName || job.prospect?.normalizedDomain || 'Unknown prospect'}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[#8ca096]"><span>{job.currentStep ? job.currentStep.replaceAll('_', ' ') : 'Analysis workflow'}</span><time>{activityDate.format(new Date(job.createdAt))}</time></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
