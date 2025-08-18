# Story 3.3: Featured Tools Section

## Story Details
- **Stage**: 3 - Homepage & Category Pages
- **Priority**: Medium
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Story 3.2 (Tool Categories Grid)

## Objective
Create a dynamic featured tools section that showcases the most popular, newest, and recommended tools. This section should be easily manageable and provide quick access to high-value tools.

## Acceptance Criteria
- [ ] Multiple display modes (carousel, grid, list)
- [ ] Tool filtering by featured type
- [ ] Auto-rotation for carousel mode
- [ ] Quick tool preview on hover
- [ ] Usage statistics display
- [ ] Recently used tools tracking
- [ ] Personalized recommendations
- [ ] Mobile swipe support
- [ ] Performance metrics integration
- [ ] Admin-manageable featured list

## Implementation Steps

### 1. Create Featured Tools Section Component

#### Create `src/components/home/featured-tools-section.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ToolCard } from '@/components/ui/tool-card'
import { 
  TrendingUp, 
  Star, 
  Clock, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

interface Tool {
  id: string
  title: string
  description: string
  icon?: any
  href: string
  category?: string
  categoryColor?: string
  usageCount?: number
  isNew?: boolean
  isPopular?: boolean
  isFeatured?: boolean
  lastUsed?: Date
}

interface FeaturedToolsSectionProps {
  tools: Tool[]
  className?: string
}

type DisplayMode = 'carousel' | 'grid' | 'list'
type FilterType = 'featured' | 'popular' | 'new' | 'recent'

export function FeaturedToolsSection({ tools, className }: FeaturedToolsSectionProps) {
  const t = useTranslations('home.featured')
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>('carousel')
  const [filterType, setFilterType] = React.useState<FilterType>('featured')

  const filteredTools = React.useMemo(() => {
    switch (filterType) {
      case 'popular':
        return tools
          .filter(tool => tool.isPopular)
          .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      case 'new':
        return tools.filter(tool => tool.isNew)
      case 'recent':
        return tools
          .filter(tool => tool.lastUsed)
          .sort((a, b) => {
            const dateA = a.lastUsed?.getTime() || 0
            const dateB = b.lastUsed?.getTime() || 0
            return dateB - dateA
          })
      default:
        return tools.filter(tool => tool.isFeatured)
    }
  }, [tools, filterType])

  const filterTabs = [
    { value: 'featured', label: t('tabs.featured'), icon: Star },
    { value: 'popular', label: t('tabs.popular'), icon: TrendingUp },
    { value: 'new', label: t('tabs.new'), icon: Sparkles },
    { value: 'recent', label: t('tabs.recent'), icon: Clock },
  ]

  const displayModes = [
    { value: 'carousel', icon: LayoutGrid, label: t('display.carousel') },
    { value: 'grid', icon: Grid3x3, label: t('display.grid') },
    { value: 'list', icon: List, label: t('display.list') },
  ]

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <Container>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {t('title')}
            </h2>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {displayModes.map((mode) => (
              <Button
                key={mode.value}
                variant={displayMode === mode.value ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setDisplayMode(mode.value as DisplayMode)}
                title={mode.label}
              >
                <mode.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {filterTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={filterType} className="mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filterType}-${displayMode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {displayMode === 'carousel' && (
                  <ToolCarousel tools={filteredTools} />
                )}
                {displayMode === 'grid' && (
                  <ToolGrid tools={filteredTools} />
                )}
                {displayMode === 'list' && (
                  <ToolList tools={filteredTools} />
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </Container>
    </section>
  )
}

// Carousel Display Component
function ToolCarousel({ tools }: { tools: Tool[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  )

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <ToolCard {...tool} className="h-full" />
            </div>
          ))}
        </div>
      </div>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
        onClick={scrollNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Grid Display Component
function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} {...tool} />
      ))}
    </div>
  )
}

// List Display Component
function ToolList({ tools }: { tools: Tool[] }) {
  const t = useTranslations('home.featured')
  
  return (
    <div className="space-y-4">
      {tools.map((tool) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group"
        >
          <Link href={tool.href}>
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              {tool.icon && (
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">{tool.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {tool.description}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {tool.usageCount && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {tool.usageCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('uses')}
                    </div>
                  </div>
                )}
                
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
```

### 2. Create Tool Preview Component

#### Create `src/components/home/tool-preview.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Clock, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ToolPreviewProps {
  tool: {
    id: string
    title: string
    description: string
    category?: string
    usageCount?: number
    rating?: number
    lastUpdate?: Date
    href: string
  }
  children: React.ReactNode
}

export function ToolPreview({ tool, children }: ToolPreviewProps) {
  const t = useTranslations('home.preview')

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg">{tool.title}</h4>
            {tool.category && (
              <Badge variant="secondary" className="mt-1">
                {tool.category}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {tool.description}
          </p>

          <div className="grid grid-cols-3 gap-4 text-sm">
            {tool.usageCount !== undefined && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>{tool.usageCount.toLocaleString()}</span>
              </div>
            )}
            
            {tool.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{tool.rating.toFixed(1)}</span>
              </div>
            )}
            
            {tool.lastUpdate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatRelativeTime(tool.lastUpdate)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1" asChild>
              <Link href={tool.href}>
                {t('tryNow')}
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`${tool.href}?info=true`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}
```

### 3. Create Recommendation Engine

#### Create `src/lib/recommendations.ts`
```typescript
interface Tool {
  id: string
  categoryId: string
  usageCount: number
  tags: string[]
}

interface UserActivity {
  toolId: string
  timestamp: Date
  duration?: number
}

export class RecommendationEngine {
  private activities: UserActivity[] = []

  constructor() {
    // Load activities from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tool-activities')
      if (stored) {
        this.activities = JSON.parse(stored).map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        }))
      }
    }
  }

  trackActivity(toolId: string, duration?: number) {
    const activity: UserActivity = {
      toolId,
      timestamp: new Date(),
      duration,
    }
    
    this.activities.push(activity)
    
    // Keep only last 50 activities
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(-50)
    }
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('tool-activities', JSON.stringify(this.activities))
    }
  }

  getRecommendations(tools: Tool[], limit: number = 6): Tool[] {
    // Get recently used tools
    const recentToolIds = this.activities
      .slice(-10)
      .map(a => a.toolId)
    
    // Get categories of recently used tools
    const recentCategories = new Set(
      tools
        .filter(t => recentToolIds.includes(t.id))
        .map(t => t.categoryId)
    )
    
    // Score tools based on:
    // 1. Same category as recently used
    // 2. Overall popularity
    // 3. Not recently used (to show variety)
    const scoredTools = tools
      .filter(t => !recentToolIds.includes(t.id))
      .map(tool => {
        let score = tool.usageCount || 0
        
        // Boost score if in same category
        if (recentCategories.has(tool.categoryId)) {
          score *= 1.5
        }
        
        return { tool, score }
      })
      .sort((a, b) => b.score - a.score)
    
    return scoredTools
      .slice(0, limit)
      .map(item => item.tool)
  }

  getRecentTools(tools: Tool[], limit: number = 6): Tool[] {
    const recentIds = this.activities
      .slice(-limit)
      .reverse()
      .map(a => a.toolId)
      .filter((id, index, self) => self.indexOf(id) === index)
    
    return recentIds
      .map(id => tools.find(t => t.id === id))
      .filter(Boolean) as Tool[]
  }
}

export const recommendationEngine = new RecommendationEngine()
```

### 4. Update Translations

Add to `src/i18n/locales/en/home.json`:
```json
{
  "featured": {
    "title": "Featured Tools",
    "subtitle": "Our most powerful and popular text tools",
    "tabs": {
      "featured": "Featured",
      "popular": "Most Popular",
      "new": "New Tools",
      "recent": "Recently Used"
    },
    "display": {
      "carousel": "Carousel view",
      "grid": "Grid view",
      "list": "List view"
    },
    "uses": "uses",
    "tryNow": "Try Now"
  },
  "preview": {
    "tryNow": "Try Now",
    "learnMore": "Learn More"
  }
}
```

### 5. Add Carousel Dependency

Update `package.json`:
```json
{
  "dependencies": {
    "embla-carousel-react": "^8.0.0",
    "embla-carousel-autoplay": "^8.0.0"
  }
}
```

## Testing & Verification

1. Test carousel auto-rotation
2. Verify swipe on mobile
3. Test all display modes
4. Check filter functionality
5. Test recommendation engine
6. Verify preview on hover

## Success Indicators
- ✅ Multiple display modes work
- ✅ Filtering functional
- ✅ Carousel auto-rotates
- ✅ Mobile swipe support
- ✅ Recommendations relevant
- ✅ Preview information accurate
- ✅ Performance optimized

## Next Steps
Proceed to Story 3.4: Search & Filter System

## Notes
- Consider lazy loading for images
- Add analytics for tool impressions
- Test carousel on touch devices
- Monitor recommendation accuracy