# Story 3.6: Category Page Template

## Story Details
- **Stage**: 3 - Homepage & Category Pages
- **Priority**: High
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Story 3.5 (Homepage Layout Assembly)

## Objective
Create a dynamic category page template that displays all tools within a specific category, provides filtering options, and maintains consistent design with the homepage while being optimized for SEO.

## Acceptance Criteria
- [ ] Dynamic routing for categories
- [ ] Category-specific hero section
- [ ] Tools grid with pagination
- [ ] Sub-category filtering
- [ ] Sort functionality
- [ ] Category description and SEO
- [ ] Related categories navigation
- [ ] Breadcrumb navigation
- [ ] Mobile-optimized layout
- [ ] Performance optimized

## Implementation Steps

### 1. Create Category Page Route

#### Create `src/app/[locale]/tools/category/[category]/page.tsx`
```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { CategoryPageLayout } from '@/components/category/category-page-layout'
import { getAllTools } from '@/lib/tools'
import { toolCategories } from '@/config/categories'

interface CategoryPageProps {
  params: {
    locale: string
    category: string
  }
  searchParams: {
    sort?: string
    page?: string
    tag?: string[]
  }
}

export async function generateStaticParams() {
  const categories = Object.keys(toolCategories)
  const locales = ['en', 'fr', 'ru', 'it']
  
  return locales.flatMap(locale =>
    categories.map(category => ({
      locale,
      category,
    }))
  )
}

export async function generateMetadata({ 
  params: { locale, category } 
}: CategoryPageProps): Promise<Metadata> {
  const categoryConfig = toolCategories[category]
  if (!categoryConfig) return {}
  
  const t = await getTranslations({ locale, namespace: 'metadata.category' })
  
  return {
    title: t('title', { category: categoryConfig.name }),
    description: t('description', { 
      category: categoryConfig.name,
      description: categoryConfig.description 
    }),
    keywords: t('keywords', { category: categoryConfig.name }),
    openGraph: {
      title: t('ogTitle', { category: categoryConfig.name }),
      description: categoryConfig.description,
      type: 'website',
    },
    alternates: {
      canonical: `/tools/category/${category}`,
      languages: {
        'en': `/tools/category/${category}`,
        'fr': `/fr/tools/category/${category}`,
        'ru': `/ru/tools/category/${category}`,
        'it': `/it/tools/category/${category}`,
      },
    },
  }
}

export default async function CategoryPage({ 
  params: { locale, category },
  searchParams 
}: CategoryPageProps) {
  unstable_setRequestLocale(locale)
  
  const categoryConfig = toolCategories[category]
  if (!categoryConfig) {
    notFound()
  }
  
  // Fetch tools for this category
  const allTools = await getAllTools()
  const categoryTools = allTools.filter(tool => tool.categoryId === category)
  
  // Apply filters
  let filteredTools = [...categoryTools]
  
  // Tag filter
  if (searchParams.tag?.length) {
    filteredTools = filteredTools.filter(tool =>
      searchParams.tag!.some(tag => tool.tags?.includes(tag))
    )
  }
  
  // Sorting
  const sortBy = searchParams.sort || 'popular'
  filteredTools.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title)
      case 'recent':
        return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
      case 'popular':
      default:
        return (b.usageCount || 0) - (a.usageCount || 0)
    }
  })
  
  // Pagination
  const page = parseInt(searchParams.page || '1')
  const perPage = 12
  const totalPages = Math.ceil(filteredTools.length / perPage)
  const paginatedTools = filteredTools.slice(
    (page - 1) * perPage,
    page * perPage
  )
  
  return (
    <CategoryPageLayout
      category={categoryConfig}
      tools={paginatedTools}
      totalTools={filteredTools.length}
      currentPage={page}
      totalPages={totalPages}
      filters={{
        sort: sortBy,
        tags: searchParams.tag || [],
      }}
    />
  )
}
```

### 2. Create Category Page Layout Component

#### Create `src/components/category/category-page-layout.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { CategoryHero } from './category-hero'
import { CategoryFilters } from './category-filters'
import { ToolGrid } from '@/components/tools/tool-grid'
import { Pagination } from '@/components/ui/pagination'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { RelatedCategories } from './related-categories'
import { ToolCategoryConfig } from '@/config/categories'
import { Tool } from '@/types/tool'

interface CategoryPageLayoutProps {
  category: ToolCategoryConfig
  tools: Tool[]
  totalTools: number
  currentPage: number
  totalPages: number
  filters: {
    sort: string
    tags: string[]
  }
}

export function CategoryPageLayout({
  category,
  tools,
  totalTools,
  currentPage,
  totalPages,
  filters,
}: CategoryPageLayoutProps) {
  const t = useTranslations('category')
  
  const breadcrumbItems = [
    { label: t('tools'), href: '/tools' },
    { label: category.name },
  ]

  return (
    <>
      <CategoryHero category={category} toolCount={totalTools} />
      
      <section className="py-8">
        <Container>
          <Breadcrumb items={breadcrumbItems} className="mb-8" />
          
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1">
              <CategoryFilters
                category={category}
                currentFilters={filters}
                totalResults={totalTools}
              />
            </aside>
            
            {/* Main Content */}
            <main className="lg:col-span-3">
              {tools.length > 0 ? (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t('showing', { 
                        start: (currentPage - 1) * 12 + 1,
                        end: Math.min(currentPage * 12, totalTools),
                        total: totalTools 
                      })}
                    </p>
                  </div>
                  
                  <ToolGrid tools={tools} columns={3} />
                  
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl={`/tools/category/${category.id}`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    {t('noTools')}
                  </p>
                </div>
              )}
            </main>
          </div>
        </Container>
      </section>
      
      <RelatedCategories currentCategory={category.id} />
    </>
  )
}
```

### 3. Create Category Hero Component

#### Create `src/components/category/category-hero.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { ToolCategoryConfig } from '@/config/categories'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CategoryHeroProps {
  category: ToolCategoryConfig
  toolCount: number
}

export function CategoryHero({ category, toolCount }: CategoryHeroProps) {
  const t = useTranslations('category')
  const Icon = category.icon

  return (
    <section className={cn(
      'relative py-16 md:py-20',
      'bg-gradient-to-br',
      `from-${category.color}-50 to-${category.color}-100/20`,
      `dark:from-${category.color}-950/20 dark:to-${category.color}-900/10`
    )}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className={cn(
              'p-4 rounded-xl',
              `bg-${category.color}-100 dark:bg-${category.color}-900/30`
            )}>
              <Icon className={cn(
                'h-10 w-10',
                `text-${category.color}-600 dark:text-${category.color}-400`
              )} />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {category.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="gap-1">
              {toolCount} {toolCount === 1 ? t('tool') : t('tools')}
            </Badge>
            {category.featured && (
              <Badge variant="default">
                {t('featured')}
              </Badge>
            )}
          </div>
        </motion.div>
      </Container>
      
      {/* Decorative background pattern */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-grid-white/50 bg-grid-16" />
      </div>
    </section>
  )
}
```

### 4. Create Category Filters Component

#### Create `src/components/category/category-filters.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'
import { ToolCategoryConfig } from '@/config/categories'

interface CategoryFiltersProps {
  category: ToolCategoryConfig
  currentFilters: {
    sort: string
    tags: string[]
  }
  totalResults: number
}

export function CategoryFilters({
  category,
  currentFilters,
  totalResults,
}: CategoryFiltersProps) {
  const t = useTranslations('category.filters')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Available tags for this category
  const availableTags = getTagsForCategory(category.id)

  const updateFilters = (updates: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update sort
    if (updates.sort !== undefined) {
      if (updates.sort === 'popular') {
        params.delete('sort')
      } else {
        params.set('sort', updates.sort)
      }
    }
    
    // Update tags
    if (updates.tags !== undefined) {
      params.delete('tag')
      updates.tags.forEach(tag => params.append('tag', tag))
    }
    
    // Reset to page 1 when filters change
    params.delete('page')
    
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push(`/tools/category/${category.id}`, { scroll: false })
  }

  const hasActiveFilters = 
    currentFilters.sort !== 'popular' || 
    currentFilters.tags.length > 0

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('title')}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto p-1"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort Options */}
        <div className="space-y-3">
          <Label>{t('sortBy')}</Label>
          <RadioGroup
            value={currentFilters.sort}
            onValueChange={(value) => updateFilters({ sort: value })}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="popular" id="sort-popular" />
                <Label htmlFor="sort-popular">{t('popular')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name" id="sort-name" />
                <Label htmlFor="sort-name">{t('alphabetical')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recent" id="sort-recent" />
                <Label htmlFor="sort-recent">{t('recent')}</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div className="space-y-3">
            <Label>{t('tags')}</Label>
            <div className="space-y-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={currentFilters.tags.includes(tag)}
                    onCheckedChange={(checked) => {
                      const newTags = checked
                        ? [...currentFilters.tags, tag]
                        : currentFilters.tags.filter(t => t !== tag)
                      updateFilters({ tags: newTags })
                    }}
                  />
                  <Label 
                    htmlFor={`tag-${tag}`}
                    className="cursor-pointer"
                  >
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {t('results', { count: totalResults })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function getTagsForCategory(categoryId: string): string[] {
  // This would typically come from your data source
  const tagsByCategory: Record<string, string[]> = {
    'text-case': ['converter', 'formatter', 'text-transform'],
    'encoding': ['encoder', 'decoder', 'base64', 'url'],
    'generators': ['random', 'password', 'uuid', 'lorem-ipsum'],
    // ... more categories
  }
  
  return tagsByCategory[categoryId] || []
}
```

### 5. Create Related Categories Component

#### Create `src/components/category/related-categories.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { CategoryCard } from '@/components/tools/category-card'
import { toolCategories } from '@/config/categories'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RelatedCategoriesProps {
  currentCategory: string
  maxItems?: number
}

export function RelatedCategories({ 
  currentCategory, 
  maxItems = 3 
}: RelatedCategoriesProps) {
  const t = useTranslations('category')
  
  const relatedCategories = Object.entries(toolCategories)
    .filter(([id]) => id !== currentCategory)
    .slice(0, maxItems)
    .map(([id, config]) => ({ id, ...config }))

  return (
    <section className="py-16 bg-muted/30">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">
            {t('relatedCategories')}
          </h2>
          <Link 
            href="/tools" 
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {t('viewAllCategories')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.name}
              description={category.description}
              icon={category.icon}
              href={`/tools/category/${category.id}`}
              color={category.color}
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
```

### 6. Update Translations

Add to `src/i18n/locales/en/category.json`:
```json
{
  "tools": "Tools",
  "tool": "tool",
  "featured": "Featured",
  "showing": "Showing {start}-{end} of {total} tools",
  "noTools": "No tools found in this category",
  "relatedCategories": "Explore Other Categories",
  "viewAllCategories": "View all",
  "filters": {
    "title": "Filters",
    "sortBy": "Sort by",
    "popular": "Most Popular",
    "alphabetical": "A-Z",
    "recent": "Recently Updated",
    "tags": "Tags",
    "results": "{count} tools found"
  }
}
```

Add to `src/i18n/locales/en/metadata.json`:
```json
{
  "category": {
    "title": "{category} Tools - Free Online Text Tools",
    "description": "{description} Browse our collection of {category} tools.",
    "keywords": "{category}, text tools, online tools, free tools",
    "ogTitle": "{category} Tools | TextTools.io"
  }
}
```

## Testing & Verification

1. Test category routing
2. Verify filters work
3. Test pagination
4. Check SEO meta tags
5. Test responsive design
6. Verify breadcrumbs

## Success Indicators
- ✅ Dynamic routing works
- ✅ Filters update URL
- ✅ Pagination functional
- ✅ SEO optimized
- ✅ Mobile responsive
- ✅ Related categories shown

## Next Steps
Stage 3 is complete! Proceed to Stage 4.

## Notes
- Consider adding view mode toggle
- Add tool preview on hover
- Monitor filter performance
- Test with many tools