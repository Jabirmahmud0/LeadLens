import { db } from '@leadlens/database';
import { notFound } from 'next/navigation';
import { ScoreRing, Badge, FindingCard } from '@leadlens/ui';
import { AlertCircle, Target, ArrowRight, Activity, ShieldCheck, Search, Globe, Plus, Check } from 'lucide-react';
import Link from 'next/link';

export default async function ReportOverviewPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch Report with Relations
  const report = await db.query.reports.findFirst({
    where: (r, { eq }) => eq(r.analysisJobId, id),
    with: {
      prospect: true,
      scores: true,
      primaryService: true,
      findings: {
        orderBy: (f, { asc }) => asc(f.sortOrder),
        limit: 3 // top 3 for overview
      }
    }
  });

  if (!report) {
    notFound();
  }

  // Calculate score distribution
  const scoreCategories = [
    { label: 'Agency Fit', value: report.scores.find(s => s.category === 'agencyServiceFit')?.score || 0 },
    { label: 'Problem Severity', value: report.scores.find(s => s.category === 'problemSeverity')?.score || 0 },
    { label: 'Business Maturity', value: report.scores.find(s => s.category === 'businessMaturity')?.score || 0 },
    { label: 'Project Value', value: report.scores.find(s => s.category === 'likelyProjectValue')?.score || 0 }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Center Column: Thesis & Highlights */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-10">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="info">Intelligence Report</Badge>
            <span className="text-sm text-neutral-500">
              Generated {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">
            {report.title}
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">
            {report.prospect.websiteUrl}
          </p>
        </div>

        {/* Opportunity Thesis */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Opportunity Thesis
          </h2>
          <p className="text-xl text-white leading-relaxed font-light">
            {report.opportunityThesis}
          </p>
        </section>

        {/* Executive Summary */}
        <section>
          <h2 className="text-lg font-medium text-white mb-4">Executive Summary</h2>
          <div className="prose prose-invert max-w-none text-neutral-300">
            {report.executiveSummary}
          </div>
        </section>

        {/* Top Findings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Critical Findings</h2>
            <Link 
              href={`/analyses/${id}/report/findings`}
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {report.findings.map(finding => (
              <FindingCard
                key={finding.id}
                title={finding.title}
                description={finding.observation || ''}
                severity={(finding.severity as any) || 'info'}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Right Rail: Score & Actions */}
      <div className="w-full lg:w-[320px] xl:w-[380px] bg-neutral-900/50 border-l border-neutral-800 p-6 lg:p-8 shrink-0 overflow-y-auto">
        <div className="space-y-8">
          
          {/* Overall Score */}
          <div className="flex flex-col items-center text-center">
            <ScoreRing 
              score={Number(report.overallScore || 0)} 
              size={160}
              label={report.scoreLabel || 'Evaluating'}
            />
            <p className="text-sm text-neutral-400 mt-4">
              Overall fit based on {report.scores.length} signals
            </p>
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-4 border-t border-neutral-800 pt-6">
            <h3 className="text-sm font-medium text-white">Score Breakdown</h3>
            {scoreCategories.map(cat => (
              <div key={cat.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">{cat.label}</span>
                  <span className="text-white font-medium">{cat.value}/100</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${cat.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Action */}
          <div className="border-t border-neutral-800 pt-6">
            <h3 className="text-sm font-medium text-white mb-3">Recommended Next Step</h3>
            <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4">
              <p className="text-sm text-blue-200">
                {report.recommendedAction}
              </p>
            </div>
          </div>

          {/* Primary Service Match */}
          {report.primaryService && (
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-medium text-white mb-3">Primary Service Match</h3>
              <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
                <div className="font-medium text-white mb-1">{report.primaryService.name}</div>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {report.primaryService.summary}
                </p>
                <Link 
                  href={`/analyses/${id}/report/opportunities`}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View rationale <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
          
          {/* Confidence & Sources */}
          <div className="border-t border-neutral-800 pt-6 grid grid-cols-2 gap-4">
            <div className="bg-neutral-900 rounded-lg p-3 text-center border border-neutral-800">
              <div className="text-xs text-neutral-500 mb-1">AI Confidence</div>
              <div className="text-lg font-medium text-white capitalize">{report.confidence}</div>
            </div>
            <div className="bg-neutral-900 rounded-lg p-3 text-center border border-neutral-800">
              <div className="text-xs text-neutral-500 mb-1">Verified Issues</div>
              <div className="text-lg font-medium text-white">{report.findings.length}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
