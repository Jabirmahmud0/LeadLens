import { db, schema } from '@leadlens/database';
import { eq, and, gt } from 'drizzle-orm';
import { hashToken } from './session';

export async function checkRateLimit(
  ip: string,
  email: string | null,
  action: 'login' | 'register' | 'password_reset',
  limit: number,
  windowMinutes: number
): Promise<boolean> {
  const ipHash = hashToken(ip); // Reuse hashToken for IP hashing to anonymize
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Record attempt
  await db.insert(schema.authAttempts).values({
    ipHash,
    email: email ? email.toLowerCase() : null,
    action,
  });

  // Count recent attempts by IP for this action
  const ipResult = await db.select()
    .from(schema.authAttempts)
    .where(
      and(
        eq(schema.authAttempts.ipHash, ipHash),
        eq(schema.authAttempts.action, action),
        gt(schema.authAttempts.createdAt, since)
      )
    );

  if (ipResult.length > limit) {
    return false;
  }

  // Count recent attempts by email for this action
  if (email) {
    const emailResult = await db.select()
      .from(schema.authAttempts)
      .where(
        and(
          eq(schema.authAttempts.email, email.toLowerCase()),
          eq(schema.authAttempts.action, action),
          gt(schema.authAttempts.createdAt, since)
        )
      );

    if (emailResult.length > limit) {
      return false;
    }
  }

  return true;
}

export const RATE_LIMITS = {
  login: { limit: 10, windowMinutes: 15 },
  register: { limit: 5, windowMinutes: 60 },
  passwordReset: { limit: 3, windowMinutes: 60 },
};
