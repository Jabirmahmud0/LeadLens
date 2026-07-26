'use server';

import { db, queries } from '@leadlens/database';
import { reportCallQuestions } from '@leadlens/database/src/schema/report';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const UpdateQuestionSchema = z.object({
  questionId: z.string().uuid(),
  isChecked: z.boolean(),
  notes: z.string().max(10_000).nullable(),
});

export async function updateCallQuestion(questionId: string, isChecked: boolean, notes: string | null) {
  try {
    const session = await getSession();
    if (!session?.organization) return { success: false, error: 'Unauthorized' };

    const input = UpdateQuestionSchema.safeParse({ questionId, isChecked, notes });
    if (!input.success) return { success: false, error: 'Invalid question update' };

    const ownsQuestion = await queries.reports.organizationOwnsCallQuestion(
      input.data.questionId,
      session.organization.id,
    );
    if (!ownsQuestion) return { success: false, error: 'Not found' };

    await db.update(reportCallQuestions)
      .set({ 
        isChecked: input.data.isChecked,
        notes: input.data.notes
      })
      .where(eq(reportCallQuestions.id, input.data.questionId));
    
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Unable to update question' };
  }
}
