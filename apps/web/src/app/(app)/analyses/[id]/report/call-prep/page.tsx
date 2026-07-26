import { db } from '@leadlens/database';
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

  // Fetch Report with Relations
  const report = await db.query.reports.findFirst({
    where: (r, { eq }) => eq(r.analysisJobId, id),
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
    <div className="flex flex-col lg:flex-row h-full">
      {/* Center Column: Questions & Discovery */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">
            Discovery & Validation
          </h1>
          <p className="text-neutral-400">
            Strategic questions to ask during the sales call to validate AI findings and qualify the deal.
          </p>
        </div>

        {report.callQuestions.length > 0 ? (
          <ClientChecklist questions={report.callQuestions} />
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center">
            <p className="text-neutral-500">No call prep questions generated for this report.</p>
          </div>
        )}
      </div>

      {/* Right Rail: Objections & Goal */}
      <div className="w-full lg:w-[320px] xl:w-[380px] bg-neutral-900/50 border-l border-neutral-800 p-6 lg:p-8 shrink-0 overflow-y-auto">
        <div className="space-y-8">
          
          {/* Call Objective */}
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Primary Call Objective</h3>
            <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 text-sm text-blue-200">
              Validate {primaryRec?.service?.name || 'the service fit'} and get agreement on a follow-up proposal review.
            </div>
          </div>

          {/* Anticipated Objections */}
          {report.objections.length > 0 && (
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                Anticipated Objections
              </h3>
              
              <div className="space-y-4">
                {report.objections.map(obj => (
                  <div key={obj.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                    <div className="text-sm font-medium text-white mb-2">{obj.objection}</div>
                    
                    <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 relative mt-3">
                      <div className="absolute -top-2 left-3 bg-neutral-950 px-1 text-[10px] uppercase tracking-wider text-green-500 font-semibold">
                        Rebuttal
                      </div>
                      <p className="text-sm text-neutral-300">
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
  );
}
