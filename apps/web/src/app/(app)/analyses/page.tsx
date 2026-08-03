import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq, desc, and, sql } from 'drizzle-orm';
import { EmptyState, Badge } from '@leadlens/ui';
import { Activity, Search, Filter, Play, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

export const metadata = {
  title: 'Analyses | LeadLens',
};

async function getAnalyses(orgId: string, query: string, status: string, page: number) {
  const pageSize = 20;
  const jobs = await db.query.analysisJobs.findMany({
    where: and(eq(schema.analysisJobs.organizationId, orgId), status ? eq(schema.analysisJobs.status, status) : undefined, query ? sql`exists (select 1 from ${schema.prospects} p where p.id = ${schema.analysisJobs.prospectId} and (p.company_name ilike ${`%${query}%`} or p.normalized_domain ilike ${`%${query}%`}))` : undefined),
    orderBy: [desc(schema.analysisJobs.createdAt)],
    with: {
      prospect: true
    }, limit: pageSize, offset: (page - 1) * pageSize,
  });
  
  return jobs;
}

export default async function AnalysesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');

  const params = await searchParams;
  const query = params.q?.trim().slice(0, 100) || '';
  const status = ['queued','processing','completed','partial','failed','cancelled'].includes(params.status || '') ? params.status! : '';
  const page = Math.max(1, Number.parseInt(params.page || '1', 10) || 1);
  const analyses = await getAnalyses(session.organization.id, query, status, page);

  return (
    <div className="app-page-enter mx-auto flex min-h-full max-w-6xl flex-col space-y-6 p-4 sm:p-7 lg:p-9">
      {/* Header */}
      <div className="shrink-0 rounded-3xl border border-[#d8e5dc] bg-gradient-to-br from-[#ecf8f0] via-white to-[#fff4e8] p-6 shadow-[0_24px_60px_-48px_rgba(20,83,45,0.55)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Research operations</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#10251d]">Analysis journal</h1>
          <p className="mt-2 text-sm text-[#60766b]">Follow every prospect from queued research to a finished opportunity brief.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <form method="get" className="flex flex-1 gap-2 sm:w-auto"><div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              className="block h-10 w-full rounded-xl border border-[#d8e5dc] bg-white pl-10 pr-4 text-sm text-[#16352a] placeholder:text-[#8ca096] focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Search activity..."
            />
          </div><select name="status" defaultValue={status} aria-label="Filter analyses by status" className="h-10 rounded-xl border border-[#d8e5dc] bg-white px-3 text-sm text-[#365246]"><option value="">All statuses</option><option value="queued">Queued</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="partial">Partial</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option></select><button type="submit" aria-label="Apply filters" className="grid size-10 place-items-center rounded-xl bg-emerald-700 text-white transition-colors hover:bg-emerald-800"><Filter className="w-4 h-4" /></button></form>
        </div>
        </div>
      </div>

      {/* Main content */}
      <div className="min-h-0 flex-1 pb-20">
        {analyses.length === 0 ? (
          <div className="h-full flex items-center justify-center">
              <EmptyState
                icon={Activity}
                title="No analysis jobs yet"
                description="Run your first analysis to populate this journal."
                action={
                  <a href="/new" className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 mt-4 inline-block">
                    Start Analysis
                  </a>
                }
              />
          </div>
        ) : (
          <div className="relative space-y-5 before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-[#cfe0d3]">
            {analyses.map(a => (
              <div key={a.id} className="relative pl-16 pr-4">
                {/* Timeline Icon */}
                <div className="absolute left-2.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#cfe0d3] bg-white shadow-sm">
                  {a.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : a.status === 'failed' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Play className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                
                <div className="group rounded-2xl border border-[#dce7df] bg-white p-5 shadow-[0_18px_48px_-42px_rgba(20,83,45,0.55)] transition-all hover:-translate-y-0.5 hover:border-[#bcd5c2] hover:shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant={a.status === 'completed' ? 'success' : a.status === 'failed' ? 'error' : 'info'} className="shadow-none px-2 py-0.5">
                          {a.status === 'completed' ? 'Analysis Completed' : a.status === 'failed' ? 'Analysis Failed' : 'Analysis Started'}
                        </Badge>
                        <span className="text-[12px] font-medium text-[#8ca096]">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      <h4 className="text-[#10251d] font-bold text-[16px] truncate">
                        {a.prospect?.companyName || a.prospect?.normalizedDomain || 'Unknown Prospect'}
                      </h4>
                      <p className="text-[13.5px] text-[#60766b] mt-1 leading-relaxed">
                        {a.status === 'completed' 
                          ? `Successfully extracted technical issues and generated Opportunity Brief.`
                          : a.status === 'failed' 
                          ? `Failed: ${a.failureMessage || 'Unknown error'}`
                          : `Status: ${a.currentStep || a.status}`}
                      </p>
                    </div>
                    
                    {a.status === 'completed' ? (
                      <a 
                        href={`/analyses/${a.id}/report`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#16352a] hover:bg-[#204a3b] text-white rounded-xl text-[12px] font-bold transition-all shadow-sm shrink-0"
                      >
                        View Report
                      </a>
                    ) : (
                      <a 
                        href={`/analyses/${a.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#16352a] hover:bg-[#204a3b] text-white rounded-xl text-[12px] font-bold transition-all shadow-sm shrink-0"
                      >
                        View Status
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {(page > 1 || analyses.length === 20) && <nav className="flex justify-center gap-3 text-sm">{page > 1 && <a className="rounded-lg border border-neutral-800 px-4 py-2 text-neutral-300" href={`/analyses?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}&page=${page - 1}`}>Previous</a>}{analyses.length === 20 && <a className="rounded-lg border border-neutral-800 px-4 py-2 text-neutral-300" href={`/analyses?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}&page=${page + 1}`}>Next</a>}</nav>}
    </div>
  );
}
