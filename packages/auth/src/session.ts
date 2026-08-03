import { randomBytes, createHash } from 'crypto';
import { db, schema } from '@leadlens/database';
import { eq, and, gt } from 'drizzle-orm';

const SESSION_EXPIRY_DAYS = 30;

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, ipHash?: string, userAgent?: string) {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * SESSION_EXPIRY_DAYS);

  const [session] = await db.insert(schema.sessions).values({
    userId,
    tokenHash: hashedToken,
    ipHash: ipHash ? createHash('sha256').update(ipHash).digest('hex') : undefined,
    userAgent,
    expiresAt,
  }).returning();

  return { token, session };
}

export async function validateSession(token: string) {
  const hashedToken = hashToken(token);

  const result = await db
    .select({
      session: schema.sessions,
      user: schema.users,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.sessions.tokenHash, hashedToken),
        gt(schema.sessions.expiresAt, new Date()),
      )
    );

  if (result.length === 0) {
    return null;
  }

  const { session, user } = result[0];

  if (session.revokedAt) {
    return null;
  }

  if (user.status !== 'active') {
    // Self-heal legacy rows created before admin suspension/deletion revoked
    // sessions transactionally. The account status is always authoritative.
    await db.update(schema.sessions)
      .set({ revokedAt: new Date() })
      .where(eq(schema.sessions.id, session.id));
    return null;
  }

  // Find user's active organization (first one for now, or default)
  const orgResult = await db
    .select({
      organization: schema.organizations,
      role: schema.organizationMembers.role,
    })
    .from(schema.organizationMembers)
    .innerJoin(schema.organizations, eq(schema.organizationMembers.organizationId, schema.organizations.id))
    .where(and(
      eq(schema.organizationMembers.userId, user.id),
      eq(schema.organizationMembers.status, 'active'),
      eq(schema.organizations.status, 'active'),
    ))
    .limit(1);

  const organization = orgResult.length > 0 ? orgResult[0].organization : null;
  const role = orgResult.length > 0 ? orgResult[0].role : null;

  // Extend session if it's close to expiry (rolling session)
  const daysUntilExpiry = (session.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilExpiry < 15) {
    await db.update(schema.sessions)
      .set({ expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * SESSION_EXPIRY_DAYS), lastSeenAt: new Date() })
      .where(eq(schema.sessions.id, session.id));
  } else {
    // Just update last seen
    await db.update(schema.sessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(schema.sessions.id, session.id));
  }

  return { session, user, organization, role };
}

export async function revokeSession(sessionId: string) {
  await db.update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(eq(schema.sessions.id, sessionId));
}

export async function revokeAllSessions(userId: string) {
  await db.update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(eq(schema.sessions.userId, userId));
}
