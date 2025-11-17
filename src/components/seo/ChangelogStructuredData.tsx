'use client';

import { usePathname } from 'next/navigation';
import { getLocaleFromPathname } from '@/lib/i18n';

export function ChangelogStructuredData() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.net';

  const url =
    locale === 'en'
      ? `${baseUrl}/changelog`
      : locale === 'ru'
        ? `${baseUrl}/ru/changelog`
        : `${baseUrl}/de/changelog`;

  const localeConfig =
    locale === 'en'
      ? {
          name: 'Product Changelog - Text Case Converter',
          description:
            'Stay up-to-date with the latest changes, new tools, and improvements to our platform. Track new features, bug fixes, and enhancements.',
          inLanguage: 'en-US',
          homeLabel: 'Home',
          updatesName: 'Product Updates',
          updatesDescription: 'A chronological list of product updates, new features, and improvements',
          homeUrl: baseUrl
        }
      : locale === 'ru'
        ? {
            name: 'История Изменений - Конвертер Регистра Текста',
            description:
              'Будьте в курсе последних изменений, новых инструментов и улучшений платформы. Отслеживайте новые функции, исправления и улучшения.',
            inLanguage: 'ru-RU',
            homeLabel: 'Главная',
            updatesName: 'Обновления Продукта',
            updatesDescription: 'Хронологический список обновлений продукта, новых функций и улучшений',
            homeUrl: `${baseUrl}/ru`
          }
        : {
            name: 'Produkt-Änderungsprotokoll - Text Case Converter',
            description:
              'Bleiben Sie auf dem Laufenden über die neuesten Änderungen, neuen Werkzeuge und Verbesserungen unserer Plattform. Verfolgen Sie neue Funktionen, Fehlerbehebungen und Verbesserungen.',
            inLanguage: 'de-DE',
            homeLabel: 'Startseite',
            updatesName: 'Produktupdates',
            updatesDescription: 'Eine chronologische Liste von Produktupdates, neuen Funktionen und Verbesserungen',
            homeUrl: `${baseUrl}/de`
          };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url: url,
    name: localeConfig.name,
    description: localeConfig.description,
    inLanguage: localeConfig.inLanguage,
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
          name: localeConfig.homeLabel,
          item: localeConfig.homeUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name:
            locale === 'en'
              ? 'Changelog'
              : locale === 'ru'
                ? 'История Изменений'
                : 'Änderungsprotokoll',
          item: url
        }
      ]
    },
    mainEntity: {
      '@type': 'ItemList',
      name: localeConfig.updatesName,
      description: localeConfig.updatesDescription,
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
