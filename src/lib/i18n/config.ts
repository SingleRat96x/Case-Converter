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

// Available namespaces for modular translations
export const namespaces = {
  common: 'shared/common',
  navigation: 'shared/navigation',
  legal: 'legal',
  aboutUs: 'pages/about-us',
  contactUs: 'pages/contact-us',
  privacyPolicy: 'pages/privacy-policy',
  termsOfService: 'pages/terms-of-service',
  changelog: 'pages/changelog',
  caseConverters: 'tools/case-converters',
  textGenerators: 'tools/text-generators',
  textModifiers: 'tools/text-modifiers',
  codeData: 'tools/code-data',
  otherTools: 'tools/other-tools',
  imageTools: 'tools/image-tools',
  randomGenerators: 'tools/random-generators',
  miscellaneous: 'tools/miscellaneous',
  miscTools: 'tools/misc-tools',
  pdfTools: 'tools/pdf-tools'
} as const;

export type Namespace = typeof namespaces[keyof typeof namespaces];