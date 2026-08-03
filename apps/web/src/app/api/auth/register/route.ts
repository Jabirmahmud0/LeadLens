import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { hashPassword, createSession, createVerificationToken, sendVerificationEmail, checkRateLimit, RATE_LIMITS, hashToken } from '@leadlens/auth';
import { setSessionCookie } from '@/lib/auth-cookies';

const registerSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(15).max(128),
  fullName: z.string().trim().min(2).max(100),
  organizationName: z.string().trim().min(2).max(120),
  plan: z.enum(['free', 'solo', 'agency']).default('free'),
});

const MAX_REGISTRATION_BODY_BYTES = 16 * 1024;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REGISTRATION_BODY_BYTES) {
      return NextResponse.json({ error: 'Request body is too large' }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { email, password, fullName, organizationName, plan } = parsed.data;

    // Rate limiting
    const isAllowed = await checkRateLimit(ip, email, 'register', RATE_LIMITS.register.limit, RATE_LIMITS.register.windowMinutes);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 });
    }

    // Check if user exists
    const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (existingUser.length > 0) {
      try {
        await db.insert(schema.auditLogs).values({
          userId: existingUser[0].id,
          action: 'registration_blocked_existing_account',
          ipHash: hashToken(ip),
          details: { accountStatus: existingUser[0].status },
        });
      } catch (auditError) {
        console.error('Unable to write blocked registration audit:', auditError);
      }
      // Don't reveal user exists, but we can't register
      return NextResponse.json({ error: 'Unable to create account with those details' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const orgSlug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const user = await db.transaction(async (tx) => {
      const [createdUser] = await tx.insert(schema.users).values({
        email, passwordHash, fullName,
      }).returning();
      const [org] = await tx.insert(schema.organizations).values({
        name: organizationName,
        slug: `${orgSlug}-${crypto.randomUUID().slice(0, 8)}`,
        createdBy: createdUser.id,
        pendingBillingPlan: plan === 'free' ? null : plan,
        billingOnboardingCompleted: false,
      }).returning();
      await tx.insert(schema.organizationMembers).values({
        organizationId: org.id, userId: createdUser.id, role: 'owner',
      });
      await tx.insert(schema.auditLogs).values({ organizationId: org.id, userId: createdUser.id, action: 'account_created', ipHash: hashToken(ip) });
      await tx.insert(schema.usageEvents).values({ organizationId: org.id, userId: createdUser.id, eventName: 'account_created' });
      return createdUser;
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
