import { db, schema } from '@leadlens/database';
import { sql, eq, and } from 'drizzle-orm';
import { analysisJobs, analysisJobSteps } from '@leadlens/database/src/schema/analysis';
import { sourcePages, technicalChecks, pagespeedResults } from '@leadlens/database/src/schema/sources';
import { prospects } from '@leadlens/database/src/schema/prospect';
import { agencyProfiles, agencyServices, idealCustomerProfiles, caseStudies } from '@leadlens/database/src/schema/agency';
import { 
  reports, reportScores, reportFindings, findingSources, 
  serviceRecommendations, reportOutreach, reportCallQuestions, 
  reportObjections, proposalStarters, reportVersions
} from '@leadlens/database/src/schema/report';
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
  orderAIProviders,
  runStage1FactExtraction,
  runStage2BusinessClassification,
  runStage3IssueClassification,
  runStage4OpportunityHypothesis,
  runStage5AgencyServiceMatching,
  runStage6FitScoring,
  runStage7OutreachGeneration,
  runStage8DiscoveryPrep,
  runStage9ProposalAngle,
  runStage10SourceVerification
} from '@leadlens/ai';
import {
  getReportCompletedTemplate,
  getReportFailedTemplate,
  sendEmail,
} from '@leadlens/email';
import { locateExactEvidence } from './evidence';
import { toJsonValue } from './json';

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

interface RequestedOptions {
  serviceIds?: string[];
  caseStudyIds?: string[];
  goal?: 'outreach' | 'call_prep' | 'proposal' | 'qualification';
  reportDepth?: 'quick' | 'standard' | 'deep';
  tone?: string;
  channels?: Array<'email' | 'linkedin' | 'whatsapp'>;
  notes?: string;
  runPagespeed?: boolean;
  specificPages?: string[];
  language?: string;
  reason?: string;
  pagespeedStrategies?: Array<'mobile' | 'desktop'>;
}

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
): Promise<'completed' | 'skipped' | 'failed'> {
  // Check if step exists and its status
  const existingStep = await db.query.analysisJobSteps.findFirst({
    where: (steps, { eq, and }) =>
      and(eq(steps.analysisJobId, ctx.jobId), eq(steps.stepKey, stepKey)),
  });

  if (existingStep?.status === 'completed') {
    return 'completed'; // Already done
  }

  const attemptCount = existingStep ? (existingStep.attemptCount || 1) + 1 : 1;

  if (attemptCount > 3) {
    // Max retries exceeded
    await db.execute(sql`
      UPDATE ${analysisJobSteps}
      SET status = 'failed', error_message = 'Max retries exceeded'
      WHERE analysis_job_id = ${ctx.jobId} AND step_key = ${stepKey}
    `);
    return 'failed';
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

    if (result?.skipped === true) {
      await db.execute(sql`
        UPDATE ${analysisJobSteps}
        SET status = 'skipped', completed_at = NOW(), output_summary = ${JSON.stringify(result)}
        WHERE analysis_job_id = ${ctx.jobId} AND step_key = ${stepKey}
      `);
      return 'skipped';
    }

    // Mark as completed
    await db.execute(sql`
      UPDATE ${analysisJobSteps}
      SET status = 'completed', completed_at = NOW(), output_summary = ${JSON.stringify(result || {})}
      WHERE analysis_job_id = ${ctx.jobId} AND step_key = ${stepKey}
    `);
    return 'completed';
  } catch (error: any) {
    console.error(`Step ${stepKey} failed for job ${ctx.jobId}:`, error);

    // Mark as failed
    await db.execute(sql`
      UPDATE ${analysisJobSteps}
      SET status = 'failed', error_message = ${error.message || 'Unknown error'}
      WHERE analysis_job_id = ${ctx.jobId} AND step_key = ${stepKey}
    `);
    return 'failed';
  }
}

/**
 * Run the orchestration loop for a job
 */
export async function runOrchestration(job: any) {
  const requestedOptions = (job.requested_options || job.requestedOptions || {}) as RequestedOptions;
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

  // Fetch Agency Data for AI Stages
  const orgId = job.organization_id;
  const agencyProfile = await db.query.agencyProfiles.findFirst({
    where: (a, { eq }) => eq(a.organizationId, orgId)
  });
  const allServices = await db.query.agencyServices.findMany({
    where: (s, { eq }) => eq(s.organizationId, orgId)
  });
  const icp = await db.query.idealCustomerProfiles.findFirst({
    where: (i, { eq, and }) => and(eq(i.organizationId, orgId), eq(i.isDefault, true))
  });
  const allCaseStudies = await db.query.caseStudies.findMany({
    where: (c, { eq, and }) => and(eq(c.organizationId, orgId), eq(c.isActive, true))
  });
  const services = requestedOptions.serviceIds?.length
    ? allServices.filter((service) => requestedOptions.serviceIds!.includes(service.id))
    : allServices.filter((service) => service.isActive);
  const caseStudiesList = requestedOptions.caseStudyIds?.length
    ? allCaseStudies.filter((caseStudy) => requestedOptions.caseStudyIds!.includes(caseStudy.id))
    : allCaseStudies;
  const agencyPromptContext = {
    ...(agencyProfile || {}),
    requestedGoal: requestedOptions.goal || 'outreach',
    requestedDepth: requestedOptions.reportDepth || 'standard',
    requestedTone: requestedOptions.tone || agencyProfile?.outreachTone || 'professional',
    requestedChannels: requestedOptions.channels || agencyProfile?.preferredChannels || ['email'],
    privateProspectContext: requestedOptions.notes || undefined,
    analysisReason: requestedOptions.reason || undefined,
    outputLanguage: requestedOptions.language || 'English',
  };

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
  let stage5Match: any = null;
  let stage6Fit: any = null;
  let stage7Outreach: any = null;
  let stage8Call: any = null;
  let stage9Proposal: any = null;
  let stage10Verify: any = null;

  // Provider setup
  const geminiProvider = new GeminiProvider();
  const groqProvider = process.env.GROQ_API_KEY ? new GroqProvider(process.env.GROQ_API_KEY) : undefined;
  const { primaryProvider, fallbackProvider } = orderAIProviders(geminiProvider, groqProvider);
  
  const aiOptions = {
    jobId: job.id,
    prospectId: prospect.id,
    organizationId: job.organization_id,
    primaryProvider,
    fallbackProvider
  };

  // Restore durable step outputs before resuming a partially processed job.
  // This prevents an already-completed prerequisite from disappearing after a worker restart.
  const previousSteps = await db.query.analysisJobSteps.findMany({
    where: (step, { eq }) => eq(step.analysisJobId, job.id),
  });
  const previousOutput = (key: StepKey): any =>
    previousSteps.find((step) => step.stepKey === key && step.status === 'completed')?.outputSummary;

  const discoveryOutput = previousOutput('discover_pages');
  discoveredUrls = Array.isArray(discoveryOutput?.urls) ? discoveryOutput.urls : discoveredUrls;
  if (discoveredUrls[0]) normalizedUrl = discoveredUrls[0];

  const persistedSources = await db.query.sourcePages.findMany({
    where: (source, { eq }) => eq(source.analysisJobId, job.id),
  });
  const persistedPrimarySource = persistedSources.find((source) => source.isPrimary && source.extractedData)
    || persistedSources.find((source) => source.extractedData);
  if (persistedPrimarySource?.extractedData) {
    primaryExtractedData = persistedPrimarySource.extractedData;
    normalizedUrl = persistedPrimarySource.url;
    primaryHtml = String((persistedPrimarySource.extractedData as any).rawHtml || '');
    primaryHeaders = new Headers((persistedPrimarySource.extractedData as any).responseHeaders || {});
  }

  technicalChecksResults = previousOutput('technical_checks')?.checks || null;
  pagespeedResult = previousOutput('pagespeed')?.primary || previousOutput('pagespeed') || null;
  techDetectionResult = previousOutput('technology_detection')?.detected || null;
  stage1Facts = previousOutput('ai_extraction') || null;
  const classificationOutput = previousOutput('ai_classification');
  stage2Business = classificationOutput?.business || null;
  stage3Issues = classificationOutput?.issues || null;
  stage4Hypotheses = classificationOutput?.hypotheses || null;
  stage5Match = previousOutput('ai_service_match') || null;
  stage6Fit = previousOutput('ai_fit_score') || null;
  stage7Outreach = previousOutput('ai_outreach') || null;
  stage8Call = previousOutput('ai_call_prep') || null;
  stage9Proposal = previousOutput('ai_proposal') || null;
  stage10Verify = previousOutput('ai_verify') || null;

  let hasFailures = false;
  let completedSteps = 0;
  const totalSteps = JOB_STEPS.length;

  for (let i = 0; i < JOB_STEPS.length; i++) {
    const stepKey = JOB_STEPS[i];

    const currentJob = await db.query.analysisJobs.findFirst({
      where: (candidate, { eq }) => eq(candidate.id, job.id),
      columns: { status: true },
    });
    if (currentJob?.status === 'cancelled') return;
    
    // Update progress
    const progressPercent = Math.floor((i / totalSteps) * 100);
    await db.execute(sql`
      UPDATE ${analysisJobs}
      SET current_step = ${stepKey}, progress_percent = ${progressPercent}, updated_at = NOW()
      WHERE id = ${job.id}
    `);

    // Execute step
    const outcome = await executeStep(ctx, stepKey, async () => {
      switch (stepKey) {
        case 'discover_pages':
          normalizedUrl = await validateAndNormalizeUrl(prospect.websiteUrl);
          discoveredUrls = await discoverPages(normalizedUrl, {
            maxPages: Number(process.env.CRAWL_MAX_PAGES || 8),
            timeout: Number(process.env.CRAWL_FETCH_TIMEOUT_MS || 10000),
          });
          for (const requestedPage of requestedOptions.specificPages || []) {
            const validatedPage = await validateAndNormalizeUrl(requestedPage);
            if (new URL(validatedPage).origin === new URL(normalizedUrl).origin && !discoveredUrls.includes(validatedPage)) {
              discoveredUrls.push(validatedPage);
            }
          }
          return { urls: discoveredUrls };

        case 'fetch_pages':
          // Discovery output is hydrated from durable step state on resumed jobs.
          if (discoveredUrls.length === 0) discoveredUrls = [normalizedUrl];

          await db.delete(sourcePages).where(eq(sourcePages.analysisJobId, job.id));
          
          let fetchedCount = 0;
          let attemptedCount = 0;
          const seenContentHashes = new Set<string>();
          const crawlDeadline = Date.now() + Number(process.env.CRAWL_MAX_DURATION_MS || 60000);
          for (const url of discoveredUrls) {
            if (Date.now() >= crawlDeadline) break;
            attemptedCount++;
            try {
              const data = await fetchAndExtract(url, Math.min(Number(process.env.CRAWL_FETCH_TIMEOUT_MS || 10000), Math.max(1000, crawlDeadline - Date.now())));
              if (seenContentHashes.has(data.contentHash)) {
                await db.insert(sourcePages).values({ analysisJobId: job.id, prospectId: prospect.id, url, fetchedAt: new Date(), errorCode: 'NEAR_DUPLICATE', errorMessage: 'Content duplicates a previously fetched page' });
                continue;
              }
              seenContentHashes.add(data.contentHash);
              const persistedData = data;
              // Save to source_pages
              const isPrimaryEvidence = primaryExtractedData === null;
              await db.insert(sourcePages).values({
                analysisJobId: job.id,
                prospectId: prospect.id,
                url,
                canonicalUrl: data.canonical || null,
                title: data.title,
                metaDescription: data.metaDescription,
                statusCode: data.statusCode,
                contentType: data.contentType,
                language: data.language || null,
                // Prefer the requested homepage, but gracefully promote the first
                // successful public page when that homepage is too large or blocked.
                isPrimary: isPrimaryEvidence,
                extractedText: data.text,
                extractedData: persistedData,
                contentHash: data.contentHash,
                fetchedAt: new Date(),
                fetchDurationMs: data.responseTimeMs,
              });
              
              if (isPrimaryEvidence) {
                primaryExtractedData = persistedData;
                primaryHtml = data.rawHtml;
                primaryHeaders = new Headers(data.responseHeaders);
              }
              
              fetchedCount++;
            } catch (err: any) {
              console.warn(`Failed to fetch ${url}:`, err);
              await db.insert(sourcePages).values({
                analysisJobId: job.id,
                prospectId: prospect.id,
                url,
                isPrimary: false,
                fetchedAt: new Date(),
                errorCode: 'FETCH_FAILED',
                errorMessage: err instanceof Error ? err.message : 'Unable to fetch page',
              });
            }
          }
          if (fetchedCount === 0) throw new Error('No public pages could be fetched');
          return { fetchedCount, attemptedCount, discoveredCount: discoveredUrls.length, durationLimitReached: attemptedCount < discoveredUrls.length };

        case 'technical_checks':
          if (!primaryExtractedData) return { skipped: true, reason: 'No successfully fetched page was available for technical checks.' };
          const checks: any = runTechnicalChecks(primaryExtractedData, primaryHtml, primaryHeaders);
          const crawledSources = await db.query.sourcePages.findMany({ where: (source, { eq }) => eq(source.analysisJobId, job.id) });
          const titleCounts = new Map<string, number>();
          for (const source of crawledSources) if (source.title) titleCounts.set(source.title.trim().toLowerCase(), (titleCounts.get(source.title.trim().toLowerCase()) || 0) + 1);
          checks.multiPage = { pagesAttempted: crawledSources.length, pagesFetched: crawledSources.filter(source => !source.errorCode).length, failedPages: crawledSources.filter(source => source.errorCode === 'FETCH_FAILED').map(source => source.url), nearDuplicates: crawledSources.filter(source => source.errorCode === 'NEAR_DUPLICATE').map(source => source.url), duplicateTitles: [...titleCounts.entries()].filter(([, count]) => count > 1).map(([title, count]) => ({ title, count })), brokenLinkSample: crawledSources.filter(source => source.errorCode === 'FETCH_FAILED').slice(0, 10).map(source => source.url), robotsAndSitemapChecked: true };
          technicalChecksResults = checks;

          await db.delete(technicalChecks).where(eq(technicalChecks.analysisJobId, job.id));
          
          // Save to technical_checks table
          for (const [key, value] of Object.entries(checks)) {
            const explicitStatus = typeof value === 'object' && value !== null && 'status' in value
              ? String((value as { status?: unknown }).status || 'unknown')
              : typeof value === 'boolean'
                ? (value ? 'pass' : 'warning')
                : 'observed';
            await db.insert(technicalChecks).values({
              analysisJobId: job.id,
              prospectId: prospect.id,
              checkKey: key,
              status: explicitStatus,
              value: toJsonValue(value),
              sourceUrl: normalizedUrl
            });
          }
          return { checksRun: Object.keys(checks).length, checks };

        case 'pagespeed':
          if (requestedOptions.runPagespeed === false) return { skipped: true, reason: 'Disabled by user' };
          const strategies: Array<'mobile' | 'desktop'> = requestedOptions.pagespeedStrategies?.length ? requestedOptions.pagespeedStrategies : ['mobile'];
          await db.delete(pagespeedResults).where(eq(pagespeedResults.analysisJobId, job.id));
          const results = [];
          for (const strategy of strategies) {
            const ps = await runPageSpeed(normalizedUrl, strategy);
            await db.insert(pagespeedResults).values({ analysisJobId: job.id, strategy, performanceScore: ps.scores.performance?.toString(), accessibilityScore: ps.scores.accessibility?.toString(), seoScore: ps.scores.seo?.toString(), bestPracticesScore: ps.scores.bestPractices?.toString(), metrics: ps.metrics, opportunities: ps.opportunities, rawSummary: ps });
            results.push({ strategy, ...ps });
          }
          pagespeedResult = results.find(result => result.strategy === 'mobile') || results[0];
          return { primary: pagespeedResult, strategies: results };

        case 'technology_detection':
          if (!primaryHtml) return { skipped: true, reason: 'No successfully fetched HTML page was available for technology detection.' };
          const techs = detectTechnologies(primaryHtml, primaryHeaders);
          techDetectionResult = techs;
          return { detected: techs };

        case 'ai_extraction':
          if (!primaryExtractedData) return { skipped: true, reason: 'No successfully extracted page content was available for AI analysis.' };
          const extractionSources = await db.query.sourcePages.findMany({ where: (source, { eq }) => eq(source.analysisJobId, job.id) });
          const sourceAddressableText = extractionSources.filter(source => source.extractedText).map(source => `[SOURCE ${source.id} | ${source.url}]\n${source.extractedText!.slice(0, 4000)}`).join('\n\n');
          stage1Facts = await runStage1FactExtraction(
            sourceAddressableText || primaryExtractedData.text,
            techDetectionResult || [],
            aiOptions
          );
          return stage1Facts;

        case 'ai_classification':
          if (!stage1Facts) return { skipped: true };
          
          stage2Business = await runStage2BusinessClassification(stage1Facts, aiOptions);
          
          if (technicalChecksResults) {
            stage3Issues = await runStage3IssueClassification(
              technicalChecksResults,
              pagespeedResult || { scores: {}, metrics: {}, opportunities: [] },
              aiOptions,
            );
            
            stage4Hypotheses = await runStage4OpportunityHypothesis(stage2Business, stage3Issues, aiOptions);
          }
          
          return {
            business: stage2Business,
            issues: stage3Issues,
            hypotheses: stage4Hypotheses,
          };

        case 'ai_service_match':
          if (!stage4Hypotheses) return { skipped: true };
          stage5Match = await runStage5AgencyServiceMatching(
            stage4Hypotheses,
            agencyPromptContext,
            services,
            icp || {},
            aiOptions
          );
          return stage5Match;

        case 'ai_fit_score':
          if (!stage5Match || !stage2Business || !stage3Issues) return { skipped: true };
          stage6Fit = await runStage6FitScoring(
            stage5Match,
            stage2Business,
            stage3Issues,
            icp || {},
            aiOptions
          );
          return stage6Fit;

        case 'ai_outreach':
          if (!stage4Hypotheses || !stage5Match || !stage6Fit) return { skipped: true };
          stage7Outreach = await runStage7OutreachGeneration(
            stage4Hypotheses,
            stage5Match,
            stage6Fit,
            agencyPromptContext,
            aiOptions
          );
          return stage7Outreach;

        case 'ai_call_prep':
          if (!stage4Hypotheses) return { skipped: true };
          stage8Call = await runStage8DiscoveryPrep(
            { business: stage2Business, issues: stage3Issues },
            stage4Hypotheses,
            aiOptions
          );
          return stage8Call;

        case 'ai_proposal':
          if (!stage5Match || !stage4Hypotheses) return { skipped: true };
          stage9Proposal = await runStage9ProposalAngle(
            stage5Match,
            stage4Hypotheses,
            caseStudiesList,
            aiOptions
          );
          return stage9Proposal;

        case 'ai_verify':
          if (!stage3Issues) return { skipped: true };
          const verificationSources = await db.query.sourcePages.findMany({
            where: (sp, { eq }) => eq(sp.analysisJobId, job.id)
          });
          const stage1ClaimValues = stage1Facts?.facts || stage1Facts?.companyFacts || stage1Facts || [];
          const stage1Claims = Array.isArray(stage1ClaimValues)
            ? stage1ClaimValues
            : Object.entries(stage1ClaimValues).map(([key, value]) => `${key}: ${String(value)}`);
          const claimsToVerify = [
            ...(stage3Issues.findings || []),
            ...(stage1Claims.map((fact: any) => ({ category: 'company_fact', observation: typeof fact === 'string' ? fact : JSON.stringify(fact) }))),
            ...(stage2Business ? Object.entries(stage2Business).map(([key, value]) => ({ category: 'business_classification', observation: `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}` })) : []),
            ...((stage4Hypotheses?.hypotheses || []).map((hypothesis: any) => ({ category: 'hypothesis', observation: hypothesis.thesis, businessImpact: hypothesis.businessImpact }))),
            ...((stage5Match?.serviceMatches || []).map((match: any) => ({ category: 'service_match', observation: match.rationale, recommendation: match.suggestedScope }))),
            ...((stage6Fit?.positiveFactors || []).map((factor: string) => ({ category: 'score_factor', observation: factor }))),
            ...(stage7Outreach ? [{ category: 'outreach', observation: stage7Outreach.emailBody }] : []),
            ...(stage9Proposal ? [{ category: 'proposal', observation: stage9Proposal.problemStatement }] : []),
          ];
          stage10Verify = await runStage10SourceVerification(
            claimsToVerify,
            verificationSources,
            aiOptions
          );
          return stage10Verify;

        case 'save_report':
          if (!stage4Hypotheses || !stage6Fit) return { skipped: true };

          const reportSources = await db.query.sourcePages.findMany({ where: (sp, { eq }) => eq(sp.analysisJobId, job.id) });
          const priorReport = await db.query.reports.findFirst({ where: (candidate, { eq }) => eq(candidate.analysisJobId, job.id), columns: { version: true } });
          const nextVersion = (priorReport?.version || 0) + 1;
          return db.transaction(async (tx) => {
          // A failed prior save may have left a partial report. Recreate it atomically from durable stage outputs.
          await tx.delete(reports).where(eq(reports.analysisJobId, job.id));

          // 1. Create Report
          const confidenceScore = Number(stage6Fit.confidence);
          const confidenceLabel = confidenceScore >= 75 ? 'High' : confidenceScore >= 45 ? 'Medium' : 'Low';
          const [report] = await tx.insert(reports).values({
            organizationId: job.organization_id,
            prospectId: job.prospect_id,
            analysisJobId: job.id,
            version: nextVersion,
            title: `Intelligence Report: ${stage1Facts?.companyName || prospect.websiteUrl}`,
            executiveSummary: stage6Fit.positiveFactors.join('. '),
            opportunityThesis: stage4Hypotheses.hypotheses[0]?.thesis || '',
            overallScore: stage6Fit.overallScore,
            scoreLabel: stage6Fit.scoreLabel,
            confidence: confidenceLabel,
            primaryServiceId: stage5Match?.primaryServiceId || null,
            secondaryServiceId: stage5Match?.secondaryServiceId || null,
            recommendedAction: stage9Proposal?.nextStep || '',
            limitations: [...(stage10Verify?.limitations || []), ...(stage10Verify?.unsupportedAreas || [])].join(', '),
            generatedAt: new Date()
          }).returning();

          // 2. Insert Scores
          if (stage6Fit.scoreBreakdown) {
            const scores = [
              { category: 'agencyServiceFit', score: stage6Fit.scoreBreakdown.agencyServiceFit, weight: 0.30 },
              { category: 'problemSeverity', score: stage6Fit.scoreBreakdown.problemSeverity, weight: 0.20 },
              { category: 'businessMaturity', score: stage6Fit.scoreBreakdown.businessMaturity, weight: 0.15 },
              { category: 'likelyProjectValue', score: stage6Fit.scoreBreakdown.likelyProjectValue, weight: 0.15 },
              { category: 'evidenceQuality', score: stage6Fit.scoreBreakdown.evidenceQuality, weight: 0.10 },
              { category: 'outreachReadiness', score: stage6Fit.scoreBreakdown.outreachReadiness, weight: 0.10 },
            ];
            await tx.insert(reportScores).values(
              scores.map(s => ({
                reportId: report.id,
                category: s.category,
                score: s.score,
                weight: s.weight.toString(),
                positiveFactors: stage6Fit.positiveFactors,
                negativeFactors: stage6Fit.negativeFactors,
                missingInformation: stage6Fit.missingInformation,
              }))
            );
          }

          // 3. Insert Findings & Sources
          if (stage3Issues?.findings) {
            for (let i = 0; i < stage3Issues.findings.length; i++) {
              const originalFinding = stage3Issues.findings[i];
              const vf = stage10Verify?.verifiedFindings?.find((candidate: any) => candidate.findingIndex === i);
              
              const findingConfidence = Number(vf?.confidence ?? originalFinding.confidence);
              const [dbFinding] = await tx.insert(reportFindings).values({
                reportId: report.id,
                category: originalFinding?.category || 'General',
                title: originalFinding.title,
                observation: originalFinding?.observation || '',
                businessImpact: originalFinding?.businessImpact || '',
                recommendation: originalFinding?.recommendation || '',
                severity: originalFinding?.severity || 'medium',
                confidence: findingConfidence >= 75 ? 'High' : findingConfidence >= 45 ? 'Medium' : 'Low',
                evidenceType: vf?.isFactOrInference || 'unverified',
                sortOrder: i
              }).returning();

              // Insert sources for this finding
              if (vf?.citations?.length > 0) {
                for (const citation of vf.citations) {
                  const sp = reportSources.find((s) => s.id === citation.sourcePageId);
                  const evidence = locateExactEvidence(sp?.extractedText, citation.evidenceExcerpt);
                  if (sp) {
                    await tx.insert(findingSources).values({
                      findingId: dbFinding.id,
                      sourcePageId: sp.id,
                      evidenceExcerpt: evidence ? evidence.excerpt : citation.evidenceExcerpt,
                      evidenceLocation: evidence ? { start: evidence.start, end: evidence.end } : null,
                      supportStrength: 'high'
                    });
                  }
                }
              }
            }
          }

          // 4. Insert Service Recommendations
          if (stage5Match?.serviceMatches) {
            await tx.insert(serviceRecommendations).values(
              stage5Match.serviceMatches.map((sm: any, idx: number) => ({
                reportId: report.id,
                serviceId: sm.serviceId,
                rank: idx + 1,
                matchScore: sm.matchScore,
                rationale: sm.rationale,
                suggestedScope: sm.suggestedScope ? JSON.parse(JSON.stringify({ text: sm.suggestedScope })) : null,
                risks: sm.risks ? JSON.parse(JSON.stringify(sm.risks)) : null,
                assumptions: JSON.parse(JSON.stringify({ opportunity: stage4Hypotheses?.hypotheses?.[idx] || null, proposalRisks: stage9Proposal?.risks || [], relevantCaseStudyId: stage9Proposal?.relevantCaseStudyId || null }))
              }))
            );
          }

          // 5. Insert Outreach
          if (stage7Outreach) {
            const requestedChannels = requestedOptions.channels?.length ? requestedOptions.channels : ['email'];
            const channelBodies: Record<string, string> = {
              email: stage7Outreach.emailBody,
              linkedin: stage7Outreach.linkedInMessage,
              whatsapp: stage7Outreach.whatsappMessage,
            };
            await tx.insert(reportOutreach).values(requestedChannels.map((channel) => ({
              reportId: report.id,
              channel,
              tone: requestedOptions.tone || agencyProfile?.outreachTone || 'professional',
              subjectLines: channel === 'email' ? JSON.parse(JSON.stringify(stage7Outreach.subjectLines)) : [],
              opener: channel === 'email' ? stage7Outreach.emailOpener : null,
              body: channelBodies[channel],
              followUp: channel === 'email' ? stage7Outreach.followUpMessage : null,
              callToAction: stage7Outreach.callToAction
            })));
          }

          // 6. Insert Call Questions & Objections
          if (stage8Call) {
            const qs = [
              ...(stage8Call.priorityQuestions || []).map((q: string) => ({ category: 'priority', question: q, priority: 1 })),
              ...(stage8Call.technicalQuestions || []).map((q: string) => ({ category: 'technical', question: q, priority: 2 })),
              ...(stage8Call.businessQuestions || []).map((q: string) => ({ category: 'business', question: q, priority: 2 })),
              ...(stage8Call.budgetQuestions || []).map((q: string) => ({ category: 'budget', question: q, priority: 2 })),
              ...(stage8Call.timelineQuestions || []).map((q: string) => ({ category: 'timeline', question: q, priority: 2 })),
              ...(stage8Call.stakeholderQuestions || []).map((q: string) => ({ category: 'stakeholder', question: q, priority: 2 })),
              ...(stage8Call.warningSignals || []).map((q: string) => ({ category: 'warning_signal', question: q, priority: 3 }))
            ];
            if (qs.length > 0) {
              await tx.insert(reportCallQuestions).values(
                qs.map(q => ({
                  reportId: report.id,
                  category: q.category,
                  question: q.question,
                  priority: q.priority
                }))
              );
            }
            
            if (stage8Call.objections && stage8Call.objections.length > 0) {
              await tx.insert(reportObjections).values(
                stage8Call.objections.map((o: any, idx: number) => ({
                  reportId: report.id,
                  objection: o.objection,
                  suggestedResponse: o.suggestedResponse,
                  sortOrder: idx
                }))
              );
            }
          }

          // 7. Insert Proposal Starter
          if (stage9Proposal) {
            await tx.insert(proposalStarters).values({
              reportId: report.id,
              problemStatement: stage9Proposal.problemStatement,
              objectives: stage9Proposal.objectives?.join('\n') || '',
              scope: stage9Proposal.proposedScope,
              phases: stage9Proposal.phases?.join('\n') || '',
              successMetrics: stage9Proposal.successMetrics?.join('\n') || '',
              assumptions: [...(stage9Proposal.assumptions || []), ...(stage9Proposal.risks || []).map((risk: string) => `Risk: ${risk}`), ...(stage9Proposal.relevantCaseStudyId ? [`Relevant case study: ${stage9Proposal.relevantCaseStudyId}`] : [])].join('\n'),
              nextStep: stage9Proposal.nextStep
            });
          }

          await tx.insert(reportVersions).values([
            { organizationId: job.organization_id, analysisJobId: job.id, version: nextVersion, section: 'summary', source: 'generated', content: { title: report.title, executiveSummary: report.executiveSummary, opportunityThesis: report.opportunityThesis, recommendedAction: report.recommendedAction } },
            { organizationId: job.organization_id, analysisJobId: job.id, version: nextVersion, section: 'outreach', source: 'generated', content: stage7Outreach || {} },
            { organizationId: job.organization_id, analysisJobId: job.id, version: nextVersion, section: 'proposal', source: 'generated', content: stage9Proposal || {} },
            { organizationId: job.organization_id, analysisJobId: job.id, version: nextVersion, section: 'verification', source: 'generated', content: stage10Verify || {} },
          ]);

          return { reportId: report.id };
          });

        default:
          return { message: `Step ${stepKey} not recognized` };
      }
    });

    if (outcome === 'completed') {
      completedSteps++;
    } else if (outcome === 'failed') {
      hasFailures = true;
    }
  }

  // Finalize job
  const persistedReport = await db.query.reports.findFirst({
    where: (r, { eq }) => eq(r.analysisJobId, job.id),
    columns: { id: true },
  });

  const finalStatus = persistedReport
    ? (hasFailures ? 'partial' : 'completed')
    : 'failed';
  const failureCode = persistedReport ? null : 'REPORT_NOT_CREATED';
  const failureMessage = persistedReport
    ? null
    : 'Analysis ended without producing a report. Retry the failed or skipped stages.';

  await db.execute(sql`
    UPDATE ${analysisJobs}
    SET 
      status = ${finalStatus},
      progress_percent = 100,
      completed_at = NOW(),
      failed_at = ${finalStatus === 'failed' ? new Date() : null},
      failure_code = ${failureCode},
      failure_message = ${failureMessage},
      updated_at = NOW()
    WHERE id = ${job.id}
  `);

  await db.execute(sql`
    UPDATE ${prospects}
    SET status = ${finalStatus}
    WHERE id = ${job.prospect_id}
  `);

  if (persistedReport) {
    await db.insert(schema.usageEvents).values({
      organizationId: job.organization_id,
      userId: job.created_by,
      eventName: 'report_completed',
      properties: { analysisId: job.id, reportId: persistedReport.id, status: finalStatus },
    });
  }

  // Email delivery is deliberately non-blocking and never changes report completion.
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const creator = await db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, job.created_by),
      });
      if (creator?.email && creator.reportCompletionEmails) {
        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
        const template = persistedReport
          ? getReportCompletedTemplate({
            prospectUrl: prospect.websiteUrl,
            companyName: prospect.companyName || undefined,
            issuesFound: stage3Issues?.findings?.length || 0,
            reportUrl: `${appUrl}/analyses/${job.id}/report`,
          })
          : getReportFailedTemplate({
            prospectUrl: prospect.websiteUrl,
            errorMessage: failureMessage || 'The report could not be created.',
            dashboardUrl: `${appUrl}/analyses/${job.id}`,
          });
        await sendEmail({ to: creator.email, ...template });
      }
    } catch (emailError) {
      console.error('Analysis notification email failed:', emailError);
    }
  }
}
