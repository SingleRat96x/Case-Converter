// Server-safe component emitting JSON-LD

export default function SiteStructuredData() {
  const baseUrl = 'https://textcaseconverter.net';

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Text Case Converter',
    url: baseUrl,
    inLanguage: ['en', 'ru'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/tools?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Text Case Converter',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/globe.svg`
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
    </>
  );
}

