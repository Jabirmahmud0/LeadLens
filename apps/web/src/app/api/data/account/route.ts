import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import { clearSessionCookie } from '@/lib/auth-cookies';

const DeleteAccountSchema = z.object({ confirmEmail: z.string().email() });

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.organization || !session.user || session.role !== 'owner') {
    return NextResponse.json({ error: 'Only the workspace owner can delete this account' }, { status: 403 });
  }
  const input = DeleteAccountSchema.safeParse(await req.json().catch(() => null));
  if (!input.success || input.data.confirmEmail.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: 'Email confirmation does not match' }, { status: 400 });
  }

  await db.delete(schema.organizations).where(and(
    eq(schema.organizations.id, session.organization.id),
    eq(schema.organizations.createdBy, session.user.id),
  ));
  await db.delete(schema.users).where(eq(schema.users.id, session.user.id));
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
