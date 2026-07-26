'use server';

import { db, queries, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';

const FindingUpdateSchema = z.discriminatedUnion('action', [
  z.object({ findingId: z.string().uuid(), action: z.literal('pin'), value: z.boolean() }),
  z.object({ findingId: z.string().uuid(), action: z.literal('hide'), value: z.boolean() }),
  z.object({ findingId: z.string().uuid(), action: z.literal('notes'), value: z.string().max(5_000) }),
  z.object({ findingId: z.string().uuid(), action: z.literal('feedback'), value: z.enum(['useful', 'inaccurate', 'irrelevant', 'unclear']) }),
]);

export async function updateFinding(input: z.infer<typeof FindingUpdateSchema>) {
  const session = await getSession();
  if (!session?.organization || !session.user) return { success: false, error: 'Unauthorized' };
  const parsed = FindingUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid update' };
  if (!await queries.reports.organizationOwnsFinding(parsed.data.findingId, session.organization.id)) {
    return { success: false, error: 'Not found' };
  }
  if (parsed.data.action === 'feedback') {
    await db.insert(schema.findingFeedback).values({ findingId: parsed.data.findingId, userId: session.user.id, feedback: parsed.data.value });
  } else {
    const update = parsed.data.action === 'pin'
      ? { isPinned: parsed.data.value }
      : parsed.data.action === 'hide'
        ? { isHidden: parsed.data.value }
        : { privateNotes: parsed.data.value };
    await db.update(schema.reportFindings).set({ ...update, updatedAt: new Date() }).where(eq(schema.reportFindings.id, parsed.data.findingId));
  }
  revalidatePath('/analyses');
  return { success: true };
}
