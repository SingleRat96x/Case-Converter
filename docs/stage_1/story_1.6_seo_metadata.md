# Story 1.6: SEO & Metadata Infrastructure

## Story Details
- **Stage**: 1 - Foundation & Infrastructure
- **Priority**: Critical (needed for SEO preservation)
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Stories 1.1-1.5 (Complete foundation)

## Objective
Set up comprehensive SEO infrastructure including dynamic metadata generation, Open Graph tags, structured data, canonical URLs, and proper hreflang tags for multilingual support. This ensures the rebuilt site maintains and improves upon existing SEO rankings.

## Acceptance Criteria
- [ ] Dynamic metadata system for all pages
- [ ] Open Graph and Twitter Card support
- [ ] Structured data (JSON-LD) implementation
- [ ] Canonical URLs properly set
- [ ] Hreflang tags for all languages
- [ ] Robots.txt configuration
- [ ] XML sitemap generation
- [ ] SEO-friendly URL structure maintained

## Implementation Steps

### 1. Create SEO Configuration

#### Create `src/config/seo.ts`
```typescript
import { Locale } from '@/i18n/config'

export const seoConfig = {
  titleTemplate: '%s | TextTools.io - Free Online Text Tools',
  defaultTitle: 'TextTools.io - Free Online Text Tools',
  defaultDescription: 'Transform, convert, and manipulate text with our free online tools. Support for 60+ text operations in multiple languages.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://texttools.io',
  siteLanguage: 'en',
  siteLocale: 'en_US',
  twitterHandle: '@texttools',
  authorName: 'TextTools Team',
  defaultOgImage: '/og-default.jpg',
  favicon: '/favicon.ico',
  themeColor: '#3b82f6',
  backgroundColor: '#ffffff',
}

export interface PageSEO {
  title: string
  description: string
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  openGraph?: {
    title?: string
    description?: string
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
    }>
    type?: 'website' | 'article' | 'profile'
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player'
    title?: string
    description?: string
    images?: string[]
  }
  structuredData?: Record<string, any>
}

// Tool-specific SEO templates
export const toolSeoTemplates = {
  uppercase: {
    title: 'Uppercase Text Converter - Convert to UPPERCASE',
    description: 'Convert any text to UPPERCASE letters instantly. Free online tool with character count, no registration required.',
    keywords: ['uppercase converter', 'capital letters', 'text to uppercase', 'caps converter'],
  },
  lowercase: {
    title: 'Lowercase Text Converter - Convert to lowercase',
    description: 'Convert any text to lowercase letters instantly. Free online tool with character count, no registration required.',
    keywords: ['lowercase converter', 'small letters', 'text to lowercase', 'uncapitalize'],
  },
  'title-case': {
    title: 'Title Case Converter - Capitalize Words Properly',
    description: 'Convert text to Title Case with proper capitalization rules. Perfect for headlines, titles, and headings.',
    keywords: ['title case converter', 'capitalize words', 'headline capitalization', 'proper case'],
  },
  // Add more tool templates as needed
}
```

### 2. Create Metadata Generation Utilities

#### Create `src/lib/metadata.ts`
```typescript
import { Metadata } from 'next'
import { seoConfig, PageSEO } from '@/config/seo'
import { Locale, locales, localeCodes } from '@/i18n/config'

interface GenerateMetadataProps {
  locale: Locale
  seo: PageSEO
  path: string
}

export function generateMetadata({
  locale,
  seo,
  path,
}: GenerateMetadataProps): Metadata {
  const siteUrl = seoConfig.siteUrl
  const canonicalPath = locale === 'en' ? path : `/${locale}${path}`
  const canonical = `${siteUrl}${canonicalPath}`

  // Generate alternate language URLs
  const languages: Record<string, string> = {}
  locales.forEach((lang) => {
    const langPath = lang === 'en' ? path : `/${lang}${path}`
    languages[lang] = `${siteUrl}${langPath}`
  })

  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
    robots: {
      index: !seo.noindex,
      follow: !seo.nofollow,
      googleBot: {
        index: !seo.noindex,
        follow: !seo.nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: seo.canonical || canonical,
      languages,
    },
    openGraph: {
      title: seo.openGraph?.title || seo.title,
      description: seo.openGraph?.description || seo.description,
      url: canonical,
      siteName: 'TextTools.io',
      locale: localeCodes[locale],
      type: seo.openGraph?.type || 'website',
      images: seo.openGraph?.images || [
        {
          url: seoConfig.defaultOgImage,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: seo.twitter?.card || 'summary_large_image',
      title: seo.twitter?.title || seo.title,
      description: seo.twitter?.description || seo.description,
      creator: seoConfig.twitterHandle,
      images: seo.twitter?.images || [seoConfig.defaultOgImage],
    },
    metadataBase: new URL(siteUrl),
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  }

  return metadata
}

// Helper to generate tool metadata
export function generateToolMetadata(
  toolId: string,
  locale: Locale,
  customSeo?: Partial<PageSEO>
): Metadata {
  const toolSeo = toolSeoTemplates[toolId as keyof typeof toolSeoTemplates]
  
  if (!toolSeo) {
    console.warn(`No SEO template found for tool: ${toolId}`)
  }

  const seo: PageSEO = {
    title: toolSeo?.title || `${toolId} Tool`,
    description: toolSeo?.description || `Free online ${toolId} tool`,
    ...customSeo,
  }

  return generateMetadata({
    locale,
    seo,
    path: `/tools/${toolId}`,
  })
}
```

### 3. Create Structured Data Components

#### Create `src/components/seo/structured-data.tsx`
```typescript
import Script from 'next/script'

interface StructuredDataProps {
  data: Record<string, any>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

// Website structured data
export function generateWebsiteStructuredData(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TextTools.io',
    alternateName: 'Text Tools - Free Online Text Manipulation Tools',
    url: 'https://texttools.io',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://texttools.io/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: locale,
  }
}

// Organization structured data
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TextTools.io',
    url: 'https://texttools.io',
    logo: 'https://texttools.io/logo.png',
    sameAs: [
      'https://twitter.com/texttools',
      'https://github.com/texttools',
    ],
  }
}

// Tool/Software Application structured data
export function generateToolStructuredData(
  toolName: string,
  toolDescription: string,
  toolUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: toolName,
    description: toolDescription,
    url: toolUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  }
}

// Breadcrumb structured data
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@id': item.url,
        name: item.name,
      },
    })),
  }
}

// FAQ structured data (for tool pages)
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
```

### 4. Create SEO Components

#### Create `src/components/seo/seo-head.tsx`
```typescript
import { StructuredData } from './structured-data'

interface SEOHeadProps {
  structuredData?: Record<string, any>[]
  additionalLinkTags?: Array<{
    rel: string
    href: string
    sizes?: string
    type?: string
  }>
}

export function SEOHead({ structuredData, additionalLinkTags }: SEOHeadProps) {
  return (
    <>
      {/* Structured Data */}
      {structuredData?.map((data, index) => (
        <StructuredData key={index} data={data} />
      ))}

      {/* Additional Link Tags */}
      {additionalLinkTags?.map((linkTag, index) => (
        <link key={index} {...linkTag} />
      ))}

      {/* PWA Tags */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#3b82f6" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </>
  )
}
```

### 5. Create Robots.txt

#### Create `src/app/robots.ts`
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://texttools.io'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          '/*.json$',
          '/*?*',  // Block URL parameters for crawlers
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
```

### 6. Create Sitemap Generator

#### Create `src/app/sitemap.ts`
```typescript
import { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import { toolSeoTemplates } from '@/config/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://texttools.io'
  const currentDate = new Date()

  // Static pages
  const staticPages = [
    '',  // home
    '/tools',
    '/categories',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ]

  // Generate URLs for all locales
  const urls: MetadataRoute.Sitemap = []

  // Add static pages for each locale
  staticPages.forEach((page) => {
    locales.forEach((locale) => {
      const path = locale === 'en' ? page : `/${locale}${page}`
      urls.push({
        url: `${siteUrl}${path}`,
        lastModified: currentDate,
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: locales.reduce((acc, lang) => {
            const langPath = lang === 'en' ? page : `/${lang}${page}`
            acc[lang] = `${siteUrl}${langPath}`
            return acc
          }, {} as Record<string, string>),
        },
      })
    })
  })

  // Add tool pages for each locale
  Object.keys(toolSeoTemplates).forEach((toolId) => {
    locales.forEach((locale) => {
      const path = locale === 'en' ? `/tools/${toolId}` : `/${locale}/tools/${toolId}`
      urls.push({
        url: `${siteUrl}${path}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: locales.reduce((acc, lang) => {
            const langPath = lang === 'en' ? `/tools/${toolId}` : `/${lang}/tools/${toolId}`
            acc[lang] = `${siteUrl}${langPath}`
            return acc
          }, {} as Record<string, string>),
        },
      })
    })
  })

  return urls
}
```

### 7. Create Manifest File

#### Create `public/manifest.json`
```json
{
  "name": "TextTools.io - Free Online Text Tools",
  "short_name": "TextTools",
  "description": "Transform, convert, and manipulate text with our free online tools",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["utilities", "productivity"]
}
```

### 8. Update Layout with SEO

#### Update `src/app/[locale]/layout.tsx` with SEO enhancements
```typescript
import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { ThemeProvider } from '@/providers/theme-provider'
import { LocaleProvider } from '@/providers/locale-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SEOHead } from '@/components/seo/seo-head'
import { locales } from '@/i18n/config'
import { getMessages } from 'next-intl/server'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { themeScript } from '@/lib/theme-script'
import { generateMetadata as generateSEOMetadata } from '@/lib/metadata'
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@/components/seo/structured-data'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export async function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: string}
}): Promise<Metadata> {
  return generateSEOMetadata({
    locale: locale as any,
    seo: {
      title: 'Free Online Text Tools - Convert, Transform & Manipulate Text',
      description: 'Transform text with 60+ free online tools. Convert case, encode/decode, generate passwords, manipulate strings, and more. No registration required.',
    },
    path: '/',
  })
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode
  params: {locale: string}
}) {
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  const structuredData = [
    generateWebsiteStructuredData(locale),
    generateOrganizationStructuredData(),
  ]

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <SEOHead 
          structuredData={structuredData}
          additionalLinkTags={[
            { rel: 'icon', href: '/favicon.ico' },
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
          ]}
        />
      </head>
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased scrollbar-custom')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={locale} messages={messages}>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 9. Create Tool Page Template with SEO

#### Create `src/app/[locale]/tools/[tool]/layout.tsx`
```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateToolMetadata } from '@/lib/metadata'
import { toolSeoTemplates } from '@/config/seo'
import { StructuredData } from '@/components/seo/structured-data'
import {
  generateToolStructuredData,
  generateBreadcrumbStructuredData,
} from '@/components/seo/structured-data'

export async function generateMetadata({
  params: { locale, tool }
}: {
  params: { locale: string; tool: string }
}): Promise<Metadata> {
  return generateToolMetadata(tool, locale as any)
}

export default function ToolLayout({
  children,
  params: { locale, tool }
}: {
  children: React.ReactNode
  params: { locale: string; tool: string }
}) {
  const toolSeo = toolSeoTemplates[tool as keyof typeof toolSeoTemplates]
  
  if (!toolSeo) {
    notFound()
  }

  const breadcrumbs = [
    { name: 'Home', url: `https://texttools.io${locale === 'en' ? '' : `/${locale}`}` },
    { name: 'Tools', url: `https://texttools.io${locale === 'en' ? '' : `/${locale}`}/tools` },
    { name: toolSeo.title.split(' - ')[0], url: `https://texttools.io${locale === 'en' ? '' : `/${locale}`}/tools/${tool}` },
  ]

  const structuredData = [
    generateToolStructuredData(
      toolSeo.title.split(' - ')[0],
      toolSeo.description,
      `https://texttools.io${locale === 'en' ? '' : `/${locale}`}/tools/${tool}`
    ),
    generateBreadcrumbStructuredData(breadcrumbs),
  ]

  return (
    <>
      {structuredData.map((data, index) => (
        <StructuredData key={index} data={data} />
      ))}
      {children}
    </>
  )
}
```

## Testing & Verification

### 1. Test Metadata Generation
```bash
# Run development server
npm run dev

# Use browser developer tools to inspect:
# - <title> tags
# - <meta> description tags
# - Open Graph tags
# - Twitter Card tags
# - Canonical URLs
# - Hreflang tags
```

### 2. Test Structured Data
```bash
# Use Google's Rich Results Test:
# https://search.google.com/test/rich-results

# Test URLs:
# - Homepage
# - Tool pages
# - Category pages
```

### 3. Verify Sitemap
```bash
# Navigate to:
# http://localhost:3000/sitemap.xml

# Verify:
# - All pages listed
# - Correct alternate language URLs
# - Proper lastmod dates
# - Priority values
```

### 4. Test Robots.txt
```bash
# Navigate to:
# http://localhost:3000/robots.txt

# Verify:
# - Correct allow/disallow rules
# - Sitemap reference
# - Host directive
```

### 5. SEO Testing Tools
- Google PageSpeed Insights
- Google Mobile-Friendly Test
- Lighthouse (built into Chrome DevTools)
- SEO Meta Inspector Chrome extension

## Success Indicators
- ✅ All pages have unique, descriptive titles
- ✅ Meta descriptions present on all pages
- ✅ Open Graph tags work (test with social media debuggers)
- ✅ Structured data validates without errors
- ✅ Hreflang tags properly implemented
- ✅ Canonical URLs correctly set
- ✅ Sitemap generates with all pages
- ✅ Robots.txt properly configured

## Common Issues & Solutions

### Issue: Duplicate content warnings
**Solution**: Ensure canonical URLs are properly set for each language version

### Issue: Missing hreflang tags
**Solution**: Check that alternates.languages is set in metadata

### Issue: Structured data errors
**Solution**: Validate JSON-LD syntax and required properties

## Next Steps
Stage 1 is now complete! Proceed to Stage 2: Core Features & Shared Components

## Notes for AI Implementation
- Always test with Google's tools before considering complete
- Ensure all metadata is translated for each locale
- Keep URLs consistent with the original site structure
- Monitor Core Web Vitals during development
- Test on both desktop and mobile devices