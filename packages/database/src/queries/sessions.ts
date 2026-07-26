import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../client';
import { sessions } from '../schema/auth';

export const listActiveSessionsForUser = (userId: string) => db.query.sessions.findMany({ where: and(eq(sessions.userId, userId), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date())), columns: { tokenHash: false }, orderBy: (table, { desc }) => [desc(table.lastSeenAt)] });
