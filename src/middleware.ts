import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Prepare Supabase Hostname: Safely extract the hostname from process.env.NEXT_PUBLIC_SUPABASE_URL
  let supabaseHostname = '';
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabaseUrlObj = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
      supabaseHostname = supabaseUrlObj.hostname;
    } catch (e) {
      console.error('Invalid NEXT_PUBLIC_SUPABASE_URL for CSP', e);
    }
  } else {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not defined. CSP will be less specific for Supabase.');
  }

  // Construct CSP Directives
  const cspDirectives = [
    `default-src 'self' ${supabaseHostname ? `https://${supabaseHostname} wss://${supabaseHostname}` : ''}`,
    `script-src 'self' ${supabaseHostname ? `https://${supabaseHostname}` : ''} https://*.googletagmanager.com https://*.google-analytics.com https://pagead2.googlesyndication.com https://*.grow.me https://vercel.com https://*.vercel-insights.com`, // NO 'unsafe-inline' or 'unsafe-eval'
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.grow.me", // Added grow.me for potential styles
    `img-src 'self' data: ${supabaseHostname ? `https://*.supabase.co https://${supabaseHostname}` : 'https://*.supabase.co'} https://pagead2.googlesyndication.com https://*.googleusercontent.com https://*.googletagmanager.com https://*.google-analytics.com https://*.g.doubleclick.net https://*.grow.me`, // Added more domains for ads/analytics images
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseHostname ? `wss://${supabaseHostname} https://${supabaseHostname}` : ''} https://*.google-analytics.com https://*.analytics.google.com https://pagead2.googlesyndication.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://*.grow.me https://vercel.com https://*.vercel-insights.com`,
    "frame-src 'self' https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com https://*.grow.me",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
  ];
  const cspHeaderValue = cspDirectives.join('; ');

  // Admin Authentication Logic & Response Handling
  let response;

  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    // Get the auth token from cookies
    const isAuthenticated = request.cookies.get('isAdminAuthenticated')?.value === 'true';

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      const redirectUrl = new URL('/admin', request.url);
      response = NextResponse.redirect(redirectUrl);
      response.headers.set('Content-Security-Policy', cspHeaderValue);
      return response;
    }
  }

  if (!response) {
    response = NextResponse.next();
  }

  response.headers.set('Content-Security-Policy', cspHeaderValue);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|lang-data|sitemap.xml|robots.txt).*)', // Excluded sitemap and robots
  ],
}; 