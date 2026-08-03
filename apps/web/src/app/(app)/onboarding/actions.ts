'use server';

import { db, schema } from '@leadlens/database';
import { eq, and, inArray } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ISO_COUNTRY_CODES } from '@/lib/agency-profile-options';

// ... existing actions ...
const identitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  website: z.string().trim().url().or(z.literal('')),
  country: z.string().refine((value) => ISO_COUNTRY_CODES.includes(value as (typeof ISO_COUNTRY_CODES)[number]), 'Invalid country'),
  timezone: z.string().min(1).max(100),
  description: z.string().trim().max(500),
  teamSize: z.string().min(1).max(50),
  primaryCategory: z.string().min(1).max(120),
});

export async function saveAgencyIdentity(data: z.infer<typeof identitySchema>) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  const parsed = identitySchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid data');
  await db.update(schema.organizations).set({
    name: parsed.data.name, 
    websiteUrl: parsed.data.website || null, 
    countryCode: parsed.data.country || null, 
    timezone: parsed.data.timezone || null,
    updatedAt: new Date(),
  }).where(eq(schema.organizations.id, session.organization.id));

  const existingProfile = await db.select().from(schema.agencyProfiles).where(eq(schema.agencyProfiles.organizationId, session.organization.id));
  
  if (existingProfile.length > 0) {
    await db.update(schema.agencyProfiles).set({
      shortDescription: parsed.data.description, 
      teamSizeRange: parsed.data.teamSize, 
      primaryCategory: parsed.data.primaryCategory,
      updatedAt: new Date(),
    }).where(eq(schema.agencyProfiles.organizationId, session.organization.id));
  } else {
    await db.insert(schema.agencyProfiles).values({
      organizationId: session.organization.id, 
      shortDescription: parsed.data.description,
      teamSizeRange: parsed.data.teamSize, 
      primaryCategory: parsed.data.primaryCategory,
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

export async function saveAgencyServices(data: Array<z.infer<typeof serviceSchema>>) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  const orgId = session.organization.id;
  const parsed = z.array(serviceSchema).parse(data);
  await db.transaction(async (tx) => {
    const retainedIds: string[] = [];
    for (const svc of parsed) {
      const slug = svc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const values = { name: svc.name, slug, summary: svc.description, problemSolved: svc.problemSolved, deliverables: svc.deliverables || [], priceMinCents: svc.priceMin ? svc.priceMin * 100 : null, priceMaxCents: svc.priceMax ? svc.priceMax * 100 : null, industries: svc.preferredIndustries || [], disqualifiers: svc.disqualifiers || [], priority: svc.priority, isActive: svc.isActive, updatedAt: new Date() };
      const [existing] = await tx.select({ id: schema.agencyServices.id }).from(schema.agencyServices).where(and(eq(schema.agencyServices.organizationId, orgId), eq(schema.agencyServices.slug, slug))).limit(1);
      if (existing) { await tx.update(schema.agencyServices).set(values).where(eq(schema.agencyServices.id, existing.id)); retainedIds.push(existing.id); }
      else { const [created] = await tx.insert(schema.agencyServices).values({ organizationId: orgId, ...values }).returning({ id: schema.agencyServices.id }); retainedIds.push(created.id); }
    }
    const current = await tx.select({ id: schema.agencyServices.id }).from(schema.agencyServices).where(eq(schema.agencyServices.organizationId, orgId));
    const removedIds = current.map(item => item.id).filter(id => !retainedIds.includes(id));
    if (removedIds.length) await tx.delete(schema.agencyServices).where(inArray(schema.agencyServices.id, removedIds));
  });
  revalidatePath('/onboarding');
  revalidatePath('/settings');
  redirect('/onboarding/icp');
}

export async function deleteAgencyService(slug: string) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  await db.delete(schema.agencyServices).where(
    and(eq(schema.agencyServices.organizationId, session.organization.id), eq(schema.agencyServices.slug, slug))
  );
  revalidatePath('/onboarding');
  revalidatePath('/settings');
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
      companySizeRanges: data.companySizeRange, industries: data.targetIndustries, locations: data.targetLocations,
      budgetMinCents: data.minBudget ? data.minBudget * 100 : null, preferredSignals: data.buyingSignals, preferredWebsiteConditions: data.preferredWebsiteCondition,
      disqualifyingSignals: data.disqualifyingFactors, commonProblems: data.commonProblems, decisionMakerRoles: data.decisionMakers
    }).where(eq(schema.idealCustomerProfiles.organizationId, orgId));
  } else {
    await db.insert(schema.idealCustomerProfiles).values({
      organizationId: orgId, companySizeRanges: data.companySizeRange, industries: data.targetIndustries, locations: data.targetLocations,
      budgetMinCents: data.minBudget ? data.minBudget * 100 : null, preferredSignals: data.buyingSignals, preferredWebsiteConditions: data.preferredWebsiteCondition,
      disqualifyingSignals: data.disqualifyingFactors, commonProblems: data.commonProblems, decisionMakerRoles: data.decisionMakers
    });
  }
  revalidatePath('/onboarding');
  redirect('/onboarding/case-studies');
}

const caseStudySchema = z.object({
  title: z.string().min(2), clientIndustry: z.string().optional(), clientType: z.string().optional(),
  problem: z.string().optional(), solution: z.string().optional(), deliverables: z.array(z.string()).optional(),
  results: z.string().optional(), metrics: z.record(z.string(), z.any()).optional(), serviceTags: z.array(z.string()).optional(),
  caseStudyUrl: z.string().url().optional().or(z.literal('')), isPublic: z.boolean().default(true),
});

export async function saveAgencyCaseStudies(data: Array<z.infer<typeof caseStudySchema>>) {
  const session = await getSession();
  if (!session || !session.organization) throw new Error('Unauthorized');
  const orgId = session.organization.id;
  const parsed = z.array(caseStudySchema).parse(data);
  await db.transaction(async (tx) => {
    const services = await tx.select({ id: schema.agencyServices.id, name: schema.agencyServices.name }).from(schema.agencyServices).where(eq(schema.agencyServices.organizationId, orgId));
    const retainedIds: string[] = [];
    for (const cs of parsed) {
      const values = { clientIndustry: cs.clientIndustry, clientType: cs.clientType, problem: cs.problem, solution: cs.solution, deliverables: cs.deliverables || [], results: cs.results, metrics: cs.metrics || {}, publicUrl: cs.caseStudyUrl || null, visibility: cs.isPublic ? 'public' : 'private', isActive: true, updatedAt: new Date() };
      const [existing] = await tx.select({ id: schema.caseStudies.id }).from(schema.caseStudies).where(and(eq(schema.caseStudies.organizationId, orgId), eq(schema.caseStudies.title, cs.title))).limit(1);
      const caseStudyId = existing ? existing.id : (await tx.insert(schema.caseStudies).values({ organizationId: orgId, title: cs.title, ...values }).returning({ id: schema.caseStudies.id }))[0].id;
      if (existing) await tx.update(schema.caseStudies).set(values).where(eq(schema.caseStudies.id, caseStudyId));
      retainedIds.push(caseStudyId);
      await tx.delete(schema.caseStudyServices).where(eq(schema.caseStudyServices.caseStudyId, caseStudyId));
      const taggedIds = services.filter(service => (cs.serviceTags || []).includes(service.name)).map(service => service.id);
      if (taggedIds.length) await tx.insert(schema.caseStudyServices).values(taggedIds.map(serviceId => ({ caseStudyId, serviceId })));
    }
    const current = await tx.select({ id: schema.caseStudies.id }).from(schema.caseStudies).where(eq(schema.caseStudies.organizationId, orgId));
    const removedIds = current.map(item => item.id).filter(id => !retainedIds.includes(id));
    if (removedIds.length) await tx.update(schema.caseStudies).set({ isActive: false, updatedAt: new Date() }).where(inArray(schema.caseStudies.id, removedIds));
  });
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
    preferredChannels: [data.preferredOutreachChannel],
    reportDepth: data.reportDepth,
    technicalDetailLevel: data.technicalDetailLevel,
    avoidedPhrases: data.avoidedPhrases || [],
    proposalStyle: data.proposalStyle,
    ctaPreference: data.ctaPreference,
    setupCompletedAt: new Date(),
  }).where(eq(schema.agencyProfiles.organizationId, orgId));

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
