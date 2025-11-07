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

  // German Changelog data
  const changelogEntries = [
    {
      id: 'nov-2025-sha1-hash',
      title: 'SHA-1 Hash-Generator',
      description: 'Generieren Sie SHA-1-Hashes online mit Dateiüberprüfungsunterstützung und Legacy-Systemkompatibilität. Enthält Sicherheitshinweise für moderne Anwendungen',
      date: new Date('2025-11-07').toUTCString(),
      category: 'Neue Funktion'
    },
    {
      id: 'nov-2025-prefix-suffix',
      title: 'Präfix und Suffix zu Zeilen hinzufügen',
      description: 'Fügen Sie jeder Zeile ein benutzerdefiniertes Präfix und Suffix hinzu mit der Option, leere Zeilen zu ignorieren. Perfekt für Code-Kommentare, Markdown und Datenformatierung',
      date: new Date('2025-11-06').toUTCString(),
      category: 'Neue Funktion'
    },
    {
      id: 'nov-2025-line-numbers',
      title: 'Zeilennummern zu Text hinzufügen',
      description: 'Fügen Sie anpassbare Zeilennummern mit mehreren Formaten (numerisch, alphabetisch, römische Ziffern), Trennzeichen und erweiterten Filteroptionen hinzu',
      date: new Date('2025-11-05').toUTCString(),
      category: 'Neue Funktion'
    },
    {
      id: 'nov-2025-reading-time',
      title: 'Lesezeit-Schätzer',
      description: 'Berechnen Sie die Lesezeit für Ihren Inhalt mit einstellbaren Geschwindigkeitseinstellungen',
      date: new Date('2025-11-03').toUTCString(),
      category: 'Neue Funktion'
    },
    {
      id: 'nov-2025-locale-switcher',
      title: 'Verbesserung des Sprachwechslers',
      description: 'Länderflaggen zum Sprachwähler hinzugefügt für bessere Sichtbarkeit',
      date: new Date('2025-11-05').toUTCString(),
      category: 'Verbesserung'
    },
    {
      id: 'oct-2025-json-formatter',
      title: 'JSON Formatierer & Validator',
      description: 'Formatieren und validieren Sie JSON mit Syntaxhervorhebung und Echtzeit-Fehlererkennung',
      date: new Date('2025-10-31').toUTCString(),
      category: 'Neue Funktion'
    },
    {
      id: 'oct-2025-case-converters',
      title: 'Case-Converter-Suite',
      description: 'Kebab Case, Snake Case und Camel Case Konverter hinzugefügt',
      date: new Date('2025-10-31').toUTCString(),
      category: 'Neue Funktion'
    },
    {
      id: 'oct-2025-email-extraction',
      title: 'E-Mail-Extraktionswerkzeuge',
      description: 'E-Mails aus Text- und PDF-Dateien mit erweiterten Filteroptionen extrahieren',
      date: new Date('2025-10-28').toUTCString(),
      category: 'Neue Funktion'
    },
    {
      id: 'oct-2025-performance',
      title: 'Leistungsoptimierung',
      description: 'Verbesserte Seitenladegeschwindigkeit durch Schriftarten-Preloading und kritische Ressourcen-Hints',
      date: new Date('2025-10-09').toUTCString(),
      category: 'Verbesserung'
    },
    {
      id: 'oct-2025-js-fix',
      title: 'JavaScript-Ladeprobleme',
      description: 'Chunk-Ladefehler behoben, die einige Benutzer betrafen',
      date: new Date('2025-10-29').toUTCString(),
      category: 'Fehlerbehebung'
    },
    {
      id: 'aug-2025-mobile-nav',
      title: 'Neugestaltung der mobilen Navigation',
      description: 'Komplette Überarbeitung des mobilen Menüs mit modernen UI/UX-Mustern und verbesserten Touch-Interaktionen',
      date: new Date('2025-08-17').toUTCString(),
      category: 'Verbesserung'
    },
    {
      id: 'aug-2025-accessibility',
      title: 'Verbesserte Barrierefreiheit',
      description: 'Tastaturnavigation und Drag-Interaktionen für bessere mobile Benutzererfahrung hinzugefügt',
      date: new Date('2025-08-08').toUTCString(),
      category: 'Verbesserung'
    },
    {
      id: 'aug-2025-footer-fix',
      title: 'Validierung der Footer-Links',
      description: 'Alle Footer-Navigationslinks auf Genauigkeit überprüft und korrigiert',
      date: new Date('2025-08-08').toUTCString(),
      category: 'Fehlerbehebung'
    }
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Text Case Converter - Produkt-Änderungsprotokoll</title>
    <link>${baseUrl}/de/changelog</link>
    <description>Bleiben Sie auf dem Laufenden über die neuesten Änderungen, neuen Werkzeuge und Verbesserungen unserer Plattform. Verfolgen Sie neue Funktionen, Fehlerbehebungen und Verbesserungen.</description>
    <language>de-DE</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/de/changelog/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Next.js</generator>
    <webMaster>support@textcaseconverter.net (Text Case Converter Team)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} Text Case Converter. Alle Rechte vorbehalten.</copyright>
    <category>Technologie</category>
    <image>
      <url>${baseUrl}/images/og-default.jpg</url>
      <title>Text Case Converter</title>
      <link>${baseUrl}/de/changelog</link>
    </image>
${changelogEntries.map(entry => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <description>${escapeXml(entry.description)}</description>
      <link>${baseUrl}/de/changelog#${entry.id}</link>
      <guid isPermaLink="true">${baseUrl}/de/changelog#${entry.id}</guid>
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
