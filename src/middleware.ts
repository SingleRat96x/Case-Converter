import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  // Check if the request is for an admin route first
  if (request.nextUrl.pathname.includes('/admin/dashboard')) {
    // Get the auth token from cookies
    const isAuthenticated = request.cookies.get('isAdminAuthenticated')?.value === 'true';

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      const redirectUrl = new URL('/admin', request.url);
      const response = NextResponse.redirect(redirectUrl);
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return response;
    }
  }
  
  // Handle internationalization
  const intlResponse = intlMiddleware(request);
  
  // If intlMiddleware returns a redirect, return it immediately with security headers
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    intlResponse.headers.set('X-Content-Type-Options', 'nosniff');
    intlResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return intlResponse;
  }
  
  // Continue with existing CSP logic
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

  // Construct script-src policies with unsafe-inline approach for dangerouslySetInnerHTML
  let scriptSrcPolicies = [
    "'self'",
    supabaseHostname ? `https://${supabaseHostname}` : null,
    "https://*.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://pagead2.googlesyndication.com",
    "https://*.grow.me",
    "https://vercel.com",
    "https://*.vercel-insights.com",
    "https://fundingchoicesmessages.google.com",
    "'unsafe-inline'" // Allow inline scripts for dangerouslySetInnerHTML approach
  ].filter(Boolean) as string[];

  // Conditionally add 'unsafe-eval' for development
  if (isDevelopment) {
    scriptSrcPolicies.push("'unsafe-eval'");
  }

  const scriptSrcValue = scriptSrcPolicies.join(' ');

  // Construct img-src policies
  let imgSrcPolicies = [
    "'self'",
    "data:",
    supabaseHostname ? `https://*.supabase.co` : null,
    supabaseHostname ? `https://${supabaseHostname}` : null,
    "https://pagead2.googlesyndication.com",
    "https://*.googleusercontent.com",
    "https://*.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://*.g.doubleclick.net",
    "https://*.grow.me",
    "https://res.cloudinary.com" // Allow Cloudinary images for Grow.me
  ].filter(Boolean) as string[];

  // Construct the full CSP header value
  const cspDirectives = [
    `default-src 'self' ${supabaseHostname ? `https://${supabaseHostname} wss://${supabaseHostname}` : ''}`,
    `script-src ${scriptSrcValue}`, // Use the constructed script-src value with unsafe-inline
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.grow.me", // Kept grow.me for styles just in case
    `img-src ${imgSrcPolicies.join(' ')}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseHostname ? `wss://${supabaseHostname} https://${supabaseHostname}` : ''} https://*.google-analytics.com https://*.analytics.google.com https://pagead2.googlesyndication.com https://*.googletagmanager.com https://stats.g.doubleclick.net https://*.grow.me https://vercel.com https://*.vercel-insights.com https://client-rapi-mediavine.recombee.com https://some.growplow.events https://ep1.adtrafficquality.google`,
    "frame-src 'self' https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com https://*.grow.me",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests"
  ];
  const cspHeaderValue = cspDirectives.join('; ');

  // Define additional security headers
  const permissionsPolicyValue = [
    "accelerometer=()",
    "autoplay=()", // Consider (self) if you need autoplay for your own videos
    "camera=()",
    "display-capture=()",
    "fullscreen=(self)",
    "geolocation=()", // Enable with (self "https://some-trusted-map-service.com") if needed
    "gyroscope=()",
    "keyboard-map=()",
    "magnetometer=()",
    "microphone=()",
    "midi=()",
    "payment=()",
    "picture-in-picture=()",
    "publickey-credentials-get=(self)", // For WebAuthn if you use it
    "screen-wake-lock=()",
    "sync-xhr=()",
    "usb=()",
    "web-share=()",
    "xr-spatial-tracking=()",
    "clipboard-read=()",
    "clipboard-write=(self)",
    // Advertising related features - try with broader allowance for now
    'attribution-reporting=*', // Try with *
    'browsing-topics=*',       // Try with *
    'join-ad-interest-group=*',// Try with *
    'run-ad-auction=*'         // Try with *
  ].join(','); // Join with comma

  // Set security headers on the intl response
  // intlResponse.headers.set('Content-Security-Policy', cspHeaderValue);
  intlResponse.headers.set('X-Content-Type-Options', 'nosniff');
  intlResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  intlResponse.headers.set('Permissions-Policy', permissionsPolicyValue);
  
  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|lang-data|sitemap.xml|robots.txt).*)', // Excluded sitemap and robots
  ],
};