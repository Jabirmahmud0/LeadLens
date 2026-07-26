import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq, desc } from 'drizzle-orm';
import { EmptyState, Badge } from '@leadlens/ui';
import { Activity, Search, Filter, Play, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

export const metadata = {
  title: 'Analyses | LeadLens',
};

async function getAnalyses(orgId: string) {
  const jobs = await db.query.analysisJobs.findMany({
    where: eq(schema.analysisJobs.organizationId, orgId),
    orderBy: [desc(schema.analysisJobs.createdAt)],
    with: {
      prospect: true
    }
  });
  
  return jobs;
}

export default async function AnalysesPage() {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');

  const analyses = await getAnalyses(session.organization.id);

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Analyses Journal</h1>
          <p className="text-sm text-neutral-400 mt-1">A chronological log of all AI processing activity.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Search activity..."
            />
          </div>
          <button className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-20">
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
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-neutral-800">
            {analyses.map((a, i) => (
              <div key={a.id} className="relative pl-16 pr-4">
                {/* Timeline Icon */}
                <div className="absolute left-2.5 top-1.5 w-7 h-7 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-sm">
                  {a.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : a.status === 'failed' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Play className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                
                {/* Content */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors shadow-sm group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={a.status === 'completed' ? 'success' : a.status === 'failed' ? 'error' : 'info'}>
                          {a.status === 'completed' ? 'Analysis Completed' : a.status === 'failed' ? 'Analysis Failed' : 'Analysis Started'}
                        </Badge>
                        <span className="text-xs text-neutral-500">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                      <h4 className="text-white font-medium text-base truncate mt-1">
                        {a.prospect?.companyName || a.prospect?.normalizedDomain || 'Unknown'}
                      </h4>
                      <p className="text-sm text-neutral-400 mt-1">
                        {a.status === 'completed' 
                          ? `Successfully extracted technical issues and generated Opportunity Brief.`
                          : a.status === 'failed' 
                          ? `Failed: ${a.failureMessage || 'Unknown error'}`
                          : `Status: ${a.currentStep || a.status}`}
                      </p>
                    </div>
                    
                    {a.status === 'completed' && (
                      <a 
                        href={`/analyses/${a.id}/report/executive-summary`}
                        className="p-2 text-neutral-500 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors shrink-0 bg-neutral-800/50"
                        title="View Report"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
