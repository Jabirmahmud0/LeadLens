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
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-neutral-950">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-light text-white tracking-tight mb-2">
            Proposal Starter Outline
          </h1>
          <p className="text-neutral-400">
            A generated business proposal synthesizing the identified problems and recommended scope.
          </p>
        </div>

        {proposal ? (
          <ClientProposal proposal={proposal} />
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center">
            <p className="text-neutral-500">No proposal starter generated for this report.</p>
          </div>
        )}

      </div>
    </div>
  );
}
