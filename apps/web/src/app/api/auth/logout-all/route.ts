import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { getSessionCookie, clearSessionCookie } from '@/lib/auth-cookies';
import { validateSession, revokeAllSessions } from '@leadlens/auth';

export async function POST(req: NextRequest) {
  try {
    const token = await getSessionCookie();
    
    if (token) {
      const sessionData = await validateSession(token);
      if (sessionData) {
        await revokeAllSessions(sessionData.user.id);
      }
    }
    
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout-all error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
