import { NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60; // Max execution time for the worker function
export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(req: Request) {
  // Simple auth for cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET || 'dev-secret'}\` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workerId = uuidv4();
  let processedCount = 0;

  try {
    // 1. Reset stale jobs (no heartbeat for > 2 mins)
    const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    await db.execute(sql\`
      UPDATE \${schema.analysisJobs}
      SET status = 'queued', worker_id = NULL
      WHERE status = 'processing' AND updated_at < \${twoMinsAgo}::timestamp
    \`);

    // 2. Claim a job using SELECT FOR UPDATE SKIP LOCKED
    // Since we are using Neon HTTP, interactive transactions are not supported.
    // We must do this in a single query block using a CTE.
    const result = await db.execute(sql\`
      WITH claimed_job AS (
        SELECT id
        FROM \${schema.analysisJobs}
        WHERE status = 'queued'
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE \${schema.analysisJobs}
      SET 
        status = 'processing',
        worker_id = \${workerId},
        started_at = NOW(),
        updated_at = NOW()
      FROM claimed_job
      WHERE \${schema.analysisJobs}.id = claimed_job.id
      RETURNING \${schema.analysisJobs}.*;
    \`);

    const claimedJob = result.rows[0];

    if (!claimedJob) {
      return NextResponse.json({ message: 'No jobs in queue', processed: 0 });
    }

    processedCount++;

    // 3. Process the job (Stub for MVP Phase 8)
    // For now, we immediately mark it as completed to test the queue.
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work

    await db.execute(sql\`
      UPDATE \${schema.analysisJobs}
      SET 
        status = 'completed',
        progress_percent = 100,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = \${claimedJob.id}
    \`);

    // Update the prospect status as well
    await db.execute(sql\`
      UPDATE \${schema.prospects}
      SET status = 'completed'
      WHERE id = \${claimedJob.prospect_id}
    \`);

    return NextResponse.json({ 
      message: 'Job processed successfully', 
      jobId: claimedJob.id,
      workerId,
      processed: processedCount
    });

  } catch (error: any) {
    console.error('Worker error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
