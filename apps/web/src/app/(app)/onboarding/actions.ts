'use server';

import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
      status: 'active', // default status
    });
  }
  
  revalidatePath('/onboarding');
  redirect('/onboarding/services');
}
