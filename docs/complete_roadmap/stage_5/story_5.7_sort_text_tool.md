# Story 5.7: Sort Text Tool

## Story Details
- **Stage**: 5 - Text Formatting Tools
- **Priority**: Medium
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a comprehensive text sorting tool that can sort lines, words, or custom delimited items with various sorting algorithms and options including alphabetical, numerical, length-based, and custom sorting.

## Acceptance Criteria
- [ ] Sort lines alphabetically (A-Z, Z-A)
- [ ] Sort numerically (ascending/descending)
- [ ] Sort by length
- [ ] Sort by date/time
- [ ] Natural sort (alphanumeric)
- [ ] Case sensitive/insensitive options
- [ ] Remove duplicates while sorting
- [ ] Custom sort order
- [ ] Multi-level sorting
- [ ] Sort statistics display

## Implementation Steps

### 1. Create Sort Text Logic

#### Create `src/lib/text-format/sort-text.ts`
```typescript
export interface SortOptions {
  text: string
  mode: 'lines' | 'words' | 'custom'
  sortType: 'alphabetical' | 'numerical' | 'length' | 'natural' | 'date' | 'custom'
  direction: 'ascending' | 'descending'
  caseSensitive: boolean
  trimWhitespace: boolean
  removeDuplicates: boolean
  customDelimiter?: string
  customOrder?: string[]
  locale?: string
}

export interface SortResult {
  output: string
  stats: {
    originalCount: number
    sortedCount: number
    duplicatesRemoved: number
    sortTime: number
  }
  errors: string[]
}

export interface MultiLevelSort {
  primary: SortOptions['sortType']
  secondary?: SortOptions['sortType']
  tertiary?: SortOptions['sortType']
}

export class SortText {
  // Main sort function
  static sort(options: SortOptions): SortResult {
    const startTime = performance.now()
    
    const {
      text,
      mode = 'lines',
      sortType = 'alphabetical',
      direction = 'ascending',
      caseSensitive = true,
      trimWhitespace = true,
      removeDuplicates = false,
      customDelimiter,
      customOrder = [],
      locale = 'en-US',
    } = options
    
    if (!text) {
      return {
        output: '',
        stats: {
          originalCount: 0,
          sortedCount: 0,
          duplicatesRemoved: 0,
          sortTime: 0,
        },
        errors: [],
      }
    }
    
    // Split text into items
    let items: string[]
    let delimiter: string
    
    switch (mode) {
      case 'lines':
        items = text.split('\n')
        delimiter = '\n'
        break
      case 'words':
        items = text.split(/\s+/).filter(Boolean)
        delimiter = ' '
        break
      case 'custom':
        delimiter = customDelimiter || ','
        items = text.split(delimiter)
        break
      default:
        items = [text]
        delimiter = ''
    }
    
    const originalCount = items.length
    
    // Trim whitespace if requested
    if (trimWhitespace) {
      items = items.map(item => item.trim())
    }
    
    // Sort items
    const { sorted, errors } = this.sortItems(items, {
      sortType,
      direction,
      caseSensitive,
      customOrder,
      locale,
    })
    
    // Remove duplicates if requested
    let finalItems = sorted
    let duplicatesRemoved = 0
    
    if (removeDuplicates) {
      const unique = new Set(finalItems)
      duplicatesRemoved = finalItems.length - unique.size
      finalItems = Array.from(unique)
    }
    
    const output = finalItems.join(delimiter)
    const sortTime = performance.now() - startTime
    
    return {
      output,
      stats: {
        originalCount,
        sortedCount: finalItems.length,
        duplicatesRemoved,
        sortTime,
      },
      errors,
    }
  }
  
  // Sort items based on sort type
  private static sortItems(
    items: string[],
    options: {
      sortType: SortOptions['sortType']
      direction: SortOptions['direction']
      caseSensitive: boolean
      customOrder: string[]
      locale: string
    }
  ): { sorted: string[]; errors: string[] } {
    const { sortType, direction, caseSensitive, customOrder, locale } = options
    const errors: string[] = []
    
    let sorted: string[]
    
    switch (sortType) {
      case 'alphabetical':
        sorted = this.sortAlphabetically(items, caseSensitive, locale)
        break
        
      case 'numerical':
        const numResult = this.sortNumerically(items)
        sorted = numResult.sorted
        errors.push(...numResult.errors)
        break
        
      case 'length':
        sorted = this.sortByLength(items)
        break
        
      case 'natural':
        sorted = this.sortNaturally(items, caseSensitive, locale)
        break
        
      case 'date':
        const dateResult = this.sortByDate(items)
        sorted = dateResult.sorted
        errors.push(...dateResult.errors)
        break
        
      case 'custom':
        sorted = this.sortByCustomOrder(items, customOrder)
        break
        
      default:
        sorted = [...items]
    }
    
    // Reverse if descending
    if (direction === 'descending') {
      sorted.reverse()
    }
    
    return { sorted, errors }
  }
  
  // Alphabetical sort
  private static sortAlphabetically(
    items: string[],
    caseSensitive: boolean,
    locale: string
  ): string[] {
    return [...items].sort((a, b) => {
      if (!caseSensitive) {
        a = a.toLowerCase()
        b = b.toLowerCase()
      }
      return a.localeCompare(b, locale)
    })
  }
  
  // Numerical sort
  private static sortNumerically(
    items: string[]
  ): { sorted: string[]; errors: string[] } {
    const errors: string[] = []
    const parsed: Array<{ original: string; value: number }> = []
    
    items.forEach((item, index) => {
      const num = parseFloat(item)
      if (isNaN(num)) {
        errors.push(`Line ${index + 1}: "${item}" is not a valid number`)
        parsed.push({ original: item, value: Infinity })
      } else {
        parsed.push({ original: item, value: num })
      }
    })
    
    parsed.sort((a, b) => a.value - b.value)
    
    return {
      sorted: parsed.map(p => p.original),
      errors,
    }
  }
  
  // Sort by length
  private static sortByLength(items: string[]): string[] {
    return [...items].sort((a, b) => a.length - b.length)
  }
  
  // Natural sort (handles alphanumeric properly)
  private static sortNaturally(
    items: string[],
    caseSensitive: boolean,
    locale: string
  ): string[] {
    const collator = new Intl.Collator(locale, {
      numeric: true,
      sensitivity: caseSensitive ? 'case' : 'base',
    })
    
    return [...items].sort(collator.compare)
  }
  
  // Sort by date
  private static sortByDate(
    items: string[]
  ): { sorted: string[]; errors: string[] } {
    const errors: string[] = []
    const parsed: Array<{ original: string; date: Date }> = []
    
    items.forEach((item, index) => {
      const date = new Date(item)
      if (isNaN(date.getTime())) {
        errors.push(`Line ${index + 1}: "${item}" is not a valid date`)
        parsed.push({ original: item, date: new Date(0) })
      } else {
        parsed.push({ original: item, date })
      }
    })
    
    parsed.sort((a, b) => a.date.getTime() - b.date.getTime())
    
    return {
      sorted: parsed.map(p => p.original),
      errors,
    }
  }
  
  // Sort by custom order
  private static sortByCustomOrder(
    items: string[],
    customOrder: string[]
  ): string[] {
    if (customOrder.length === 0) return [...items]
    
    const orderMap = new Map<string, number>()
    customOrder.forEach((item, index) => {
      orderMap.set(item, index)
    })
    
    return [...items].sort((a, b) => {
      const indexA = orderMap.get(a) ?? Infinity
      const indexB = orderMap.get(b) ?? Infinity
      return indexA - indexB
    })
  }
  
  // Multi-level sort
  static multiLevelSort(
    text: string,
    levels: MultiLevelSort,
    options: Partial<SortOptions>
  ): SortResult {
    const startTime = performance.now()
    
    const {
      mode = 'lines',
      caseSensitive = true,
      trimWhitespace = true,
      locale = 'en-US',
    } = options
    
    // Split text
    const delimiter = mode === 'lines' ? '\n' : ' '
    let items = text.split(delimiter)
    
    if (trimWhitespace) {
      items = items.map(item => item.trim())
    }
    
    // Create comparison function
    const compare = (a: string, b: string): number => {
      // Primary sort
      let result = this.compareByType(a, b, levels.primary, caseSensitive, locale)
      
      // Secondary sort if primary is equal
      if (result === 0 && levels.secondary) {
        result = this.compareByType(a, b, levels.secondary, caseSensitive, locale)
      }
      
      // Tertiary sort if secondary is equal
      if (result === 0 && levels.tertiary) {
        result = this.compareByType(a, b, levels.tertiary, caseSensitive, locale)
      }
      
      return result
    }
    
    const sorted = [...items].sort(compare)
    const sortTime = performance.now() - startTime
    
    return {
      output: sorted.join(delimiter),
      stats: {
        originalCount: items.length,
        sortedCount: sorted.length,
        duplicatesRemoved: 0,
        sortTime,
      },
      errors: [],
    }
  }
  
  // Compare two items by sort type
  private static compareByType(
    a: string,
    b: string,
    sortType: SortOptions['sortType'],
    caseSensitive: boolean,
    locale: string
  ): number {
    switch (sortType) {
      case 'alphabetical':
        if (!caseSensitive) {
          a = a.toLowerCase()
          b = b.toLowerCase()
        }
        return a.localeCompare(b, locale)
        
      case 'numerical':
        const numA = parseFloat(a)
        const numB = parseFloat(b)
        if (isNaN(numA) && isNaN(numB)) return 0
        if (isNaN(numA)) return 1
        if (isNaN(numB)) return -1
        return numA - numB
        
      case 'length':
        return a.length - b.length
        
      case 'natural':
        const collator = new Intl.Collator(locale, {
          numeric: true,
          sensitivity: caseSensitive ? 'case' : 'base',
        })
        return collator.compare(a, b)
        
      default:
        return 0
    }
  }
  
  // Common sort presets
  static readonly PRESETS = {
    A_TO_Z: {
      sortType: 'alphabetical' as const,
      direction: 'ascending' as const,
      caseSensitive: false,
    },
    Z_TO_A: {
      sortType: 'alphabetical' as const,
      direction: 'descending' as const,
      caseSensitive: false,
    },
    SHORTEST_FIRST: {
      sortType: 'length' as const,
      direction: 'ascending' as const,
      caseSensitive: true,
    },
    LONGEST_FIRST: {
      sortType: 'length' as const,
      direction: 'descending' as const,
      caseSensitive: true,
    },
    NATURAL_SORT: {
      sortType: 'natural' as const,
      direction: 'ascending' as const,
      caseSensitive: false,
    },
  }
  
  // Shuffle items randomly
  static shuffle(text: string, mode: 'lines' | 'words' = 'lines'): string {
    const delimiter = mode === 'lines' ? '\n' : ' '
    const items = text.split(delimiter).filter(Boolean)
    
    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    
    return items.join(delimiter)
  }
  
  // Reverse order
  static reverse(text: string, mode: 'lines' | 'words' = 'lines'): string {
    const delimiter = mode === 'lines' ? '\n' : ' '
    const items = text.split(delimiter).filter(Boolean)
    return items.reverse().join(delimiter)
  }
}

// Export convenience functions
export const sortAtoZ = (text: string) =>
  SortText.sort({
    text,
    mode: 'lines',
    ...SortText.PRESETS.A_TO_Z,
  })

export const sortByLength = (text: string) =>
  SortText.sort({
    text,
    mode: 'lines',
    ...SortText.PRESETS.SHORTEST_FIRST,
  })
```

### 2. Create Sort Text Component

#### Create `src/components/tools/text-format/sort-text-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shuffle,
  AlertCircle,
  Timer
} from 'lucide-react'
import { 
  SortText, 
  SortOptions,
  MultiLevelSort 
} from '@/lib/text-format/sort-text'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { cn } from '@/lib/utils'

export function SortTextTool() {
  const [input, setInput] = React.useState('')
  const [mode, setMode] = React.useState<SortOptions['mode']>('lines')
  const [sortType, setSortType] = React.useState<SortOptions['sortType']>('alphabetical')
  const [direction, setDirection] = React.useState<SortOptions['direction']>('ascending')
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [trimWhitespace, setTrimWhitespace] = React.useState(true)
  const [removeDuplicates, setRemoveDuplicates] = React.useState(false)
  const [customDelimiter, setCustomDelimiter] = React.useState(',')
  const [customOrder, setCustomOrder] = React.useState('')
  const [locale, setLocale] = React.useState('en-US')
  const [multiLevel, setMultiLevel] = React.useState(false)
  const [secondarySort, setSecondarySort] = React.useState<SortOptions['sortType']>('alphabetical')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'sort-text',
    toolName: 'Sort Text',
    category: 'text-formatting',
  })
  
  // Process sorting
  const result = React.useMemo(() => {
    if (!input) return null
    
    trackStart(input)
    
    let sortResult
    
    if (multiLevel && secondarySort) {
      sortResult = SortText.multiLevelSort(
        input,
        {
          primary: sortType,
          secondary: secondarySort,
        },
        {
          mode,
          caseSensitive,
          trimWhitespace,
          locale,
        }
      )
    } else {
      const options: SortOptions = {
        text: input,
        mode,
        sortType,
        direction,
        caseSensitive,
        trimWhitespace,
        removeDuplicates,
        customDelimiter,
        customOrder: customOrder ? customOrder.split('\n').filter(Boolean) : [],
        locale,
      }
      
      sortResult = SortText.sort(options)
    }
    
    trackComplete(input, sortResult.output)
    
    return sortResult
  }, [
    input,
    mode,
    sortType,
    direction,
    caseSensitive,
    trimWhitespace,
    removeDuplicates,
    customDelimiter,
    customOrder,
    locale,
    multiLevel,
    secondarySort,
    trackStart,
    trackComplete
  ])
  
  const handlePreset = (presetKey: keyof typeof SortText.PRESETS) => {
    const preset = SortText.PRESETS[presetKey]
    setSortType(preset.sortType)
    setDirection(preset.direction)
    setCaseSensitive(preset.caseSensitive)
    
    trackFeature('use_preset', { preset: presetKey })
  }
  
  const handleShuffle = () => {
    if (!input) return
    
    const shuffled = SortText.shuffle(input, mode)
    setInput(shuffled)
    
    trackFeature('shuffle')
    
    toast({
      title: 'Shuffled!',
      description: 'Items have been randomly shuffled',
    })
  }
  
  const handleReverse = () => {
    if (!input) return
    
    const reversed = SortText.reverse(input, mode)
    setInput(reversed)
    
    trackFeature('reverse')
    
    toast({
      title: 'Reversed!',
      description: 'Order has been reversed',
    })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Sort Text
          </CardTitle>
          <CardDescription>
            Sort lines or words alphabetically, numerically, by length, or custom order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Text to sort</Label>
            <Textarea
              id="input"
              placeholder="Enter text to sort..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] font-mono"
            />
            <CounterDisplay
              current={input.length}
              label="characters"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('A_TO_Z')}
            >
              A → Z
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('Z_TO_A')}
            >
              Z → A
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('SHORTEST_FIRST')}
            >
              Shortest First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('LONGEST_FIRST')}
            >
              Longest First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('NATURAL_SORT')}
            >
              Natural Sort
            </Button>
          </div>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Options</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sort what</Label>
                  <RadioGroup value={mode} onValueChange={setMode as any}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lines" id="lines" />
                      <Label htmlFor="lines" className="font-normal">
                        Lines
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="words" id="words" />
                      <Label htmlFor="words" className="font-normal">
                        Words
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="font-normal">
                        Custom delimiter
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {mode === 'custom' && (
                    <Input
                      placeholder="Enter delimiter..."
                      value={customDelimiter}
                      onChange={(e) => setCustomDelimiter(e.target.value)}
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortType">Sort type</Label>
                  <Select value={sortType} onValueChange={setSortType as any}>
                    <SelectTrigger id="sortType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      <SelectItem value="numerical">Numerical</SelectItem>
                      <SelectItem value="length">By Length</SelectItem>
                      <SelectItem value="natural">Natural (Alphanumeric)</SelectItem>
                      <SelectItem value="date">By Date</SelectItem>
                      <SelectItem value="custom">Custom Order</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={direction === 'ascending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDirection('ascending')}
                      className="flex-1"
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Ascending
                    </Button>
                    <Button
                      variant={direction === 'descending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDirection('descending')}
                      className="flex-1"
                    >
                      <ArrowDown className="h-4 w-4 mr-2" />
                      Descending
                    </Button>
                  </div>
                </div>
              </div>
              
              {sortType === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customOrder">Custom sort order (one per line)</Label>
                  <Textarea
                    id="customOrder"
                    placeholder="Enter items in desired order..."
                    value={customOrder}
                    onChange={(e) => setCustomOrder(e.target.value)}
                    className="min-h-[100px] font-mono"
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="caseSensitive" className="font-normal">
                    Case sensitive
                  </Label>
                  <Switch
                    id="caseSensitive"
                    checked={caseSensitive}
                    onCheckedChange={setCaseSensitive}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="trimWhitespace" className="font-normal">
                    Trim whitespace
                  </Label>
                  <Switch
                    id="trimWhitespace"
                    checked={trimWhitespace}
                    onCheckedChange={setTrimWhitespace}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="removeDuplicates" className="font-normal">
                    Remove duplicates
                  </Label>
                  <Switch
                    id="removeDuplicates"
                    checked={removeDuplicates}
                    onCheckedChange={setRemoveDuplicates}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="multiLevel" className="font-normal">
                    Multi-level sort
                  </Label>
                  <Switch
                    id="multiLevel"
                    checked={multiLevel}
                    onCheckedChange={setMultiLevel}
                  />
                </div>
              </div>
              
              {multiLevel && (
                <div className="space-y-2">
                  <Label htmlFor="secondarySort">Secondary sort</Label>
                  <Select value={secondarySort} onValueChange={setSecondarySort as any}>
                    <SelectTrigger id="secondarySort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      <SelectItem value="numerical">Numerical</SelectItem>
                      <SelectItem value="length">By Length</SelectItem>
                      <SelectItem value="natural">Natural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="locale">Locale for sorting</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger id="locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="it-IT">Italian</SelectItem>
                    <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                    <SelectItem value="ru-RU">Russian</SelectItem>
                    <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                    <SelectItem value="ja-JP">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              disabled={!input}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReverse}
              disabled={!input}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Reverse
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sorted Result</CardTitle>
              {result.stats.sortTime > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {result.stats.sortTime.toFixed(2)}ms
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {result.errors.slice(0, 5).map((error, i) => (
                      <div key={i} className="text-sm">{error}</div>
                    ))}
                    {result.errors.length > 5 && (
                      <div className="text-sm">
                        ... and {result.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Textarea
                value={result.output}
                readOnly
                className="min-h-[200px] font-mono"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <CounterDisplay
                  current={result.output.length}
                  label="characters"
                />
                <div className="flex gap-4">
                  <span>{result.stats.originalCount} → {result.stats.sortedCount} items</span>
                  {result.stats.duplicatesRemoved > 0 && (
                    <Badge variant="destructive">
                      {result.stats.duplicatesRemoved} duplicates removed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <CopyButton
                text={result.output}
                onCopy={() => {
                  trackFeature('copy_output')
                  toast({
                    title: 'Copied!',
                    description: 'Sorted text copied to clipboard',
                  })
                }}
              />
              <DownloadButton
                text={result.output}
                filename="sorted-text.txt"
                onDownload={() => trackFeature('download_output')}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput('')}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/sort-text/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SortTextTool } from '@/components/tools/text-format/sort-text-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.sortText' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['sort text', 'alphabetical sort', 'sort lines', 'natural sort', 'text organizer'],
    locale,
    path: '/tools/sort-text',
  })
}

export default function SortTextPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="sort-text"
      locale={locale}
    >
      <SortTextTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test alphabetical sorting
2. Verify numerical sorting
3. Test natural sort with alphanumeric
4. Check multi-level sorting
5. Verify custom sort order
6. Test performance with large datasets

## Notes
- Support for international characters
- Natural sorting for version numbers
- Multi-level sorting capabilities
- Custom sort order support
- Performance optimization for large lists