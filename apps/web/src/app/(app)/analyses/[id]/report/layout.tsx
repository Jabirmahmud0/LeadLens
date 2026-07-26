import { queries } from '@leadlens/database';
import { notFound, redirect } from 'next/navigation';
import { ReportLayoutWrapper } from './ReportLayoutWrapper';
import { requireSession } from '@/lib/auth/session';

export default async function ReportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  if (!session.organization) {
    notFound();
  }

  // 1. Fetch Job
  const job = await queries.jobs.getJobForOrganization(id, session.organization.id);

  if (!job) {
    notFound();
  }

  // If job is not completed, redirect back to the analysis processing page
  if (job.status !== 'completed' && job.status !== 'partial') {
    redirect(`/analyses/${id}`);
  }

  // 2. Fetch Report
  const report = await queries.reports.getReportForOrganizationByAnalysisId(
    id,
    session.organization.id,
  );

  if (!report) {
    notFound();
  }

  return (
    <ReportLayoutWrapper 
      agencyName={report.organization.name || undefined} 
      analysisId={id}
      reportId={report.id}
    >
      {children}
    </ReportLayoutWrapper>
  );
}
