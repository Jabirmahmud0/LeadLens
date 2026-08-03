import { db, schema } from '@leadlens/database';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
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
  const session = await requireSession();
  if (!session.organization) notFound();

  // Fetch Report with Relations
  const report = await db.query.reports.findFirst({
    where: and(eq(schema.reports.analysisJobId, id), eq(schema.reports.organizationId, session.organization.id)),
    with: {
      outreach: true
    }
  });

  if (!report) {
    notFound();
  }

  const activeOutreach = report.outreach[0];

  return (
    <div className="flex flex-col h-full bg-[#fafdfa]/30 overflow-y-auto scrollbar-thin scrollbar-thumb-[#c8ddcd] scrollbar-track-transparent">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-12 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 border-b border-[#d8e5db]/60 pb-4">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#10251d] sm:text-4xl mb-2">
            Outreach Studio
          </h1>
          <p className="text-[16px] leading-relaxed text-[#60766b] max-w-2xl">
            Tailored messaging to break the ice using the verified technical issues found on their site.
          </p>
        </div>

        {/* Content */}
        {report.outreach.length > 0 ? (
          <div className="space-y-8">
            {report.outreach.map(outreach => (
              <section key={outreach.id} aria-labelledby={`outreach-${outreach.id}`}>
                <ClientEditor 
                  outreach={outreach} 
                  recommendedCta={activeOutreach?.callToAction} 
                />
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-[#d8e5db]/60 bg-white p-12 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 h-8 w-8 text-[#8ca096]" />
            <h3 className="mb-2 text-[15px] font-semibold text-[#10251d]">No Outreach Generated</h3>
            <p className="text-[14px] text-[#60766b]">No outreach templates were generated for this report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
