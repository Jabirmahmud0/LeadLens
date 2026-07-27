import 'server-only';

import { randomUUID } from 'crypto';
import { after } from 'next/server';
import { db, schema } from '@leadlens/database';
import { runOrchestration } from '@leadlens/orchestration';
import { eq, sql } from 'drizzle-orm';

/**
 * Claims a specific queued job and schedules it in the current Vercel request.
 * The external cron worker remains the fallback for interrupted invocations.
 */
export async function dispatchAnalysisJob(jobId: string): Promise<boolean> {
  const workerId = `web-${randomUUID()}`;
  const result = await db.execute(sql`
    UPDATE ${schema.analysisJobs}
    SET status = 'processing',
        worker_id = ${workerId},
        started_at = COALESCE(started_at, NOW()),
        updated_at = NOW()
    WHERE id = ${jobId} AND status = 'queued'
    RETURNING *
  `);
  const job = result.rows[0] as Record<string, unknown> | undefined;
  if (!job) return false;

  after(async () => {
    try {
      await runOrchestration(job);
    } catch (dispatchError: unknown) {
      console.error(`[web-dispatch] Analysis job ${jobId} failed:`, dispatchError);
      await db.update(schema.analysisJobs).set({
        status: 'failed',
        failureCode: 'WEB_DISPATCH_ERROR',
        failureMessage: dispatchError instanceof Error ? dispatchError.message : 'Unknown dispatch failure',
        failedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(schema.analysisJobs.id, jobId));
    }
  });

  return true;
}
