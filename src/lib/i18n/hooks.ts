'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname, type Namespace } from './config';
import { 
  getTranslation, 
  getTranslationSync, 
  loadNamespace, 
  preloadCommonNamespaces 
} from './loader';
import { getSyncTranslation, areTranslationsPreloaded } from './sync-loader';

/**
 * Enhanced translation hook with namespace support
 */
export function useTranslation(namespace?: Namespace) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload namespace on mount
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        if (namespace) {
          await loadNamespace(namespace, locale);
        }
        // Always preload common namespaces
        await preloadCommonNamespaces(locale);
        setIsLoaded(true);
      } catch (error) {
        console.warn('Failed to preload translations:', error);
        setIsLoaded(true); // Still set loaded to prevent blocking
      }
    };

    loadTranslations();
  }, [namespace, locale]);

  // Async translation function
  const t = useCallback(async (key: string) => {
    if (!namespace) {
      throw new Error('Namespace is required for async translation');
    }
    return await getTranslation(locale, namespace, key);
  }, [locale, namespace]);

  // Synchronous translation function (for already loaded namespaces)
  const tSync = useCallback((key: string, fallback?: string) => {
    if (!namespace) {
      console.warn('Namespace is required for translation');
      return fallback || key;
    }
    
    // Try sync loader first (for essential translations)
    if (areTranslationsPreloaded()) {
      const syncTranslation = getSyncTranslation(locale, namespace, key);
      if (syncTranslation) {
        return syncTranslation;
      }
    }
    
    if (!isLoaded) {
      // Return fallback while loading to prevent errors
      return fallback || key;
    }
    const translation = getTranslationSync(locale, namespace, key);
    return translation || fallback || key;
  }, [locale, namespace, isLoaded]);

  return { 
    t, 
    tSync, 
    locale, 
    isLoaded,
    // Helper function to check if a specific namespace is loaded
    isNamespaceLoaded: (ns: Namespace) => Boolean(loadNamespace(ns, locale))
  };
}

/**
 * Hook for common translations (buttons, messages, etc.)
 */
export function useCommonTranslations() {
  return useTranslation('shared/common');
}

/**
 * Hook for navigation translations (header, footer, menu)
 */
export function useNavigationTranslations() {
  return useTranslation('shared/navigation');
}

/**
 * Hook for case converter tool translations
 */
export function useCaseConverterTranslations() {
  return useTranslation('tools/case-converters');
}

/**
 * Hook for text generator tool translations
 */
export function useTextGeneratorTranslations() {
  return useTranslation('tools/text-generators');
}

/**
 * Hook for other tools translations
 */
export function useOtherToolsTranslations() {
  return useTranslation('tools/other-tools');
}

/**
 * Hook that combines common and tool translations for convenience
 */
export function useToolTranslations(toolNamespace: Namespace) {
  const common = useCommonTranslations();
  const tool = useTranslation(toolNamespace);
  
  return {
    common: common.tSync,
    tool: tool.tSync,
    locale: common.locale,
    isLoaded: common.isLoaded && tool.isLoaded
  };
}