import { NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { eq, inArray } from 'drizzle-orm';
import { getSessionCookie } from '@/lib/auth-cookies';
import { validateSession } from '@leadlens/auth';
import { and } from 'drizzle-orm';
import { z } from 'zod';

const AnalysisActionSchema = z.object({ action: z.enum(['retry', 'cancel']) });

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

    // Fetch the steps for this job
    const steps = await db.query.analysisJobSteps.findMany({
      where: (jobSteps, { eq }) => eq(jobSteps.analysisJobId, analysisId),
      orderBy: (jobSteps, { asc }) => [asc(jobSteps.startedAt)],
    });

    // Determine currently processing step if any
    const currentStep = steps.find(s => s.status === 'processing')?.stepKey || job.currentStep;

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progressPercent: job.progressPercent,
      currentStep,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      failureCode: job.failureCode,
      failureMessage: job.failureMessage,
      steps: steps.map(s => ({
        key: s.stepKey,
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        error: s.errorMessage,
        outputSummary: s.outputSummary,
      }))
    });

  } catch (error: any) {
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

  const input = AnalysisActionSchema.safeParse(await req.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  const { id } = await params;
  const job = await db.query.analysisJobs.findFirst({
    where: and(
      eq(schema.analysisJobs.id, id),
      eq(schema.analysisJobs.organizationId, sessionData.organization.id),
    ),
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (input.data.action === 'cancel') {
    if (!['queued', 'processing'].includes(job.status)) {
      return NextResponse.json({ error: 'Only active jobs can be cancelled' }, { status: 409 });
    }
    await db.update(schema.analysisJobs).set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(schema.analysisJobs.id, id), eq(schema.analysisJobs.organizationId, sessionData.organization.id)));
    return NextResponse.json({ success: true, status: 'cancelled' });
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
    failureCode: null,
    failureMessage: null,
    failedAt: null,
    completedAt: null,
    updatedAt: new Date(),
  }).where(and(eq(schema.analysisJobs.id, id), eq(schema.analysisJobs.organizationId, sessionData.organization.id)));
  return NextResponse.json({ success: true, status: 'queued' });
}
