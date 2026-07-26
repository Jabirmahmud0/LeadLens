'use server';

import { db } from '@leadlens/database';
import { reportCallQuestions } from '@leadlens/database/src/schema/report';
import { eq } from 'drizzle-orm';

export async function updateCallQuestion(questionId: string, isChecked: boolean, notes: string | null) {
  try {
    await db.update(reportCallQuestions)
      .set({ 
        isChecked,
        notes
      })
      .where(eq(reportCallQuestions.id, questionId));
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
