import { and, eq } from 'drizzle-orm';
import { db } from '../client';
import {
  reportCallQuestions,
  reportOutreach,
  reportFindings,
  reports,
} from '../schema/report';

export function getReportForOrganizationByAnalysisId(
  analysisJobId: string,
  organizationId: string,
) {
  return db.query.reports.findFirst({
    where: and(
      eq(reports.analysisJobId, analysisJobId),
      eq(reports.organizationId, organizationId),
    ),
    with: {
      prospect: true,
      organization: true,
    },
  });
}

export async function organizationOwnsFinding(findingId: string, organizationId: string): Promise<boolean> {
  const rows = await db.select({ id: reportFindings.id }).from(reportFindings)
    .innerJoin(reports, eq(reportFindings.reportId, reports.id))
    .where(and(eq(reportFindings.id, findingId), eq(reports.organizationId, organizationId)))
    .limit(1);
  return rows.length === 1;
}

export async function organizationOwnsOutreach(
  outreachId: string,
  organizationId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: reportOutreach.id })
    .from(reportOutreach)
    .innerJoin(reports, eq(reportOutreach.reportId, reports.id))
    .where(and(eq(reportOutreach.id, outreachId), eq(reports.organizationId, organizationId)))
    .limit(1);

  return rows.length === 1;
}

export async function organizationOwnsCallQuestion(
  questionId: string,
  organizationId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: reportCallQuestions.id })
    .from(reportCallQuestions)
    .innerJoin(reports, eq(reportCallQuestions.reportId, reports.id))
    .where(and(eq(reportCallQuestions.id, questionId), eq(reports.organizationId, organizationId)))
    .limit(1);

  return rows.length === 1;
}
