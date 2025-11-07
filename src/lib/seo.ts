import { Locale } from './i18n';

// HTML language codes for proper SEO
export const htmlLangCodes: Record<Locale, string> = {
  en: 'en',
  ru: 'ru',
  de: 'de',
};

// Generate hreflang links for SEO
export function generateHreflangLinks(pathname: string, baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.net') {
  const links = [];
  
  // Remove locale from pathname to get the base path and normalize trailing slash
  const raw = pathname.replace(/^\/(ru|de)/, '') || '/';
  const basePath = raw.endsWith('/') ? raw : `${raw}/`;
  
  // Add hreflang for each locale
  links.push({
    rel: 'alternate',
    hreflang: 'en',
    href: `${baseUrl}${basePath}`
  });
  
  links.push({
    rel: 'alternate',
    hreflang: 'ru',
    href: `${baseUrl}/ru${basePath === '/' ? '' : basePath}`
  });
  
  links.push({
    rel: 'alternate',
    hreflang: 'de',
    href: `${baseUrl}/de${basePath === '/' ? '' : basePath}`
  });
  
  // Add x-default for default language (English)
  links.push({
    rel: 'alternate',
    hreflang: 'x-default',
    href: `${baseUrl}${basePath}`
  });
  
  return links;
}

// Generate canonical URL
export function generateCanonicalUrl(pathname: string, locale: Locale, baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.net') {
  const raw = pathname.replace(/^\/(ru|de)/, '') || '/';
  const basePath = raw.endsWith('/') ? raw : `${raw}/`;
  
  if (locale === 'en') {
    return `${baseUrl}${basePath}`;
  }
  
  if (locale === 'ru') {
    return `${baseUrl}/ru${basePath === '/' ? '' : basePath}`;
  }
  
  if (locale === 'de') {
    return `${baseUrl}/de${basePath === '/' ? '' : basePath}`;
  }
  
  return `${baseUrl}${basePath}`;
}

// Browser language detection utility for client-side
export function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  const languages = navigator.languages || [navigator.language];
  
  for (const lang of languages) {
    const code = lang.toLowerCase().split('-')[0];
    if (code === 'ru') return 'ru';
    if (code === 'en') return 'en';
  }
  
  return 'en';
}

// Get user's saved language preference
export function getSavedLanguagePreference(): Locale | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'preferred-locale') {
      return (value === 'ru' || value === 'en') ? value as Locale : null;
    }
  }
  
  return null;
}