'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';

const FeedbackSchema = z.object({
  reportId: z.string().uuid(),
  overallUsefulness: z.number().int().min(1).max(10),
  timeSavedEstimate: z.string().max(100),
  usedForOutreach: z.boolean(),
  usedForCall: z.boolean(),
  usedForProposal: z.boolean(),
  comments: z.string().max(2_000),
});

export async function saveReportFeedback(input: z.infer<typeof FeedbackSchema>) {
  const session = await getSession();
  if (!session?.organization || !session.user) return { success: false, error: 'Unauthorized' };
  const parsed = FeedbackSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid feedback' };
  const report = await db.query.reports.findFirst({ where: and(eq(schema.reports.id, parsed.data.reportId), eq(schema.reports.organizationId, session.organization.id)), columns: { id: true } });
  if (!report) return { success: false, error: 'Not found' };
  await db.insert(schema.reportFeedback).values({ ...parsed.data, userId: session.user.id });
  return { success: true };
}
