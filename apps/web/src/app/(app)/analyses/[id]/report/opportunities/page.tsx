import { db } from '@leadlens/database';
import { notFound } from 'next/navigation';
import { Badge } from '@leadlens/ui';
import { Target, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export default async function ReportOpportunitiesPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch Report with Relations
  const report = await db.query.reports.findFirst({
    where: (r, { eq }) => eq(r.analysisJobId, id),
    with: {
      serviceRecommendations: {
        orderBy: (sr, { asc }) => asc(sr.rank)
      }
    }
  });

  if (!report) {
    notFound();
  }

  // Eagerly fetch the agency services to map the service IDs to names
  const allServices = await db.query.agencyServices.findMany({
    where: (s, { eq }) => eq(s.organizationId, report.organizationId)
  });

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-neutral-950">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">
            Service Match & Opportunities
          </h1>
          <p className="text-neutral-400">
            How your agency's services align with the prospect's critical business problems.
          </p>
        </div>

        {/* Matrix Visualization Note */}
        <div className="bg-blue-900/10 border border-blue-900/30 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">AI Recommendation Context</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Based on the identified technical and strategic issues, the AI has prioritized the following service offerings. These recommendations maximize your chance of winning the deal by aligning your strongest capabilities with their most urgent pain points.
              </p>
            </div>
          </div>
        </div>

        {/* Service Matches */}
        <div className="space-y-6">
          {report.serviceRecommendations.map((rec, idx) => {
            const service = allServices.find(s => s.id === rec.serviceId);
            if (!service) return null;

            const isPrimary = idx === 0;
            const suggestedScope = rec.suggestedScope as { text: string } | null;
            const risks = rec.risks as string[] | null;

            return (
              <div 
                key={rec.id} 
                className={`bg-neutral-900 border rounded-2xl overflow-hidden transition-colors ${isPrimary ? 'border-blue-500/50' : 'border-neutral-800'}`}
              >
                {/* Header */}
                <div className={`p-6 border-b ${isPrimary ? 'border-blue-500/20 bg-blue-500/5' : 'border-neutral-800'}`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {isPrimary ? (
                          <Badge variant="info">Primary Recommendation</Badge>
                        ) : (
                          <Badge variant="neutral">Secondary Option</Badge>
                        )}
                        <span className="text-sm font-medium text-neutral-400">
                          {rec.matchScore}% Match
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                    </div>
                  </div>
                  
                  <p className="text-neutral-300 leading-relaxed">
                    {rec.rationale}
                  </p>
                </div>

                {/* Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-950/50">
                  
                  {/* Scope */}
                  {suggestedScope && suggestedScope.text && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        Suggested Scope
                      </h4>
                      <div className="text-sm text-neutral-300 leading-relaxed bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        {suggestedScope.text}
                      </div>
                    </div>
                  )}

                  {/* Risks / Hurdles */}
                  {risks && risks.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                        Sales Risks & Hurdles
                      </h4>
                      <ul className="space-y-3">
                        {risks.map((risk, i) => (
                          <li key={i} className="flex gap-3 text-sm text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-yellow-500 mt-0.5" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
