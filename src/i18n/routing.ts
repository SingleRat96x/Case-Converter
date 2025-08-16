import {defineRouting} from 'next-intl/routing';
import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'ru', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const localeInfo = {
  en: { name: 'English', dir: 'ltr' as const },
  ru: { name: 'Русский', dir: 'ltr' as const },
  ar: { name: 'العربية', dir: 'rtl' as const }
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed' // This means the default locale won't have a prefix
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation(routing);