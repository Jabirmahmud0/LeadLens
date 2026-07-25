import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq, desc } from 'drizzle-orm';
import { ScoreRing, Badge, EmptyState } from '@leadlens/ui';
import { Users, Search, Filter, LayoutGrid, List } from 'lucide-react';

export const metadata = {
  title: 'Prospects | LeadLens',
};

async function getProspects(orgId: string) {
  return await db.query.prospects.findMany({
    where: eq(schema.prospects.organizationId, orgId),
    orderBy: [desc(schema.prospects.createdAt)],
  });
}

export default async function ProspectsPage() {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');

  const prospects = await getProspects(session.organization.id);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Prospects</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage and review your analyzed leads.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Search prospects..."
            />
          </div>
          <button className="p-2 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button className="p-1.5 rounded-md bg-neutral-800 text-white shadow-sm">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md text-neutral-500 hover:text-white">
              <List className="w-4 h-4" />
            </button>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {prospects.map((p) => (
              <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors group flex flex-col h-full cursor-pointer shadow-sm relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="text-lg font-semibold text-white truncate">{p.companyName}</h3>
                    <p className="text-sm text-neutral-400 truncate">{p.domain}</p>
                  </div>
                  <ScoreRing score={p.overallScore || 0} size={56} strokeWidth={5} className="shrink-0" />
                </div>
                
                <div className="mt-2 space-y-3 flex-1">
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Status</span>
                    <Badge variant={p.status === 'completed' ? 'success' : p.status === 'processing' ? 'warning' : 'neutral'}>
                      {p.status}
                    </Badge>
                  </div>
                  
                  {p.status === 'completed' && (
                    <div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Main Opportunity</span>
                      <p className="text-sm text-neutral-300 line-clamp-2">
                        Significant potential in technical SEO architecture and site performance improvements.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                  <span>Analyzed {new Date(p.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">View Report →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
