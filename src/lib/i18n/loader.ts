import { Locale, Namespace } from './config';
import { TranslationNamespaces, validateTranslationStructure } from './types';

// Translation cache to avoid repeated file loading
const translationCache = new Map<string, Record<string, unknown>>();

/**
 * Loads translations for a specific namespace and locale with TypeScript validation
 */
export async function loadNamespace<T extends Namespace>(
  namespace: T, 
  locale: Locale
): Promise<TranslationNamespaces[T]> {
  const cacheKey = `${namespace}-${locale}`;
  
  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey);
    return cached as unknown as TranslationNamespaces[T];
  }

  try {
    const translations = await import(`../../locales/${namespace}.json`);
    
    // Validate structure in development
    if (process.env.NODE_ENV === 'development') {
      validateTranslationStructure(translations.default, {}, namespace);
    }
    
    const localeData = translations.default[locale] as Record<string, unknown>;
    
    if (!localeData) {
      throw new Error(`No data found for locale ${locale} in namespace ${namespace}`);
    }
    
    translationCache.set(cacheKey, localeData);
    return localeData as unknown as TranslationNamespaces[T];
  } catch (error) {
    console.error(`Failed to load namespace ${namespace} for locale ${locale}:`, error);
    throw error;
  }
}

/**
 * Gets a translation value by key path
 */
export async function getTranslation(
  locale: Locale, 
  namespace: Namespace, 
  keyPath: string
): Promise<string> {
  const namespaceData = await loadNamespace(namespace, locale);
  const value = getNestedValue(namespaceData as unknown as Record<string, unknown>, keyPath);
  
  if (value === undefined) {
    console.warn(`Translation key not found: ${namespace}.${keyPath} for locale ${locale}`);
    return keyPath; // Return key as fallback
  }
  
  return value;
}

/**
 * Synchronous version for already loaded translations
 */
export function getTranslationSync(
  locale: Locale, 
  namespace: Namespace, 
  keyPath: string
): string {
  const cacheKey = `${namespace}-${locale}`;
  const namespaceData = translationCache.get(cacheKey);
  
  if (!namespaceData) {
    // Don't warn during initial load, just return the key
    return keyPath;
  }
  
  const value = getNestedValue(namespaceData as unknown as Record<string, unknown>, keyPath);
  if (value === undefined) {
    console.warn(`Translation key not found: ${namespace}.${keyPath} for locale ${locale}`);
    return keyPath;
  }
  
  return value;
}

/**
 * Preloads commonly used namespaces for better performance
 */
export async function preloadCommonNamespaces(locale: Locale): Promise<void> {
  const commonNamespaces = [
    'shared/common',
    'shared/navigation'
  ] as const;

  await Promise.all(
    commonNamespaces.map(namespace => loadNamespace(namespace, locale))
  );
}

/**
 * Helper to get nested object values by dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce((current: unknown, key: string) => 
    current && typeof current === 'object' && key in current 
      ? (current as Record<string, unknown>)[key] 
      : undefined
  , obj);
  return typeof value === 'string' ? value : undefined;
}

/**
 * Clear translation cache (useful for development/testing)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}