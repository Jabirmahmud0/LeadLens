import { eq } from 'drizzle-orm';
import { db } from '../client';
import { users } from '../schema/auth';

export const getUserById = (id: string) => db.query.users.findFirst({ where: eq(users.id, id), columns: { passwordHash: false } });
