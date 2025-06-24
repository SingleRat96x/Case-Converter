import { supabase } from './supabase';

export interface PageContent {
  id: string;
  title: string;
  short_description: string | null;
  long_description: string | null;
  updated_at: string;
}

// Cache object to store page content
const pageContentCache: {
  [key: string]: { content: PageContent; timestamp: number };
} = {};
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function getPageContent(
  pageId: string
): Promise<PageContent | null> {
  try {
    // Check if we have a valid cached version
    const cachedContent = pageContentCache[pageId];
    const now = Date.now();

    if (
      cachedContent &&
      cachedContent.timestamp > 0 &&
      now - cachedContent.timestamp < CACHE_DURATION
    ) {
      return cachedContent.content;
    }

    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      pageContentCache[pageId] = {
        content: data,
        timestamp: now,
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching page content:', error);
    return null;
  }
}

export function invalidatePageCache(pageId: string) {
  delete pageContentCache[pageId];
}
