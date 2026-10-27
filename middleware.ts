import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const secret = process.env.NEXTAUTH_SECRET || 'class_deadline_hub_super_secret_jwt_key_2026_ptit';
  const token = await getToken({
    req: request,
    secret,
  });

  const isAuthRouteProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isAuthRouteProtected) {
    // 1. If not authenticated, redirect to /login with internal-only safe callbackUrl
    if (!token) {
      const fullPath = `${pathname}${search}`;
      // Ensure target is internal path to prevent open redirect
      const safeCallback =
        fullPath.startsWith('/') && !fullPath.startsWith('//')
          ? fullPath
          : '/dashboard';

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', safeCallback);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Role-based check for /admin: must be 'admin'
    if (pathname.startsWith('/admin')) {
      if (token.role !== 'admin') {
        const forbiddenUrl = new URL('/403', request.url);
        return NextResponse.redirect(forbiddenUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
