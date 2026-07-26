import { db } from '@leadlens/database';
import { notFound } from 'next/navigation';
import { Badge, FindingCard, SourceChip } from '@leadlens/ui';
import { ExternalLink, ShieldAlert, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function ReportFindingsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch Report with Relations
  const report = await db.query.reports.findFirst({
    where: (r, { eq }) => eq(r.analysisJobId, id),
    with: {
      findings: {
        with: {
          sources: {
            with: {
              sourcePage: true
            }
          }
        },
        orderBy: (f, { asc }) => asc(f.sortOrder),
      }
    }
  });

  if (!report) {
    notFound();
  }

  // Group findings by category
  const groupedFindings: Record<string, typeof report.findings> = {};
  report.findings.forEach(finding => {
    const cat = finding.category || 'General';
    if (!groupedFindings[cat]) {
      groupedFindings[cat] = [];
    }
    groupedFindings[cat].push(finding);
  });

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-neutral-950">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">
            Evidence Map
          </h1>
          <p className="text-neutral-400">
            A detailed breakdown of all verified technical, strategic, and performance issues discovered.
          </p>
        </div>

        {/* Findings by Category */}
        <div className="space-y-12">
          {Object.entries(groupedFindings).map(([category, findings]) => (
            <section key={category} className="space-y-4">
              <h2 className="text-xl font-medium text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
                {category}
                <Badge variant="info">{findings.length}</Badge>
              </h2>

              <div className="space-y-3">
                {findings.map(finding => (
                  <FindingCard
                    key={finding.id}
                    title={finding.title}
                    description={finding.observation || ''}
                    severity={(finding.severity as any) || 'info'}
                    evidence={
                      <div className="space-y-6">
                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {finding.businessImpact && (
                            <div>
                              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Business Impact
                              </div>
                              <p className="text-sm text-neutral-300">
                                {finding.businessImpact}
                              </p>
                            </div>
                          )}
                          {finding.recommendation && (
                            <div>
                              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Recommendation
                              </div>
                              <p className="text-sm text-neutral-300">
                                {finding.recommendation}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Metadata & Sources */}
                        <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-4">
                          {finding.confidence && (
                            <Badge variant="success" className="capitalize">
                              {finding.confidence} Confidence
                            </Badge>
                          )}
                          {finding.evidenceType && (
                            <Badge variant="neutral" className="capitalize">
                              Type: {finding.evidenceType}
                            </Badge>
                          )}
                          
                          {/* Sources */}
                          {finding.sources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 ml-auto">
                              <span className="text-xs text-neutral-500">Sources:</span>
                              {finding.sources.map(s => (
                                <SourceChip
                                  key={s.sourcePageId}
                                  url={s.sourcePage.url}
                                  title={s.sourcePage.title || undefined}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

      </div>
    </div>
  );
}
