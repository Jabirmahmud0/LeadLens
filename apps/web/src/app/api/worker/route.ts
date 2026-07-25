import { NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET || 'dev-secret'}`;
  if (authHeader !== expectedToken && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workerId = uuidv4();
  let processedCount = 0;

  try {
    // Reset stale jobs (no heartbeat for > 2 mins)
    await db.execute(sql`
      UPDATE ${schema.analysisJobs}
      SET status = 'queued', worker_id = NULL
      WHERE status = 'processing' AND updated_at < (NOW() - INTERVAL '2 minutes')
    `);

    // Claim a job atomically using SELECT FOR UPDATE SKIP LOCKED via CTE
    const result = await db.execute(sql`
      WITH claimed_job AS (
        SELECT id
        FROM ${schema.analysisJobs}
        WHERE status = 'queued'
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE ${schema.analysisJobs}
      SET 
        status = 'processing',
        worker_id = ${workerId},
        started_at = NOW(),
        updated_at = NOW()
      FROM claimed_job
      WHERE ${schema.analysisJobs}.id = claimed_job.id
      RETURNING ${schema.analysisJobs}.*;
    `);

    const claimedJob = result.rows[0];

    if (!claimedJob) {
      return NextResponse.json({ message: 'No jobs in queue', processed: 0 });
    }

    processedCount++;

    // Stub: simulate work (Phase 9 will replace this with real analysis)
    await new Promise(resolve => setTimeout(resolve, 2000));

    await db.execute(sql`
      UPDATE ${schema.analysisJobs}
      SET 
        status = 'completed',
        progress_percent = 100,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${claimedJob.id}
    `);

    await db.execute(sql`
      UPDATE ${schema.prospects}
      SET status = 'completed'
      WHERE id = ${claimedJob.prospect_id}
    `);

    return NextResponse.json({ 
      message: 'Job processed successfully', 
      jobId: claimedJob.id,
      workerId,
      processed: processedCount
    });

  } catch (error: unknown) {
    console.error('Worker error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
