import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@leadlens/auth';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', req.url));
    }

    const isValid = await verifyEmailToken(token);

    if (isValid) {
      return NextResponse.redirect(new URL('/dashboard?verified=true', req.url));
    } else {
      return NextResponse.redirect(new URL('/login?error=TokenExpired', req.url));
    }
  } catch (err) {
    console.error('Verify email error:', err);
    return NextResponse.redirect(new URL('/login?error=VerificationFailed', req.url));
  }
}

export async function POST(req: NextRequest) {
  // Can be called via API directly
  try {
    const body = await req.json();
    const tokenSchema = z.object({ token: z.string() });
    const parsed = tokenSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }
    
    const isValid = await verifyEmailToken(parsed.data.token);
    
    if (isValid) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Token invalid or expired' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
