import { db, schema } from '@leadlens/database';
import { eq, and, gt, lt } from 'drizzle-orm';
import { hashToken } from './session';

export async function checkRateLimit(
  ip: string,
  identifier: string | null,
  action: 'login' | 'register' | 'password_reset' | 'billing_checkout' | 'billing_portal',
  limit: number,
  windowMinutes: number
): Promise<boolean> {
  const ipHash = hashToken(ip); // Reuse hashToken for IP hashing to anonymize
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  await db.delete(schema.authAttempts).where(lt(schema.authAttempts.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

  // Record attempt
  await db.insert(schema.authAttempts).values({
    ipHash,
    email: identifier ? identifier.toLowerCase() : null,
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
  if (identifier) {
    const identifierResult = await db.select()
      .from(schema.authAttempts)
      .where(
        and(
        eq(schema.authAttempts.email, identifier.toLowerCase()),
          eq(schema.authAttempts.action, action),
          gt(schema.authAttempts.createdAt, since)
        )
      );

    if (identifierResult.length > limit) {
      return false;
    }
  }

  return true;
}

export const RATE_LIMITS = {
  login: { limit: 10, windowMinutes: 15 },
  register: { limit: 5, windowMinutes: 60 },
  passwordReset: { limit: 3, windowMinutes: 60 },
  billingCheckout: { limit: 8, windowMinutes: 15 },
  billingPortal: { limit: 10, windowMinutes: 15 },
};
