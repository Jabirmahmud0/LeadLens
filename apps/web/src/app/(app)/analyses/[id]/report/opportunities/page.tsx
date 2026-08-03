import { db, schema } from '@leadlens/database';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { Badge } from '@leadlens/ui';
import { Target, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

export default async function ReportOpportunitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  if (!session.organization) notFound();

  // Fetch Report with Relations
  const report = await db.query.reports.findFirst({
    where: and(eq(schema.reports.analysisJobId, id), eq(schema.reports.organizationId, session.organization.id)),
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
    <div className="flex flex-col h-full bg-[#fafdfa]/30 overflow-y-auto scrollbar-thin scrollbar-thumb-[#c8ddcd] scrollbar-track-transparent">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-12 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 border-b border-[#d8e5db]/60 pb-4">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#10251d] sm:text-4xl mb-2">
            Service Match & Opportunities
          </h1>
          <p className="text-[16px] leading-relaxed text-[#60766b] max-w-2xl">
            How your agency's services align with the prospect's critical business problems.
          </p>
        </div>

        {/* Matrix Visualization Note */}
        <div className="mb-8 p-5 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl shadow-sm">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e7f2e9] flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#10251d] mb-1">AI Recommendation Context</h3>
              <p className="text-[13.5px] text-[#2a4537] leading-relaxed">
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
            const context = rec.assumptions as { opportunity?: { buyingSignals?: string[]; requiredProof?: string; risks?: string[] }; proposalRisks?: string[] } | null;

            return (
              <div 
                key={rec.id} 
                className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm ${isPrimary ? 'border-[#8ca096] ring-1 ring-[#8ca096]/20' : 'border-[#d8e5db]/60'}`}
              >
                {/* Header */}
                <div className={`p-6 border-b ${isPrimary ? 'border-[#d8e5db]/60 bg-[#fbfdfb]' : 'border-[#d8e5db]/60'}`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {isPrimary ? (
                          <Badge variant="success" className="bg-[#f4f8f3] text-[#16352a] shadow-none border-[#c8ddcd] px-3 py-1 font-medium">Primary Recommendation</Badge>
                        ) : (
                          <Badge variant="neutral" className="bg-white text-[#60766b] shadow-none border-[#d8e5db] px-3 py-1 font-medium">Secondary Option</Badge>
                        )}
                        <span className="text-[13px] font-semibold text-[#486257]">
                          {rec.matchScore}% Match
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#10251d] tracking-tight">{service.name}</h3>
                    </div>
                  </div>
                  
                  <p className="text-[14.5px] text-[#486257] leading-relaxed">
                    {rec.rationale}
                  </p>
                </div>

                {/* Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fafdfa]/30">
                  
                  {/* Scope */}
                  {suggestedScope && suggestedScope.text && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b] mb-3 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        Suggested Scope
                      </h4>
                      <div className="text-[13px] text-[#2a4537] leading-relaxed bg-white border border-[#d8e5db]/60 rounded-xl p-4 shadow-sm">
                        {suggestedScope.text}
                      </div>
                    </div>
                  )}

                  {/* Risks / Hurdles */}
                  {risks && risks.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b] mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Sales Risks & Hurdles
                      </h4>
                      <ul className="space-y-3">
                        {risks.map((risk, i) => (
                          <li key={i} className="flex gap-3 text-[13px] text-[#2a4537] leading-relaxed bg-white border border-[#d8e5db]/60 rounded-xl p-3 shadow-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {context?.opportunity && (
                    <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-[#d8e5db]/60 bg-white shadow-sm p-5">
                        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b]">Buying signals</h4>
                        <ul className="space-y-2 text-[13px] text-[#2a4537] leading-relaxed">
                          {(context.opportunity.buyingSignals || []).map(signal => (
                            <li key={signal} className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#8ca096] shrink-0 mt-1.5"></div> {signal}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-[#d8e5db]/60 bg-white shadow-sm p-5">
                        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b]">Proof required</h4>
                        <p className="text-[13px] text-[#2a4537] leading-relaxed">
                          {context.opportunity.requiredProof || 'Validate during discovery.'}
                        </p>
                      </div>
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
