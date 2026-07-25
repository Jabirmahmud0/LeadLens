import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { hashPassword, createSession, createVerificationToken, sendVerificationEmail, checkRateLimit, RATE_LIMITS } from '@leadlens/auth';
import { setSessionCookie } from '@/lib/auth-cookies';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
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
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 }); // In a real app we might handle this differently to prevent enumeration
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [user] = await db.insert(schema.users).values({
      email: email.toLowerCase(),
      passwordHash,
      fullName,
    }).returning();

    // Create organization
    const orgSlug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const [org] = await db.insert(schema.organizations).values({
      name: organizationName,
      slug: orgSlug + '-' + Math.floor(Math.random() * 10000), // Ensure uniqueness
      createdBy: user.id,
    }).returning();

    // Add user to org
    await db.insert(schema.organizationMembers).values({
      organizationId: org.id,
      userId: user.id,
      role: 'owner',
    });

    // Create session
    const userAgent = req.headers.get('user-agent') || undefined;
    const { token } = await createSession(user.id, ip, userAgent);
    await setSessionCookie(token);

    // Start verification flow
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verifyToken = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, verifyToken, baseUrl);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
