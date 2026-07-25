import { db, schema } from '@leadlens/database';
import { sql, eq, and } from 'drizzle-orm';
import { analysisJobs, analysisJobSteps } from '@leadlens/database/src/schema/analysis';
import { sourcePages, technicalChecks, pagespeedResults } from '@leadlens/database/src/schema/sources';
import { prospects } from '@leadlens/database/src/schema/prospect';
import { agencyProfiles, agencyServices, idealCustomerProfiles, caseStudies } from '@leadlens/database/src/schema/agency';
import { 
  reports, reportScores, reportFindings, findingSources, 
  serviceRecommendations, reportOutreach, reportCallQuestions, 
  reportObjections, proposalStarters 
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

  // Fetch Agency Data for AI Stages
  const orgId = job.organization_id;
  const agencyProfile = await db.query.agencyProfiles.findFirst({
    where: (a, { eq }) => eq(a.organizationId, orgId)
  });
  const services = await db.query.agencyServices.findMany({
    where: (s, { eq }) => eq(s.organizationId, orgId)
  });
  const icp = await db.query.idealCustomerProfiles.findFirst({
    where: (i, { eq, and }) => and(eq(i.organizationId, orgId), eq(i.isDefault, true))
  });
  const caseStudiesList = await db.query.caseStudies.findMany({
    where: (c, { eq, and }) => and(eq(c.organizationId, orgId), eq(c.isActive, true))
  });

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

        case 'ai_service_match':
          if (!stage4Hypotheses) return { skipped: true };
          stage5Match = await runStage5AgencyServiceMatching(
            stage4Hypotheses,
            agencyProfile || {},
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
            agencyProfile || {},
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
          // For now, we only verify the stage 3 issues. Later we can pass all extracted facts.
          const sourcePagesList = await db.query.sourcePages.findMany({
            where: (sp, { eq }) => eq(sp.analysisJobId, job.id)
          });
          stage10Verify = await runStage10SourceVerification(
            stage3Issues.findings,
            sourcePagesList,
            aiOptions
          );
          return stage10Verify;

        case 'save_report':
          if (!stage4Hypotheses || !stage6Fit) return { skipped: true };

          // 1. Create Report
          const [report] = await db.insert(reports).values({
            organizationId: job.organization_id,
            prospectId: job.prospect_id,
            analysisJobId: job.id,
            title: `Intelligence Report: ${stage1Facts?.companyName || prospect.websiteUrl}`,
            executiveSummary: stage6Fit.positiveFactors.join('. '),
            opportunityThesis: stage4Hypotheses.hypotheses[0]?.thesis || '',
            overallScore: stage6Fit.overallScore,
            scoreLabel: stage6Fit.scoreLabel,
            confidence: stage6Fit.confidence.toString(),
            primaryServiceId: stage5Match?.primaryServiceId || null,
            secondaryServiceId: stage5Match?.secondaryServiceId || null,
            recommendedAction: stage9Proposal?.nextStep || '',
            limitations: stage10Verify?.limitations?.join(', ') || '',
            generatedAt: new Date()
          }).returning();

          // 2. Insert Scores
          if (stage6Fit.scoreBreakdown) {
            const scores = [
              { category: 'agencyServiceFit', score: stage6Fit.scoreBreakdown.agencyServiceFit },
              { category: 'problemSeverity', score: stage6Fit.scoreBreakdown.problemSeverity },
              { category: 'businessMaturity', score: stage6Fit.scoreBreakdown.businessMaturity },
              { category: 'likelyProjectValue', score: stage6Fit.scoreBreakdown.likelyProjectValue },
              { category: 'evidenceQuality', score: stage6Fit.scoreBreakdown.evidenceQuality },
              { category: 'outreachReadiness', score: stage6Fit.scoreBreakdown.outreachReadiness },
            ];
            await db.insert(reportScores).values(
              scores.map(s => ({
                reportId: report.id,
                category: s.category,
                score: s.score
              }))
            );
          }

          // 3. Insert Findings & Sources
          if (stage10Verify?.verifiedFindings) {
            for (let i = 0; i < stage10Verify.verifiedFindings.length; i++) {
              const vf = stage10Verify.verifiedFindings[i];
              // Try to find the original finding from stage3
              const originalFinding = stage3Issues?.findings?.find((f: any) => f.title === vf.findingId || f.observation.includes(vf.findingId));
              
              const [dbFinding] = await db.insert(reportFindings).values({
                reportId: report.id,
                category: originalFinding?.category || 'General',
                title: originalFinding?.title || vf.findingId,
                observation: originalFinding?.observation || '',
                businessImpact: originalFinding?.businessImpact || '',
                recommendation: originalFinding?.recommendation || '',
                severity: originalFinding?.severity || 'medium',
                confidence: vf.confidence.toString(),
                evidenceType: vf.isFactOrInference,
                sortOrder: i
              }).returning();

              // Insert sources for this finding
              if (vf.sourceUrls && vf.sourceUrls.length > 0) {
                // Find matching source page IDs
                const sourcePagesList = await db.query.sourcePages.findMany({
                  where: (sp, { eq }) => eq(sp.analysisJobId, job.id)
                });
                
                for (const url of vf.sourceUrls) {
                  const sp = sourcePagesList.find((s) => s.url === url);
                  if (sp) {
                    await db.insert(findingSources).values({
                      findingId: dbFinding.id,
                      sourcePageId: sp.id,
                      supportStrength: 'high'
                    });
                  }
                }
              }
            }
          }

          // 4. Insert Service Recommendations
          if (stage5Match?.serviceMatches) {
            await db.insert(serviceRecommendations).values(
              stage5Match.serviceMatches.map((sm: any, idx: number) => ({
                reportId: report.id,
                serviceId: sm.serviceId,
                rank: idx + 1,
                matchScore: sm.matchScore,
                rationale: sm.rationale,
                suggestedScope: sm.suggestedScope ? JSON.parse(JSON.stringify({ text: sm.suggestedScope })) : null,
                risks: sm.risks ? JSON.parse(JSON.stringify(sm.risks)) : null
              }))
            );
          }

          // 5. Insert Outreach
          if (stage7Outreach) {
            await db.insert(reportOutreach).values({
              reportId: report.id,
              channel: 'email',
              tone: 'professional',
              subjectLines: JSON.parse(JSON.stringify(stage7Outreach.subjectLines)),
              opener: stage7Outreach.emailOpener,
              body: stage7Outreach.emailBody,
              followUp: stage7Outreach.followUpMessage,
              callToAction: stage7Outreach.callToAction
            });
          }

          // 6. Insert Call Questions & Objections
          if (stage8Call) {
            const qs = [
              ...(stage8Call.priorityQuestions || []).map((q: string) => ({ category: 'priority', question: q, priority: 1 })),
              ...(stage8Call.technicalQuestions || []).map((q: string) => ({ category: 'technical', question: q, priority: 2 })),
              ...(stage8Call.businessQuestions || []).map((q: string) => ({ category: 'business', question: q, priority: 2 }))
            ];
            if (qs.length > 0) {
              await db.insert(reportCallQuestions).values(
                qs.map(q => ({
                  reportId: report.id,
                  category: q.category,
                  question: q.question,
                  priority: q.priority
                }))
              );
            }
            
            if (stage8Call.objections && stage8Call.objections.length > 0) {
              await db.insert(reportObjections).values(
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
            await db.insert(proposalStarters).values({
              reportId: report.id,
              problemStatement: stage9Proposal.problemStatement,
              objectives: stage9Proposal.objectives?.join('\n') || '',
              scope: stage9Proposal.proposedScope,
              phases: stage9Proposal.phases?.join('\n') || '',
              successMetrics: stage9Proposal.successMetrics?.join('\n') || '',
              assumptions: stage9Proposal.assumptions?.join('\n') || '',
              nextStep: stage9Proposal.nextStep
            });
          }

          return { reportId: report.id };

        default:
          return { message: `Step ${stepKey} not recognized` };
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
