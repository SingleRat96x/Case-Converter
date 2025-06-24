import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
    console.warn(
      'NEXT_PUBLIC_SUPABASE_URL is not defined. CSP will be less specific for Supabase.'
    );
  }

  // Construct script-src policies with unsafe-inline approach for dangerouslySetInnerHTML
  let scriptSrcPolicies = [
    "'self'",
    supabaseHostname ? `https://${supabaseHostname}` : null,
    'https://*.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://pagead2.googlesyndication.com',
    'https://*.grow.me',
    'https://vercel.com',
    'https://*.vercel-insights.com',
    'https://fundingchoicesmessages.google.com',
    "'unsafe-inline'", // Allow inline scripts for dangerouslySetInnerHTML approach
  ].filter(Boolean) as string[];

  // Conditionally add 'unsafe-eval' for development
  if (isDevelopment) {
    scriptSrcPolicies.push("'unsafe-eval'");
  }

  const scriptSrcValue = scriptSrcPolicies.join(' ');

  // Construct img-src policies
  let imgSrcPolicies = [
    "'self'",
    'data:',
    supabaseHostname ? `https://*.supabase.co` : null,
    supabaseHostname ? `https://${supabaseHostname}` : null,
    'https://pagead2.googlesyndication.com',
    'https://*.googleusercontent.com',
    'https://*.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://*.g.doubleclick.net',
    'https://*.grow.me',
    'https://res.cloudinary.com', // Allow Cloudinary images for Grow.me
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
    'upgrade-insecure-requests',
  ];
  const cspHeaderValue = cspDirectives.join('; ');

  // Define additional security headers
  const permissionsPolicyValue = [
    'accelerometer=()',
    'autoplay=()', // Consider (self) if you need autoplay for your own videos
    'camera=()',
    'display-capture=()',
    'fullscreen=(self)',
    'geolocation=()', // Enable with (self "https://some-trusted-map-service.com") if needed
    'gyroscope=()',
    'keyboard-map=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=(self)', // For WebAuthn if you use it
    'screen-wake-lock=()',
    'sync-xhr=()',
    'usb=()',
    'web-share=()',
    'xr-spatial-tracking=()',
    'clipboard-read=()',
    'clipboard-write=(self)',
    // Advertising related features - try with broader allowance for now
    // Note: '*' for ad features can be a security risk if not understood.
    // This is for debugging the "unrecognized feature" vs. "origin trial" errors.
    // Ideally, these would be restricted to specific ad provider domains if they actually function.
    'attribution-reporting=*', // Try with *
    'browsing-topics=*', // Try with *
    'join-ad-interest-group=*', // Try with *
    'run-ad-auction=*', // Try with *
  ].join(','); // Join with comma

  // Admin Authentication Logic & Response Handling
  let response;

  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    // Get the auth token from cookies
    const isAuthenticated =
      request.cookies.get('isAdminAuthenticated')?.value === 'true';

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      const redirectUrl = new URL('/admin', request.url);
      response = NextResponse.redirect(redirectUrl);
      // response.headers.set('Content-Security-Policy', cspHeaderValue);
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
      response.headers.set('Permissions-Policy', permissionsPolicyValue);
      return response;
    }
  }

  // If not an admin redirect, prepare the main response
  if (!response) {
    response = NextResponse.next();
  }

  // response.headers.set('Content-Security-Policy', cspHeaderValue);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', permissionsPolicyValue);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|lang-data|sitemap.xml|robots.txt).*)', // Excluded sitemap and robots
  ],
};
