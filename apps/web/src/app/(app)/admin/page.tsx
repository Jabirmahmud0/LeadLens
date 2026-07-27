import { desc, eq, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';
import { Activity, AlertTriangle, Building2, Gauge, MessageSquareText, ShieldAlert, Sparkles, Users } from 'lucide-react';

export const metadata = { title: 'Admin Diagnostics | LeadLens' };
export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user) notFound();
  if (!isPlatformAdmin(session.user.email)) {
    await db.insert(schema.auditLogs).values({ organizationId: session.organization?.id, userId: session.user.id, action: 'admin_access_denied' });
    notFound();
  }
  await db.insert(schema.auditLogs).values({ organizationId: session.organization?.id, userId: session.user.id, action: 'admin_accessed' });
  const [users, organizations, failedJobs, failedAiRuns, usage, feedback, securityEvents, aiTotals] = await Promise.all([
    db.query.users.findMany({ columns: { id: true, email: true, status: true, createdAt: true }, orderBy: [desc(schema.users.createdAt)], limit: 50 }),
    db.query.organizations.findMany({ orderBy: [desc(schema.organizations.createdAt)], limit: 50 }),
    db.query.analysisJobs.findMany({ where: eq(schema.analysisJobs.status, 'failed'), orderBy: [desc(schema.analysisJobs.updatedAt)], limit: 50 }),
    db.query.aiRuns.findMany({ where: eq(schema.aiRuns.status, 'failed'), orderBy: [desc(schema.aiRuns.createdAt)], limit: 50 }),
    db.query.usageEvents.findMany({ orderBy: [desc(schema.usageEvents.createdAt)], limit: 100 }),
    db.query.reportFeedback.findMany({ orderBy: [desc(schema.reportFeedback.createdAt)], limit: 100 }),
    db.query.auditLogs.findMany({ orderBy: [desc(schema.auditLogs.createdAt)], limit: 100 }),
    db.select({ inputTokens: sql<number>`coalesce(sum(${schema.aiRuns.inputTokens}), 0)`, outputTokens: sql<number>`coalesce(sum(${schema.aiRuns.outputTokens}), 0)`, averageLatency: sql<number>`coalesce(avg(${schema.aiRuns.latencyMs}), 0)` }).from(schema.aiRuns),
  ]);
  const totals = aiTotals[0];
  const metrics = [
    { label: 'Users', value: users.length, icon: Users, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Organizations', value: organizations.length, icon: Building2, tone: 'bg-teal-50 text-teal-700' },
    { label: 'Failed jobs', value: failedJobs.length, icon: AlertTriangle, tone: 'bg-rose-50 text-rose-700' },
    { label: 'Provider failures', value: failedAiRuns.length, icon: Sparkles, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Usage events', value: usage.length, icon: Activity, tone: 'bg-lime-50 text-lime-700' },
    { label: 'Feedback entries', value: feedback.length, icon: MessageSquareText, tone: 'bg-orange-50 text-orange-700' },
    { label: 'Security events', value: securityEvents.length, icon: ShieldAlert, tone: 'bg-red-50 text-red-700' },
    { label: 'AI tokens', value: Number(totals?.inputTokens || 0) + Number(totals?.outputTokens || 0), icon: Gauge, tone: 'bg-cyan-50 text-cyan-700' },
  ];

  return <main className="app-page-enter mx-auto max-w-[1480px] p-4 sm:p-7 lg:p-9">
    <header className="overflow-hidden rounded-3xl border border-[#d6e5da] bg-gradient-to-br from-[#e8f6eb] via-white to-[#fff1e8] p-6 shadow-[0_24px_60px_-48px_rgba(20,83,45,0.55)] sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Platform operations</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#10251d]">Admin diagnostics</h1><p className="mt-2 max-w-2xl text-sm text-[#60766b]">Monitor product health, provider reliability, user activity, and operational risk.</p></div><div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-[#8ca096]">Average AI latency</p><p className="mt-1 text-2xl font-semibold text-emerald-800">{Math.round(Number(totals?.averageLatency || 0))}<span className="ml-1 text-xs font-medium text-[#789084]">ms</span></p></div></div>
    </header>
    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-[#dce7df] bg-white p-5 shadow-[0_18px_48px_-42px_rgba(20,83,45,0.5)] transition-all hover:-translate-y-0.5 hover:border-[#bcd6c3]"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-[#789084]">{label}</p><p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#16352a]">{value.toLocaleString()}</p></div><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-4.5" /></span></div></article>)}</section>
    <section className="mt-5 overflow-hidden rounded-3xl border border-[#dce7df] bg-white shadow-[0_24px_60px_-48px_rgba(20,83,45,0.5)]"><div className="border-b border-[#e3ebe5] px-5 py-5 sm:px-7"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-rose-600">Needs attention</p><h2 className="mt-1.5 text-xl font-semibold text-[#16352a]">Recent failed jobs</h2></div>{failedJobs.length ? <div className="divide-y divide-[#e7eee9]">{failedJobs.map((job) => <div key={job.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(180px,0.7fr)_minmax(0,1.3fr)] sm:px-7"><div><span className="font-mono text-xs text-[#60766b]">{job.id}</span><span className="ml-2 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase text-rose-700">{job.failureCode || 'Unknown'}</span></div><p className="text-sm text-[#60766b]">{job.failureMessage || 'No failure message was recorded.'}</p></div>)}</div> : <div className="px-6 py-14 text-center"><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldAlert className="size-5" /></span><p className="mt-4 text-sm font-semibold text-[#365246]">No recent job failures</p><p className="mt-1 text-xs text-[#8ca096]">The processing queue is healthy.</p></div>}</section>
  </main>;
}
