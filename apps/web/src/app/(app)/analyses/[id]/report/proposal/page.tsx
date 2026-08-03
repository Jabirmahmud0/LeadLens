import { db, schema } from '@leadlens/database';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { ClientProposal } from './ClientProposal';

export default async function ReportProposalPage({
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
      proposalStarters: {
        limit: 1
      }
    }
  });

  if (!report) {
    notFound();
  }

  const proposal = report.proposalStarters[0];

  return (
    <div className="flex flex-col h-full bg-[#fafdfa]/30 overflow-y-auto scrollbar-thin scrollbar-thumb-[#c8ddcd] scrollbar-track-transparent">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-12 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 border-b border-[#d8e5db]/60 pb-4">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#10251d] sm:text-4xl mb-2">
            Proposal Starter Outline
          </h1>
          <p className="text-[16px] leading-relaxed text-[#60766b] max-w-2xl">
            A generated business proposal synthesizing the identified problems and recommended scope.
          </p>
        </div>

        {proposal ? (
          <ClientProposal proposal={proposal} />
        ) : (
          <div className="rounded-[1.25rem] border border-[#d8e5db]/60 bg-white p-12 text-center shadow-sm">
            <p className="text-[14px] text-[#60766b]">No proposal starter generated for this report.</p>
          </div>
        )}

      </div>
    </div>
  );
}
