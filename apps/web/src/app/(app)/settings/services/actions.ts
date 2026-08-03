'use server';
import { db, schema } from '@leadlens/database';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';

export async function deleteAgencyServiceById(id: string) {
  const session = await getSession();
  if (!session?.organization) throw new Error('Unauthorized');
  await db.delete(schema.agencyServices).where(
    and(eq(schema.agencyServices.id, id), eq(schema.agencyServices.organizationId, session.organization.id))
  );
  revalidatePath('/settings/services');
  revalidatePath('/settings');
}

const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  summary: z.string().trim().min(10, 'Description must be at least 10 characters'),
  problemSolved: z.string().trim().optional(),
  deliverables: z.array(z.string()).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function updateAgencyService(id: string, data: z.infer<typeof serviceSchema>) {
  const session = await getSession();
  if (!session?.organization) throw new Error('Unauthorized');
  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid data');

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  await db.update(schema.agencyServices).set({
    name: parsed.data.name,
    slug,
    summary: parsed.data.summary,
    problemSolved: parsed.data.problemSolved ?? null,
    deliverables: parsed.data.deliverables ?? [],
    priceMinCents: parsed.data.priceMin != null ? parsed.data.priceMin * 100 : null,
    priceMaxCents: parsed.data.priceMax != null ? parsed.data.priceMax * 100 : null,
    isActive: parsed.data.isActive ?? true,
    updatedAt: new Date(),
  }).where(
    and(eq(schema.agencyServices.id, id), eq(schema.agencyServices.organizationId, session.organization.id))
  );

  revalidatePath('/settings/services');
  revalidatePath('/settings');
  redirect('/settings/services?saved=1');
}
