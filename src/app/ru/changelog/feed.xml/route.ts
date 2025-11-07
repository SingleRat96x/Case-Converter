import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.net';
  const currentDate = new Date().toUTCString();

  // Helper function to escape XML entities
  const escapeXml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Changelog data in Russian
  const changelogEntries = [
    {
      id: 'nov-2025-sha1-hash',
      title: 'Генератор SHA-1 Хеша',
      description: 'Генерируйте SHA-1 хэши онлайн с поддержкой проверки файлов и совместимостью с устаревшими системами. Включает уведомления о безопасности',
      date: new Date('2025-11-07').toUTCString(),
      category: 'Новая Функция'
    },
    {
      id: 'nov-2025-prefix-suffix',
      title: 'Добавить Префикс и Суффикс к Строкам',
      description: 'Добавляйте пользовательский префикс и суффикс к каждой строке с опцией игнорирования пустых строк. Идеально для комментариев кода, markdown и форматирования данных',
      date: new Date('2025-11-06').toUTCString(),
      category: 'Новая Функция'
    },
    {
      id: 'nov-2025-line-numbers',
      title: 'Добавить Номера Строк к Тексту',
      description: 'Добавляйте настраиваемые номера строк с множеством форматов (числовые, алфавитные, римские цифры), разделителями и расширенными опциями фильтрации',
      date: new Date('2025-11-05').toUTCString(),
      category: 'Новая Функция'
    },
    {
      id: 'nov-2025-reading-time',
      title: 'Калькулятор Времени Чтения',
      description: 'Рассчитайте время чтения вашего контента с настраиваемой скоростью',
      date: new Date('2025-11-03').toUTCString(),
      category: 'Новая Функция'
    },
    {
      id: 'nov-2025-locale-switcher',
      title: 'Улучшение Переключателя Языка',
      description: 'Добавлены флаги стран в переключатель языка для лучшей видимости',
      date: new Date('2025-11-05').toUTCString(),
      category: 'Улучшение'
    },
    {
      id: 'oct-2025-json-formatter',
      title: 'JSON Форматировщик и Валидатор',
      description: 'Форматирование и валидация JSON с подсветкой синтаксиса и обнаружением ошибок в реальном времени',
      date: new Date('2025-10-31').toUTCString(),
      category: 'Новая Функция'
    },
    {
      id: 'oct-2025-case-converters',
      title: 'Набор Конвертеров Регистра',
      description: 'Добавлены конвертеры Kebab Case, Snake Case и Camel Case',
      date: new Date('2025-10-31').toUTCString(),
      category: 'Новая Функция'
    },
    {
      id: 'oct-2025-email-extraction',
      title: 'Инструменты Извлечения Email',
      description: 'Извлечение email из текста и PDF файлов с расширенными опциями фильтрации',
      date: new Date('2025-10-28').toUTCString(),
      category: 'Новая Функция'
    },
    {
      id: 'oct-2025-performance',
      title: 'Оптимизация Производительности',
      description: 'Улучшена скорость загрузки страниц с предзагрузкой шрифтов и критических ресурсов',
      date: new Date('2025-10-09').toUTCString(),
      category: 'Улучшение'
    },
    {
      id: 'oct-2025-js-fix',
      title: 'Проблемы Загрузки JavaScript',
      description: 'Устранены ошибки загрузки чанков, затрагивающие некоторых пользователей',
      date: new Date('2025-10-29').toUTCString(),
      category: 'Исправление'
    },
    {
      id: 'aug-2025-mobile-nav',
      title: 'Редизайн Мобильной Навигации',
      description: 'Полный редизайн мобильного меню с современными UI/UX паттернами и улучшенными сенсорными взаимодействиями',
      date: new Date('2025-08-17').toUTCString(),
      category: 'Улучшение'
    },
    {
      id: 'aug-2025-accessibility',
      title: 'Улучшенная Доступность',
      description: 'Добавлена навигация с клавиатуры и взаимодействия перетаскиванием для лучшего мобильного опыта',
      date: new Date('2025-08-08').toUTCString(),
      category: 'Улучшение'
    },
    {
      id: 'aug-2025-footer-fix',
      title: 'Проверка Ссылок в Футере',
      description: 'Проверены и исправлены все навигационные ссылки в футере для точности',
      date: new Date('2025-08-08').toUTCString(),
      category: 'Исправление'
    }
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Text Case Converter - История Изменений</title>
    <link>${baseUrl}/ru/changelog</link>
    <description>Будьте в курсе последних изменений, новых инструментов и улучшений платформы. Отслеживайте новые функции, исправления и улучшения.</description>
    <language>ru-RU</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/ru/changelog/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js</generator>
    <webMaster>support@textcaseconverter.net (Text Case Converter Team)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} Text Case Converter. Все права защищены.</copyright>
    <category>Технологии</category>
    <image>
      <url>${baseUrl}/images/og-default.jpg</url>
      <title>Text Case Converter</title>
      <link>${baseUrl}/ru/changelog</link>
    </image>
${changelogEntries.map(entry => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <description>${escapeXml(entry.description)}</description>
      <link>${baseUrl}/ru/changelog#${entry.id}</link>
      <guid isPermaLink="true">${baseUrl}/ru/changelog#${entry.id}</guid>
      <pubDate>${entry.date}</pubDate>
      <category>${escapeXml(entry.category)}</category>
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
