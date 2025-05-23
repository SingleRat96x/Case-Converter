import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate a unique, cryptographically strong nonce using Web Crypto API (Edge Runtime compatible)
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  // Convert byte array to a base64 string
  // btoa expects a string of characters, so we need to convert bytes to characters first
  let binaryString = '';
  randomBytes.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });
  const nonce = btoa(binaryString);
  
  // Determine if it's development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

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

  // Construct script-src policies with nonce-based approach
  let scriptSrcPolicies = [
    "'self'",
    supabaseHostname ? `https://${supabaseHostname}` : null,
    "https://*.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://pagead2.googlesyndication.com",
    "https://*.grow.me",
    "https://vercel.com",
    "https://*.vercel-insights.com",
    `'nonce-${nonce}'`, // Nonce for scripts we control
    "'sha256-Ec/XLCqW9IkiT3yUDKK5ftmkQGcF3JzHW7lzlrWMZYQ='", // Hash for specific third-party injected inline script
    "'sha256-x41wyMbDu6AdfADPEamp92rpZBhpXK7l04JfrTVCFKU='"  // New production hash
  ].filter(Boolean) as string[];

  // Conditionally add 'unsafe-eval' for development
  if (isDevelopment) {
    scriptSrcPolicies.push("'unsafe-eval'");
  }

  const scriptSrcValue = scriptSrcPolicies.join(' ');

  // Construct the full CSP header value
  const cspDirectives = [
    `default-src 'self' ${supabaseHostname ? `https://${supabaseHostname} wss://${supabaseHostname}` : ''}`,
    `script-src ${scriptSrcValue}`, // Use the constructed nonce-based script-src value
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.grow.me", // Kept grow.me for styles just in case
    `img-src 'self' data: ${supabaseHostname ? `https://*.supabase.co https://${supabaseHostname}` : 'https://*.supabase.co'} https://pagead2.googlesyndication.com https://*.googleusercontent.com https://*.googletagmanager.com https://*.google-analytics.com https://*.g.doubleclick.net https://*.grow.me`,
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseHostname ? `wss://${supabaseHostname} https://${supabaseHostname}` : ''} https://*.google-analytics.com https://*.analytics.google.com https://pagead2.googlesyndication.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://*.grow.me https://vercel.com https://*.vercel-insights.com https://client-rapi-mediavine.recombee.com`,
    "frame-src 'self' https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com https://*.grow.me",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
  ];
  const cspHeaderValue = cspDirectives.join('; ');

  // Pass the nonce to the application by setting a custom REQUEST header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Request-Nonce', nonce);

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

  // If not an admin redirect, prepare the main response with modified request headers
  if (!response) {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  response.headers.set('Content-Security-Policy', cspHeaderValue);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|lang-data|sitemap.xml|robots.txt).*)', // Excluded sitemap and robots
  ],
}; 