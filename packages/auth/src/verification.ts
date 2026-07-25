import { db, schema } from '@leadlens/database';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { generateToken, hashToken } from './session';

export async function createVerificationToken(userId: string) {
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

  // Mark token as used
  await db.update(schema.emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.emailVerificationTokens.id, verificationToken.id));

  // Mark user as verified
  await db.update(schema.users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(schema.users.id, verificationToken.userId));

  return true;
}
