import { db, schema } from '@leadlens/database';
import { sql, eq, and } from 'drizzle-orm';
import { analysisJobs, analysisJobSteps } from '@leadlens/database/src/schema/analysis';
import { sourcePages, technicalChecks, pagespeedResults } from '@leadlens/database/src/schema/sources';
import { prospects } from '@leadlens/database/src/schema/prospect';
import { 
  validateAndNormalizeUrl, 
  discoverPages, 
  fetchAndExtract, 
  runTechnicalChecks, 
  detectTechnologies, 
  runPageSpeed 
} from '@leadlens/analysis';
import { 
  GeminiProvider, 
  GroqProvider,
  runStage1FactExtraction,
  runStage2BusinessClassification,
  runStage3IssueClassification,
  runStage4OpportunityHypothesis
} from '@leadlens/ai';

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

  // 1. Fetch prospect to get website URL
  const prospect = await db.query.prospects.findFirst({
    where: (p, { eq }) => eq(p.id, job.prospect_id),
  });

  if (!prospect || !prospect.websiteUrl) {
    throw new Error('Prospect or website URL not found');
  }

  let normalizedUrl = prospect.websiteUrl;
  let discoveredUrls: string[] = [];
  let primaryHtml = '';
  let primaryHeaders = new Headers();
  let primaryExtractedData: any = null;
  let technicalChecksResults: any = null;
  let pagespeedResult: any = null;
  let techDetectionResult: any = null;

  // AI state
  let stage1Facts: any = null;
  let stage2Business: any = null;
  let stage3Issues: any = null;
  let stage4Hypotheses: any = null;

  // Provider setup
  const primaryProvider = new GeminiProvider(process.env.GEMINI_API_KEY);
  const fallbackProvider = process.env.GROQ_API_KEY ? new GroqProvider(process.env.GROQ_API_KEY) : undefined;
  
  const aiOptions = {
    jobId: job.id,
    prospectId: prospect.id,
    organizationId: job.organization_id,
    primaryProvider,
    fallbackProvider
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

    // Execute step
    const success = await executeStep(ctx, stepKey, async () => {
      switch (stepKey) {
        case 'discover_pages':
          normalizedUrl = await validateAndNormalizeUrl(prospect.websiteUrl);
          discoveredUrls = await discoverPages(normalizedUrl);
          return { urls: discoveredUrls };

        case 'fetch_pages':
          // We need discovered urls. If resumed, we could fetch from DB, but for now we rely on in-memory or fallback to normalizedUrl
          if (discoveredUrls.length === 0) discoveredUrls = [normalizedUrl];
          
          let fetchedCount = 0;
          for (const url of discoveredUrls) {
            try {
              const data = await fetchAndExtract(url);
              // Save to source_pages
              await db.insert(sourcePages).values({
                analysisJobId: job.id,
                prospectId: prospect.id,
                url,
                title: data.title,
                metaDescription: data.metaDescription,
                isPrimary: url === discoveredUrls[0],
                extractedText: data.text,
                extractedData: data
              });
              
              if (url === discoveredUrls[0]) {
                primaryExtractedData = data;
                // We don't have the raw HTML returned from fetchAndExtract, so we will fetch it again for tech detection later, or rely on what we can.
                // For MVP, we will let detectTechnologies just run on the text or we can just fetch it here.
                const rawRes = await fetch(url);
                primaryHtml = await rawRes.text();
                primaryHeaders = rawRes.headers;
              }
              
              fetchedCount++;
            } catch (err: any) {
              console.warn(`Failed to fetch ${url}:`, err);
            }
          }
          return { fetchedCount };

        case 'technical_checks':
          if (!primaryExtractedData) return { skipped: true };
          const checks = runTechnicalChecks(primaryExtractedData, primaryHtml, primaryHeaders);
          
          // Save to technical_checks table
          for (const [key, value] of Object.entries(checks)) {
            if (typeof value === 'object' && value !== null) {
               await db.insert(technicalChecks).values({
                 analysisJobId: job.id,
                 prospectId: prospect.id,
                 checkKey: key,
                 status: (value as any).status || 'unknown',
                 value: value,
                 sourceUrl: normalizedUrl
               });
            }
          }
          return { checksRun: Object.keys(checks).length };

        case 'pagespeed':
          const ps = await runPageSpeed(normalizedUrl, 'mobile');
          await db.insert(pagespeedResults).values({
            analysisJobId: job.id,
            strategy: 'mobile',
            performanceScore: ps.scores.performance?.toString(),
            accessibilityScore: ps.scores.accessibility?.toString(),
            seoScore: ps.scores.seo?.toString(),
            bestPracticesScore: ps.scores.bestPractices?.toString(),
          });
          pagespeedResult = ps;
          return { performanceScore: ps.scores.performance };

        case 'technology_detection':
          if (!primaryHtml) return { skipped: true };
          const techs = detectTechnologies(primaryHtml, primaryHeaders);
          techDetectionResult = techs;
          return { detected: techs };

        case 'ai_extraction':
          if (!primaryExtractedData) return { skipped: true };
          stage1Facts = await runStage1FactExtraction(
            primaryExtractedData.text,
            techDetectionResult || [],
            aiOptions
          );
          return stage1Facts;

        case 'ai_classification':
          if (!stage1Facts) return { skipped: true };
          
          stage2Business = await runStage2BusinessClassification(stage1Facts, aiOptions);
          
          if (technicalChecksResults && pagespeedResult) {
            stage3Issues = await runStage3IssueClassification(technicalChecksResults, pagespeedResult, aiOptions);
            
            stage4Hypotheses = await runStage4OpportunityHypothesis(stage2Business, stage3Issues, aiOptions);
          }
          
          return { 
            business: stage2Business, 
            issuesFound: stage3Issues?.findings?.length || 0,
            hypotheses: stage4Hypotheses?.hypotheses?.length || 0
          };

        default:
          // Stub for remaining AI steps
          await new Promise(resolve => setTimeout(resolve, 500));
          return { message: `Stubbed step ${stepKey} completed` };
      }
    });

    if (success) {
      completedSteps++;
    } else {
      hasFailures = true;
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
    UPDATE ${prospects}
    SET status = ${finalStatus}
    WHERE id = ${job.prospect_id}
  `);
}
