import { Locale } from './config';

/**
 * Synchronous translation loading for immediate use
 * Pre-loads essential translations to avoid async issues
 */

// Essential translations loaded synchronously
let syncTranslations: Record<string, Record<string, unknown>> = {};

/**
 * Preload essential translations synchronously
 */
export function preloadEssentialTranslations() {
  try {
    // Load navigation translations synchronously for immediate use
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const navigationEn = require('../../locales/shared/navigation.json').en;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const navigationRu = require('../../locales/shared/navigation.json').ru;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const commonEn = require('../../locales/shared/common.json').en;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const commonRu = require('../../locales/shared/common.json').ru;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const legalEn = require('../../locales/legal.json').en;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const legalRu = require('../../locales/legal.json').ru;

    syncTranslations = {
      'shared/navigation-en': navigationEn,
      'shared/navigation-ru': navigationRu,
      'shared/common-en': commonEn,
      'shared/common-ru': commonRu,
      'legal-en': legalEn,
      'legal-ru': legalRu,
    };
  } catch (error) {
    console.warn('Failed to preload essential translations:', error);
  }
}

/**
 * Get translation synchronously from preloaded data
 */
export function getSyncTranslation(
  locale: Locale,
  namespace: string,
  keyPath: string
): string | null {
  const cacheKey = `${namespace}-${locale}`;
  const data = syncTranslations[cacheKey];
  
  if (!data) {
    return null;
  }
  
  const value = keyPath.split('.').reduce((current: unknown, key: string) => 
    current && typeof current === 'object' && key in current 
      ? (current as Record<string, unknown>)[key] 
      : null
  , data);
  return typeof value === 'string' ? value : null;
}

/**
 * Check if translations are preloaded
 */
export function areTranslationsPreloaded(): boolean {
  return Object.keys(syncTranslations).length > 0;
}

// Auto-preload on module load
if (typeof window === 'undefined') {
  // Server-side: preload immediately
  preloadEssentialTranslations();
} else {
  // Client-side: preload when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadEssentialTranslations);
  } else {
    preloadEssentialTranslations();
  }
}