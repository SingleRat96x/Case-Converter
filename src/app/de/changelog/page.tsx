import type { Metadata } from 'next';
import { ChangelogContent } from '@/components/pages/ChangelogContent';
import { generateCanonicalUrl, generateHreflangLinks } from '@/lib/seo';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const pathname = '/changelog';
  const locale = 'de';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.net';
  const canonicalUrl = generateCanonicalUrl(pathname, locale);
  const alternateLinks = generateHreflangLinks(pathname);

  return {
    title: 'Produkt-Änderungsprotokoll - Text Case Converter',
    description: 'Bleiben Sie auf dem Laufenden über die neuesten Änderungen, neuen Werkzeuge und Verbesserungen unserer Plattform. Verfolgen Sie neue Funktionen, Fehlerbehebungen und Verbesserungen.',
    keywords: ['Änderungsprotokoll', 'Produkt-Updates', 'neue Funktionen', 'Fehlerbehebungen', 'Verbesserungen', 'Release Notes', 'Versionshistorie'],
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
        'application/rss+xml': `${baseUrl}/de/changelog/feed.xml`
      }
    },
    
    openGraph: {
      title: 'Produkt-Änderungsprotokoll - Text Case Converter',
      description: 'Bleiben Sie auf dem Laufenden über die neuesten Änderungen, neuen Werkzeuge und Verbesserungen unserer Plattform.',
      type: 'website',
      locale: 'de_DE',
      alternateLocale: ['en_US', 'ru_RU'],
      url: canonicalUrl,
      siteName: 'Text Case Converter',
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'Text Case Converter Änderungsprotokoll'
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: 'Produkt-Änderungsprotokoll - Text Case Converter',
      description: 'Bleiben Sie auf dem Laufenden über die neuesten Änderungen, neuen Werkzeuge und Verbesserungen.',
      site: '@textcaseconverter',
      images: ['/images/og-default.jpg']
    },
  };
}

export default function ChangelogPage() {
  return <ChangelogContent />;
}
