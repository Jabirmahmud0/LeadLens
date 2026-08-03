import { db, schema } from '@leadlens/database';
import { eq, and, gt, isNull, or, lt, isNotNull } from 'drizzle-orm';
import { generateToken, hashToken } from './session';

export async function createVerificationToken(userId: string) {
  await db.delete(schema.emailVerificationTokens).where(or(lt(schema.emailVerificationTokens.expiresAt, new Date()), isNotNull(schema.emailVerificationTokens.usedAt)));
  const token = generateToken();
  const hashedToken = hashToken(token);
  // 24h expiry
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  // Invalidate any existing tokens for this user
  await db.update(schema.emailVerificationTokens)
    .set({ usedAt: new Date() }) // marking as used effectively invalidates it
    .where(and(eq(schema.emailVerificationTokens.userId, userId), isNull(schema.emailVerificationTokens.usedAt)));

  await db.insert(schema.emailVerificationTokens).values({
    userId,
    tokenHash: hashedToken,
    expiresAt,
  });

  return token;
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const hashedToken = hashToken(token);

  const [verificationToken] = await db.select()
    .from(schema.emailVerificationTokens)
    .where(
      and(
        eq(schema.emailVerificationTokens.tokenHash, hashedToken),
        gt(schema.emailVerificationTokens.expiresAt, new Date())
      )
    );

  if (!verificationToken || verificationToken.usedAt) {
    return false;
  }

  const [activeUser] = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(and(eq(schema.users.id, verificationToken.userId), eq(schema.users.status, 'active')));
  if (!activeUser) return false;

  await db.transaction(async (tx) => {
    await tx.update(schema.emailVerificationTokens).set({ usedAt: new Date() }).where(eq(schema.emailVerificationTokens.id, verificationToken.id));
    await tx.update(schema.users).set({ emailVerifiedAt: new Date() }).where(eq(schema.users.id, verificationToken.userId));
    await tx.insert(schema.auditLogs).values({ userId: verificationToken.userId, action: 'email_verified' });
  });

  return true;
}
