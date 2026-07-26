import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq, desc, asc, and, or, ilike, inArray, isNull, isNotNull } from 'drizzle-orm';
import { ScoreRing, Badge, EmptyState } from '@leadlens/ui';
import { Users, Search } from 'lucide-react';
import Link from 'next/link';
import { ProspectControls } from './ProspectControls';

export const metadata = {
  title: 'Prospects | LeadLens',
};

async function getProspects(orgId: string, query: string, page: number, status: string, sort: string) {
  const pageSize = 12;
  const rows = await db.query.prospects.findMany({
    where: and(
      eq(schema.prospects.organizationId, orgId),
      query ? or(ilike(schema.prospects.companyName, `%${query}%`), ilike(schema.prospects.normalizedDomain, `%${query}%`)) : undefined,
      status === 'archived' ? isNotNull(schema.prospects.archivedAt) : isNull(schema.prospects.archivedAt),
      status && status !== 'archived' ? eq(schema.prospects.status, status) : undefined,
    ),
    orderBy: [desc(schema.prospects.pinnedAt), sort === 'oldest' ? asc(schema.prospects.createdAt) : desc(schema.prospects.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  const reportRows = rows.length ? await db.query.reports.findMany({
    where: and(eq(schema.reports.organizationId, orgId), inArray(schema.reports.prospectId, rows.map(row => row.id))),
    orderBy: [desc(schema.reports.createdAt)],
  }) : [];
  const latestReportByProspect = new Map<string, typeof reportRows[number]>();
  for (const report of reportRows) if (!latestReportByProspect.has(report.prospectId)) latestReportByProspect.set(report.prospectId, report);
  return { rows, latestReportByProspect, pageSize };
}

export default async function ProspectsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; status?: string; sort?: string; view?: string }> }) {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');

  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100) ?? '';
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);
  const status = ['new','queued','processing','completed','failed','archived'].includes(params.status || '') ? params.status! : '';
  const sort = params.sort === 'oldest' ? 'oldest' : 'newest';
  const view = params.view === 'table' ? 'table' : 'cards';
  const { rows: prospects, latestReportByProspect, pageSize } = await getProspects(session.organization.id, query, page, status, sort);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Prospects</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage and review your analyzed leads.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <form method="get" className="flex flex-1 flex-wrap gap-2"><div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              className="block w-full pl-10 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Search prospects..."
            />
          </div><select name="status" defaultValue={status} aria-label="Filter prospects" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-300"><option value="">Active</option><option value="completed">Completed</option><option value="processing">Processing</option><option value="failed">Failed</option><option value="archived">Archived</option></select><select name="sort" defaultValue={sort} aria-label="Sort prospects" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-300"><option value="newest">Newest</option><option value="oldest">Oldest</option></select><select name="view" defaultValue={view} aria-label="Prospect view" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-sm text-neutral-300"><option value="cards">Cards</option><option value="table">Compact</option></select><button className="rounded-lg border border-neutral-800 px-3 text-sm text-neutral-300">Apply</button></form>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {prospects.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={Users}
              title="No prospects yet"
              description="Analyze a website to add your first prospect."
            />
          </div>
        ) : (
          <div className={view === 'table' ? 'space-y-3 pb-20' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20'}>
            {prospects.map((p) => {
              const report = latestReportByProspect.get(p.id);
              const target = report ? `/analyses/${report.analysisJobId}/report` : '/analyses';
              return <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors group flex flex-col h-full shadow-sm relative overflow-hidden"><ProspectControls id={p.id} pinned={Boolean(p.pinnedAt)} archived={Boolean(p.archivedAt)} /><Link href={target} className="flex h-full flex-col p-6 pr-24">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="text-lg font-semibold text-white truncate">{p.companyName}</h3>
                    <p className="text-sm text-neutral-400 truncate">{p.websiteUrl}</p>
                  </div>
                  <ScoreRing score={report?.overallScore ?? 0} size={56} strokeWidth={5} className="shrink-0" />
                </div>
                
                <div className="mt-2 space-y-3 flex-1">
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Status</span>
                    <Badge variant={p.status === 'completed' ? 'success' : p.status === 'processing' ? 'warning' : 'neutral'}>
                      {p.status}
                    </Badge>
                  </div>
                  
                  {report && (
                    <div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Main Opportunity</span>
                      <p className="text-sm text-neutral-300 line-clamp-2">
                        {report.opportunityThesis || report.recommendedAction || 'Open the report to review the evidence-backed opportunity.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                  <span>Analyzed {new Date(p.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">{report ? 'View report →' : 'View analyses →'}</span>
                </div>
              </Link></div>;
            })}
          </div>
        )}
      </div>
      {(page > 1 || prospects.length === pageSize) && <nav className="flex justify-center gap-3 text-sm">
        {page > 1 && <Link className="rounded-lg border border-neutral-800 px-4 py-2 text-neutral-300" href={`/prospects?q=${encodeURIComponent(query)}&page=${page - 1}`}>Previous</Link>}
        {prospects.length === pageSize && <Link className="rounded-lg border border-neutral-800 px-4 py-2 text-neutral-300" href={`/prospects?q=${encodeURIComponent(query)}&page=${page + 1}`}>Next</Link>}
      </nav>}
    </div>
  );
}
