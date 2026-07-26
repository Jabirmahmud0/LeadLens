'use server';

import { db } from '@leadlens/database';
import { reportOutreach } from '@leadlens/database/src/schema/report';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function saveOutreachBody(outreachId: string, newBody: string) {
  try {
    await db.update(reportOutreach)
      .set({ 
        userEditedBody: newBody,
        updatedAt: new Date()
      })
      .where(eq(reportOutreach.id, outreachId));
    
    // In a real app we'd trigger a revalidatePath here, but it depends on the exact route
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
