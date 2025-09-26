# Story 3.4: Search & Filter System

## Story Details
- **Stage**: 3 - Homepage & Category Pages
- **Priority**: High
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 3.3 (Featured Tools Section)

## Objective
Implement a comprehensive search and filter system that allows users to quickly find tools through text search, category filters, tags, and advanced filtering options. The system should provide instant results with a great user experience.

## Acceptance Criteria
- [ ] Instant search with debouncing
- [ ] Search suggestions/autocomplete
- [ ] Category filtering
- [ ] Tag-based filtering
- [ ] Sort options (popularity, name, date)
- [ ] Advanced filters (features, languages)
- [ ] Search history
- [ ] Filter persistence in URL
- [ ] Mobile-optimized filters
- [ ] Search analytics

## Implementation Steps

### 1. Create Search Context

#### Create `src/contexts/search-context.tsx`
```typescript
'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tool } from '@/types/tool'

interface SearchFilters {
  query: string
  categories: string[]
  tags: string[]
  sortBy: 'popular' | 'name' | 'recent' | 'rating'
  features?: string[]
  languages?: string[]
}

interface SearchContextValue {
  filters: SearchFilters
  results: Tool[]
  isSearching: boolean
  totalResults: number
  suggestions: string[]
  recentSearches: string[]
  updateFilters: (filters: Partial<SearchFilters>) => void
  clearFilters: () => void
  addToHistory: (query: string) => void
}

const SearchContext = React.createContext<SearchContextValue | undefined>(undefined)

export function useSearch() {
  const context = React.useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}

interface SearchProviderProps {
  children: React.ReactNode
  tools: Tool[]
}

export function SearchProvider({ children, tools }: SearchProviderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = React.useState<SearchFilters>({
    query: searchParams.get('q') || '',
    categories: searchParams.getAll('category'),
    tags: searchParams.getAll('tag'),
    sortBy: (searchParams.get('sort') as any) || 'popular',
    features: searchParams.getAll('feature'),
    languages: searchParams.getAll('lang'),
  })
  
  const [isSearching, setIsSearching] = React.useState(false)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])

  // Load recent searches from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('recent-searches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  // Search implementation
  const results = React.useMemo(() => {
    let filtered = [...tools]

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(tool =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(tool =>
        filters.categories.includes(tool.categoryId)
      )
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(tool =>
        tool.tags?.some(tag => filters.tags.includes(tag))
      )
    }

    // Feature filter
    if (filters.features?.length) {
      filtered = filtered.filter(tool =>
        filters.features!.every(feature =>
          tool.features?.includes(feature)
        )
      )
    }

    // Language filter
    if (filters.languages?.length) {
      filtered = filtered.filter(tool =>
        filters.languages!.some(lang =>
          tool.supportedLanguages?.includes(lang)
        )
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular':
          return (b.usageCount || 0) - (a.usageCount || 0)
        case 'name':
          return a.title.localeCompare(b.title)
        case 'recent':
          return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [tools, filters])

  // Generate suggestions
  const suggestions = React.useMemo(() => {
    if (!filters.query || filters.query.length < 2) return []
    
    const query = filters.query.toLowerCase()
    const suggestionSet = new Set<string>()
    
    tools.forEach(tool => {
      if (tool.title.toLowerCase().includes(query)) {
        suggestionSet.add(tool.title)
      }
      tool.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          suggestionSet.add(tag)
        }
      })
    })
    
    return Array.from(suggestionSet).slice(0, 5)
  }, [tools, filters.query])

  // Update filters and URL
  const updateFilters = React.useCallback((newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    
    // Update URL params
    const params = new URLSearchParams()
    if (updated.query) params.set('q', updated.query)
    updated.categories.forEach(cat => params.append('category', cat))
    updated.tags.forEach(tag => params.append('tag', tag))
    if (updated.sortBy !== 'popular') params.set('sort', updated.sortBy)
    updated.features?.forEach(f => params.append('feature', f))
    updated.languages?.forEach(l => params.append('lang', l))
    
    router.push(`?${params.toString()}`, { scroll: false })
  }, [filters, router])

  const clearFilters = React.useCallback(() => {
    setFilters({
      query: '',
      categories: [],
      tags: [],
      sortBy: 'popular',
      features: [],
      languages: [],
    })
    router.push('/', { scroll: false })
  }, [router])

  const addToHistory = React.useCallback((query: string) => {
    if (!query.trim()) return
    
    const updated = [
      query,
      ...recentSearches.filter(q => q !== query)
    ].slice(0, 10)
    
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))
  }, [recentSearches])

  const value = React.useMemo(() => ({
    filters,
    results,
    isSearching,
    totalResults: results.length,
    suggestions,
    recentSearches,
    updateFilters,
    clearFilters,
    addToHistory,
  }), [
    filters,
    results,
    isSearching,
    suggestions,
    recentSearches,
    updateFilters,
    clearFilters,
    addToHistory,
  ])

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}
```

### 2. Create Search Bar Component

#### Create `src/components/search/search-bar.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSearch } from '@/contexts/search-context'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SearchBarProps {
  className?: string
  placeholder?: string
  showSuggestions?: boolean
  showRecent?: boolean
  autoFocus?: boolean
}

export function SearchBar({
  className,
  placeholder,
  showSuggestions = true,
  showRecent = true,
  autoFocus = false,
}: SearchBarProps) {
  const t = useTranslations('search')
  const { filters, suggestions, recentSearches, updateFilters, addToHistory } = useSearch()
  const [localQuery, setLocalQuery] = React.useState(filters.query)
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const popularSearches = [
    'uppercase', 'base64', 'json formatter', 'password generator'
  ]

  const handleSearch = (query: string) => {
    setLocalQuery(query)
    updateFilters({ query })
    if (query.trim()) {
      addToHistory(query)
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    setLocalQuery('')
    updateFilters({ query: '' })
    inputRef.current?.focus()
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== filters.query) {
        updateFilters({ query: localQuery })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localQuery])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={cn('relative', className)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || t('placeholder')}
            className="pl-9 pr-9"
            autoFocus={autoFocus}
          />
          {localQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[400px] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {suggestions.length > 0 && showSuggestions && (
              <CommandGroup heading={t('suggestions')}>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    onSelect={() => handleSearch(suggestion)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {recentSearches.length > 0 && showRecent && !localQuery && (
              <CommandGroup heading={t('recent')}>
                {recentSearches.map((search) => (
                  <CommandItem
                    key={search}
                    onSelect={() => handleSearch(search)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {search}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!localQuery && (
              <CommandGroup heading={t('popular')}>
                {popularSearches.map((search) => (
                  <CommandItem
                    key={search}
                    onSelect={() => handleSearch(search)}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {search}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {localQuery && suggestions.length === 0 && (
              <CommandEmpty>{t('noResults')}</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

### 3. Create Filter Panel Component

#### Create `src/components/search/filter-panel.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useSearch } from '@/contexts/search-context'
import { toolCategories } from '@/config/categories'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  className?: string
  showAsSheet?: boolean
}

export function FilterPanel({ className, showAsSheet = false }: FilterPanelProps) {
  const t = useTranslations('search.filters')
  const { filters, updateFilters, clearFilters } = useSearch()
  
  const activeFilterCount = 
    filters.categories.length + 
    filters.tags.length + 
    (filters.features?.length || 0) +
    (filters.languages?.length || 0)

  const availableTags = [
    'converter', 'encoder', 'decoder', 'formatter', 
    'generator', 'validator', 'parser', 'minifier'
  ]

  const availableFeatures = [
    'batch-processing', 'file-upload', 'api-access', 
    'export-options', 'history', 'sharing'
  ]

  const availableLanguages = ['en', 'fr', 'ru', 'it']

  const content = (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {t('title')}
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            {t('clearAll')}
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={['categories', 'sort']}>
        {/* Sort Options */}
        <AccordionItem value="sort">
          <AccordionTrigger>{t('sortBy')}</AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={filters.sortBy}
              onValueChange={(value: any) => updateFilters({ sortBy: value })}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="popular" id="sort-popular" />
                  <Label htmlFor="sort-popular">{t('sortOptions.popular')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="name" id="sort-name" />
                  <Label htmlFor="sort-name">{t('sortOptions.name')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recent" id="sort-recent" />
                  <Label htmlFor="sort-recent">{t('sortOptions.recent')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rating" id="sort-rating" />
                  <Label htmlFor="sort-rating">{t('sortOptions.rating')}</Label>
                </div>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger>
            {t('categories')}
            {filters.categories.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filters.categories.length}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {Object.entries(toolCategories).map(([id, category]) => (
                <div key={id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${id}`}
                    checked={filters.categories.includes(id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFilters({
                          categories: [...filters.categories, id]
                        })
                      } else {
                        updateFilters({
                          categories: filters.categories.filter(c => c !== id)
                        })
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`cat-${id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tags */}
        <AccordionItem value="tags">
          <AccordionTrigger>
            {t('tags')}
            {filters.tags.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filters.tags.length}
              </Badge>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (filters.tags.includes(tag)) {
                      updateFilters({
                        tags: filters.tags.filter(t => t !== tag)
                      })
                    } else {
                      updateFilters({
                        tags: [...filters.tags, tag]
                      })
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Features */}
        <AccordionItem value="features">
          <AccordionTrigger>{t('features')}</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {availableFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={`feat-${feature}`}
                    checked={filters.features?.includes(feature) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.features || []
                      if (checked) {
                        updateFilters({
                          features: [...current, feature]
                        })
                      } else {
                        updateFilters({
                          features: current.filter(f => f !== feature)
                        })
                      }
                    }}
                  />
                  <Label htmlFor={`feat-${feature}`}>
                    {t(`featureOptions.${feature}`)}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

  if (showAsSheet) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('title')}
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('title')}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return content
}
```

### 4. Create Search Results Component

#### Create `src/components/search/search-results.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { useSearch } from '@/contexts/search-context'
import { ToolGrid } from '@/components/tools/tool-grid'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SearchX, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function SearchResults() {
  const t = useTranslations('search.results')
  const { filters, results, totalResults, clearFilters } = useSearch()

  if (totalResults === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <SearchX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {t('noResults')}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t('noResultsDescription')}
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={clearFilters}>
            {t('clearFilters')}
          </Button>
          <Button>
            {t('browseAll')}
          </Button>
        </div>
      </motion.div>
    )
  }

  const hasActiveFilters = 
    filters.query || 
    filters.categories.length > 0 || 
    filters.tags.length > 0

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            {t('showing', { count: totalResults })}
            {filters.query && (
              <span className="font-medium"> "{filters.query}"</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <ToolGrid tools={results} />
    </div>
  )
}
```

### 5. Update Translations

Add to `src/i18n/locales/en/search.json`:
```json
{
  "placeholder": "Search tools...",
  "suggestions": "Suggestions",
  "recent": "Recent searches",
  "popular": "Popular searches",
  "noResults": "No results found",
  "filters": {
    "title": "Filters",
    "clearAll": "Clear all",
    "sortBy": "Sort by",
    "sortOptions": {
      "popular": "Most Popular",
      "name": "Name (A-Z)",
      "recent": "Recently Updated",
      "rating": "Highest Rated"
    },
    "categories": "Categories",
    "tags": "Tags",
    "features": "Features",
    "featureOptions": {
      "batch-processing": "Batch Processing",
      "file-upload": "File Upload",
      "api-access": "API Access",
      "export-options": "Export Options",
      "history": "History",
      "sharing": "Sharing"
    }
  },
  "results": {
    "showing": "Showing {count} tools",
    "noResults": "No tools found",
    "noResultsDescription": "Try adjusting your filters or search terms",
    "clearFilters": "Clear filters",
    "browseAll": "Browse all tools"
  }
}
```

## Testing & Verification

1. Test instant search
2. Verify autocomplete
3. Test all filter combinations
4. Check URL persistence
5. Test mobile filters
6. Verify search history

## Success Indicators
- ✅ Instant search works
- ✅ Filters update results
- ✅ URL params persist
- ✅ Mobile experience smooth
- ✅ Search history saved
- ✅ Performance optimized

## Next Steps
Proceed to Story 3.5: Homepage Layout Assembly

## Notes
- Consider search analytics
- Add fuzzy search support
- Test with large datasets
- Monitor search performance