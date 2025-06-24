import type { Metadata } from 'next';
import { getMetaDescription, type PageType } from './meta-descriptions';

export async function generatePageMetadata(
  pageType: PageType,
  pageId: string,
  fallbackTitle: string,
  fallbackDescription: string
): Promise<Metadata> {
  const meta = await getMetaDescription(pageType, pageId);

  if (!meta) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
    };
  }

  return {
    title: meta.meta_title,
    description: meta.meta_description,
    keywords: meta.meta_keywords,
    openGraph: {
      title: meta.og_title || meta.meta_title,
      description: meta.og_description || meta.meta_description,
      type: (meta.og_type || 'website') as 'website',
      url: meta.canonical_url,
    },
    twitter: {
      card: meta.twitter_card as 'summary' | 'summary_large_image',
      title: meta.twitter_title || meta.meta_title,
      description: meta.twitter_description || meta.meta_description,
    },
    alternates: {
      canonical: meta.canonical_url,
    },
  };
}
