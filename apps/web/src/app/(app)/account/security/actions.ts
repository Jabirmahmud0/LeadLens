'use server';

import { and, eq, ne } from 'drizzle-orm';
import { db, schema } from '@leadlens/database';
import { hashPassword, verifyPassword } from '@leadlens/auth';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const PasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(128),
});

export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');
  const input = PasswordSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) throw new Error('New password must be at least 12 characters');
  const valid = await verifyPassword(input.data.currentPassword, session.user.passwordHash);
  if (!valid) throw new Error('Current password is incorrect');
  await db.update(schema.users).set({ passwordHash: await hashPassword(input.data.newPassword), updatedAt: new Date() })
    .where(eq(schema.users.id, session.user.id));
  await db.update(schema.sessions).set({ revokedAt: new Date() }).where(and(
    eq(schema.sessions.userId, session.user.id),
    ne(schema.sessions.id, session.session.id),
  ));
  revalidatePath('/account/security');
}

export async function revokeSessionAction(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');
  const sessionId = z.string().uuid().parse(formData.get('sessionId'));
  if (sessionId === session.session.id) throw new Error('Use sign out to end the current session');
  await db.update(schema.sessions).set({ revokedAt: new Date() }).where(and(
    eq(schema.sessions.id, sessionId),
    eq(schema.sessions.userId, session.user.id),
  ));
  revalidatePath('/account/security');
}

export async function logoutOtherSessions() {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');
  await db.update(schema.sessions).set({ revokedAt: new Date() }).where(and(
    eq(schema.sessions.userId, session.user.id),
    ne(schema.sessions.id, session.session.id),
  ));
  revalidatePath('/account/security');
}
