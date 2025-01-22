import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for an admin route azerzerzrazerzeraz
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    // Get the auth token from cookies
    const isAuthenticated = request.cookies.get('isAdminAuthenticated')?.value === 'true';

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/dashboard/:path*',
}; 