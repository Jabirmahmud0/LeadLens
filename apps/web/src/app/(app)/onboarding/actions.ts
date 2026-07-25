'use server';

import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ... existing identity schemas ...
const identitySchema = z.object({
  name: z.string().min(2),
  website: z.string().url().or(z.literal('')),
  country: z.string(),
  timezone: z.string(),
  description: z.string(),
  teamSize: z.string(),
  primaryCategory: z.string(),
});

export async function saveAgencyIdentity(data: z.infer<typeof identitySchema>) {
  const session = await getSession();
  if (!session || !session.organization) {
    throw new Error('Unauthorized');
  }

  const parsed = identitySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid data');
  }

  // Find existing profile or create one
  const existingProfile = await db.select().from(schema.agencyProfiles).where(eq(schema.agencyProfiles.organizationId, session.organization.id));

  if (existingProfile.length > 0) {
    await db.update(schema.agencyProfiles)
      .set({
        name: parsed.data.name,
        websiteUrl: parsed.data.website,
        country: parsed.data.country,
        timezone: parsed.data.timezone,
        description: parsed.data.description,
        teamSize: parsed.data.teamSize,
        primaryServiceCategory: parsed.data.primaryCategory,
      })
      .where(eq(schema.agencyProfiles.organizationId, session.organization.id));
  } else {
    await db.insert(schema.agencyProfiles).values({
      organizationId: session.organization.id,
      name: parsed.data.name,
      websiteUrl: parsed.data.website,
      country: parsed.data.country,
      timezone: parsed.data.timezone,
      description: parsed.data.description,
      teamSize: parsed.data.teamSize,
      primaryServiceCategory: parsed.data.primaryCategory,
      status: 'active',
    });
  }
  
  revalidatePath('/onboarding');
  redirect('/onboarding/services');
}

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  problemSolved: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  preferredIndustries: z.array(z.string()).optional(),
  disqualifiers: z.array(z.string()).optional(),
  priority: z.number().default(0),
  isActive: z.boolean().default(true),
});

const servicesSchema = z.array(serviceSchema);

export async function saveAgencyServices(data: z.infer<typeof servicesSchema>) {
  const session = await getSession();
  if (!session || !session.organization) {
    throw new Error('Unauthorized');
  }

  const parsed = servicesSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid data');
  }

  const orgId = session.organization.id;

  // For MVP, just delete existing and insert new (simple sync)
  await db.delete(schema.agencyServices).where(eq(schema.agencyServices.organizationId, orgId));

  if (parsed.data.length > 0) {
    await db.insert(schema.agencyServices).values(
      parsed.data.map(svc => ({
        organizationId: orgId,
        name: svc.name,
        description: svc.description,
        problemSolved: svc.problemSolved,
        deliverables: svc.deliverables || [],
        priceMin: svc.priceMin ? svc.priceMin.toString() : null, // numeric mapping
        priceMax: svc.priceMax ? svc.priceMax.toString() : null,
        preferredIndustries: svc.preferredIndustries || [],
        disqualifiers: svc.disqualifiers || [],
        priority: svc.priority,
        isActive: svc.isActive,
      }))
    );
  }
  
  revalidatePath('/onboarding');
  redirect('/onboarding/icp');
}
