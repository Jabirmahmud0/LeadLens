import { db, schema } from '@leadlens/database';
import { sql, eq, and } from 'drizzle-orm';
import { analysisJobs, analysisJobSteps } from '@leadlens/database/src/schema/analysis';

export type StepKey =
  | 'discover_pages'
  | 'fetch_pages'
  | 'technical_checks'
  | 'pagespeed'
  | 'technology_detection'
  | 'ai_extraction'
  | 'ai_classification'
  | 'ai_service_match'
  | 'ai_fit_score'
  | 'ai_outreach'
  | 'ai_call_prep'
  | 'ai_proposal'
  | 'ai_verify'
  | 'save_report';

export const JOB_STEPS: StepKey[] = [
  'discover_pages',
  'fetch_pages',
  'technical_checks',
  'pagespeed',
  'technology_detection',
  'ai_extraction',
  'ai_classification',
  'ai_service_match',
  'ai_fit_score',
  'ai_outreach',
  'ai_call_prep',
  'ai_proposal',
  'ai_verify',
  'save_report',
];

interface OrchestratorContext {
  jobId: string;
  prospectId: string;
  organizationId: string;
}

/**
 * Execute a single step with retry logic and state management
 */
export async function executeStep(
  ctx: OrchestratorContext,
  stepKey: StepKey,
  executeFn: () => Promise<any>
): Promise<boolean> {
  // Check if step exists and its status
  const existingStep = await db.query.analysisJobSteps.findFirst({
    where: (steps, { eq, and }) =>
      and(eq(steps.analysisJobId, ctx.jobId), eq(steps.stepKey, stepKey)),
  });

  if (existingStep?.status === 'completed') {
    return true; // Already done
  }

  const attemptCount = existingStep ? (existingStep.attemptCount || 1) + 1 : 1;

  if (attemptCount > 3) {
    // Max retries exceeded
    await db.execute(sql`
      UPDATE ${analysisJobSteps}
      SET status = 'failed', error_message = 'Max retries exceeded'
      WHERE analysis_job_id = ${ctx.jobId} AND step_key = ${stepKey}
    `);
    return false;
  }

  // Insert or update as processing
  await db.execute(sql`
    INSERT INTO ${analysisJobSteps} (analysis_job_id, step_key, status, started_at, attempt_count)
    VALUES (${ctx.jobId}, ${stepKey}, 'processing', NOW(), ${attemptCount})
    ON CONFLICT (analysis_job_id, step_key) DO UPDATE
    SET status = 'processing', started_at = NOW(), attempt_count = EXCLUDED.attempt_count
  `);

  try {
    const result = await executeFn();

    // Mark as completed
    await db.execute(sql`
      UPDATE ${analysisJobSteps}
      SET status = 'completed', completed_at = NOW(), output_summary = ${JSON.stringify(result || {})}
      WHERE analysis_job_id = ${ctx.jobId} AND step_key = ${stepKey}
    `);
    return true;
  } catch (error: any) {
    console.error(`Step ${stepKey} failed for job ${ctx.jobId}:`, error);

    // Mark as failed
    await db.execute(sql`
      UPDATE ${analysisJobSteps}
      SET status = 'failed', error_message = ${error.message || 'Unknown error'}
      WHERE analysis_job_id = ${ctx.jobId} AND step_key = ${stepKey}
    `);
    return false;
  }
}

/**
 * Run the orchestration loop for a job
 */
export async function runOrchestration(job: any) {
  const ctx: OrchestratorContext = {
    jobId: job.id,
    prospectId: job.prospect_id,
    organizationId: job.organization_id,
  };

  let hasFailures = false;
  let completedSteps = 0;
  const totalSteps = JOB_STEPS.length;

  for (let i = 0; i < JOB_STEPS.length; i++) {
    const stepKey = JOB_STEPS[i];
    
    // Update progress
    const progressPercent = Math.floor((i / totalSteps) * 100);
    await db.execute(sql`
      UPDATE ${analysisJobs}
      SET current_step = ${stepKey}, progress_percent = ${progressPercent}, updated_at = NOW()
      WHERE id = ${job.id}
    `);

    // Execute step (currently a stub)
    const success = await executeStep(ctx, stepKey, async () => {
      // Stub: simulate work for the step
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: `Stubbed step ${stepKey} completed` };
    });

    if (success) {
      completedSteps++;
    } else {
      hasFailures = true;
      // Depending on step, we might want to break, but tasks say:
      // "A failed step does not abort subsequent independent steps unless required — partial reports are valid"
      // For now, continue to next step.
    }
  }

  // Finalize job
  const finalStatus = hasFailures && completedSteps === 0 ? 'failed' 
                    : hasFailures ? 'partial' 
                    : 'completed';

  await db.execute(sql`
    UPDATE ${analysisJobs}
    SET 
      status = ${finalStatus},
      progress_percent = 100,
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = ${job.id}
  `);

  await db.execute(sql`
    UPDATE ${schema.prospects}
    SET status = ${finalStatus}
    WHERE id = ${job.prospect_id}
  `);
}
