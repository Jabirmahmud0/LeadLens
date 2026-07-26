import { and, eq } from 'drizzle-orm';
import { db } from '../client';
import { analysisJobs } from '../schema/analysis';

export function getJobForOrganization(jobId: string, organizationId: string) {
  return db.query.analysisJobs.findFirst({
    where: and(
      eq(analysisJobs.id, jobId),
      eq(analysisJobs.organizationId, organizationId),
    ),
  });
}
