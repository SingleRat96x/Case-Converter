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

  // Changelog data - in production, you'd fetch this from your data source
  const changelogEntries = [
    {
      id: 'nov-2025-reading-time',
      title: 'Reading Time Estimator',
      description: 'Calculate reading time for your content with adjustable speed settings',
      date: new Date('2025-11-05').toUTCString(),
      category: 'New Feature'
    },
    {
      id: 'nov-2025-locale-switcher',
      title: 'Locale Switcher Enhancement',
      description: 'Added country flags to language selector for better visibility',
      date: new Date('2025-11-05').toUTCString(),
      category: 'Improvement'
    },
    {
      id: 'oct-2025-json-formatter',
      title: 'JSON Formatter & Validator',
      description: 'Format and validate JSON with syntax highlighting and real-time error detection',
      date: new Date('2025-10-31').toUTCString(),
      category: 'New Feature'
    },
    {
      id: 'oct-2025-case-converters',
      title: 'Case Converter Suite',
      description: 'Added Kebab Case, Snake Case, and Camel Case converters',
      date: new Date('2025-10-31').toUTCString(),
      category: 'New Feature'
    },
    {
      id: 'oct-2025-email-extraction',
      title: 'Email Extraction Tools',
      description: 'Extract emails from text and PDF files with advanced filtering options',
      date: new Date('2025-10-28').toUTCString(),
      category: 'New Feature'
    },
    {
      id: 'oct-2025-performance',
      title: 'Performance Optimization',
      description: 'Improved page load speed with font preloading and critical resource hints',
      date: new Date('2025-10-09').toUTCString(),
      category: 'Improvement'
    },
    {
      id: 'oct-2025-js-fix',
      title: 'JavaScript Loading Issues',
      description: 'Resolved chunk loading errors affecting some users',
      date: new Date('2025-10-29').toUTCString(),
      category: 'Bug Fix'
    },
    {
      id: 'aug-2025-mobile-nav',
      title: 'Mobile Navigation Redesign',
      description: 'Complete revamp of mobile menu with modern UI/UX patterns and improved touch interactions',
      date: new Date('2025-08-17').toUTCString(),
      category: 'Improvement'
    },
    {
      id: 'aug-2025-accessibility',
      title: 'Enhanced Accessibility',
      description: 'Added keyboard navigation and drag interactions for better mobile user experience',
      date: new Date('2025-08-08').toUTCString(),
      category: 'Improvement'
    },
    {
      id: 'aug-2025-footer-fix',
      title: 'Footer Links Validation',
      description: 'Verified and fixed all footer navigation links for accuracy',
      date: new Date('2025-08-08').toUTCString(),
      category: 'Bug Fix'
    }
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Text Case Converter - Product Changelog</title>
    <link>${baseUrl}/changelog</link>
    <description>Stay up-to-date with the latest changes, new tools, and improvements to our platform. Track new features, bug fixes, and enhancements.</description>
    <language>en-US</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/changelog/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js</generator>
    <webMaster>support@textcaseconverter.net (Text Case Converter Team)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} Text Case Converter. All rights reserved.</copyright>
    <category>Technology</category>
    <image>
      <url>${baseUrl}/images/og-default.jpg</url>
      <title>Text Case Converter</title>
      <link>${baseUrl}/changelog</link>
    </image>
${changelogEntries.map(entry => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <description>${escapeXml(entry.description)}</description>
      <link>${baseUrl}/changelog#${entry.id}</link>
      <guid isPermaLink="true">${baseUrl}/changelog#${entry.id}</guid>
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
