import { supabase } from './supabase';

export type PageType = 'index' | 'tool' | 'static' | 'category';

export interface MetaDescription {
  id: string;
  page_type: PageType;
  page_id: string;
  // SEO Meta Tags
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  // Open Graph Tags
  og_title?: string;
  og_description?: string;
  og_type?: string;
  og_image?: string;
  og_url?: string;
  // Twitter Card Tags
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  // Canonical URL
  canonical_url?: string;
  // Tracking
  updated_at: string;
}

// Cache object to store meta descriptions
const metaCache: {
  [key: string]: { content: MetaDescription; timestamp: number };
} = {};
const CACHE_DURATION = 36000000; // 10 hours in milliseconds

// Helper function to generate cache key
function getCacheKey(pageType: PageType, pageId: string): string {
  return `${pageType}:${pageId}`;
}

// Get meta description for a specific page
export async function getMetaDescription(
  pageType: PageType,
  pageId: string
): Promise<MetaDescription | null> {
  try {
    const cacheKey = getCacheKey(pageType, pageId);
    const cachedContent = metaCache[cacheKey];
    const now = Date.now();

    if (
      cachedContent &&
      cachedContent.timestamp > 0 &&
      now - cachedContent.timestamp < CACHE_DURATION
    ) {
      return cachedContent.content;
    }

    const { data, error } = await supabase
      .from('meta_descriptions')
      .select('*')
      .eq('page_type', pageType)
      .eq('page_id', pageId)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      metaCache[cacheKey] = {
        content: data,
        timestamp: now,
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching meta description:', error);
    return null;
  }
}

// Get all meta descriptions
export async function getAllMetaDescriptions(): Promise<MetaDescription[]> {
  try {
    const { data, error } = await supabase
      .from('meta_descriptions')
      .select('*')
      .order('page_type')
      .order('page_id');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all meta descriptions:', error);
    return [];
  }
}

// Create or update meta description
export async function upsertMetaDescription(
  meta: Omit<MetaDescription, 'id' | 'updated_at'>
): Promise<MetaDescription | null> {
  try {
    const id =
      meta.page_id === 'index' ? 'index' : `${meta.page_type}-${meta.page_id}`;

    const { data, error } = await supabase
      .from('meta_descriptions')
      .upsert({
        ...meta,
        id,
        og_type: meta.og_type || 'website',
        twitter_card: meta.twitter_card || 'summary_large_image',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Invalidate cache
    invalidateMetaCache(meta.page_type, meta.page_id);

    return data;
  } catch (error) {
    console.error('Error upserting meta description:', error);
    return null;
  }
}

// Delete meta description
export async function deleteMetaDescription(
  pageType: PageType,
  pageId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('meta_descriptions')
      .delete()
      .eq('page_type', pageType)
      .eq('page_id', pageId);

    if (error) {
      throw error;
    }

    // Invalidate cache
    invalidateMetaCache(pageType, pageId);

    return true;
  } catch (error) {
    console.error('Error deleting meta description:', error);
    return false;
  }
}

// Invalidate cache for a specific page
export function invalidateMetaCache(pageType: PageType, pageId: string): void {
  const cacheKey = getCacheKey(pageType, pageId);
  delete metaCache[cacheKey];
}

// Invalidate all meta description caches
export function invalidateAllMetaCaches(): void {
  Object.keys(metaCache).forEach(key => {
    delete metaCache[key];
  });
}

// Get default meta description for a page type
export function getDefaultMetaDescription(
  pageType: PageType,
  title: string
): Partial<MetaDescription> {
  const baseDescription =
    'Free online tool for text transformation and analysis.';
  const domain = 'https://case-converter.vercel.app';

  return {
    meta_title: `${title} - Text Case Converter`,
    meta_description: baseDescription,
    meta_keywords: 'text converter, text tools, online text tools',
    og_title: title,
    og_description: baseDescription,
    og_type: 'website',
    twitter_card: 'summary_large_image',
    twitter_title: title,
    twitter_description: baseDescription,
    canonical_url: `${domain}${pageType === 'tool' ? `/tools/${title.toLowerCase()}` : ''}`,
  };
}
