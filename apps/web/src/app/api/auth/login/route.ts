import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession, checkRateLimit, RATE_LIMITS } from '@leadlens/auth';
import { setSessionCookie } from '@/lib/auth-cookies';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
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
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create session
    const userAgent = req.headers.get('user-agent') || undefined;
    const { token } = await createSession(user.id, ip, userAgent);
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
