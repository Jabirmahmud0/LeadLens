import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { getSessionCookie, clearSessionCookie } from '@/lib/auth-cookies';
import { hashToken } from '@leadlens/auth';

export async function POST(req: NextRequest) {
  try {
    const token = await getSessionCookie();
    
    if (token) {
      const hashedToken = hashToken(token);
      await db.update(schema.sessions)
        .set({ revokedAt: new Date() })
        .where(eq(schema.sessions.tokenHash, hashedToken));
    }
    
    await clearSessionCookie();

    if (req.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(new URL('/login', req.url), { status: 303 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
