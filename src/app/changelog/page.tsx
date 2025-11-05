import type { Metadata } from 'next';
import { ChangelogContent } from '@/components/pages/ChangelogContent';
import { generateCanonicalUrl, generateHreflangLinks } from '@/lib/seo';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const pathname = '/changelog';
  const locale = 'en';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.net';
  const canonicalUrl = generateCanonicalUrl(pathname, locale);
  const alternateLinks = generateHreflangLinks(pathname);

  return {
    title: 'Product Changelog - Text Case Converter',
    description: 'Stay up-to-date with the latest changes, new tools, and improvements to our platform. Track new features, bug fixes, and enhancements.',
    keywords: ['changelog', 'product updates', 'new features', 'bug fixes', 'improvements', 'release notes', 'version history'],
    authors: [{ name: 'Text Case Converter Team' }],
    creator: 'Text Case Converter',
    publisher: 'Text Case Converter',
    robots: 'index, follow',
    
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLinks.reduce((acc, link) => {
        if (link.hreflang !== 'x-default') {
          acc[link.hreflang] = link.href;
        }
        return acc;
      }, {} as Record<string, string>),
      types: {
        'application/rss+xml': `${baseUrl}/changelog/feed.xml`
      }
    },
    
    openGraph: {
      title: 'Product Changelog - Text Case Converter',
      description: 'Stay up-to-date with the latest changes, new tools, and improvements to our platform.',
      type: 'website',
      locale: 'en_US',
      alternateLocale: 'ru_RU',
      url: canonicalUrl,
      siteName: 'Text Case Converter',
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'Text Case Converter Changelog'
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: 'Product Changelog - Text Case Converter',
      description: 'Stay up-to-date with the latest changes, new tools, and improvements.',
      site: '@textcaseconverter',
      images: ['/images/og-default.jpg']
    },
  };
}

export default function ChangelogPage() {
  return <ChangelogContent />;
}
