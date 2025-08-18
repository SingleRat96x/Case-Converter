# Story 5.4: SEO Enhancement & Monitoring

## Story Details
- **Stage**: 5 - Integration, Testing & Performance
- **Priority**: Critical
- **Estimated Hours**: 6-8 hours
- **Dependencies**: Story 5.3 (Performance Optimization)

## Objective
Implement comprehensive SEO enhancements including structured data, meta tags optimization, XML sitemaps, and monitoring tools. Ensure proper URL redirects from the old site structure to maintain search rankings and implement analytics for tracking SEO performance.

## Acceptance Criteria
- [ ] 301 redirects for all old URLs
- [ ] Dynamic meta tags for all pages
- [ ] Structured data (JSON-LD) implementation
- [ ] XML sitemap generation
- [ ] Robots.txt optimization
- [ ] Canonical URLs for all pages
- [ ] Open Graph and Twitter Card tags
- [ ] Multi-language SEO support
- [ ] Google Search Console integration
- [ ] SEO monitoring dashboard
- [ ] Core Web Vitals tracking
- [ ] Broken link checker

## Implementation Steps

### 1. URL Redirect System

#### Create `src/middleware/redirects.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'

// Map of old URLs to new URLs
const redirectMap: Record<string, string> = {
  // Old tool URLs to new structure
  '/case-converter': '/tools/uppercase',
  '/text-case-converter': '/tools/multi-case',
  '/uppercase-converter': '/tools/uppercase',
  '/lowercase-converter': '/tools/lowercase',
  '/title-case-converter': '/tools/title-case',
  '/sentence-case-converter': '/tools/sentence-case',
  '/camelcase-converter': '/tools/camel-case',
  '/snake-case-converter': '/tools/snake-case',
  '/kebab-case-converter': '/tools/kebab-case',
  
  // Category redirects
  '/text-tools': '/tools',
  '/converters': '/tools/category/case-conversion',
  '/formatters': '/tools/category/text-formatting',
  '/generators': '/tools/category/text-generation',
  
  // Old blog/content URLs
  '/blog/how-to-convert-text-case': '/guides/text-case-conversion',
  '/faq': '/help',
}

// Regex patterns for dynamic redirects
const redirectPatterns: Array<{
  pattern: RegExp
  redirect: (match: RegExpMatchArray) => string
}> = [
  {
    // Old tool pattern: /tools.php?tool=uppercase
    pattern: /^\/tools\.php\?tool=(.+)$/,
    redirect: (match) => `/tools/${match[1].toLowerCase().replace(/_/g, '-')}`,
  },
  {
    // Old category pattern: /category.php?cat=converters
    pattern: /^\/category\.php\?cat=(.+)$/,
    redirect: (match) => `/tools/category/${match[1].toLowerCase()}`,
  },
]

export function handleRedirects(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname
  const search = request.nextUrl.search
  const fullPath = pathname + search
  
  // Check exact redirects
  if (redirectMap[pathname]) {
    return NextResponse.redirect(
      new URL(redirectMap[pathname], request.url),
      301 // Permanent redirect
    )
  }
  
  // Check pattern-based redirects
  for (const { pattern, redirect } of redirectPatterns) {
    const match = fullPath.match(pattern)
    if (match) {
      const newPath = redirect(match)
      return NextResponse.redirect(new URL(newPath, request.url), 301)
    }
  }
  
  // Handle trailing slashes
  if (pathname.endsWith('/') && pathname !== '/') {
    return NextResponse.redirect(
      new URL(pathname.slice(0, -1) + search, request.url),
      301
    )
  }
  
  return null
}

// Validate that all old URLs have redirects
export async function validateRedirects() {
  const oldUrls = [
    '/case-converter',
    '/uppercase-converter',
    '/tools.php?tool=lowercase',
    // Add all known old URLs
  ]
  
  const missingRedirects: string[] = []
  
  for (const oldUrl of oldUrls) {
    const hasRedirect = 
      redirectMap[oldUrl] || 
      redirectPatterns.some(({ pattern }) => pattern.test(oldUrl))
    
    if (!hasRedirect) {
      missingRedirects.push(oldUrl)
    }
  }
  
  return missingRedirects
}
```

### 2. Dynamic Meta Tags System

#### Create `src/lib/seo/metadata.ts`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface GenerateMetadataOptions {
  title: string
  description: string
  keywords?: string[]
  locale: string
  path: string
  type?: 'website' | 'article' | 'tool'
  images?: Array<{
    url: string
    width: number
    height: number
    alt: string
  }>
  noindex?: boolean
  alternateLanguages?: Record<string, string>
}

export async function generateMetadata({
  title,
  description,
  keywords = [],
  locale,
  path,
  type = 'website',
  images = [],
  noindex = false,
  alternateLanguages = {},
}: GenerateMetadataOptions): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'common' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.com'
  const url = `${baseUrl}${path}`
  
  // Default image if none provided
  if (images.length === 0) {
    images.push({
      url: `${baseUrl}/og-default.png`,
      width: 1200,
      height: 630,
      alt: 'Text Case Converter - Free Online Text Tools',
    })
  }
  
  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${t('siteName')}`,
    },
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Text Case Converter Team' }],
    creator: 'Text Case Converter',
    publisher: 'Text Case Converter',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: t('siteName'),
      images,
      locale,
      type: type === 'article' ? 'article' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map(img => img.url),
      creator: '@textcaseconvert',
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    },
  }
  
  return metadata
}

// Tool-specific metadata generator
export async function generateToolMetadata({
  tool,
  locale,
}: {
  tool: {
    id: string
    name: string
    description: string
    keywords: string[]
    category: string
  }
  locale: string
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.com'
  const path = `/${locale}/tools/${tool.id}`
  
  // Generate alternate language URLs
  const alternateLanguages: Record<string, string> = {
    'en': `/tools/${tool.id}`,
    'fr': `/fr/tools/${tool.id}`,
    'ru': `/ru/tools/${tool.id}`,
    'it': `/it/tools/${tool.id}`,
  }
  
  return generateMetadata({
    title: tool.name,
    description: tool.description,
    keywords: tool.keywords,
    locale,
    path,
    type: 'tool',
    alternateLanguages,
    images: [{
      url: `${baseUrl}/og/tools/${tool.id}.png`,
      width: 1200,
      height: 630,
      alt: tool.name,
    }],
  })
}
```

### 3. Structured Data Implementation

#### Create `src/lib/seo/structured-data.ts`
```typescript
import { Organization, WebSite, BreadcrumbList, SoftwareApplication, FAQPage } from 'schema-dts'

// Organization schema
export function generateOrganizationSchema(): Organization {
  return {
    '@type': 'Organization',
    '@context': 'https://schema.org',
    name: 'Text Case Converter',
    url: 'https://textcaseconverter.com',
    logo: 'https://textcaseconverter.com/logo.png',
    sameAs: [
      'https://twitter.com/textcaseconvert',
      'https://github.com/textcaseconverter',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@textcaseconverter.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'French', 'Russian', 'Italian'],
    },
  }
}

// Website schema with search action
export function generateWebsiteSchema(locale: string): WebSite {
  const baseUrl = 'https://textcaseconverter.com'
  
  return {
    '@type': 'WebSite',
    '@context': 'https://schema.org',
    url: baseUrl,
    name: 'Text Case Converter',
    description: 'Free online text case conversion and manipulation tools',
    publisher: {
      '@type': 'Organization',
      name: 'Text Case Converter',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: locale,
  }
}

// Breadcrumb schema
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@context': 'https://schema.org',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Tool schema as SoftwareApplication
export function generateToolSchema(tool: {
  name: string
  description: string
  url: string
  category: string
  ratingValue?: number
  ratingCount?: number
}): SoftwareApplication {
  return {
    '@type': 'SoftwareApplication',
    '@context': 'https://schema.org',
    name: tool.name,
    description: tool.description,
    url: tool.url,
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: tool.category,
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    ...(tool.ratingValue && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: tool.ratingValue,
        ratingCount: tool.ratingCount || 1,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  }
}

// FAQ schema
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): FAQPage {
  return {
    '@type': 'FAQPage',
    '@context': 'https://schema.org',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Component to render structured data
export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

### 4. Dynamic Sitemap Generation

#### Create `src/app/sitemap.ts`
```typescript
import { MetadataRoute } from 'next'
import { getAllTools } from '@/lib/tools'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.com'

// Priority calculation based on page importance
function calculatePriority(path: string): number {
  if (path === '/') return 1.0
  if (path.includes('/tools/')) return 0.9
  if (path.includes('/category/')) return 0.8
  if (path.includes('/guides/')) return 0.7
  return 0.5
}

// Change frequency based on content type
function getChangeFrequency(path: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  if (path === '/') return 'daily'
  if (path.includes('/tools/')) return 'weekly'
  if (path.includes('/guides/')) return 'monthly'
  return 'monthly'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await getAllTools()
  const sitemap: MetadataRoute.Sitemap = []
  
  // Static pages for each locale
  const staticPages = [
    '/',
    '/tools',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
  ]
  
  // Tool categories
  const categories = [
    '/tools/category/case-conversion',
    '/tools/category/text-formatting',
    '/tools/category/encoding-decoding',
    '/tools/category/text-generation',
    '/tools/category/text-analysis',
    '/tools/category/advanced-tools',
  ]
  
  // Generate URLs for each locale
  for (const locale of SUPPORTED_LOCALES) {
    const localePrefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
    
    // Add static pages
    for (const page of staticPages) {
      sitemap.push({
        url: `${baseUrl}${localePrefix}${page}`,
        lastModified: new Date(),
        changeFrequency: getChangeFrequency(page),
        priority: calculatePriority(page),
        alternates: {
          languages: SUPPORTED_LOCALES.reduce((acc, lang) => {
            const langPrefix = lang === DEFAULT_LOCALE ? '' : `/${lang}`
            acc[lang] = `${baseUrl}${langPrefix}${page}`
            return acc
          }, {} as Record<string, string>),
        },
      })
    }
    
    // Add categories
    for (const category of categories) {
      sitemap.push({
        url: `${baseUrl}${localePrefix}${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
    
    // Add tool pages
    for (const tool of tools) {
      sitemap.push({
        url: `${baseUrl}${localePrefix}/tools/${tool.id}`,
        lastModified: new Date(tool.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: {
          languages: SUPPORTED_LOCALES.reduce((acc, lang) => {
            const langPrefix = lang === DEFAULT_LOCALE ? '' : `/${lang}`
            acc[lang] = `${baseUrl}${langPrefix}/tools/${tool.id}`
            return acc
          }, {} as Record<string, string>),
        },
      })
    }
  }
  
  // Sort by priority and URL
  sitemap.sort((a, b) => {
    if (a.priority !== b.priority) {
      return (b.priority || 0) - (a.priority || 0)
    }
    return a.url.localeCompare(b.url)
  })
  
  return sitemap
}

// Generate sitemap index for large sites
export async function generateSitemapIndex(): Promise<string> {
  const sitemaps = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap-tools.xml`,
    `${baseUrl}/sitemap-guides.xml`,
  ]
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`
  
  return xml
}
```

### 5. SEO Monitoring Dashboard

#### Create `src/components/admin/seo-dashboard.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface SEOMetrics {
  indexedPages: number
  crawlErrors: Array<{ url: string; error: string; lastCrawled: string }>
  brokenLinks: Array<{ source: string; target: string; status: number }>
  missingMeta: Array<{ url: string; missing: string[] }>
  coreWebVitals: {
    lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }
    fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }
    cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor' }
  }
  rankings: Array<{
    keyword: string
    position: number
    change: number
    url: string
  }>
}

export function SEODashboard() {
  const { data: metrics, isLoading, refetch } = useQuery<SEOMetrics>({
    queryKey: ['seo-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/seo-metrics')
      return response.json()
    },
    refetchInterval: 60000, // Refresh every minute
  })

  if (isLoading) {
    return <div>Loading SEO metrics...</div>
  }

  if (!metrics) {
    return <div>Failed to load metrics</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SEO Dashboard</h1>
        <Button onClick={() => refetch()} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.indexedPages}</div>
            <p className="text-xs text-muted-foreground">
              Pages indexed by Google
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Crawl Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.crawlErrors.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Errors found during crawl
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Broken Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.brokenLinks.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Internal broken links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Missing Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {metrics.missingMeta.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pages with missing meta tags
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Largest Contentful Paint (LCP)"
              value={`${metrics.coreWebVitals.lcp.value.toFixed(2)}s`}
              rating={metrics.coreWebVitals.lcp.rating}
              threshold={{ good: 2.5, poor: 4.0 }}
            />
            <MetricCard
              title="First Input Delay (FID)"
              value={`${metrics.coreWebVitals.fid.value.toFixed(0)}ms`}
              rating={metrics.coreWebVitals.fid.rating}
              threshold={{ good: 100, poor: 300 }}
            />
            <MetricCard
              title="Cumulative Layout Shift (CLS)"
              value={metrics.coreWebVitals.cls.value.toFixed(3)}
              rating={metrics.coreWebVitals.cls.rating}
              threshold={{ good: 0.1, poor: 0.25 }}
            />
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {metrics.crawlErrors.length > 0 ? (
            <div className="space-y-2">
              {metrics.crawlErrors.map((error, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{error.url}</p>
                      <p className="text-sm text-muted-foreground">
                        {error.error}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {new Date(error.lastCrawled).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No crawl errors found
            </div>
          )}
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <div className="space-y-2">
            {metrics.rankings.map((ranking, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{ranking.keyword}</p>
                    <p className="text-sm text-muted-foreground">
                      {ranking.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">#{ranking.position}</p>
                      <p className={`text-sm ${
                        ranking.change > 0 
                          ? 'text-green-600' 
                          : ranking.change < 0 
                          ? 'text-red-600' 
                          : 'text-muted-foreground'
                      }`}>
                        {ranking.change > 0 && '+'}
                        {ranking.change}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  title,
  value,
  rating,
  threshold,
}: {
  title: string
  value: string
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; poor: number }
}) {
  const Icon = rating === 'good' 
    ? CheckCircle 
    : rating === 'poor' 
    ? XCircle 
    : AlertCircle
    
  const color = rating === 'good'
    ? 'text-green-600'
    : rating === 'poor'
    ? 'text-red-600'
    : 'text-yellow-600'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Good: &lt;{threshold.good} | Poor: &gt;{threshold.poor}
        </p>
      </CardContent>
    </Card>
  )
}
```

### 6. robots.txt Configuration

#### Create `src/app/robots.ts`
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/chunks/',
          '/*.json$',
          '/search?*',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 0,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/og/'],
        disallow: '/admin/',
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-tools.xml`,
      `${baseUrl}/sitemap-guides.xml`,
    ],
    host: baseUrl,
  }
}
```

### 7. SEO Monitoring API

#### Create `src/app/api/admin/seo-metrics/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getWebVitals } from '@/lib/analytics/web-vitals'

// Initialize Google Search Console API
const searchConsole = google.searchconsole('v1')

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const session = await getServerSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch indexed pages from Google Search Console
    const indexedPages = await getIndexedPages()
    
    // Check for crawl errors
    const crawlErrors = await getCrawlErrors()
    
    // Find broken links
    const brokenLinks = await checkBrokenLinks()
    
    // Check for missing meta tags
    const missingMeta = await checkMissingMeta()
    
    // Get Core Web Vitals
    const coreWebVitals = await getWebVitals()
    
    // Get keyword rankings
    const rankings = await getKeywordRankings()
    
    return NextResponse.json({
      indexedPages,
      crawlErrors,
      brokenLinks,
      missingMeta,
      coreWebVitals,
      rankings,
    })
  } catch (error) {
    console.error('Failed to fetch SEO metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

async function getIndexedPages(): Promise<number> {
  // Query Google Search Console API
  const response = await searchConsole.urlInspection.index.inspect({
    siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
    inspectionUrl: process.env.NEXT_PUBLIC_BASE_URL,
  })
  
  // In reality, you'd aggregate this data
  return 150 // Placeholder
}

async function getCrawlErrors(): Promise<any[]> {
  // Check server logs and Google Search Console
  return []
}

async function checkBrokenLinks(): Promise<any[]> {
  // Crawl internal links and check status
  const brokenLinks: any[] = []
  
  // Implementation would crawl all pages and check links
  
  return brokenLinks
}

async function checkMissingMeta(): Promise<any[]> {
  // Query database for pages without meta descriptions
  const pages = await db.page.findMany({
    where: {
      OR: [
        { metaDescription: null },
        { metaDescription: '' },
        { metaTitle: null },
        { metaTitle: '' },
      ],
    },
  })
  
  return pages.map(page => ({
    url: page.url,
    missing: [
      !page.metaTitle && 'title',
      !page.metaDescription && 'description',
    ].filter(Boolean),
  }))
}

async function getKeywordRankings(): Promise<any[]> {
  // Query ranking tracking service
  const keywords = [
    'case converter',
    'text case converter',
    'uppercase converter',
    'title case converter',
  ]
  
  // Placeholder data
  return keywords.map(keyword => ({
    keyword,
    position: Math.floor(Math.random() * 20) + 1,
    change: Math.floor(Math.random() * 10) - 5,
    url: '/tools/uppercase',
  }))
}
```

## Testing & Verification

1. Verify all old URLs redirect properly
2. Check meta tags on all pages
3. Validate structured data with Google's tool
4. Test sitemap generation
5. Verify robots.txt configuration
6. Monitor Core Web Vitals

## Success Indicators
- ✅ All old URLs redirect with 301 status
- ✅ Dynamic meta tags on all pages
- ✅ Valid structured data
- ✅ Sitemap includes all pages
- ✅ Search Console shows no errors
- ✅ Rankings maintained or improved

## Next Steps
Proceed to Story 5.5: Security Implementation

## Notes
- Set up Google Search Console
- Configure Bing Webmaster Tools
- Implement schema markup testing
- Add rich snippets for tools
- Monitor 404 errors regularly