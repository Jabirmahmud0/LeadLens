import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { hashPassword, createSession, createVerificationToken, sendVerificationEmail, checkRateLimit, RATE_LIMITS, hashToken } from '@leadlens/auth';
import { setSessionCookie } from '@/lib/auth-cookies';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  fullName: z.string().min(2),
  organizationName: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { email, password, fullName, organizationName } = parsed.data;

    // Rate limiting
    const isAllowed = await checkRateLimit(ip, email, 'register', RATE_LIMITS.register.limit, RATE_LIMITS.register.windowMinutes);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    // Check if user exists
    const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    if (existingUser.length > 0) {
      // Don't reveal user exists, but we can't register
      return NextResponse.json({ error: 'Unable to create account with those details' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const orgSlug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const { user, org } = await db.transaction(async (tx) => {
      const [createdUser] = await tx.insert(schema.users).values({
        email: email.toLowerCase(), passwordHash, fullName,
      }).returning();
      const [org] = await tx.insert(schema.organizations).values({
        name: organizationName,
        slug: `${orgSlug}-${crypto.randomUUID().slice(0, 8)}`,
        createdBy: createdUser.id,
      }).returning();
      await tx.insert(schema.organizationMembers).values({
        organizationId: org.id, userId: createdUser.id, role: 'owner',
      });
      await tx.insert(schema.auditLogs).values({ organizationId: org.id, userId: createdUser.id, action: 'account_created', ipHash: hashToken(ip) });
      await tx.insert(schema.usageEvents).values({ organizationId: org.id, userId: createdUser.id, eventName: 'account_created' });
      return { user: createdUser, org };
    });

    // Create session
    const userAgent = req.headers.get('user-agent') || undefined;
    const { token } = await createSession(user.id, ip, userAgent);
    await setSessionCookie(token);

    // Start verification flow
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyToken = await createVerificationToken(user.id);
    try {
      await sendVerificationEmail(user.email, verifyToken, baseUrl);
    } catch (emailError) {
      console.error('Registration succeeded but verification email failed:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
