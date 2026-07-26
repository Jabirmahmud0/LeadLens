'use server';

import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';

export async function updateNotificationPreferences(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');
  await db.update(schema.users).set({
    reportCompletionEmails: formData.get('reportCompletionEmails') === 'on',
    productUpdateEmails: formData.get('productUpdateEmails') === 'on',
    updatedAt: new Date(),
  }).where(eq(schema.users.id, session.user.id));
  revalidatePath('/account/notifications');
}
