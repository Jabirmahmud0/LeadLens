import { db } from '@leadlens/database';
import { notFound } from 'next/navigation';
import { ClientEditor } from './ClientEditor';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@leadlens/ui';

export default async function ReportOutreachPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch Report with Relations
  const report = await db.query.reports.findFirst({
    where: (r, { eq }) => eq(r.analysisJobId, id),
    with: {
      outreach: true
    }
  });

  if (!report) {
    notFound();
  }

  // Use the first outreach strategy available
  const activeOutreach = report.outreach[0];

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left/Center Editor Column */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">
            Outreach Studio
          </h1>
          <p className="text-neutral-400">
            Tailored messaging to break the ice using the verified technical issues found on their site.
          </p>
        </div>

        {activeOutreach ? (
          <ClientEditor outreach={activeOutreach} />
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center">
            <p className="text-neutral-500">No outreach templates generated for this report.</p>
          </div>
        )}
      </div>

      {/* Right Rail: Guidelines & Checklists */}
      {activeOutreach && (
        <div className="w-full lg:w-[320px] xl:w-[380px] bg-neutral-900/50 border-l border-neutral-800 p-6 lg:p-8 shrink-0 overflow-y-auto">
          <div className="space-y-8">
            
            {/* CTA Option */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Recommended CTA</h3>
              <p className="text-sm text-neutral-400">
                {activeOutreach.callToAction || "Ask for a quick 10-minute audit review."}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
