import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('leadlens_session')?.value;

  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isAuthRoute = ['/login', '/register', '/reset-password', '/forgot-password'].includes(request.nextUrl.pathname);
  
  if (!sessionToken) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAuthRoute) {
      // Redirect to login if accessing a protected page
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // Redirect authenticated users away from auth routes
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Security: Prevent CSRF on state-mutating requests by checking Origin for API routes
  if (isApiRoute && request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // In production, enforce origin matches host
    if (process.env.NODE_ENV === 'production' && origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
        }
      } catch (e) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}
