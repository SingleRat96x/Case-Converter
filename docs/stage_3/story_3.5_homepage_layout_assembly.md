# Story 3.5: Homepage Layout Assembly

## Story Details
- **Stage**: 3 - Homepage & Category Pages
- **Priority**: Critical
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Stories 3.1-3.4 Complete

## Objective
Assemble all homepage components into a cohesive, high-performance layout that provides an excellent user experience. The homepage should effectively showcase tools, guide users, and maintain fast loading times.

## Acceptance Criteria
- [ ] All components integrated seamlessly
- [ ] Proper spacing and visual hierarchy
- [ ] Performance optimized (<3s load time)
- [ ] SEO meta tags configured
- [ ] Above-the-fold content prioritized
- [ ] Lazy loading for below-fold content
- [ ] Newsletter signup integration
- [ ] Social proof elements
- [ ] Call-to-action placement
- [ ] Analytics tracking ready

## Implementation Steps

### 1. Create Homepage Layout

#### Update `src/app/[locale]/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { HeroSection } from '@/components/home/hero-section'
import { CategoriesGrid } from '@/components/home/categories-grid'
import { FeaturedToolsSection } from '@/components/home/featured-tools-section'
import { StatsCounter } from '@/components/home/stats-counter'
import { CategoryPreview } from '@/components/home/category-preview'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { Container } from '@/components/ui/container'
import { getAllTools } from '@/lib/tools'
import { toolCategories } from '@/config/categories'

interface HomePageProps {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params: { locale } }: HomePageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata.home' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      images: ['/og-home.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
      images: ['/twitter-home.png'],
    },
    alternates: {
      canonical: '/',
      languages: {
        'en': '/',
        'fr': '/fr',
        'ru': '/ru',
        'it': '/it',
      },
    },
  }
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  unstable_setRequestLocale(locale)
  
  // Fetch all tools
  const tools = await getAllTools()
  
  // Categorize tools
  const featuredTools = tools
    .filter(tool => tool.isFeatured)
    .slice(0, 6)
    .map(tool => ({
      ...tool,
      icon: toolCategories[tool.categoryId]?.icon,
      href: `/tools/${tool.id}`,
    }))
  
  const popularTools = tools
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 12)
  
  return (
    <>
      {/* Hero Section - Above the fold */}
      <HeroSection featuredTools={featuredTools.slice(0, 3)} />
      
      {/* Stats Counter - Social proof */}
      <section className="py-12 bg-muted/30">
        <Container>
          <StatsCounter />
        </Container>
      </section>
      
      {/* Featured Tools - Quick access */}
      <FeaturedToolsSection tools={tools} />
      
      {/* Categories Grid - Navigation */}
      <CategoriesGrid 
        tools={tools} 
        featuredCategoryId="text-case"
      />
      
      {/* Category Preview - Tool discovery */}
      <section className="py-16 bg-muted/20">
        <Container>
          <CategoryPreview tools={popularTools} />
        </Container>
      </section>
      
      {/* Testimonials - Trust building */}
      <TestimonialsSection />
      
      {/* Newsletter - Lead generation */}
      <NewsletterSection />
      
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'TextTools.io',
            description: 'Free online text manipulation tools',
            url: 'https://texttools.io',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://texttools.io/tools?q={search_term_string}'
              },
              'query-input': 'required name=search_term_string'
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              reviewCount: '1250'
            }
          })
        }}
      />
    </>
  )
}
```

### 2. Create Testimonials Section

#### Create `src/components/home/testimonials-section.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Content Creator',
    avatar: '/avatars/sarah.jpg',
    rating: 5,
    content: 'TextTools has become an essential part of my workflow. The case converters save me hours every week!',
  },
  {
    id: 2,
    name: 'Mike Chen',
    role: 'Developer',
    avatar: '/avatars/mike.jpg',
    rating: 5,
    content: 'The encoding tools are fantastic. Base64, URL encoding, JSON formatting - everything I need in one place.',
  },
  {
    id: 3,
    name: 'Emma Williams',
    role: 'Marketing Manager',
    avatar: '/avatars/emma.jpg',
    rating: 5,
    content: 'Multi-language support is a game-changer for our international team. Highly recommended!',
  },
  {
    id: 4,
    name: 'David Kumar',
    role: 'Freelancer',
    avatar: '/avatars/david.jpg',
    rating: 5,
    content: 'Clean interface, fast processing, and no sign-up required. This is how web tools should be built.',
  },
]

export function TestimonialsSection() {
  const t = useTranslations('home.testimonials')
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  )

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <Quote className="h-8 w-8 text-primary/20" />
                    
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    
                    <p className="text-muted-foreground">
                      {testimonial.content}
                    </p>
                    
                    <div className="flex items-center gap-3 pt-4">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
```

### 3. Create Newsletter Section

#### Create `src/components/home/newsletter-section.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { NewsletterForm } from '@/components/layout/newsletter-form'
import { Sparkles, Mail, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export function NewsletterSection() {
  const t = useTranslations('home.newsletter')

  const benefits = [
    { icon: Sparkles, label: t('benefits.newTools') },
    { icon: Zap, label: t('benefits.tips') },
    { icon: Shield, label: t('benefits.noSpam') },
  ]

  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <Container>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Mail className="h-4 w-4" />
              {t('badge')}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-lg shadow-lg p-8"
          >
            <NewsletterForm variant="card" />
            
            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <benefit.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{benefit.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
```

### 4. Create Performance Optimization

#### Create `src/components/home/lazy-section.tsx`
```typescript
'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { useInView } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface LazySectionProps {
  component: string
  height?: string
  threshold?: number
  props?: any
}

export function LazySection({ 
  component, 
  height = '400px',
  threshold = 0.1,
  props = {}
}: LazySectionProps) {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    margin: '100px',
    amount: threshold 
  })
  
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null)

  React.useEffect(() => {
    if (isInView && !Component) {
      const DynamicComponent = dynamic(
        () => import(`@/components/home/${component}`).then(mod => mod[component]),
        {
          loading: () => <Skeleton style={{ height }} />,
          ssr: false,
        }
      )
      setComponent(() => DynamicComponent)
    }
  }, [isInView, component, Component, height])

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {Component && <Component {...props} />}
    </div>
  )
}
```

### 5. Update Homepage with Lazy Loading

#### Update homepage to use lazy loading:
```typescript
// In src/app/[locale]/page.tsx, update sections:

{/* Lazy load below-the-fold content */}
<LazySection 
  component="TestimonialsSection" 
  height="500px"
/>

<LazySection 
  component="NewsletterSection" 
  height="400px"
/>
```

### 6. Add Homepage Translations

Add to `src/i18n/locales/en/metadata.json`:
```json
{
  "home": {
    "title": "Free Online Text Tools - Case Converter, Encoder & More",
    "description": "Transform, convert, and manipulate text with our free online tools. Support for 4 languages. No signup required.",
    "keywords": "text tools, case converter, base64 encoder, text formatter, online tools",
    "ogTitle": "TextTools.io - Free Text Manipulation Tools",
    "ogDescription": "60+ free online text tools for developers, writers, and content creators.",
    "twitterTitle": "TextTools.io - Transform Your Text Instantly",
    "twitterDescription": "Free online text manipulation tools. No signup, no limits."
  }
}
```

Add to `src/i18n/locales/en/home.json`:
```json
{
  "testimonials": {
    "title": "Loved by Thousands",
    "subtitle": "See what our users are saying about TextTools"
  },
  "newsletter": {
    "badge": "Join 10,000+ subscribers",
    "title": "Stay Updated with New Tools",
    "subtitle": "Get notified when we launch new tools and features",
    "benefits": {
      "newTools": "New tool announcements",
      "tips": "Pro tips & tricks",
      "noSpam": "No spam, unsubscribe anytime"
    }
  }
}
```

## Testing & Verification

1. Test page load performance
2. Verify lazy loading works
3. Check all sections render
4. Test newsletter signup
5. Verify SEO meta tags
6. Test with all languages

## Success Indicators
- ✅ Page loads <3 seconds
- ✅ All components integrated
- ✅ Lazy loading functional
- ✅ SEO optimized
- ✅ Mobile responsive
- ✅ Analytics tracking ready

## Next Steps
Proceed to Story 3.6: Category Page Template

## Notes
- Monitor Core Web Vitals
- Add structured data
- Test with slow connections
- Consider adding A/B testing