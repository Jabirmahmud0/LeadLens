import { db, schema } from '@leadlens/database';
import { eq, and, gt, isNull, or, lt, isNotNull } from 'drizzle-orm';
import { generateToken, hashToken } from './session';
import { hashPassword } from './password';
import { sendPasswordResetEmail } from './email';

export async function createPasswordResetToken(email: string, baseUrl: string) {
  await db.delete(schema.passwordResetTokens).where(or(lt(schema.passwordResetTokens.expiresAt, new Date()), isNotNull(schema.passwordResetTokens.usedAt)));
  // Find user by email
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
  
  if (!user) {
    // Silently return to prevent user enumeration
    return;
  }

  const token = generateToken();
  const hashedToken = hashToken(token);
  // 1 hour expiry
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  // Invalidate any existing tokens for this user
  await db.update(schema.passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(schema.passwordResetTokens.userId, user.id), isNull(schema.passwordResetTokens.usedAt)));

  await db.insert(schema.passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashedToken,
    expiresAt,
  });

  await sendPasswordResetEmail(user.email, token, baseUrl);
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const hashedToken = hashToken(token);

  const [resetTokenRow] = await db.select()
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.tokenHash, hashedToken),
        gt(schema.passwordResetTokens.expiresAt, new Date())
      )
    );

  if (!resetTokenRow || resetTokenRow.usedAt) {
    return false;
  }

  const newHash = await hashPassword(newPassword);

  await db.transaction(async (tx) => {
    await tx.update(schema.passwordResetTokens).set({ usedAt: new Date() }).where(eq(schema.passwordResetTokens.id, resetTokenRow.id));
    await tx.update(schema.users).set({ passwordHash: newHash }).where(eq(schema.users.id, resetTokenRow.userId));
    await tx.update(schema.sessions).set({ revokedAt: new Date() }).where(eq(schema.sessions.userId, resetTokenRow.userId));
    await tx.insert(schema.auditLogs).values({ userId: resetTokenRow.userId, action: 'password_reset_completed' });
  });

  return true;
}
