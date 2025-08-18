# Story 3.2: Tool Categories Grid

## Story Details
- **Stage**: 3 - Homepage & Category Pages
- **Priority**: High
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Story 3.1 (Homepage Hero Section)

## Objective
Create an organized and visually appealing tool categories grid that helps users quickly find the type of tools they need. Each category should display relevant information and provide easy navigation to filtered tool lists.

## Acceptance Criteria
- [ ] Grid layout with category cards
- [ ] Category icons and descriptions
- [ ] Tool count per category
- [ ] Hover effects and animations
- [ ] Featured category highlighting
- [ ] Mobile-responsive design
- [ ] Lazy loading for performance
- [ ] Category filtering system
- [ ] Quick preview of tools
- [ ] Multilingual category names

## Implementation Steps

### 1. Create Categories Grid Component

#### Create `src/components/home/categories-grid.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star } from 'lucide-react'
import { toolCategories } from '@/config/categories'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/container'

interface Tool {
  id: string
  categoryId: string
}

interface CategoriesGridProps {
  tools: Tool[]
  featuredCategoryId?: string
  className?: string
}

export function CategoriesGrid({ tools, featuredCategoryId, className }: CategoriesGridProps) {
  const t = useTranslations('home.categories')
  
  const categoriesWithCount = React.useMemo(() => {
    const counts = tools.reduce((acc, tool) => {
      acc[tool.categoryId] = (acc[tool.categoryId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(toolCategories).map(([id, category]) => ({
      ...category,
      toolCount: counts[id] || 0,
      isFeatured: id === featuredCategoryId,
    }))
  }, [tools, featuredCategoryId])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <motion.div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {categoriesWithCount.map((category) => (
            <motion.div key={category.id} variants={item}>
              <CategoryCard {...category} />
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/tools">
              {t('viewAllTools')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}

interface CategoryCardProps {
  id: string
  name: string
  description: string
  icon: any
  color: string
  toolCount: number
  isFeatured?: boolean
}

function CategoryCard({
  id,
  name,
  description,
  icon: Icon,
  color,
  toolCount,
  isFeatured,
}: CategoryCardProps) {
  const t = useTranslations('home.categories')
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Link href={`/tools?category=${id}`}>
      <Card 
        className={cn(
          'relative h-full transition-all duration-300 cursor-pointer',
          'hover:shadow-xl hover:-translate-y-1',
          isFeatured && 'ring-2 ring-primary ring-offset-2'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isFeatured && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge className="gap-1" variant="default">
              <Star className="h-3 w-3" />
              {t('featured')}
            </Badge>
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'p-3 rounded-lg transition-colors',
              `bg-${color}-100 dark:bg-${color}-900/20`,
              isHovered && `bg-${color}-200 dark:bg-${color}-900/30`
            )}>
              <Icon className={cn(
                'h-8 w-8 transition-transform',
                `text-${color}-600 dark:text-${color}-400`,
                isHovered && 'scale-110'
              )} />
            </div>
            <Badge variant="secondary">
              {toolCount} {toolCount === 1 ? t('tool') : t('tools')}
            </Badge>
          </div>
          
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription className="mt-2">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary font-medium">
              {t('explore')}
            </span>
            <ArrowRight className={cn(
              'h-4 w-4 text-primary transition-transform',
              isHovered && 'translate-x-1'
            )} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### 2. Create Category Preview Component

#### Create `src/components/home/category-preview.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolCard } from '@/components/ui/tool-card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toolCategories } from '@/config/categories'
import { motion, AnimatePresence } from 'framer-motion'

interface Tool {
  id: string
  title: string
  description: string
  categoryId: string
  icon?: any
  href: string
}

interface CategoryPreviewProps {
  tools: Tool[]
  defaultCategory?: string
  previewCount?: number
}

export function CategoryPreview({ 
  tools, 
  defaultCategory = 'text-case',
  previewCount = 6 
}: CategoryPreviewProps) {
  const t = useTranslations('home.preview')
  const [activeCategory, setActiveCategory] = React.useState(defaultCategory)
  const [isLoading, setIsLoading] = React.useState(false)

  const toolsByCategory = React.useMemo(() => {
    return tools.reduce((acc, tool) => {
      if (!acc[tool.categoryId]) {
        acc[tool.categoryId] = []
      }
      acc[tool.categoryId].push(tool)
      return acc
    }, {} as Record<string, Tool[]>)
  }, [tools])

  const handleCategoryChange = (value: string) => {
    setIsLoading(true)
    setActiveCategory(value)
    // Simulate loading for smooth transition
    setTimeout(() => setIsLoading(false), 300)
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold mb-2">{t('title')}</h3>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
          {Object.entries(toolCategories).map(([id, category]) => (
            <TabsTrigger 
              key={id} 
              value={id}
              className="gap-2"
            >
              <category.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          {Object.entries(toolCategories).map(([categoryId, category]) => (
            <TabsContent 
              key={categoryId} 
              value={categoryId}
              className="mt-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {toolsByCategory[categoryId]?.slice(0, previewCount).map((tool) => (
                      <ToolCard
                        key={tool.id}
                        id={tool.id}
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                        href={tool.href}
                        category={category.name}
                        categoryColor={category.color}
                      />
                    ))}
                  </div>

                  {toolsByCategory[categoryId]?.length > previewCount && (
                    <div className="text-center mt-8">
                      <Button variant="outline" asChild>
                        <Link href={`/tools?category=${categoryId}`}>
                          {t('viewMore', { 
                            count: toolsByCategory[categoryId].length - previewCount 
                          })}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}
```

### 3. Create Category Filter Component

#### Create `src/components/tools/category-filter.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toolCategories } from '@/config/categories'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface CategoryFilterProps {
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
  toolCounts?: Record<string, number>
  className?: string
}

export function CategoryFilter({
  selectedCategories,
  onCategoryChange,
  toolCounts = {},
  className,
}: CategoryFilterProps) {
  const t = useTranslations('tools.filter')

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId))
    } else {
      onCategoryChange([...selectedCategories, categoryId])
    }
  }

  const clearAll = () => {
    onCategoryChange([])
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('categories')}</h3>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-auto p-1"
          >
            <X className="h-3 w-3 mr-1" />
            {t('clearAll')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(toolCategories).map(([id, category]) => {
          const isSelected = selectedCategories.includes(id)
          const count = toolCounts[id] || 0
          
          return (
            <Button
              key={id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory(id)}
              className={cn(
                'gap-2',
                !isSelected && 'hover:border-primary'
              )}
            >
              <category.icon className="h-4 w-4" />
              {category.name}
              {count > 0 && (
                <Badge 
                  variant={isSelected ? 'secondary' : 'outline'} 
                  className="ml-1 px-1 min-w-[20px] h-5"
                >
                  {count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
```

### 4. Update Category Configuration

#### Update `src/config/categories.ts`
```typescript
import { 
  Type, 
  FileText, 
  Code, 
  Image, 
  Shuffle, 
  MoreHorizontal,
  Hash,
  Lock,
  Calendar,
  Calculator,
} from 'lucide-react'

export interface ToolCategoryConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  featured?: boolean
  order: number
}

export const toolCategories: Record<string, ToolCategoryConfig> = {
  'text-case': {
    id: 'text-case',
    name: 'Convert Case',
    description: 'Transform text between uppercase, lowercase, title case, and more',
    icon: Type,
    color: 'blue',
    featured: true,
    order: 1,
  },
  'text-format': {
    id: 'text-format',
    name: 'Text Formatting',
    description: 'Format, clean, and manipulate text content',
    icon: FileText,
    color: 'green',
    order: 2,
  },
  'encoding': {
    id: 'encoding',
    name: 'Encoding & Decoding',
    description: 'Encode and decode various formats like Base64, URL, HTML',
    icon: Code,
    color: 'purple',
    featured: true,
    order: 3,
  },
  'generators': {
    id: 'generators',
    name: 'Random Generators',
    description: 'Generate passwords, UUIDs, random data, and more',
    icon: Shuffle,
    color: 'orange',
    order: 4,
  },
  'converters': {
    id: 'converters',
    name: 'Converters',
    description: 'Convert between different units and formats',
    icon: Calculator,
    color: 'indigo',
    order: 5,
  },
  'images': {
    id: 'images',
    name: 'Image Tools',
    description: 'Resize, crop, convert, and process images',
    icon: Image,
    color: 'pink',
    order: 6,
  },
  'security': {
    id: 'security',
    name: 'Security Tools',
    description: 'Hashing, encryption, and security utilities',
    icon: Lock,
    color: 'red',
    order: 7,
  },
  'datetime': {
    id: 'datetime',
    name: 'Date & Time',
    description: 'Date formatting, timezone conversion, and time utilities',
    icon: Calendar,
    color: 'teal',
    order: 8,
  },
  'misc': {
    id: 'misc',
    name: 'Miscellaneous',
    description: 'Various utility tools',
    icon: MoreHorizontal,
    color: 'gray',
    order: 9,
  },
}

// Helper function to get categories sorted by order
export function getSortedCategories() {
  return Object.values(toolCategories).sort((a, b) => a.order - b.order)
}

// Helper function to get featured categories
export function getFeaturedCategories() {
  return Object.values(toolCategories).filter(cat => cat.featured)
}
```

### 5. Update Translations

Add to `src/i18n/locales/en/home.json`:
```json
{
  "categories": {
    "title": "Browse by Category",
    "subtitle": "Find the perfect tool for your needs",
    "featured": "Featured",
    "tool": "tool",
    "tools": "tools",
    "explore": "Explore tools",
    "viewAllTools": "View All Tools"
  },
  "preview": {
    "title": "Popular Tools by Category",
    "subtitle": "Quick access to our most used tools",
    "viewMore": "View {count} more tools"
  }
}
```

Add to `src/i18n/locales/en/tools.json`:
```json
{
  "filter": {
    "categories": "Categories",
    "clearAll": "Clear all"
  }
}
```

## Testing & Verification

1. Test grid responsiveness
2. Verify category counts
3. Test hover animations
4. Check filter functionality
5. Test with all languages
6. Verify loading states

## Success Indicators
- ✅ Categories display correctly
- ✅ Tool counts accurate
- ✅ Animations smooth
- ✅ Filtering works
- ✅ Mobile responsive
- ✅ Featured categories highlighted
- ✅ All languages supported

## Next Steps
Proceed to Story 3.3: Featured Tools Section

## Notes
- Consider lazy loading for large tool lists
- Add category icons to improve visual hierarchy
- Test color contrast in dark mode
- Monitor performance with many tools