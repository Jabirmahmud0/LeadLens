import { db, schema } from '@leadlens/database';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
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
  const session = await requireSession();
  if (!session.organization) notFound();

  // 1. Fetch Report (just to verify it exists and get the organization ID if needed)
  const report = await db.query.reports.findFirst({
    where: and(eq(schema.reports.analysisJobId, id), eq(schema.reports.organizationId, session.organization.id)),
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
    <div className="flex flex-col h-full bg-[#fafdfa]/30 overflow-y-auto scrollbar-thin scrollbar-thumb-[#c8ddcd] scrollbar-track-transparent">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-12 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 border-b border-[#d8e5db]/60 pb-4">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#10251d] sm:text-4xl mb-2">
            Sources Ledger
          </h1>
          <p className="text-[16px] leading-relaxed text-[#60766b] max-w-2xl">
            A complete directory of all prospect URLs crawled and analyzed to generate this report.
          </p>
        </div>

        {/* Directory List */}
        <div className="bg-white border border-[#d8e5db]/60 shadow-sm rounded-2xl overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#d8e5db]/60 bg-[#fbfdfb] text-[11px] font-bold text-[#71877b] uppercase tracking-[0.15em]">
            <div className="col-span-8 md:col-span-9">Page Details</div>
            <div className="col-span-2 hidden md:block">Status</div>
            <div className="col-span-4 md:col-span-1 text-right">Findings</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#d8e5db]/60">
            {sources.map(source => {
              
              let TypeIcon = FileText;
              if (source.contentType?.includes('html')) TypeIcon = LayoutTemplate;
              if (source.contentType?.includes('json')) TypeIcon = Code2;
              
              const isError = source.statusCode && source.statusCode >= 400;
              
              const getFallbackTitle = (url: string, contentType: string | null) => {
                try {
                  const u = new URL(url);
                  if (contentType?.includes('xml') || u.pathname.endsWith('.xml')) {
                    const filename = u.pathname.split('/').pop() || 'sitemap.xml';
                    return `Sitemap (${filename})`;
                  }
                  if (u.pathname === '/' || u.pathname === '') {
                    return 'Homepage';
                  }
                  return u.pathname;
                } catch {
                  return 'Untitled Page';
                }
              };

              return (
                <details key={source.id} className="group p-4 hover:bg-[#f4f8f3] transition-colors cursor-pointer">
                <summary className="grid grid-cols-12 gap-4 items-center list-none">
                  
                  {/* Page Details */}
                  <div className="col-span-8 md:col-span-9 flex items-start gap-3">
                    <div className="mt-1 shrink-0">
                      <TypeIcon className="w-5 h-5 text-[#8ca096]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-[#10251d] truncate mb-1">
                        {source.title && source.title.trim() !== '' ? source.title : getFallbackTitle(source.url, source.contentType)}
                      </div>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[12px] text-[#486257] hover:text-[#16352a] flex items-center gap-1.5 truncate transition-colors"
                      >
                        {source.url}
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 hidden md:flex items-center">
                    {isError ? (
                      <Badge variant="error" className="bg-red-50 text-red-700 shadow-none border-red-200 px-3 py-1 font-bold tracking-tight">
                        {source.statusCode || 'Error'}
                      </Badge>
                    ) : (
                      <Badge variant="success" className="bg-[#f4f8f3] text-[#16352a] shadow-none border-[#c8ddcd] px-3 py-1 font-bold tracking-tight">
                        {source.statusCode || '200'}
                      </Badge>
                    )}
                  </div>

                  {/* Findings Count */}
                  <div className="col-span-4 md:col-span-1 flex items-center justify-end">
                    {source.findings.length > 0 ?
                      <Badge variant="neutral" className="bg-[#e7f2e9] text-[#16352a] shadow-none border-[#c8ddcd] px-2 py-0.5">{source.findings.length}</Badge>
                    :
                      <span className="text-[14px] text-[#8ca096]">0</span>
                    }
                  </div>

                </summary>
                <div className="ml-8 mt-4 rounded-xl border border-[#d8e5db]/60 bg-[#fafdfa] p-5 text-[13.5px] leading-relaxed text-[#2a4537] shadow-inner">
                  <div className="mb-3 flex flex-wrap gap-4 text-[12px] font-medium text-[#60766b]">
                    <span>Fetched {source.fetchedAt ? new Date(source.fetchedAt).toLocaleString() : 'not available'}</span>
                    <span>{source.contentType || 'unknown type'}</span>
                    <span>{source.fetchDurationMs ? `${source.fetchDurationMs} ms` : 'duration unavailable'}</span>
                  </div>
                  {source.errorMessage ? (
                    <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">{source.errorMessage}</p>
                  ) : (
                    <p className="max-h-48 overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-[#c8ddcd]">{source.extractedText?.slice(0, 2000) || source.metaDescription || 'No extracted preview is available.'}</p>
                  )}
                </div>
                </details>
              );
            })}

            {sources.length === 0 && (
              <div className="p-10 text-center text-[#60766b] text-[14px]">
                No sources found for this report.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
