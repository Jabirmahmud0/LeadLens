import { db } from '@leadlens/database';
import { notFound } from 'next/navigation';
import { Badge } from '@leadlens/ui';
import { ExternalLink, Search, FileText, Code2, AlertTriangle, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

export default async function ReportSourcesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch Report (just to verify it exists and get the organization ID if needed)
  const report = await db.query.reports.findFirst({
    where: (r, { eq }) => eq(r.analysisJobId, id),
  });

  if (!report) {
    notFound();
  }

  // 2. Fetch Source Pages
  const sources = await db.query.sourcePages.findMany({
    where: (sp, { eq }) => eq(sp.analysisJobId, id),
    with: {
      findings: true // findingSources
    },
    orderBy: (sp, { desc }) => desc(sp.fetchedAt)
  });

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-neutral-950">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">
            Sources Ledger
          </h1>
          <p className="text-neutral-400">
            A complete directory of all prospect URLs crawled and analyzed to generate this report.
          </p>
        </div>

        {/* Directory List */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800 bg-neutral-900/50 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <div className="col-span-8 md:col-span-9">Page Details</div>
            <div className="col-span-2 hidden md:block">Status</div>
            <div className="col-span-4 md:col-span-1 text-right">Findings</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-neutral-800">
            {sources.map(source => {
              
              let TypeIcon = FileText;
              if (source.contentType?.includes('html')) TypeIcon = LayoutTemplate;
              if (source.contentType?.includes('json')) TypeIcon = Code2;
              
              const isError = source.statusCode && source.statusCode >= 400;

              return (
                <div key={source.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-neutral-800/30 transition-colors">
                  
                  {/* Page Details */}
                  <div className="col-span-8 md:col-span-9 flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      <TypeIcon className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate mb-1">
                        {source.title || 'Untitled Page'}
                      </div>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 truncate"
                      >
                        {source.url}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 hidden md:flex items-center">
                    <Badge variant={isError ? 'error' : 'success'}>
                      {source.statusCode || 'N/A'}
                    </Badge>
                  </div>

                  {/* Findings Count */}
                  <div className="col-span-4 md:col-span-1 flex items-center justify-end">
                    {source.findings.length > 0 ?
                      <Badge variant="info">{source.findings.length}</Badge>
                    :
                      <span className="text-sm text-neutral-600">0</span>
                    }
                  </div>

                </div>
              );
            })}

            {sources.length === 0 && (
              <div className="p-8 text-center text-neutral-500 text-sm">
                No sources found for this report.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
