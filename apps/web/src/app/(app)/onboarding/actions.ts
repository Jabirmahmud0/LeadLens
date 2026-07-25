'use server';

import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ... existing actions ...
const identitySchema = z.object({
  name: z.string().min(2), website: z.string().url().or(z.literal('')), country: z.string(),
  timezone: z.string(), description: z.string(), teamSize: z.string(), primaryCategory: z.string(),
});

export async function saveAgencyIdentity(data: z.infer<typeof identitySchema>) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  const parsed = identitySchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid data');
  const existingProfile = await db.select().from(schema.agencyProfiles).where(eq(schema.agencyProfiles.organizationId, session.organization.id));
  if (existingProfile.length > 0) {
    await db.update(schema.agencyProfiles).set({
      name: parsed.data.name, websiteUrl: parsed.data.website, country: parsed.data.country,
      timezone: parsed.data.timezone, description: parsed.data.description, teamSize: parsed.data.teamSize,
      primaryServiceCategory: parsed.data.primaryCategory,
    }).where(eq(schema.agencyProfiles.organizationId, session.organization.id));
  } else {
    await db.insert(schema.agencyProfiles).values({
      organizationId: session.organization.id, name: parsed.data.name, websiteUrl: parsed.data.website,
      country: parsed.data.country, timezone: parsed.data.timezone, description: parsed.data.description,
      teamSize: parsed.data.teamSize, primaryServiceCategory: parsed.data.primaryCategory, status: 'active',
    });
  }
  revalidatePath('/onboarding');
  redirect('/onboarding/services');
}

const serviceSchema = z.object({
  name: z.string().min(2), description: z.string().min(10), problemSolved: z.string().optional(),
  deliverables: z.array(z.string()).optional(), priceMin: z.number().optional(), priceMax: z.number().optional(),
  preferredIndustries: z.array(z.string()).optional(), disqualifiers: z.array(z.string()).optional(),
  priority: z.number().default(0), isActive: z.boolean().default(true),
});

export async function saveAgencyServices(data: z.array<z.infer<typeof serviceSchema>>) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  const orgId = session.organization.id;
  await db.delete(schema.agencyServices).where(eq(schema.agencyServices.organizationId, orgId));
  if (data.length > 0) {
    await db.insert(schema.agencyServices).values(
      data.map(svc => ({
        organizationId: orgId, name: svc.name, description: svc.description, problemSolved: svc.problemSolved,
        deliverables: svc.deliverables || [], priceMin: svc.priceMin ? svc.priceMin.toString() : null,
        priceMax: svc.priceMax ? svc.priceMax.toString() : null, preferredIndustries: svc.preferredIndustries || [],
        disqualifiers: svc.disqualifiers || [], priority: svc.priority, isActive: svc.isActive,
      }))
    );
  }
  revalidatePath('/onboarding');
  redirect('/onboarding/icp');
}

const icpSchema = z.object({
  companySizeRange: z.array(z.string()), targetIndustries: z.array(z.string()), targetLocations: z.array(z.string()),
  minBudget: z.number().optional(), preferredWebsiteCondition: z.array(z.string()), decisionMakers: z.array(z.string()),
  buyingSignals: z.array(z.string()), disqualifyingFactors: z.array(z.string()), commonProblems: z.array(z.string()),
});

export async function saveAgencyICP(data: z.infer<typeof icpSchema>) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  const orgId = session.organization.id;
  const existing = await db.select().from(schema.idealCustomerProfiles).where(eq(schema.idealCustomerProfiles.organizationId, orgId));
  if (existing.length > 0) {
    await db.update(schema.idealCustomerProfiles).set({
      ...data, minBudget: data.minBudget ? data.minBudget.toString() : null,
    }).where(eq(schema.idealCustomerProfiles.organizationId, orgId));
  } else {
    await db.insert(schema.idealCustomerProfiles).values({
      organizationId: orgId, ...data, minBudget: data.minBudget ? data.minBudget.toString() : null,
    });
  }
  revalidatePath('/onboarding');
  redirect('/onboarding/case-studies');
}

const caseStudySchema = z.object({
  title: z.string().min(2), clientIndustry: z.string().optional(), clientType: z.string().optional(),
  problem: z.string().optional(), solution: z.string().optional(), deliverables: z.array(z.string()).optional(),
  results: z.string().optional(), metrics: z.record(z.string()).optional(), serviceTags: z.array(z.string()).optional(),
  caseStudyUrl: z.string().url().optional().or(z.literal('')), isPublic: z.boolean().default(true),
});

export async function saveAgencyCaseStudies(data: z.array<z.infer<typeof caseStudySchema>>) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  const orgId = session.organization.id;
  await db.delete(schema.agencyCaseStudies).where(eq(schema.agencyCaseStudies.organizationId, orgId));
  if (data.length > 0) {
    await db.insert(schema.agencyCaseStudies).values(
      data.map(cs => ({
        organizationId: orgId, title: cs.title, clientIndustry: cs.clientIndustry, clientType: cs.clientType,
        problem: cs.problem, solution: cs.solution, deliverables: cs.deliverables || [], results: cs.results,
        metrics: cs.metrics || {}, serviceTags: cs.serviceTags || [], caseStudyUrl: cs.caseStudyUrl, isPublic: cs.isPublic,
      }))
    );
  }
  revalidatePath('/onboarding');
  redirect('/onboarding/preferences');
}

const preferencesSchema = z.object({
  brandVoice: z.string(),
  outreachTone: z.string(),
  preferredOutreachChannel: z.string(),
  reportDepth: z.string(),
  technicalDetailLevel: z.string(),
  proposalStyle: z.string(),
  avoidedPhrases: z.array(z.string()).optional(),
  ctaPreference: z.string(),
});

export async function saveOutputPreferences(data: z.infer<typeof preferencesSchema>) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  const orgId = session.organization.id;
  
  await db.update(schema.agencyProfiles).set({
    brandVoice: data.brandVoice,
    outreachTone: data.outreachTone,
    preferredOutreachChannel: data.preferredOutreachChannel,
    reportDepth: data.reportDepth,
    technicalDetailLevel: data.technicalDetailLevel,
    proposalStyle: data.proposalStyle,
    avoidedPhrases: data.avoidedPhrases || [],
    ctaPreference: data.ctaPreference,
    onboardingCompletedAt: new Date(),
  }).where(eq(schema.agencyProfiles.organizationId, orgId));

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
