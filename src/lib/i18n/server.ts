import { Locale, Namespace } from './config';
import fs from 'fs';
import path from 'path';

/**
 * Server-side translation loader for build-time/SSR usage
 * Synchronously loads translation files from the file system
 */

// Cache for loaded translations
const serverTranslationCache = new Map<string, Record<string, unknown>>();

/**
 * Synchronously loads namespace data on the server
 */
export function loadNamespaceSync(namespace: Namespace, locale: Locale): Record<string, unknown> {
  const cacheKey = `${namespace}-${locale}`;
  
  if (serverTranslationCache.has(cacheKey)) {
    return serverTranslationCache.get(cacheKey) as Record<string, unknown>;
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'locales', `${namespace}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(fileContent) as Record<string, Record<string, unknown>>;
    const localeData = translations[locale];
    
    if (!localeData) {
      throw new Error(`No data found for locale ${locale} in namespace ${namespace}`);
    }
    
    serverTranslationCache.set(cacheKey, localeData);
    return localeData;
  } catch (error) {
    console.error(`Failed to load namespace ${namespace} for locale ${locale} on server:`, error);
    throw error;
  }
}

/**
 * Gets a translation value by key path (server-side)
 */
export function getServerTranslation(
  locale: Locale, 
  namespace: Namespace, 
  keyPath: string
): string {
  const namespaceData = loadNamespaceSync(namespace, locale);
  const value = getNestedValue(namespaceData, keyPath);
  
  if (value === undefined) {
    console.warn(`Translation key not found: ${namespace}.${keyPath} for locale ${locale}`);
    return keyPath; // Return key as fallback
  }
  
  return value;
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
 * Legacy-compatible translation getter for migration
 * Returns a translation object that matches the old structure
 */
export function getLegacyCompatibleTranslations(locale: Locale): Record<string, unknown> {
  // Load all necessary namespaces
  const navigation = loadNamespaceSync('shared/navigation', locale);
  const caseConverters = loadNamespaceSync('tools/case-converters', locale);
  const textGenerators = loadNamespaceSync('tools/text-generators', locale);
  
  // Return object that matches old structure
  return {
    header: navigation.header,
    mainTool: caseConverters.main,
    uppercaseTool: caseConverters.uppercase,
    lowercaseTool: caseConverters.lowercase,
    titleCaseTool: caseConverters.titleCase,
    sentenceCaseTool: caseConverters.sentenceCase,
    alternatingCaseTool: caseConverters.alternatingCase,
    boldTextTool: textGenerators.bold,
    italicTextTool: textGenerators.italic,
    subscriptTextTool: textGenerators.subscript,
    bigTextTool: textGenerators.bigText,
  };
}