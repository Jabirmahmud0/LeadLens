import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { createVerificationToken, sendVerificationEmail, checkRateLimit, RATE_LIMITS } from '@leadlens/auth';

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email } = parsed.data;

    // We can reuse the password reset rate limit for resending verification
    const isAllowed = await checkRateLimit(ip, email, 'password_reset', RATE_LIMITS.passwordReset.limit, RATE_LIMITS.passwordReset.windowMinutes);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));

    if (!user || user.emailVerifiedAt) {
      // Return success silently
      return NextResponse.json({ success: true });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyToken = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, verifyToken, baseUrl);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Resend verification error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
