'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '@leadlens/database';
import { requireSession } from '@/lib/auth/session';

const profileSchema = z.object({ fullName: z.string().trim().min(2, 'Enter your full name').max(100) });

export async function updateProfile(formData: FormData) {
  const session = await requireSession();
  const parsed = profileSchema.safeParse({ fullName: formData.get('fullName') });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid profile details');
  await db.update(schema.users).set({ fullName: parsed.data.fullName, updatedAt: new Date() }).where(eq(schema.users.id, session.user.id));
  revalidatePath('/account');
}
