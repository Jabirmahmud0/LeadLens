import { NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { eq, inArray, lt, sql } from 'drizzle-orm';
import { getSessionCookie } from '@/lib/auth-cookies';
import { validateSession } from '@leadlens/auth';
import { and } from 'drizzle-orm';
import { z } from 'zod';
import { dispatchAnalysisJob } from '@/lib/analysis/dispatch';

const AnalysisActionSchema = z.object({ action: z.enum(['retry', 'cancel', 'restart']) });
const STALLED_AFTER_MS = 8 * 60 * 1000;
export const maxDuration = 300;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionData = await validateSession(token);
    const user = sessionData?.user;

    if (!user || !sessionData?.organization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const organizationId = sessionData.organization.id;

  try {
    const { id: analysisId } = await params;
    
    // Fetch the job
    const job = await db.query.analysisJobs.findFirst({
      where: (jobs, { eq, and }) =>
        and(eq(jobs.id, analysisId), eq(jobs.organizationId, organizationId)),
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const [steps, prospect, sources] = await Promise.all([
      db.query.analysisJobSteps.findMany({
        where: (jobSteps, { eq }) => eq(jobSteps.analysisJobId, analysisId),
        orderBy: (jobSteps, { asc }) => [asc(jobSteps.startedAt)],
      }),
      db.query.prospects.findFirst({
        where: (candidate, { eq }) => eq(candidate.id, job.prospectId),
        columns: { companyName: true, websiteUrl: true, normalizedDomain: true },
      }),
      db.query.sourcePages.findMany({
        where: (source, { eq }) => eq(source.analysisJobId, analysisId),
        columns: {
          id: true,
          url: true,
          title: true,
          statusCode: true,
          isPrimary: true,
          errorCode: true,
          errorMessage: true,
          fetchedAt: true,
        },
        orderBy: (source, { asc }) => [asc(source.fetchedAt)],
      }),
    ]);

    // Determine currently processing step if any
    const currentStep = steps.find(s => s.status === 'processing')?.stepKey || job.currentStep;

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progressPercent: job.progressPercent,
      currentStep,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      isStalled: ['queued', 'processing'].includes(job.status)
        && job.updatedAt.getTime() < Date.now() - STALLED_AFTER_MS,
      failureCode: job.failureCode,
      failureMessage: job.failureMessage,
      prospect,
      sources,
      steps: steps.map(s => ({
        key: s.stepKey,
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        error: s.errorMessage,
        outputSummary: s.outputSummary,
      }))
    });

  } catch (error: unknown) {
    console.error('Error fetching analysis progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getSessionCookie();
  const sessionData = token ? await validateSession(token) : null;
  if (!sessionData?.organization) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const organizationId = sessionData.organization.id;
  const userId = sessionData.user.id;

  const input = AnalysisActionSchema.safeParse(await req.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  const { id } = await params;
  const job = await db.query.analysisJobs.findFirst({
    where: and(
      eq(schema.analysisJobs.id, id),
      eq(schema.analysisJobs.organizationId, organizationId),
    ),
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (input.data.action === 'cancel') {
    if (!['queued', 'processing'].includes(job.status)) {
      return NextResponse.json({ error: 'Only active jobs can be cancelled' }, { status: 409 });
    }
    await db.update(schema.analysisJobs).set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(schema.analysisJobs.id, id), eq(schema.analysisJobs.organizationId, organizationId)));
    return NextResponse.json({ success: true, status: 'cancelled' });
  }

  if (input.data.action === 'restart') {
    if (!['queued', 'processing'].includes(job.status) || job.updatedAt.getTime() >= Date.now() - STALLED_AFTER_MS) {
      return NextResponse.json({ error: 'Only stalled active jobs can be restarted' }, { status: 409 });
    }

    const restarted = await db.transaction(async (tx) => {
      const updatedJobs = await tx.update(schema.analysisJobs).set({
        status: 'queued',
        workerId: null,
        currentStep: null,
        failureCode: null,
        failureMessage: null,
        retryCount: sql`coalesce(${schema.analysisJobs.retryCount}, 0) + 1`,
        updatedAt: new Date(),
      }).where(and(
        eq(schema.analysisJobs.id, id),
        eq(schema.analysisJobs.organizationId, organizationId),
        lt(schema.analysisJobs.updatedAt, new Date(Date.now() - STALLED_AFTER_MS)),
      )).returning({ id: schema.analysisJobs.id });
      if (!updatedJobs.length) return false;

      await tx.update(schema.analysisJobSteps)
        .set({ status: 'queued', errorCode: null, errorMessage: null })
        .where(and(
          eq(schema.analysisJobSteps.analysisJobId, id),
          inArray(schema.analysisJobSteps.status, ['processing', 'failed', 'skipped']),
        ));
      await tx.insert(schema.auditLogs).values({
        organizationId,
        userId,
        action: 'analysis_stalled_restarted',
        details: { analysisId: id },
      });
      return true;
    });
    if (!restarted) return NextResponse.json({ error: 'The job is active again; restart was not applied' }, { status: 409 });
    await dispatchAnalysisJob(id).catch((dispatchError) => {
      console.error(`[analysis-restart] Immediate dispatch failed for ${id}:`, dispatchError);
    });
    return NextResponse.json({ success: true, status: 'queued' });
  }

  if (!['failed', 'partial'].includes(job.status)) {
    return NextResponse.json({ error: 'Only failed or partial jobs can be retried' }, { status: 409 });
  }
  await db.update(schema.analysisJobSteps)
    .set({ status: 'queued', errorCode: null, errorMessage: null })
    .where(and(
      eq(schema.analysisJobSteps.analysisJobId, id),
      inArray(schema.analysisJobSteps.status, ['failed', 'skipped']),
    ));
  await db.update(schema.analysisJobs).set({
    status: 'queued',
    workerId: null,
    currentStep: null,
    progressPercent: 0,
    failureCode: null,
    failureMessage: null,
    failedAt: null,
    completedAt: null,
    updatedAt: new Date(),
  }).where(and(eq(schema.analysisJobs.id, id), eq(schema.analysisJobs.organizationId, organizationId)));
  await dispatchAnalysisJob(id).catch((dispatchError) => {
    console.error(`[analysis-retry] Immediate dispatch failed for ${id}:`, dispatchError);
  });
  return NextResponse.json({ success: true, status: 'queued' });
}
