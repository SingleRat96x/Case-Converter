import type { Metadata } from 'next';
import { ChangelogContent } from '@/components/pages/ChangelogContent';
import { generateCanonicalUrl, generateHreflangLinks } from '@/lib/seo';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const pathname = '/changelog';
  const locale = 'ru';
  const canonicalUrl = generateCanonicalUrl(pathname, locale);
  const alternateLinks = generateHreflangLinks(pathname);

  return {
    title: 'История Изменений - Конвертер Регистра Текста',
    description: 'Будьте в курсе последних изменений, новых инструментов и улучшений платформы. Отслеживайте новые функции, исправления и улучшения.',
    keywords: ['история изменений', 'обновления продукта', 'новые функции', 'исправления ошибок', 'улучшения', 'примечания к выпуску'],
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
      }, {} as Record<string, string>)
    },
    
    openGraph: {
      title: 'История Изменений - Конвертер Регистра Текста',
      description: 'Будьте в курсе последних изменений, новых инструментов и улучшений платформы.',
      type: 'website',
      locale: 'ru_RU',
      alternateLocale: 'en_US',
      url: canonicalUrl,
      siteName: 'Text Case Converter',
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'История Изменений Text Case Converter'
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: 'История Изменений - Конвертер Регистра Текста',
      description: 'Будьте в курсе последних изменений, новых инструментов и улучшений.',
      site: '@textcaseconverter',
      images: ['/images/og-default.jpg']
    },
  };
}

export default function ChangelogPageRu() {
  return <ChangelogContent />;
}
