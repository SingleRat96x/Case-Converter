export const locales = ['en', 'ru', 'de'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  de: 'Deutsch',
};

// Language detection mappings for better accuracy
export const languageMappings: Record<string, Locale> = {
  'en': 'en',
  'en-us': 'en',
  'en-gb': 'en',
  'en-ca': 'en',
  'en-au': 'en',
  'ru': 'ru',
  'ru-ru': 'ru',
  'be': 'ru', // Belarusian -> Russian
  'uk': 'ru', // Ukrainian -> Russian (fallback)
  'de': 'de',
  'de-de': 'de',
  'de-at': 'de', // Austrian German
  'de-ch': 'de', // Swiss German
};

export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname.startsWith('/ru/') || pathname === '/ru') {
    return 'ru';
  }
  if (pathname.startsWith('/de/') || pathname === '/de') {
    return 'de';
  }
  return 'en';
}

export function getLocalizedPathname(pathname: string, locale: Locale): string {
  // Remove any existing locale prefix first
  const cleanPath = pathname.replace(/^\/(ru|de)/, '') || '/';
  
  if (locale === 'en') {
    return cleanPath;
  }
  
  // For Russian, add /ru prefix
  if (locale === 'ru') {
    if (cleanPath === '/') return '/ru/';
    return `/ru${cleanPath}`;
  }
  
  // For German, add /de prefix
  if (locale === 'de') {
    if (cleanPath === '/') return '/de/';
    return `/de${cleanPath}`;
  }
  
  return cleanPath;
}
