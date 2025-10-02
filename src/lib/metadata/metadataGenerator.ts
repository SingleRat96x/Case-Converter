import { Metadata } from 'next';
import { generateHreflangLinks, generateCanonicalUrl } from '../seo';
import { getToolMetadataLocalized } from './toolMetadata';
import { MetadataGenerationOptions } from './types';
import type { Locale } from '../i18n';

/**
 * Generate comprehensive metadata for tool pages
 */
export async function generateToolMetadata(
  toolSlug: string,
  options: MetadataGenerationOptions
): Promise<Metadata> {
  const { locale = 'en', pathname, overrides } = options;
  const toolConfig = getToolMetadataLocalized(toolSlug, locale);
  
  // If no tool metadata found, fallback to generic
  if (!toolConfig) {
    return generateGenericMetadata({ locale, pathname });
  }
  
  // Apply any runtime overrides
  const finalConfig = { ...toolConfig, ...overrides };
  
  // Generate SEO URLs
  const canonicalUrl = generateCanonicalUrl(pathname, locale);
  const alternateLinks = generateHreflangLinks(pathname);
  
  // Build comprehensive metadata
  const metadata: Metadata = {
    title: finalConfig.title,
    description: finalConfig.description,
    authors: [{ name: "Text Case Converter Team" }],
    creator: "Text Case Converter",
    publisher: "Text Case Converter",
    robots: "index, follow",
    
    // Canonical and alternate languages
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLinks.reduce((acc, link) => {
        if (link.hreflang !== 'x-default') {
          acc[link.hreflang] = link.href;
        }
        return acc;
      }, {} as Record<string, string>)
    },
    
    // Open Graph
    openGraph: {
      title: finalConfig.alternateTitle || finalConfig.title,
      description: finalConfig.shortDescription || finalConfig.description,
      type: "website",
      locale: locale === 'en' ? 'en_US' : 'ru_RU',
      alternateLocale: locale === 'en' ? 'ru_RU' : 'en_US',
      url: canonicalUrl,
      siteName: "Text Case Converter",
      images: finalConfig.ogImage ? [finalConfig.ogImage] : undefined,
    },
    
    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: finalConfig.alternateTitle || finalConfig.title,
      description: finalConfig.shortDescription || finalConfig.description,
    }
  };
  
  // Ensure default social images and alt text
  const defaultOgImage = { url: '/images/og-default.jpg', width: 1200, height: 630, alt: finalConfig.alternateTitle || finalConfig.title };
  {
    type OGImage = string | { url: string; width?: number; height?: number; alt?: string };
    const currentImages = metadata.openGraph?.images as undefined | OGImage | OGImage[];
    const imagesArray: Array<{ url: string; width?: number; height?: number; alt?: string }> = Array.isArray(currentImages)
      ? currentImages.map(img => (typeof img === 'string' ? { url: img } : img))
      : currentImages
        ? (typeof currentImages === 'string' ? [{ url: currentImages }] : [currentImages])
        : [];
    metadata.openGraph = {
      ...(metadata.openGraph || {}),
      images: imagesArray.length > 0 ? imagesArray : [defaultOgImage]
    };
  }
  {
    const tw = metadata.twitter || {};
    const twImages = (tw as { images?: string[] }).images;
    metadata.twitter = {
      ...tw,
      images: Array.isArray(twImages) ? twImages : ['/images/og-default.jpg'],
      site: (tw as { site?: string }).site || '@textcaseconverter'
    };
  }

  // Add structured data if configured - handled separately, not in metadata.other
  if (finalConfig.schema) {
    // Structured data will be handled by a separate component or head tag
    // For now, we'll skip adding it to metadata.other to avoid type issues
  }
  
  return metadata;
}

/**
 * Fallback for tools without custom metadata
 */
function generateGenericMetadata(options: { locale: Locale; pathname: string }): Metadata {
  const { locale, pathname } = options;
  
  // Ensure locale is a valid string
  const validLocale: Locale = typeof locale === 'string' ? locale as Locale : 'en';
  
  const canonicalUrl = generateCanonicalUrl(pathname, validLocale);
  const alternateLinks = generateHreflangLinks(pathname);
  
  return {
    title: "Text Case Converter - Professional Text Tools",
    description: "Professional text transformation and utility tools for developers, writers, and content creators.",
    authors: [{ name: "Text Case Converter Team" }],
    creator: "Text Case Converter",
    publisher: "Text Case Converter",
    robots: "index, follow",
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLinks.reduce((acc, link) => {
        if (link.hreflang !== 'x-default') {
          acc[link.hreflang] = link.href;
        }
        return acc;
      }, {} as Record<string, string>)
    },
    openGraph: {
      title: "Text Case Converter",
      description: "Professional text tools",
      type: "website",
      locale: validLocale === 'en' ? 'en_US' : 'ru_RU',
      alternateLocale: validLocale === 'en' ? 'ru_RU' : 'en_US',
      url: canonicalUrl,
      siteName: "Text Case Converter",
    },
    twitter: {
      card: "summary_large_image",
      title: "Text Case Converter",
      description: "Professional text tools",
    }
  };
}