import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, type Locale, languageMappings } from './lib/i18n';

// Detect preferred language from Accept-Language header
function getPreferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  try {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,ru;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, qValue] = lang.trim().split(';q=');
        const quality = qValue ? parseFloat(qValue) || 1.0 : 1.0;
        const langCode = code.toLowerCase().trim();
        return { code: langCode, quality };
      })
      .sort((a, b) => b.quality - a.quality); // Sort by quality (preference)

    // Find first supported language using mappings
    for (const lang of languages) {
      const mappedLocale = languageMappings[lang.code];
      if (mappedLocale && locales.includes(mappedLocale)) {
        return mappedLocale;
      }
      
      // Also check base language code (e.g., 'ru' from 'ru-RU')
      const baseCode = lang.code.split('-')[0];
      const baseMappedLocale = languageMappings[baseCode];
      if (baseMappedLocale && locales.includes(baseMappedLocale)) {
        return baseMappedLocale;
      }
    }
  } catch (error) {
    // If parsing fails, return default locale
    console.warn('Error parsing Accept-Language header:', error);
  }

  return defaultLocale;
}

// Check if path already has a locale
function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  
  if (locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  return null;
}

// Get localized path
function getLocalizedPath(pathname: string, locale: Locale): string {
  // Remove existing locale if present
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  
  if (locale === defaultLocale) {
    return pathWithoutLocale;
  }
  
  return `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for:
  // - API routes
  // - Static files
  // - Next.js internal files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check if path already has a locale
  const currentLocale = getLocaleFromPath(pathname);
  
  // If path already has a locale, add pathname header and continue
  if (currentLocale) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  // Get browser's preferred language
  const acceptLanguage = request.headers.get('accept-language');
  const preferredLocale = getPreferredLocale(acceptLanguage);

  // Check if user has a language preference cookie
  const cookieLocale = request.cookies.get('preferred-locale')?.value as Locale;
  const targetLocale = cookieLocale && locales.includes(cookieLocale) 
    ? cookieLocale 
    : preferredLocale;

  // If target locale is default (English), no redirection needed
  if (targetLocale === defaultLocale) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  // Redirect to localized version
  const localizedPath = getLocalizedPath(pathname, targetLocale);
  const redirectUrl = new URL(localizedPath, request.url);
  
  // Add search params if they exist
  if (request.nextUrl.search) {
    redirectUrl.search = request.nextUrl.search;
  }

  // Create redirect response with SEO-friendly 302 (temporary redirect)
  const response = NextResponse.redirect(redirectUrl, 302);
  
  // Add pathname header for the redirected URL
  response.headers.set('x-pathname', localizedPath);
  
  // Set language preference cookie for future visits
  response.cookies.set('preferred-locale', targetLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });

  return response;
}

export const config = {
  // Match all paths except:
  // - API routes (/api/*)
  // - Static files (/_next/*, /favicon.ico, etc.)
  // - Files with extensions
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (.js, .css, .png, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};