import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession, checkRateLimit, RATE_LIMITS, hashToken } from '@leadlens/auth';
import { setSessionCookie } from '@/lib/auth-cookies';
import { ensureBootstrapPlatformOwner } from '@/lib/auth/admin';

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Rate limiting
    const isAllowed = await checkRateLimit(ip, email, 'login', RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMinutes);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    // Find user
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    
    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      try { await db.insert(schema.auditLogs).values({ userId: user.id, action: 'login_failed', ipHash: hashToken(ip) }); } catch (auditError) { console.error('Unable to write login audit:', auditError); }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ADMIN_EMAILS can only create the first database assignment after the
    // account has successfully authenticated. Authorization itself reads DB roles.
    await ensureBootstrapPlatformOwner({ id: user.id, email: user.email });

    // Create session
    const userAgent = req.headers.get('user-agent') || undefined;
    const { token } = await createSession(user.id, ip, userAgent);
    await setSessionCookie(token);
    await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
    try { await db.insert(schema.auditLogs).values({ userId: user.id, action: 'login_succeeded', ipHash: hashToken(ip) }); } catch (auditError) { console.error('Unable to write login audit:', auditError); }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
