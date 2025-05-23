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
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not defined. CSP will be less specific for Supabase.');
  }

  // Base script sources
  let scriptSrcPolicies = [
    "'self'",
    supabaseHostname ? `https://${supabaseHostname}` : null, // Add Supabase hostname if available
    "https://*.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://pagead2.googlesyndication.com",
    "https://*.grow.me",
    "https://vercel.com",
    "https://*.vercel-insights.com"
  ].filter(Boolean) as string[]; // Filter out nulls and assert as string array

  // Add the collected SHA256 hashes from live deployment:
  const scriptHashes = [
    "'sha256-g44d/3JXfqDLNsvubwqcjIiLegMYoi0vGjwMPuNpBEA='",
    "'sha256-Q+8tPsjVtiDsjF/Cv8FMOpg2Yg91oKFKDAJat1PPb2g='", // This one was in both dev and prod logs, likely gtag-init
    "'sha256-F4n1q1Aq9UCdF2xreD8Sj4hKqoPO1GINhVeuxOjt6hE='",
    "'sha256-a7qRX+E7UbmNSBjrY14+uXkU3OIBYHCjjN/Hckjdoh8='",
    "'sha256-swi4wozVxiDM8g+d8xd5l05s6ZqY6aFJiJVDrxfAfuc='",
    "'sha256-OT5mqCOoKLqGFEKqs+dqw5a3+6sakNIquRErq6Lwy4c='",
    "'sha256-VcH8XRVr/XmrIS+S/SXMxV/QSLIuZiT4ypGUd0Rh5ow='",
    "'sha256-Z1ttBHHwDQv+3X2WJgCCUHUQ5ywJGOX/rJQwtUlpm7A='",
    "'sha256-kkGuidKZmpfLHMnUk9YsbohrzgU0jeTSFi89bS2wj9A='",
    "'sha256-Ajd6YtM2frZHtt3ofC9OwlXMjkxoCEL2og6Jar2AZQs='",
    "'sha256-7YO0/7SQSWskIYahXgdxEQbsDh2ecblGTE6//8PuM/U='",
    "'sha256-YoiTZbP35ftJSuqcXHIQKR0GkOgvwuSrIESq73qEh+4='"
  ];
  scriptSrcPolicies = scriptSrcPolicies.concat(scriptHashes);

  // Conditionally add 'unsafe-eval' for development
  if (isDevelopment) {
    scriptSrcPolicies.push("'unsafe-eval'");
  }

  const scriptSrcValue = scriptSrcPolicies.join(' ');

  // Construct the full CSP header value
  const cspDirectives = [
    `default-src 'self' ${supabaseHostname ? `https://${supabaseHostname} wss://${supabaseHostname}` : ''}`,
    `script-src ${scriptSrcValue}`, // Use the constructed script-src value
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.grow.me", // Kept grow.me for styles just in case
    `img-src 'self' data: ${supabaseHostname ? `https://*.supabase.co https://${supabaseHostname}` : 'https://*.supabase.co'} https://pagead2.googlesyndication.com https://*.googleusercontent.com https://*.googletagmanager.com https://*.google-analytics.com https://*.g.doubleclick.net https://*.grow.me`,
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