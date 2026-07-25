import { NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { getSessionCookie } from '@/lib/auth-cookies';
import { validateSession } from '@leadlens/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionData = await validateSession(token);
  const user = sessionData?.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const analysisId = params.id;
    
    // Fetch the job
    const job = await db.query.analysisJobs.findFirst({
      where: (jobs, { eq, and }) =>
        and(eq(jobs.id, analysisId), eq(jobs.createdBy, user.id)),
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
