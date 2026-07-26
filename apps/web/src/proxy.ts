import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'] };

const PROTECTED_PAGE_PREFIXES = ['/dashboard','/prospects','/analyses','/new','/settings','/account','/onboarding','/admin'];
const PUBLIC_API_PREFIXES = ['/api/auth/login','/api/auth/register','/api/auth/forgot-password','/api/auth/reset-password','/api/auth/resend-verification','/api/auth/verify-email'];
const INTERNAL_API_PREFIXES = ['/api/worker','/api/internal'];
const AUTH_PAGES = ['/login','/register','/reset-password','/forgot-password'];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('leadlens_session')?.value;
  const isApi = pathname.startsWith('/api/');
  const isInternal = INTERNAL_API_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isPublicApi = PUBLIC_API_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!sessionToken && isProtectedPage) return NextResponse.redirect(new URL('/login', request.url));
  if (!sessionToken && isApi && !isInternal && !isPublicApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (sessionToken && AUTH_PAGES.includes(pathname)) return NextResponse.redirect(new URL('/dashboard', request.url));

  const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  if (isApi && unsafeMethod && !isInternal) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const fetchSite = request.headers.get('sec-fetch-site');
    let sameOrigin = fetchSite === 'same-origin';
    if (origin && host) {
      try { sameOrigin = new URL(origin).host === host; } catch { sameOrigin = false; }
    }
    if (!sameOrigin) return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }
  return NextResponse.next();
}
