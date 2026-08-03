'use server';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ISO_COUNTRY_CODES } from '@/lib/agency-profile-options';

const identitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  website: z.string().trim().url().or(z.literal('')),
  country: z.string().refine((v) => ISO_COUNTRY_CODES.includes(v as (typeof ISO_COUNTRY_CODES)[number]), 'Invalid country'),
  timezone: z.string().min(1).max(100),
  description: z.string().trim().max(500),
  teamSize: z.string().min(1).max(50),
  primaryCategory: z.string().min(1).max(120),
});

export async function saveAgencyDetails(data: z.infer<typeof identitySchema>) {
  const session = await getSession();
  if (!session?.organization) throw new Error('Unauthorized');
  const parsed = identitySchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid data');

  await db.update(schema.organizations).set({
    name: parsed.data.name,
    websiteUrl: parsed.data.website || null,
    countryCode: parsed.data.country || null,
    timezone: parsed.data.timezone || null,
    updatedAt: new Date(),
  }).where(eq(schema.organizations.id, session.organization.id));

  const existing = await db.select().from(schema.agencyProfiles).where(eq(schema.agencyProfiles.organizationId, session.organization.id));
  if (existing.length > 0) {
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

  revalidatePath('/settings');
  revalidatePath('/settings/profile');
  redirect('/settings/profile?saved=1');
}
