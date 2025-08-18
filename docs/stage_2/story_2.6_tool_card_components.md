# Story 2.6: Tool Card Components for Homepage

## Story Details
- **Stage**: 2 - Core Features & Shared Components
- **Priority**: Medium
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Story 2.5 (Character/Word Counter)

## Objective
Create visually appealing and interactive tool card components for displaying available tools on the homepage and category pages. These cards should be responsive, accessible, and provide clear information about each tool's functionality.

## Acceptance Criteria
- [ ] Tool card with icon, title, and description
- [ ] Hover effects and animations
- [ ] Category badges
- [ ] New/Popular/Featured indicators
- [ ] Skeleton loading states
- [ ] Grid layout system
- [ ] Search/filter integration ready
- [ ] Mobile-optimized design
- [ ] Keyboard navigation support

## Implementation Steps

### 1. Update Tool Card Component

#### Update `src/components/ui/tool-card.tsx`
```typescript
'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { LucideIcon, ArrowRight, Star, TrendingUp, Sparkles } from 'lucide-react'

export interface ToolCardProps {
  id: string
  title: string
  description: string
  icon?: LucideIcon
  category?: string
  categoryColor?: string
  href?: string
  isNew?: boolean
  isPopular?: boolean
  isFeatured?: boolean
  disabled?: boolean
  className?: string
}

export function ToolCard({
  id,
  title,
  description,
  icon: Icon,
  category,
  categoryColor = 'blue',
  href,
  isNew,
  isPopular,
  isFeatured,
  disabled = false,
  className,
}: ToolCardProps) {
  const locale = useLocale()
  const localizedHref = href && locale !== 'en' ? `/${locale}${href}` : href

  const cardContent = (
    <>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          {Icon && (
            <div className={`p-3 rounded-lg bg-${categoryColor}-100 dark:bg-${categoryColor}-900/20`}>
              <Icon className={`h-6 w-6 text-${categoryColor}-600 dark:text-${categoryColor}-400`} />
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {isNew && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                New
              </Badge>
            )}
            {isPopular && (
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Popular
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="default" className="gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
          {category && (
            <p className="text-xs text-muted-foreground">{category}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
        
        {!disabled && (
          <div className="flex items-center gap-2 mt-4 text-sm font-medium text-primary">
            <span>Try it now</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </CardContent>
    </>
  )

  const cardClasses = cn(
    'group relative overflow-hidden transition-all duration-200',
    'hover:shadow-lg hover:-translate-y-1',
    'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
    disabled && 'opacity-60 cursor-not-allowed hover:shadow-none hover:translate-y-0',
    className
  )

  if (href && !disabled) {
    return (
      <Link href={localizedHref!} className="block">
        <Card className={cardClasses}>
          {cardContent}
        </Card>
      </Link>
    )
  }

  return (
    <Card className={cardClasses}>
      {cardContent}
    </Card>
  )
}
```

### 2. Create Tool Grid Component

#### Create `src/components/tools/tool-grid.tsx`
```typescript
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ToolCard, ToolCardProps } from '@/components/ui/tool-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ToolGridProps {
  tools: ToolCardProps[]
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingCount?: number
  className?: string
}

export function ToolGrid({
  tools,
  columns = 3,
  gap = 'md',
  loading = false,
  loadingCount = 6,
  className,
}: ToolGridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (loading) {
    return (
      <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {tools.map((tool) => (
        <ToolCard key={tool.id} {...tool} />
      ))}
    </div>
  )
}

function ToolCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Create Category Configuration

#### Create `src/config/categories.ts`
```typescript
import { Type, FileText, Code, Image, Shuffle, MoreHorizontal } from 'lucide-react'

export interface ToolCategoryConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
}

export const toolCategories: Record<string, ToolCategoryConfig> = {
  'text-case': {
    id: 'text-case',
    name: 'Convert Case',
    description: 'Transform text between different cases',
    icon: Type,
    color: 'blue',
  },
  'text-format': {
    id: 'text-format',
    name: 'Text Formatting',
    description: 'Format and manipulate text content',
    icon: FileText,
    color: 'green',
  },
  'encoding': {
    id: 'encoding',
    name: 'Encoding & Decoding',
    description: 'Encode and decode various formats',
    icon: Code,
    color: 'purple',
  },
  'images': {
    id: 'images',
    name: 'Image Tools',
    description: 'Process and convert images',
    icon: Image,
    color: 'pink',
  },
  'generators': {
    id: 'generators',
    name: 'Random Generators',
    description: 'Generate random data and content',
    icon: Shuffle,
    color: 'orange',
  },
  'misc': {
    id: 'misc',
    name: 'Miscellaneous',
    description: 'Various utility tools',
    icon: MoreHorizontal,
    color: 'gray',
  },
}
```

### 4. Create Featured Tools Section

#### Create `src/components/tools/featured-tools.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolGrid } from './tool-grid'
import { ToolCardProps } from '@/components/ui/tool-card'
import Link from 'next/link'

interface FeaturedToolsProps {
  tools: ToolCardProps[]
  title?: string
  description?: string
  showViewAll?: boolean
  viewAllHref?: string
  className?: string
}

export function FeaturedTools({
  tools,
  title,
  description,
  showViewAll = true,
  viewAllHref = '/tools',
  className,
}: FeaturedToolsProps) {
  const t = useTranslations('common')

  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {title || t('featuredTools')}
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {showViewAll && (
          <Button variant="outline" asChild>
            <Link href={viewAllHref}>
              {t('viewAllTools')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <ToolGrid tools={tools} columns={3} />
    </section>
  )
}
```

### 5. Create Search Hook

#### Create `src/hooks/use-tool-search.ts`
```typescript
'use client'

import * as React from 'react'
import { ToolCardProps } from '@/components/ui/tool-card'

export function useToolSearch(
  tools: ToolCardProps[],
  searchTerm: string,
  options: {
    searchKeys?: (keyof ToolCardProps)[]
    categoryFilter?: string
    debounceMs?: number
  } = {}
) {
  const {
    searchKeys = ['title', 'description', 'category'],
    categoryFilter,
    debounceMs = 300,
  } = options

  const [filteredTools, setFilteredTools] = React.useState(tools)
  const [isSearching, setIsSearching] = React.useState(false)

  React.useEffect(() => {
    setIsSearching(true)
    
    const timer = setTimeout(() => {
      let results = [...tools]

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        results = results.filter(tool =>
          searchKeys.some(key => {
            const value = tool[key]
            return value && 
              typeof value === 'string' && 
              value.toLowerCase().includes(term)
          })
        )
      }

      if (categoryFilter) {
        results = results.filter(tool => tool.category === categoryFilter)
      }

      setFilteredTools(results)
      setIsSearching(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, categoryFilter, tools, searchKeys, debounceMs])

  return { filteredTools, isSearching }
}
```

### 6. Update Translations

Add to `src/i18n/locales/en/common.json`:
```json
{
  "featuredTools": "Featured Tools",
  "viewAllTools": "View All Tools",
  "tryItNow": "Try it now"
}
```

## Testing & Verification

1. Test hover effects and animations
2. Verify responsive grid layouts
3. Test loading skeleton states
4. Check keyboard navigation
5. Test search functionality

## Success Indicators
- ✅ Tool cards display correctly
- ✅ Hover animations smooth
- ✅ Grid responsive on all devices
- ✅ Search/filter functionality ready
- ✅ Loading states work properly
- ✅ Keyboard accessible

## Next Steps
Proceed to Story 2.7: Breadcrumb Navigation

## Notes
- Use semantic HTML for SEO
- Optimize images/icons
- Test with various content lengths
- Add analytics tracking