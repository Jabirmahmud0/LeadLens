import { NextResponse, after } from 'next/server';
import { randomUUID, timingSafeEqual } from 'crypto';
import { db, schema } from '@leadlens/database';
import { sql } from 'drizzle-orm';
import { runOrchestration } from '@leadlens/orchestration';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get('x-cron-secret') ?? '';
  try {
    const a = Buffer.from(header);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function claimNextJob(workerId: string): Promise<Record<string, unknown> | null> {
  // Reset stale processing jobs (stuck > 5 min)
  await db.execute(sql`
    UPDATE ${schema.analysisJobs}
    SET status = 'queued', worker_id = NULL, updated_at = NOW()
    WHERE status = 'processing' AND updated_at < (NOW() - INTERVAL '5 minutes')
  `);

  const result = await db.execute(sql`
    WITH claimed AS (
      SELECT id FROM ${schema.analysisJobs}
      WHERE status = 'queued'
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE ${schema.analysisJobs}
    SET status = 'processing', worker_id = ${workerId}, started_at = COALESCE(started_at, NOW()), updated_at = NOW()
    FROM claimed
    WHERE ${schema.analysisJobs}.id = claimed.id
    RETURNING ${schema.analysisJobs}.*
  `);

  return (result.rows[0] as Record<string, unknown> | undefined) ?? null;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workerId = randomUUID();
  const job = await claimNextJob(workerId);

  if (!job) {
    return NextResponse.json({ processed: false, message: 'No queued jobs' });
  }

  const jobId = String(job.id);

  after(async () => {
    try {
      await runOrchestration(job);
    } catch (error: unknown) {
      console.error(`[cron] Job ${jobId} failed:`, error);
      await db.update(schema.analysisJobs)
        .set({
          status: 'failed',
          failureCode: 'CRON_WORKER_ERROR',
          failureMessage: error instanceof Error ? error.message : 'Unknown error',
          failedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(sql`${schema.analysisJobs.id} = ${jobId}`);
    }
  });

  return NextResponse.json({ processed: true, jobId });
}
