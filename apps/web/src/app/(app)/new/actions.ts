'use server';

import { getSession } from '@/lib/auth/session';
import { db, schema } from '@leadlens/database';
import { validateAndNormalizeUrl } from '@leadlens/analysis';
import { eq, and, inArray, gte, count } from 'drizzle-orm';
import { z } from 'zod';
import { dispatchAnalysisJob } from '@/lib/analysis/dispatch';

const ComposerSchema = z.object({
  url: z.string().url(),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  contactRole: z.string().max(120).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactProfileUrl: z.string().url().optional().or(z.literal('')),
  competitors: z.array(z.string().url()).max(5).default([]),
  specificPages: z.array(z.string().url()).max(10).default([]),
  language: z.string().max(20).default('English'),
  reason: z.string().max(500).optional(),
  notes: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, 'Select at least one service'),
  caseStudyIds: z.array(z.string().uuid()).max(10).default([]),
  goal: z.enum(['outreach', 'call_prep', 'proposal', 'qualification']),
  reportDepth: z.enum(['quick', 'standard', 'deep']),
  tone: z.enum(['professional', 'aggressive', 'consultative']),
  channels: z.array(z.enum(['email', 'linkedin', 'whatsapp'])).min(1).max(3),
  runPagespeed: z.boolean(),
  pagespeedStrategies: z.array(z.enum(['mobile', 'desktop'])).min(1).max(2).default(['mobile']),
  force: z.boolean().optional().default(false),
});

export async function submitAnalysis(data: z.infer<typeof ComposerSchema>) {
  const session = await getSession();
  if (!session || !session.organization) {
    throw new Error('Unauthorized');
  }

  const parsed = ComposerSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid form data');
  }

  const { url, force, ...rest } = parsed.data;
  const organizationId = session.organization.id;
  const periodStart = new Date();
  periodStart.setUTCDate(1);
  periodStart.setUTCHours(0, 0, 0, 0);
  const [{ analysesThisPeriod }] = await db.select({ analysesThisPeriod: count() })
    .from(schema.analysisJobs)
    .where(and(eq(schema.analysisJobs.organizationId, organizationId), gte(schema.analysisJobs.createdAt, periodStart)));
  const monthlyLimit = Number(process.env.MONTHLY_ANALYSIS_LIMIT || 25);
  if (analysesThisPeriod >= monthlyLimit) {
    throw new Error(`Monthly analysis limit reached (${monthlyLimit}). Contact support to increase the alpha limit.`);
  }

  const [ownedServices, ownedCaseStudies] = await Promise.all([
    db.select({ id: schema.agencyServices.id })
      .from(schema.agencyServices)
      .where(and(
        eq(schema.agencyServices.organizationId, organizationId),
        inArray(schema.agencyServices.id, rest.serviceIds),
        eq(schema.agencyServices.isActive, true),
      )),
    rest.caseStudyIds.length > 0
      ? db.select({ id: schema.caseStudies.id })
        .from(schema.caseStudies)
        .where(and(
          eq(schema.caseStudies.organizationId, organizationId),
          inArray(schema.caseStudies.id, rest.caseStudyIds),
        ))
      : Promise.resolve([]),
  ]);
  if (ownedServices.length !== rest.serviceIds.length || ownedCaseStudies.length !== rest.caseStudyIds.length) {
    throw new Error('One or more selected agency assets are unavailable');
  }

  // 1. Validate and normalize URL (SSRF protection)
  let normalizedUrl: string;
  try {
    normalizedUrl = await validateAndNormalizeUrl(url);
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Invalid URL');
  }

  // 2. Duplicate Check
  // Check if this domain has been analyzed by this org in the last 24 hours
  try {
    const domain = new URL(normalizedUrl).hostname;
    
    // Quick duplicate check (we use a simple where clause for MVP)
    const recentProspects = await db.query.prospects.findMany({
      where: and(
        eq(schema.prospects.organizationId, session.organization.id),
        eq(schema.prospects.normalizedDomain, domain)
      ),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: 1
    });

    if (!force && recentProspects.length > 0) {
      const lastAnalyzed = new Date(recentProspects[0].createdAt);
      const hoursSince = (Date.now() - lastAnalyzed.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < 24) {
        // Return a special error indicating duplicate to allow user to confirm rerun
        const existingJob = await db.query.analysisJobs.findFirst({
          where: and(
            eq(schema.analysisJobs.organizationId, organizationId),
            eq(schema.analysisJobs.prospectId, recentProspects[0].id),
          ),
          orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
        });
        return { isDuplicate: true, existingId: recentProspects[0].id, existingAnalysisId: existingJob?.id };
      }
    }
  } catch (e) {
    // If URL parsing fails here, it's invalid anyway
  }

  // 3. Insert Prospect
  const [prospect] = await db.insert(schema.prospects).values({
    organizationId: session.organization.id,
    createdBy: session.user.id,
    websiteUrl: normalizedUrl,
    normalizedDomain: new URL(normalizedUrl).hostname,
    companyName: rest.companyName || new URL(normalizedUrl).hostname,
    contactName: rest.contactName || null,
    contactRole: rest.contactRole || null,
    contactEmail: rest.contactEmail || null,
    contactProfileUrl: rest.contactProfileUrl || null,
    notes: [rest.reason, rest.notes].filter(Boolean).join('\n\n') || null,
    status: 'queued', // Mark as queued to wait for worker
  }).returning();

  // 4. Create Analysis Job
  if (rest.competitors.length > 0) {
    const normalizedCompetitors = await Promise.all(rest.competitors.map(validateAndNormalizeUrl));
    await db.insert(schema.prospectCompetitors).values(normalizedCompetitors.map((competitorUrl) => ({
      prospectId: prospect.id,
      competitorUrl,
      normalizedDomain: new URL(competitorUrl).hostname,
    })));
  }

  const [job] = await db.insert(schema.analysisJobs).values({
    organizationId: session.organization.id,
    prospectId: prospect.id,
    createdBy: session.user.id,
    status: 'queued',
    requestedOptions: rest,
  }).returning({ id: schema.analysisJobs.id });
  await db.insert(schema.usageEvents).values({
    organizationId,
    userId: session.user.id,
    eventName: 'prospect_submitted',
    properties: { analysisId: job.id, goal: rest.goal, reportDepth: rest.reportDepth },
  });

  await dispatchAnalysisJob(job.id).catch((dispatchError) => {
    console.error(`[submit-analysis] Immediate dispatch failed for ${job.id}:`, dispatchError);
  });

  // Return success
  return { success: true, prospectId: prospect.id, analysisId: job.id };
}
