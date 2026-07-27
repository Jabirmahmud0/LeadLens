import { desc, eq, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { isPlatformAdmin } from '@/lib/auth/admin';

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
  return <main className="p-6 lg:p-10"><h1 className="text-3xl font-light text-white">Admin diagnostics</h1><div className="mt-8 grid gap-4 sm:grid-cols-4">{[['Users', users.length], ['Organizations', organizations.length], ['Failed jobs', failedJobs.length], ['Provider failures', failedAiRuns.length], ['Usage events', usage.length], ['Feedback entries', feedback.length], ['Security events', securityEvents.length], ['AI tokens', Number(totals?.inputTokens || 0) + Number(totals?.outputTokens || 0)]].map(([label, value]) => <div key={label} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"><p className="text-xs uppercase text-neutral-500">{label}</p><p className="mt-2 text-3xl text-white">{value}</p></div>)}</div><p className="mt-4 text-sm text-neutral-500">Average provider latency: {Math.round(Number(totals?.averageLatency || 0))} ms. Token totals support cost review; configure provider-specific pricing externally.</p><section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900 p-5"><h2 className="font-medium text-white">Recent failed jobs</h2><div className="mt-4 space-y-3">{failedJobs.map((job) => <div key={job.id} className="text-sm"><span className="text-neutral-300">{job.id}</span><span className="ml-3 text-red-300">{job.failureCode || 'Unknown'}</span><p className="text-xs text-neutral-500">{job.failureMessage}</p></div>)}</div></section></main>;
}
