import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { randomUUID, timingSafeEqual } from 'crypto';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { sql } from 'drizzle-orm';
import { db, schema } from '@leadlens/database';
import { runOrchestration } from '@leadlens/orchestration';
import { validateEnv } from '@leadlens/shared';
import { logger } from './logger';

validateEnv('worker');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: process.env.SENTRY_DSN ? [nodeProfilingIntegration()] : [],
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE || 0),
  sendDefaultPii: false,
});

const app = express();
const port = Number(process.env.PORT || 3001);
const pollIntervalMs = Number(process.env.WORKER_POLL_INTERVAL_MS || 5_000);
const heartbeatIntervalMs = Number(process.env.WORKER_HEARTBEAT_INTERVAL_MS || 30_000);
let shuttingDown = false;
let processing = false;

app.use(express.json({ limit: '64kb' }));

function secretsMatch(candidate: string | undefined, expected: string | undefined): boolean {
  if (!candidate || !expected) return false;
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes);
}

function requireWorkerAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const candidate = req.headers['x-worker-secret'];
  if (typeof candidate !== 'string' || !secretsMatch(candidate, process.env.WORKER_SECRET)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

async function claimNextJob(workerId: string): Promise<Record<string, unknown> | null> {
  await db.execute(sql`
    UPDATE ${schema.analysisJobs}
    SET status = 'queued', worker_id = NULL, updated_at = NOW(), retry_count = COALESCE(retry_count, 0) + 1
    WHERE status = 'processing' AND updated_at < (NOW() - INTERVAL '5 minutes')
  `);

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
    SET status = 'processing', worker_id = ${workerId}, started_at = COALESCE(started_at, NOW()), updated_at = NOW()
    FROM claimed_job
    WHERE ${schema.analysisJobs}.id = claimed_job.id
    RETURNING ${schema.analysisJobs}.*
  `);
  return (result.rows[0] as Record<string, unknown> | undefined) || null;
}

async function processOneJob(): Promise<{ processed: boolean; jobId?: string }> {
  if (processing || shuttingDown) return { processed: false };
  processing = true;
  const workerId = randomUUID();
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let activeJobId: string | undefined;

  try {
    const job = await claimNextJob(workerId);
    if (!job) return { processed: false };
    const jobId = String(job.id);
    activeJobId = jobId;

    heartbeat = setInterval(() => {
      void db.execute(sql`
        UPDATE ${schema.analysisJobs}
        SET updated_at = NOW()
        WHERE id = ${jobId} AND worker_id = ${workerId} AND status = 'processing'
      `).catch((error) => logger.error({ jobId, error }, 'Job heartbeat failed'));
    }, heartbeatIntervalMs);

    logger.info({ jobId, workerId }, 'Processing analysis job');
    await runOrchestration(job);
    logger.info({ jobId, workerId }, 'Analysis job finished');
    return { processed: true, jobId };
  } catch (error) {
    Sentry.captureException(error);
    const jobId = activeJobId;
    logger.error({ jobId, error }, 'Analysis job failed');
    if (jobId) {
      await db.update(schema.analysisJobs)
        .set({
          status: 'failed',
          failureCode: 'WORKER_ERROR',
          failureMessage: error instanceof Error ? error.message : 'Unknown worker failure',
          failedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(sql`${schema.analysisJobs.id} = ${jobId}`);
    }
    throw error;
  } finally {
    if (heartbeat) clearInterval(heartbeat);
    processing = false;
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', processing, shuttingDown });
});

const internalRouter = express.Router();
internalRouter.use(requireWorkerAuth);
internalRouter.post('/jobs/claim', async (_req, res) => {
  try {
    res.json(await processOneJob());
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Worker failure' });
  }
});
app.use('/internal', internalRouter);

Sentry.setupExpressErrorHandler(app);

const server = app.listen(port, () => {
  logger.info({ port, pollIntervalMs }, 'LeadLens worker listening');
});

const poller = setInterval(() => {
  void processOneJob().catch(() => undefined);
}, pollIntervalMs);
void processOneJob().catch(() => undefined);

function shutdown(signal: string) {
  shuttingDown = true;
  clearInterval(poller);
  logger.info({ signal }, 'Worker shutting down');
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
