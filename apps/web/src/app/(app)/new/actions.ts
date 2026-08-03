'use server';

import { getSession } from '@/lib/auth/session';
import { db, schema } from '@leadlens/database';
import { validateAndNormalizeUrl } from '@leadlens/analysis';
import { eq, and, inArray, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { dispatchAnalysisJob } from '@/lib/analysis/dispatch';
import { getOrganizationEntitlement } from '@/lib/billing/subscriptions';

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
        return { isDuplicate: true as const, existingId: recentProspects[0].id, existingAnalysisId: existingJob?.id };
      }
    }
  } catch (e) {
    // If URL parsing fails here, it's invalid anyway
  }

  const normalizedCompetitors = rest.competitors.length > 0
    ? await Promise.all(rest.competitors.map(validateAndNormalizeUrl))
    : [];
  const entitlement = await getOrganizationEntitlement(organizationId);

  // Reserve allowance and create the prospect/job under the same per-org
  // transaction. The advisory lock prevents parallel submissions from both
  // claiming the final available analysis.
  const created = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${organizationId}, 0))`);

    await tx.insert(schema.organizationUsagePeriods).values({
      organizationId,
      periodStart: entitlement.periodStart,
      periodEnd: entitlement.periodEnd,
      planKey: entitlement.planKey,
      analysisLimit: entitlement.analysisLimit,
      analysesUsed: sql<number>`(
        select count(*)::int from ${schema.analysisJobs}
        where ${schema.analysisJobs.organizationId} = ${organizationId}
          and ${schema.analysisJobs.createdAt} >= ${entitlement.periodStart}
          and ${schema.analysisJobs.createdAt} < ${entitlement.periodEnd}
      )`,
    }).onConflictDoUpdate({
      target: [schema.organizationUsagePeriods.organizationId, schema.organizationUsagePeriods.periodStart],
      set: {
        periodEnd: entitlement.periodEnd,
        planKey: entitlement.planKey,
        analysisLimit: entitlement.analysisLimit,
        updatedAt: new Date(),
      },
    });

    const [reservation] = await tx.update(schema.organizationUsagePeriods).set({
      analysesUsed: sql`${schema.organizationUsagePeriods.analysesUsed} + 1`,
      updatedAt: new Date(),
    }).where(and(
      eq(schema.organizationUsagePeriods.organizationId, organizationId),
      eq(schema.organizationUsagePeriods.periodStart, entitlement.periodStart),
      lt(schema.organizationUsagePeriods.analysesUsed, entitlement.analysisLimit),
    )).returning({ analysesUsed: schema.organizationUsagePeriods.analysesUsed });

    if (!reservation) {
      throw new Error(`PLAN_LIMIT_REACHED: Your ${entitlement.planKey === 'free' ? 'Hobby' : entitlement.planKey} plan includes ${entitlement.analysisLimit} analyses per billing period.`);
    }

    const [prospect] = await tx.insert(schema.prospects).values({
      organizationId,
      createdBy: session.user.id,
      websiteUrl: normalizedUrl,
      normalizedDomain: new URL(normalizedUrl).hostname,
      companyName: rest.companyName || new URL(normalizedUrl).hostname,
      contactName: rest.contactName || null,
      contactRole: rest.contactRole || null,
      contactEmail: rest.contactEmail || null,
      contactProfileUrl: rest.contactProfileUrl || null,
      notes: [rest.reason, rest.notes].filter(Boolean).join('\n\n') || null,
      status: 'queued',
    }).returning();

    if (normalizedCompetitors.length > 0) {
      await tx.insert(schema.prospectCompetitors).values(normalizedCompetitors.map((competitorUrl) => ({
        prospectId: prospect.id,
        competitorUrl,
        normalizedDomain: new URL(competitorUrl).hostname,
      })));
    }

    const [job] = await tx.insert(schema.analysisJobs).values({
      organizationId,
      prospectId: prospect.id,
      createdBy: session.user.id,
      status: 'queued',
      requestedOptions: rest,
    }).returning({ id: schema.analysisJobs.id });
    await tx.insert(schema.usageEvents).values({
      organizationId,
      userId: session.user.id,
      eventName: 'prospect_submitted',
      properties: { analysisId: job.id, goal: rest.goal, reportDepth: rest.reportDepth, billingPlan: entitlement.planKey },
    });
    return { prospectId: prospect.id, analysisId: job.id };
  });

  await dispatchAnalysisJob(created.analysisId).catch((dispatchError) => {
    console.error(`[submit-analysis] Immediate dispatch failed for ${created.analysisId}:`, dispatchError);
  });

  return { success: true as const, ...created };
}
