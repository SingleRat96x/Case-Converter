'use client';

import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';

export function ChangelogStructuredData() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.net';
  const url = locale === 'en' ? `${baseUrl}/changelog` : `${baseUrl}/ru/changelog`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url: url,
    name: locale === 'en' ? 'Product Changelog - Text Case Converter' : 'История Изменений - Конвертер Регистра Текста',
    description: locale === 'en' 
      ? 'Stay up-to-date with the latest changes, new tools, and improvements to our platform. Track new features, bug fixes, and enhancements.'
      : 'Будьте в курсе последних изменений, новых инструментов и улучшений платформы. Отслеживайте новые функции, исправления и улучшения.',
    inLanguage: locale === 'en' ? 'en-US' : 'ru-RU',
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Text Case Converter',
      description: 'Professional text transformation tools for developers, writers, and content creators',
      publisher: {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Text Case Converter',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/images/og-default.jpg`,
          width: 1200,
          height: 630
        }
      }
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: locale === 'en' ? 'Home' : 'Главная',
          item: locale === 'en' ? baseUrl : `${baseUrl}/ru`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: locale === 'en' ? 'Changelog' : 'История Изменений',
          item: url
        }
      ]
    },
    mainEntity: {
      '@type': 'ItemList',
      name: locale === 'en' ? 'Product Updates' : 'Обновления Продукта',
      description: locale === 'en' 
        ? 'A chronological list of product updates, new features, and improvements'
        : 'Хронологический список обновлений продукта, новых функций и улучшений',
      itemListOrder: 'https://schema.org/ItemListOrderDescending'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
