import { db } from '@leadlens/database';
import { notFound, redirect } from 'next/navigation';
import { ReportLayoutWrapper } from './ReportLayoutWrapper';

export default async function ReportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch Job
  const job = await db.query.analysisJobs.findFirst({
    where: (j, { eq }) => eq(j.id, id),
  });

  if (!job) {
    notFound();
  }

  // If job is not completed, redirect back to the analysis processing page
  if (job.status !== 'completed' && job.status !== 'partial') {
    redirect(`/analyses/${id}`);
  }

  // 2. Fetch Report
  const report = await db.query.reports.findFirst({
    where: (r, { eq }) => eq(r.analysisJobId, id),
    with: {
      prospect: true,
      organization: true,
    }
  });

  if (!report) {
    notFound();
  }

  return (
    <ReportLayoutWrapper 
      agencyName={report.organization.name || undefined} 
      analysisId={id}
    >
      {children}
    </ReportLayoutWrapper>
  );
}
