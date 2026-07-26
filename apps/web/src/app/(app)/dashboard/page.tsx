import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq, desc, and, gte } from 'drizzle-orm';
import { ScoreRing, Badge, SkeletonCard, EmptyState, FindingCard, cn } from '@leadlens/ui';
import { ArrowRight, Search, Zap, Activity, AlertTriangle, FileText, CheckCircle2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | LeadLens',
};

async function getDashboardData(orgId: string) {
  const profile = await db.query.agencyProfiles.findFirst({
    where: eq(schema.agencyProfiles.organizationId, orgId)
  });

  const services = await db.query.agencyServices.findMany({
    where: eq(schema.agencyServices.organizationId, orgId)
  });

  const icp = await db.query.idealCustomerProfiles.findFirst({
    where: eq(schema.idealCustomerProfiles.organizationId, orgId)
  });

  const caseStudies = await db.query.caseStudies.findMany({
    where: eq(schema.caseStudies.organizationId, orgId)
  });

  const topReports = await db.query.reports.findMany({
    where: eq(schema.reports.organizationId, orgId),
    orderBy: [desc(schema.reports.overallScore), desc(schema.reports.createdAt)],
    limit: 5,
    with: { prospect: true, primaryService: true },
  });

  const jobs = await db.query.analysisJobs.findMany({
    where: eq(schema.analysisJobs.organizationId, orgId),
    orderBy: [desc(schema.analysisJobs.createdAt)],
    limit: 5,
    with: {
      prospect: true
    }
  });

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const monthlyJobs = await db.query.analysisJobs.findMany({
    columns: { id: true },
    where: and(eq(schema.analysisJobs.organizationId, orgId), gte(schema.analysisJobs.createdAt, monthStart)),
  });

  // Calculate setup completeness
  let completeness = 0;
  if (profile) completeness += 25;
  if (services.length > 0) completeness += 25;
  if (icp) completeness += 25;
  if (caseStudies.length > 0) completeness += 25;

  return { profile, services, icp, caseStudies, topReports, jobs, monthlyUsage: monthlyJobs.length, completeness };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');

  const { profile, completeness, topReports, services, jobs, monthlyUsage, icp, caseStudies } = await getDashboardData(session.organization.id);
  const monthlyLimit = Number(process.env.MONTHLY_ANALYSIS_LIMIT ?? 100);
  const nextReset = new Date();
  nextReset.setUTCMonth(nextReset.getUTCMonth() + 1, 1);
  const resetDays = Math.max(1, Math.ceil((nextReset.getTime() - Date.now()) / 86_400_000));

  // Greeting logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = session.organization.name || session.user?.email?.split('@')[0] || 'Agency';

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Zone */}
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-light text-white tracking-tight">{greeting}, <span className="font-medium">{name}</span></h1>
          <p className="text-neutral-400 mt-2">Here is what&apos;s happening with your prospects today.</p>
          
          <Link href="/new" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black hover:bg-neutral-200">
            <Zap className="h-5 w-5" /> Analyze a website <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-400">Analysis Quota</span>
              <span className="text-sm text-white font-medium">{monthlyUsage} / {monthlyLimit}</span>
            </div>
            <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, (monthlyUsage / monthlyLimit) * 100)}%` }} />
            </div>
            <p className="text-xs text-neutral-500 mt-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Resets in {resetDays} day{resetDays === 1 ? '' : 's'}
            </p>
          </div>

          {completeness < 100 && (
            <Link href="/onboarding/identity" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors group shadow-lg block">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-300">Setup Completeness</span>
                <span className="text-sm font-bold text-white">{completeness}%</span>
              </div>
              <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div 
                  className="h-full bg-white transition-all duration-1000 w-0 group-hover:bg-neutral-200" 
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                Finish setup to improve AI accuracy
              </p>
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid: Asymmetric */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                High-Potential Prospects
              </h2>
              <Link href="/prospects" className="text-sm text-blue-400 hover:text-blue-300 font-medium">View all</Link>
            </div>
            
            {topReports.length === 0 ? (
              <EmptyState
                icon={LayoutDashboard}
                title="No prospects yet"
                description="Run your first analysis to see high-potential leads appear here."
                action={
                  <Link href="/new" className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200">
                    Analyze a website
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {topReports.map(report => (
                  <Link href={`/analyses/${report.analysisJobId}/report`} key={report.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-6 hover:border-neutral-700 transition-colors group shadow-sm">
                    <ScoreRing score={report.overallScore ?? 0} size={64} strokeWidth={6} animate={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white truncate">{report.prospect?.companyName || report.prospect?.normalizedDomain}</h3>
                        <span className="text-xs text-neutral-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-neutral-400 truncate">{report.prospect?.normalizedDomain}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="success">{report.scoreLabel || 'Scored'}</Badge>
                        {report.primaryService && <Badge variant="neutral">{report.primaryService.name}</Badge>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-neutral-800">
                
                {jobs.map(job => (
                  <div key={job.id} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${
                        job.status === 'completed' ? 'bg-green-500' : 
                        job.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    <p className="text-sm text-white">
                      Analysis {job.status} for <span className="font-medium">{job.prospect?.companyName || job.prospect?.normalizedDomain || 'Unknown'}</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}

                {jobs.length === 0 && (
                  <p className="text-sm text-neutral-500 text-center py-4">No recent activity.</p>
                )}

              </div>
            </div>
          </section>

        </div>

        {/* Right Rail (1/3 width) */}
        <div className="space-y-8">
          
          <section>
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Insights</h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-white font-medium mb-3">Report outcomes</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-neutral-950 p-3"><dt className="text-neutral-500">Reports</dt><dd className="mt-1 text-2xl text-white">{topReports.length}</dd></div>
                  <div className="rounded-xl bg-neutral-950 p-3"><dt className="text-neutral-500">High potential</dt><dd className="mt-1 text-2xl text-white">{topReports.filter(report => (report.overallScore ?? 0) >= 75).length}</dd></div>
                  <div className="rounded-xl bg-neutral-950 p-3"><dt className="text-neutral-500">Active jobs</dt><dd className="mt-1 text-2xl text-white">{jobs.filter(job => ['queued', 'processing'].includes(job.status)).length}</dd></div>
                  <div className="rounded-xl bg-neutral-950 p-3"><dt className="text-neutral-500">Failed jobs</dt><dd className="mt-1 text-2xl text-white">{jobs.filter(job => job.status === 'failed').length}</dd></div>
                </dl>
                <p className="mt-3 text-xs text-neutral-500">Based on the latest available reports and jobs.</p>
              </div>
            </div>
          </section>

          {completeness < 100 && (
            <section>
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Setup Recommendations</h2>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-neutral-800 flex items-start gap-3 hover:bg-neutral-800/50 transition-colors">
                  <div className="mt-0.5">
                    {profile ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-neutral-600" />}
                  </div>
                  <div>
                    <h4 className={cn("text-sm font-medium", profile ? "text-neutral-500 line-through" : "text-white")}>Complete Agency Profile</h4>
                    {!profile && <p className="text-xs text-neutral-400 mt-1">Set your brand voice and defaults.</p>}
                  </div>
                </div>
                <div className="p-4 border-b border-neutral-800 flex items-start gap-3 hover:bg-neutral-800/50 transition-colors">
                  <div className="mt-0.5">
                    {caseStudies.length > 0 ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-neutral-600" />}
                  </div>
                  <div>
                    <h4 className={cn("text-sm font-medium", caseStudies.length > 0 ? "text-neutral-500 line-through" : "text-white")}>Add Case Studies</h4>
                    {caseStudies.length === 0 && <p className="text-xs text-neutral-400 mt-1">Provide proof for the AI to cite.</p>}
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3 hover:bg-neutral-800/50 transition-colors">
                  <div className="mt-0.5">
                    {icp ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-neutral-600" />}
                  </div>
                  <div>
                    <h4 className={cn("text-sm font-medium", icp ? "text-neutral-500 line-through" : "text-white")}>Define ICP</h4>
                    {!icp && <p className="text-xs text-neutral-400 mt-1">Help the AI qualify leads accurately.</p>}
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
