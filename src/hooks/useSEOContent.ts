'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';

export interface SEOContentItem {
  title?: string;
  description?: string;
  content?: string;
  items?: string[] | SEOContentItem[];
  step?: number;
  input?: string;
  output?: string;
  question?: string;
  answer?: string;
  name?: string;
  tools?: SEOContentItem[];
  steps?: SEOContentItem[];
}

export interface SEOContent {
  title: string;
  metaDescription: string;
  sections: {
    intro: SEOContentItem;
    features: SEOContentItem;
    howToUse: SEOContentItem;
    examples: SEOContentItem;
    useCases: SEOContentItem;
    benefits: SEOContentItem;
    relatedTools: SEOContentItem;
    faqs: SEOContentItem[];
  };
}

export function useSEOContent(toolName: string) {
  const [content, setContent] = useState<SEOContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pathname = usePathname();
  const currentLocale = getLocaleFromPathname(pathname);

  useEffect(() => {
    const loadSEOContent = async () => {
      if (!toolName) return;

      setIsLoading(true);
      setError(null);

      try {
        // Dynamic import for code splitting and performance
        const seoModule = await import(`@/locales/tools/seo-content/${toolName}.json`);
        const seoData = seoModule.default || seoModule;
        
        // Get content for current locale, fallback to English
        const localeContent = seoData[currentLocale] || seoData['en'];
        
        if (!localeContent) {
          throw new Error(`SEO content not found for tool: ${toolName}`);
        }

        setContent(localeContent);
      } catch (err) {
        console.warn(`Failed to load SEO content for ${toolName}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load SEO content');
      } finally {
        setIsLoading(false);
      }
    };

    loadSEOContent();
  }, [toolName, currentLocale]);

  return {
    content,
    isLoading,
    error,
    hasContent: !!content && !isLoading && !error
  };
}

// Helper hook for specific sections
export function useSEOContentSection(toolName: string, sectionName: keyof SEOContent['sections']) {
  const { content, isLoading, error, hasContent } = useSEOContent(toolName);
  
  return {
    section: content?.sections[sectionName] || null,
    isLoading,
    error,
    hasSection: hasContent && !!content?.sections[sectionName]
  };
}