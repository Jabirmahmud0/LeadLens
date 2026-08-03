import { desc, eq, and, isNull, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin, PLATFORM_OWNER_ROLE } from '@/lib/auth/admin';
import {
  Activity, AlertTriangle, Building2, CheckCircle2,
  CreditCard, KeyRound, MessageSquareText, ShieldAlert, Sparkles,
  TrendingUp, UserPlus, Users, Zap
} from 'lucide-react';
import Link from 'next/link';
import { GrantOwnerForm, RevokeOwnerForm } from './PlatformOwnerForms';

export const metadata = { title: 'Platform Administration | LeadLens' };

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.user || !(await isPlatformAdmin(session.user.id))) notFound();

  const [users, organizations, failedJobs, failedAiRuns, usage, feedback, securityEvents, aiTotals, owners] = await Promise.all([
    db.query.users.findMany({ columns: { id: true, email: true, status: true, createdAt: true }, orderBy: [desc(schema.users.createdAt)], limit: 50 }),
    db.query.organizations.findMany({ orderBy: [desc(schema.organizations.createdAt)], limit: 50 }),
    db.query.analysisJobs.findMany({ where: eq(schema.analysisJobs.status, 'failed'), orderBy: [desc(schema.analysisJobs.updatedAt)], limit: 50 }),
    db.query.aiRuns.findMany({ where: eq(schema.aiRuns.status, 'failed'), orderBy: [desc(schema.aiRuns.createdAt)], limit: 50 }),
    db.query.usageEvents.findMany({ orderBy: [desc(schema.usageEvents.createdAt)], limit: 100 }),
    db.query.reportFeedback.findMany({ orderBy: [desc(schema.reportFeedback.createdAt)], limit: 100 }),
    db.query.auditLogs.findMany({ orderBy: [desc(schema.auditLogs.createdAt)], limit: 100 }),
    db.select({
      inputTokens: sql<number>`coalesce(sum(${schema.aiRuns.inputTokens}), 0)`,
      outputTokens: sql<number>`coalesce(sum(${schema.aiRuns.outputTokens}), 0)`,
      averageLatency: sql<number>`coalesce(avg(${schema.aiRuns.latencyMs}), 0)`,
    }).from(schema.aiRuns),
    db.select({
      assignmentId: schema.platformRoleAssignments.id,
      userId: schema.users.id,
      email: schema.users.email,
      fullName: schema.users.fullName,
      source: schema.platformRoleAssignments.source,
      grantedAt: schema.platformRoleAssignments.grantedAt,
    }).from(schema.platformRoleAssignments)
      .innerJoin(schema.users, eq(schema.platformRoleAssignments.userId, schema.users.id))
      .where(and(
        eq(schema.platformRoleAssignments.role, PLATFORM_OWNER_ROLE),
        isNull(schema.platformRoleAssignments.revokedAt),
      ))
      .orderBy(desc(schema.platformRoleAssignments.grantedAt)),
  ]);

  const totals = aiTotals[0];
  const totalTokens = Number(totals?.inputTokens || 0) + Number(totals?.outputTokens || 0);
  const avgLatency = Math.round(Number(totals?.averageLatency || 0));
  const systemHealthy = failedJobs.length === 0 && failedAiRuns.length === 0;

  const primaryMetrics = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'emerald', href: '/admin/users', trend: '+12%' },
    { label: 'Organizations', value: organizations.length, icon: Building2, color: 'teal', href: '/admin/organizations', trend: '+5%' },
    { label: 'Usage Events', value: usage.length, icon: Activity, color: 'violet', href: '/admin/usage-events', trend: '+28%' },
    { label: 'AI Tokens Used', value: totalTokens, icon: Zap, color: 'amber', href: undefined, trend: null },
  ];

  const alertMetrics = [
    { label: 'Failed Jobs', value: failedJobs.length, icon: AlertTriangle, color: 'rose', href: '/admin/failed-jobs', critical: failedJobs.length > 0 },
    { label: 'Provider Failures', value: failedAiRuns.length, icon: Sparkles, color: 'orange', href: '/admin/provider-failures', critical: failedAiRuns.length > 0 },
    { label: 'Security Events', value: securityEvents.length, icon: ShieldAlert, color: 'red', href: '/admin/security-events', critical: false },
    { label: 'Feedback Entries', value: feedback.length, icon: MessageSquareText, color: 'blue', href: '/admin/feedback', critical: false },
  ];

  const operationLinks = [
    { label: 'Users', description: 'Suspend, restore, or remove platform accounts.', href: '/admin/users', icon: Users, tone: 'emerald' },
    { label: 'Organizations', description: 'Review and control workspace access.', href: '/admin/organizations', icon: Building2, tone: 'teal' },
    { label: 'Billing operations', description: 'Inspect subscriptions and Stripe webhook health.', href: '/admin/billing', icon: CreditCard, tone: 'amber' },
    { label: 'Security audit', description: 'Trace privileged and account-level activity.', href: '/admin/security-events', icon: ShieldAlert, tone: 'rose' },
    { label: 'Failed analyses', description: 'Investigate jobs that did not complete.', href: '/admin/failed-jobs', icon: AlertTriangle, tone: 'orange' },
    { label: 'Provider reliability', description: 'Review AI provider and model failures.', href: '/admin/provider-failures', icon: Sparkles, tone: 'violet' },
    { label: 'Usage ledger', description: 'Follow platform activity and adoption events.', href: '/admin/usage-events', icon: Activity, tone: 'blue' },
    { label: 'Product feedback', description: 'Read feedback submitted from reports.', href: '/admin/feedback', icon: MessageSquareText, tone: 'teal' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; pill: string; pillText: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-100', pill: 'bg-emerald-50', pillText: 'text-emerald-700' },
    teal:    { bg: 'bg-teal-500/10',    text: 'text-teal-600',    border: 'border-teal-100',    pill: 'bg-teal-50',    pillText: 'text-teal-700' },
    violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-600',  border: 'border-violet-100',  pill: 'bg-violet-50',  pillText: 'text-violet-700' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-600',   border: 'border-amber-100',   pill: 'bg-amber-50',   pillText: 'text-amber-700' },
    rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-600',    border: 'border-rose-100',    pill: 'bg-rose-50',    pillText: 'text-rose-700' },
    orange:  { bg: 'bg-orange-500/10',  text: 'text-orange-600',  border: 'border-orange-100',  pill: 'bg-orange-50',  pillText: 'text-orange-700' },
    red:     { bg: 'bg-red-500/10',     text: 'text-red-600',     border: 'border-red-100',     pill: 'bg-red-50',     pillText: 'text-red-700' },
    blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-600',    border: 'border-blue-100',    pill: 'bg-blue-50',    pillText: 'text-blue-700' },
  };

  return (
    <main className="app-page-enter min-h-screen bg-[#f5f8f6] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">

        {/* ── Hero Header ── */}
        <header className="relative overflow-hidden rounded-[28px] border border-white bg-white px-8 py-8 shadow-[0_2px_20px_-12px_rgba(0,0,0,0.1),0_12px_32px_-20px_rgba(20,83,45,0.15)] sm:px-10 sm:py-10">
          {/* Subtle gradient wash */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-transparent to-teal-50/50" />
          
          {/* Decorative glow orbs */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/4 h-64 w-64 rounded-full bg-teal-100/30 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1 shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">Platform Operations</span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0f2318] sm:text-[2.5rem]">
                Platform Administration
              </h1>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#4a6b5a]">
                Monitor product health, provider reliability, user activity, and privileged access across the LeadLens ecosystem.
              </p>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-4">
              <div className="flex min-w-[140px] flex-col justify-center rounded-2xl border border-[#e8f0ec] bg-white px-5 py-4 shadow-[0_2px_12px_-4px_rgba(20,83,45,0.08)] transition-transform hover:-translate-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#789084]">Your Role</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[15px] font-bold text-[#0f2318]">
                  <KeyRound className="size-4 text-emerald-600" /> Platform Owner
                </p>
              </div>
              <div className="flex min-w-[140px] flex-col justify-center rounded-2xl border border-[#e8f0ec] bg-white px-5 py-4 shadow-[0_2px_12px_-4px_rgba(20,83,45,0.08)] transition-transform hover:-translate-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#789084]">Avg AI Latency</p>
                <p className="mt-1.5 text-2xl font-black tracking-tight text-[#0f2318]">
                  {avgLatency}<span className="ml-1 text-sm font-medium text-[#789084]">ms</span>
                </p>
              </div>
              <div className={`flex min-w-[160px] flex-col justify-center rounded-2xl border px-5 py-4 shadow-[0_2px_12px_-4px_rgba(20,83,45,0.08)] transition-transform hover:-translate-y-0.5 ${systemHealthy ? 'border-emerald-100 bg-emerald-50/50' : 'border-rose-100 bg-rose-50/50'}`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#789084]">System Health</p>
                <p className={`mt-1.5 flex items-center gap-1.5 text-[15px] font-bold ${systemHealthy ? 'text-emerald-700' : 'text-rose-600'}`}>
                  <CheckCircle2 className="size-4" />
                  {systemHealthy ? 'All Operational' : 'Issues Detected'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Primary Metrics ── */}
        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#789084]">Growth & Usage</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {primaryMetrics.map(({ label, value, icon: Icon, color, href, trend }) => {
              const c = colorMap[color];
              const card = (
                <div className="group relative overflow-hidden rounded-2xl border border-white bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)]">
                  {/* top accent line */}
                  <div className={`absolute inset-x-0 top-0 h-0.5 ${c.bg.replace('/10', '/60').replace('bg-', 'bg-gradient-to-r from-')} transition-all`} />
                  <div className="flex items-start justify-between">
                    <div className={`grid size-10 place-items-center rounded-xl ${c.bg} ${c.text}`}>
                      <Icon className="size-5" />
                    </div>
                    {trend && (
                      <div className={`flex items-center gap-1 rounded-full ${c.pill} px-2 py-0.5`}>
                        <TrendingUp className={`size-3 ${c.pillText}`} />
                        <span className={`text-[10px] font-bold ${c.pillText}`}>{trend}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9aaba5]">{label}</p>
                    <p className="mt-1 text-[2.25rem] font-bold leading-none tracking-[-0.04em] text-[#0f2318]">
                      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
              return href ? (
                <Link key={label} href={href} className="block">{card}</Link>
              ) : (
                <div key={label}>{card}</div>
              );
            })}
          </div>
        </section>

        {/* ── Alert Metrics ── */}
        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#789084]">Monitoring & Alerts</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {alertMetrics.map(({ label, value, icon: Icon, color, href, critical }) => {
              const c = colorMap[color];
              const card = (
                <div className={`group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${critical ? `border-rose-200 bg-rose-50/40` : 'border-white'}`}>
                  <div className="flex items-start justify-between">
                    <div className={`grid size-10 place-items-center rounded-xl ${c.bg} ${c.text}`}>
                      <Icon className="size-5" />
                    </div>
                    {critical && value > 0 && (
                      <span className="flex size-2.5 items-center justify-center">
                        <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9aaba5]">{label}</p>
                    <p className={`mt-1 text-[2.25rem] font-bold leading-none tracking-[-0.04em] ${critical && value > 0 ? 'text-rose-600' : 'text-[#0f2318]'}`}>
                      {value.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
              return href ? (
                <Link key={label} href={href} className="block">{card}</Link>
              ) : (
                <div key={label}>{card}</div>
              );
            })}
          </div>
        </section>

        {/* ── Platform Owners + Grant Access ── */}
        <section>
          <div className="mb-3 flex items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#789084]">Operations Console</p><h2 className="mt-1 text-xl font-bold text-[#0f2318]">Platform controls and diagnostics</h2></div><span className="hidden text-xs text-[#91a49a] sm:block">Every privileged mutation is audited</span></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{operationLinks.map(({ label, description, href, icon: Icon, tone }) => { const c = colorMap[tone]; return <Link key={href} href={href} className="group rounded-2xl border border-white bg-white p-5 shadow-[0_8px_24px_-20px_rgba(20,83,45,.3)] transition-all hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-[0_14px_34px_-24px_rgba(20,83,45,.45)]"><div className={`grid size-9 place-items-center rounded-xl ${c.bg} ${c.text}`}><Icon className="size-4" /></div><p className="mt-4 text-sm font-bold text-[#16352a]">{label}</p><p className="mt-1 text-xs leading-5 text-[#789084]">{description}</p><span className="mt-4 inline-flex text-[10px] font-bold uppercase tracking-wide text-emerald-700 transition-transform group-hover:translate-x-1">Open →</span></Link>; })}</div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

          {/* Platform Owners List */}
          <article className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[#f0f4f1] px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600">Privileged Access</p>
                <h2 className="mt-1 text-lg font-bold text-[#0f2318]">Platform Owners</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                {owners.length} active
              </span>
            </div>
            <div className="divide-y divide-[#f4f7f5]">
              {owners.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-[#9aaba5]">No platform owners assigned.</div>
              )}
              {owners.map((owner) => (
                <div key={owner.assignmentId} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {(owner.fullName || owner.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0f2318]">{owner.fullName || owner.email}</p>
                      <p className="mt-0.5 truncate text-xs text-[#789084]">{owner.email}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[#b0bfb9]">
                        Granted {owner.grantedAt.toLocaleDateString()} · {owner.source.replaceAll('_', ' ')}
                      </p>
                    </div>
                  </div>
                  {owner.userId === session.user.id ? (
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      You
                    </span>
                  ) : (
                    <RevokeOwnerForm userId={owner.userId} email={owner.email} />
                  )}
                </div>
              ))}
            </div>
          </article>

          {/* Grant Access Card */}
          <article className="rounded-2xl border border-white bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-7">
            <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <UserPlus className="size-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0f2318]">Grant Platform-Owner Access</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#789084]">
              The person must already have a LeadLens account. Every grant is recorded in the audit log.
            </p>
            <GrantOwnerForm />
          </article>
        </section>

        {/* ── Recent Failed Jobs ── */}
        <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between border-b border-[#f4f7f5] px-6 py-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-500">Needs Attention</p>
              <h2 className="mt-1 text-lg font-bold text-[#0f2318]">Recent Failed Jobs</h2>
            </div>
            <Link href="/admin/failed-jobs" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#789084] transition hover:bg-[#f5f8f6] hover:text-[#16352a]">
              View all →
            </Link>
          </div>
          {failedJobs.length > 0 ? (
            <div className="divide-y divide-[#f4f7f5]">
              {failedJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="grid gap-3 px-6 py-4 sm:grid-cols-[minmax(180px,0.7fr)_minmax(0,1.3fr)]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#9aaba5]">{job.id.slice(0, 8)}…</span>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600 ring-1 ring-rose-100">
                      {job.failureCode || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-[#789084]">{job.failureMessage || 'No failure message was recorded.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CheckCircle2 className="size-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-[#365246]">No recent job failures</p>
              <p className="mt-1 text-xs text-[#9aaba5]">The processing queue is healthy and running smoothly.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
