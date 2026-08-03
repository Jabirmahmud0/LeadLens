import { db, schema } from '@leadlens/database';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { ClientChecklist } from './ClientChecklist';
import { ShieldAlert, Info } from 'lucide-react';
import { Badge } from '@leadlens/ui';

export default async function ReportCallPrepPage({
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
      callQuestions: {
        orderBy: (cq, { desc }) => desc(cq.category)
      },
      objections: true,
      serviceRecommendations: {
        limit: 1,
        orderBy: (sr, { asc }) => asc(sr.rank),
        with: {
          service: true
        }
      }
    }
  });

  if (!report) {
    notFound();
  }

  const primaryRec = report.serviceRecommendations[0];

  return (
    <div className="flex flex-col h-full bg-[#fafdfa]/30 overflow-y-auto scrollbar-thin scrollbar-thumb-[#c8ddcd] scrollbar-track-transparent">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-12 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 border-b border-[#d8e5db]/60 pb-4">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#10251d] sm:text-4xl mb-2">
            Discovery & Validation
          </h1>
          <p className="text-[16px] leading-relaxed text-[#60766b] max-w-2xl">
            Strategic questions to ask during the sales call to validate AI findings and qualify the deal.
          </p>
        </div>

        {/* Primary Call Objective Callout */}
        <div className="mb-8 p-5 bg-emerald-50/50 border border-emerald-200/50 rounded-2xl shadow-sm">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#e7f2e9] flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#10251d] mb-1">Primary Call Objective</h3>
              <p className="text-[13.5px] text-[#2a4537] leading-relaxed">
                Validate {primaryRec?.service?.name || 'the service fit'} and get agreement on a follow-up proposal review.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Checklist */}
          <div className="lg:col-span-8">
            {report.callQuestions.length > 0 ? (
              <ClientChecklist questions={report.callQuestions} />
            ) : (
              <div className="rounded-[1.25rem] border border-[#d8e5db]/60 bg-white p-12 text-center shadow-sm">
                <p className="text-[14px] text-[#60766b]">No call prep questions generated for this report.</p>
              </div>
            )}
          </div>

          {/* Right Rail: Objections */}
          <div className="lg:col-span-4 space-y-6">
            {report.objections.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b] mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Anticipated Objections
                </h3>
                
                <div className="space-y-4">
                  {report.objections.map(obj => (
                    <div key={obj.id} className="bg-white border border-[#d8e5db]/60 shadow-sm rounded-xl p-4">
                      <div className="text-[13px] font-semibold text-[#10251d] mb-3">{obj.objection}</div>
                      
                      <div className="bg-[#f4f8f3] border border-[#c8ddcd] rounded-lg p-3 relative mt-3">
                        <div className="absolute -top-2 left-3 bg-[#f4f8f3] px-1 text-[10px] uppercase tracking-wider text-emerald-600 font-bold">
                          Rebuttal
                        </div>
                        <p className="text-[13px] text-[#2a4537] leading-relaxed">
                          {obj.suggestedResponse}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
