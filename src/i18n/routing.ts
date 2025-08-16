export const locales = ['en', 'ru', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const localeInfo = {
  en: { name: 'English', dir: 'ltr' as const },
  ru: { name: 'Русский', dir: 'ltr' as const },
  ar: { name: 'العربية', dir: 'rtl' as const }
};

export const defaultLocale: Locale = 'en';

// Simple routing configuration
export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'as-needed' as const
} as const;