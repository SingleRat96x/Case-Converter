# Story 5.6: Remove Duplicates Tool

## Story Details
- **Stage**: 5 - Text Formatting Tools
- **Priority**: Medium
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a tool to remove duplicate lines, words, or custom patterns from text with options for case sensitivity, trimming, and maintaining original order.

## Acceptance Criteria
- [ ] Remove duplicate lines
- [ ] Remove duplicate words
- [ ] Case sensitive/insensitive options
- [ ] Trim whitespace before comparison
- [ ] Keep first or last occurrence
- [ ] Maintain or sort order
- [ ] Show duplicate statistics
- [ ] Custom delimiter support
- [ ] Export duplicate list
- [ ] Real-time processing

## Implementation Steps

### 1. Create Remove Duplicates Logic

#### Create `src/lib/text-format/remove-duplicates.ts`
```typescript
export interface RemoveDuplicatesOptions {
  text: string
  mode: 'lines' | 'words' | 'custom'
  caseSensitive: boolean
  trimWhitespace: boolean
  keepFirst: boolean // true = keep first, false = keep last
  sortResult: boolean
  customDelimiter?: string
  ignoreEmpty: boolean
}

export interface RemoveDuplicatesResult {
  output: string
  stats: {
    originalCount: number
    uniqueCount: number
    duplicatesRemoved: number
    duplicatesList: DuplicateItem[]
  }
}

export interface DuplicateItem {
  value: string
  count: number
  firstIndex: number
  indices: number[]
}

export class RemoveDuplicates {
  // Main function to remove duplicates
  static removeDuplicates(options: RemoveDuplicatesOptions): RemoveDuplicatesResult {
    const {
      text,
      mode = 'lines',
      caseSensitive = true,
      trimWhitespace = true,
      keepFirst = true,
      sortResult = false,
      customDelimiter,
      ignoreEmpty = true,
    } = options
    
    if (!text) {
      return {
        output: '',
        stats: {
          originalCount: 0,
          uniqueCount: 0,
          duplicatesRemoved: 0,
          duplicatesList: [],
        },
      }
    }
    
    let items: string[]
    let delimiter: string
    
    // Split text based on mode
    switch (mode) {
      case 'lines':
        items = text.split('\n')
        delimiter = '\n'
        break
      case 'words':
        items = text.split(/\s+/)
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
    
    // Process items
    const processedItems = items.map(item => {
      let processed = item
      if (trimWhitespace) {
        processed = processed.trim()
      }
      return processed
    })
    
    // Remove duplicates and collect stats
    const { uniqueItems, duplicatesList } = this.findUniqueItems(
      processedItems,
      items,
      {
        caseSensitive,
        keepFirst,
        ignoreEmpty,
      }
    )
    
    // Sort if requested
    let finalItems = uniqueItems
    if (sortResult) {
      finalItems = [...uniqueItems].sort((a, b) => {
        const compareA = caseSensitive ? a : a.toLowerCase()
        const compareB = caseSensitive ? b : b.toLowerCase()
        return compareA.localeCompare(compareB)
      })
    }
    
    // Join back together
    const output = finalItems.join(delimiter)
    
    return {
      output,
      stats: {
        originalCount: items.length,
        uniqueCount: uniqueItems.length,
        duplicatesRemoved: items.length - uniqueItems.length,
        duplicatesList,
      },
    }
  }
  
  // Find unique items and track duplicates
  private static findUniqueItems(
    processedItems: string[],
    originalItems: string[],
    options: {
      caseSensitive: boolean
      keepFirst: boolean
      ignoreEmpty: boolean
    }
  ): {
    uniqueItems: string[]
    duplicatesList: DuplicateItem[]
  } {
    const { caseSensitive, keepFirst, ignoreEmpty } = options
    
    const seen = new Map<string, {
      originalValue: string
      count: number
      firstIndex: number
      indices: number[]
    }>()
    
    const uniqueItems: string[] = []
    const uniqueIndices = new Set<number>()
    
    // First pass: count occurrences
    processedItems.forEach((item, index) => {
      if (ignoreEmpty && item.length === 0) {
        return
      }
      
      const key = caseSensitive ? item : item.toLowerCase()
      const original = originalItems[index]
      
      if (seen.has(key)) {
        const entry = seen.get(key)!
        entry.count++
        entry.indices.push(index)
      } else {
        seen.set(key, {
          originalValue: original,
          count: 1,
          firstIndex: index,
          indices: [index],
        })
      }
    })
    
    // Second pass: build unique list
    if (keepFirst) {
      // Keep first occurrence
      processedItems.forEach((item, index) => {
        if (ignoreEmpty && item.length === 0) {
          return
        }
        
        const key = caseSensitive ? item : item.toLowerCase()
        const entry = seen.get(key)!
        
        if (entry.firstIndex === index) {
          uniqueItems.push(originalItems[index])
          uniqueIndices.add(index)
        }
      })
    } else {
      // Keep last occurrence
      const lastIndices = new Map<string, number>()
      
      processedItems.forEach((item, index) => {
        if (ignoreEmpty && item.length === 0) {
          return
        }
        
        const key = caseSensitive ? item : item.toLowerCase()
        lastIndices.set(key, index)
      })
      
      processedItems.forEach((item, index) => {
        if (ignoreEmpty && item.length === 0) {
          return
        }
        
        const key = caseSensitive ? item : item.toLowerCase()
        
        if (lastIndices.get(key) === index) {
          uniqueItems.push(originalItems[index])
          uniqueIndices.add(index)
        }
      })
    }
    
    // Build duplicates list
    const duplicatesList: DuplicateItem[] = []
    
    seen.forEach((entry, key) => {
      if (entry.count > 1) {
        duplicatesList.push({
          value: entry.originalValue,
          count: entry.count,
          firstIndex: entry.firstIndex,
          indices: entry.indices,
        })
      }
    })
    
    // Sort duplicates by count (descending)
    duplicatesList.sort((a, b) => b.count - a.count)
    
    return { uniqueItems, duplicatesList }
  }
  
  // Advanced duplicate detection with fuzzy matching
  static findSimilarItems(
    items: string[],
    threshold: number = 0.8
  ): Array<{
    item1: string
    item2: string
    similarity: number
  }> {
    const similar: Array<{
      item1: string
      item2: string
      similarity: number
    }> = []
    
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const similarity = this.calculateSimilarity(items[i], items[j])
        
        if (similarity >= threshold) {
          similar.push({
            item1: items[i],
            item2: items[j],
            similarity,
          })
        }
      }
    }
    
    return similar.sort((a, b) => b.similarity - a.similarity)
  }
  
  // Calculate similarity between two strings (Dice coefficient)
  private static calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1
    if (str1.length < 2 || str2.length < 2) return 0
    
    const bigrams1 = this.getBigrams(str1.toLowerCase())
    const bigrams2 = this.getBigrams(str2.toLowerCase())
    
    const intersection = bigrams1.filter(bigram => bigrams2.includes(bigram))
    
    return (2 * intersection.length) / (bigrams1.length + bigrams2.length)
  }
  
  // Get bigrams from a string
  private static getBigrams(str: string): string[] {
    const bigrams: string[] = []
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.substring(i, i + 2))
    }
    return bigrams
  }
  
  // Remove consecutive duplicates only
  static removeConsecutiveDuplicates(
    text: string,
    mode: 'lines' | 'words',
    caseSensitive: boolean = true
  ): RemoveDuplicatesResult {
    const delimiter = mode === 'lines' ? '\n' : ' '
    const items = text.split(delimiter)
    const uniqueItems: string[] = []
    let duplicatesRemoved = 0
    
    items.forEach((item, index) => {
      if (index === 0) {
        uniqueItems.push(item)
      } else {
        const prev = uniqueItems[uniqueItems.length - 1]
        const current = caseSensitive ? item : item.toLowerCase()
        const prevCompare = caseSensitive ? prev : prev.toLowerCase()
        
        if (current !== prevCompare) {
          uniqueItems.push(item)
        } else {
          duplicatesRemoved++
        }
      }
    })
    
    return {
      output: uniqueItems.join(delimiter),
      stats: {
        originalCount: items.length,
        uniqueCount: uniqueItems.length,
        duplicatesRemoved,
        duplicatesList: [],
      },
    }
  }
  
  // Common presets
  static readonly PRESETS = {
    LINES: {
      mode: 'lines' as const,
      caseSensitive: true,
      trimWhitespace: true,
      keepFirst: true,
      sortResult: false,
      ignoreEmpty: true,
    },
    WORDS: {
      mode: 'words' as const,
      caseSensitive: false,
      trimWhitespace: true,
      keepFirst: true,
      sortResult: false,
      ignoreEmpty: true,
    },
    EMAILS: {
      mode: 'lines' as const,
      caseSensitive: false,
      trimWhitespace: true,
      keepFirst: true,
      sortResult: true,
      ignoreEmpty: true,
    },
    CSV_ROWS: {
      mode: 'lines' as const,
      caseSensitive: true,
      trimWhitespace: false,
      keepFirst: true,
      sortResult: false,
      ignoreEmpty: false,
    },
  }
  
  // Export duplicates as report
  static exportDuplicatesReport(
    duplicatesList: DuplicateItem[],
    format: 'text' | 'csv' | 'json'
  ): string {
    switch (format) {
      case 'csv':
        const headers = 'Value,Count,First Index,All Indices'
        const rows = duplicatesList.map(item =>
          `"${item.value.replace(/"/g, '""')}",${item.count},${item.firstIndex},"${item.indices.join(', ')}"`
        )
        return [headers, ...rows].join('\n')
        
      case 'json':
        return JSON.stringify(duplicatesList, null, 2)
        
      default: // text
        return duplicatesList
          .map(item =>
            `"${item.value}" - ${item.count} occurrences at positions: ${item.indices.join(', ')}`
          )
          .join('\n')
    }
  }
}

// Export convenience functions
export const removeLinesDuplicates = (text: string) =>
  RemoveDuplicates.removeDuplicates({
    text,
    ...RemoveDuplicates.PRESETS.LINES,
  })

export const removeWordsDuplicates = (text: string) =>
  RemoveDuplicates.removeDuplicates({
    text,
    ...RemoveDuplicates.PRESETS.WORDS,
  })
```

### 2. Create Remove Duplicates Component

#### Create `src/components/tools/text-format/remove-duplicates-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  FileText,
  AlertCircle
} from 'lucide-react'
import { 
  RemoveDuplicates, 
  RemoveDuplicatesOptions,
  DuplicateItem 
} from '@/lib/text-format/remove-duplicates'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { cn } from '@/lib/utils'

export function RemoveDuplicatesTool() {
  const [input, setInput] = React.useState('')
  const [mode, setMode] = React.useState<RemoveDuplicatesOptions['mode']>('lines')
  const [caseSensitive, setCaseSensitive] = React.useState(true)
  const [trimWhitespace, setTrimWhitespace] = React.useState(true)
  const [keepFirst, setKeepFirst] = React.useState(true)
  const [sortResult, setSortResult] = React.useState(false)
  const [customDelimiter, setCustomDelimiter] = React.useState(',')
  const [ignoreEmpty, setIgnoreEmpty] = React.useState(true)
  const [showStats, setShowStats] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState('output')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'remove-duplicates',
    toolName: 'Remove Duplicates',
    category: 'text-formatting',
  })
  
  // Process text
  const result = React.useMemo(() => {
    if (!input) return null
    
    trackStart(input)
    
    const options: RemoveDuplicatesOptions = {
      text: input,
      mode,
      caseSensitive,
      trimWhitespace,
      keepFirst,
      sortResult,
      customDelimiter,
      ignoreEmpty,
    }
    
    const result = RemoveDuplicates.removeDuplicates(options)
    trackComplete(input, result.output)
    
    return result
  }, [
    input,
    mode,
    caseSensitive,
    trimWhitespace,
    keepFirst,
    sortResult,
    customDelimiter,
    ignoreEmpty,
    trackStart,
    trackComplete
  ])
  
  // Find similar items (fuzzy matching)
  const similarItems = React.useMemo(() => {
    if (!input || mode !== 'lines') return []
    
    const lines = input.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []
    
    return RemoveDuplicates.findSimilarItems(lines, 0.7)
  }, [input, mode])
  
  const handlePreset = (presetName: keyof typeof RemoveDuplicates.PRESETS) => {
    const preset = RemoveDuplicates.PRESETS[presetName]
    setMode(preset.mode)
    setCaseSensitive(preset.caseSensitive)
    setTrimWhitespace(preset.trimWhitespace)
    setKeepFirst(preset.keepFirst)
    setSortResult(preset.sortResult)
    setIgnoreEmpty(preset.ignoreEmpty)
    
    trackFeature('use_preset', { preset: presetName })
  }
  
  const handleExportDuplicates = (format: 'text' | 'csv' | 'json') => {
    if (!result || result.stats.duplicatesList.length === 0) return
    
    const report = RemoveDuplicates.exportDuplicatesReport(
      result.stats.duplicatesList,
      format
    )
    
    const filename = `duplicates-report.${format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt'}`
    
    // Create download
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    trackFeature('export_duplicates', { format })
    
    toast({
      title: 'Exported!',
      description: `Duplicates report saved as ${filename}`,
    })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Remove Duplicates
          </CardTitle>
          <CardDescription>
            Remove duplicate lines, words, or custom patterns from your text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Input text</Label>
            <Textarea
              id="input"
              placeholder="Enter text with duplicates..."
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
              onClick={() => handlePreset('LINES')}
            >
              Lines (Default)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('WORDS')}
            >
              Words
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('EMAILS')}
            >
              Email List
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('CSV_ROWS')}
            >
              CSV Rows
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Remove duplicates from</Label>
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
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="caseSensitive" className="text-sm font-normal">
                  Case sensitive
                </Label>
                <Switch
                  id="caseSensitive"
                  checked={caseSensitive}
                  onCheckedChange={setCaseSensitive}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="trimWhitespace" className="text-sm font-normal">
                  Trim whitespace
                </Label>
                <Switch
                  id="trimWhitespace"
                  checked={trimWhitespace}
                  onCheckedChange={setTrimWhitespace}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="keepFirst" className="text-sm font-normal">
                  Keep {keepFirst ? 'first' : 'last'} occurrence
                </Label>
                <Switch
                  id="keepFirst"
                  checked={keepFirst}
                  onCheckedChange={setKeepFirst}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sortResult" className="text-sm font-normal">
                  Sort result
                </Label>
                <Switch
                  id="sortResult"
                  checked={sortResult}
                  onCheckedChange={setSortResult}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="ignoreEmpty" className="text-sm font-normal">
                  Ignore empty items
                </Label>
                <Switch
                  id="ignoreEmpty"
                  checked={ignoreEmpty}
                  onCheckedChange={setIgnoreEmpty}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="output">
                  <FileText className="h-4 w-4 mr-2" />
                  Output
                </TabsTrigger>
                <TabsTrigger value="stats">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="duplicates">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Duplicates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="output" className="space-y-4">
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
                    <span>
                      {result.stats.uniqueCount} unique {mode}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <CopyButton
                    text={result.output}
                    onCopy={() => {
                      trackFeature('copy_output')
                      toast({
                        title: 'Copied!',
                        description: 'Unique items copied to clipboard',
                      })
                    }}
                  />
                  <DownloadButton
                    text={result.output}
                    filename="unique-items.txt"
                    onDownload={() => trackFeature('download_output')}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{result.stats.originalCount}</div>
                      <p className="text-sm text-muted-foreground">Original {mode}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{result.stats.uniqueCount}</div>
                      <p className="text-sm text-muted-foreground">Unique {mode}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-destructive">
                        {result.stats.duplicatesRemoved}
                      </div>
                      <p className="text-sm text-muted-foreground">Duplicates removed</p>
                    </CardContent>
                  </Card>
                </div>
                
                {result.stats.duplicatesRemoved > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm">
                      Removed {((result.stats.duplicatesRemoved / result.stats.originalCount) * 100).toFixed(1)}% of {mode}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="duplicates" className="space-y-4">
                {result.stats.duplicatesList.length > 0 ? (
                  <>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportDuplicates('text')}
                      >
                        Export as Text
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportDuplicates('csv')}
                      >
                        Export as CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportDuplicates('json')}
                      >
                        Export as JSON
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[300px] w-full rounded-md border">
                      <div className="p-4 space-y-2">
                        {result.stats.duplicatesList.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded-md"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-sm">{item.value}</span>
                              <Badge variant="destructive">
                                {item.count} times
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Found at positions: {item.indices.slice(0, 5).join(', ')}
                              {item.indices.length > 5 && ` ... and ${item.indices.length - 5} more`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No duplicates found
                  </div>
                )}
                
                {similarItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Similar items detected:</h4>
                    <ScrollArea className="h-[200px] w-full rounded-md border">
                      <div className="p-4 space-y-2">
                        {similarItems.slice(0, 10).map((item, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-mono">"{item.item1}"</span>
                            <span className="mx-2">≈</span>
                            <span className="font-mono">"{item.item2}"</span>
                            <Badge variant="outline" className="ml-2">
                              {(item.similarity * 100).toFixed(0)}% similar
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput('')}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/remove-duplicates/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { RemoveDuplicatesTool } from '@/components/tools/text-format/remove-duplicates-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.removeDuplicates' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['remove duplicates', 'unique lines', 'deduplicate text', 'duplicate remover'],
    locale,
    path: '/tools/remove-duplicates',
  })
}

export default function RemoveDuplicatesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="remove-duplicates"
      locale={locale}
    >
      <RemoveDuplicatesTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test duplicate line removal
2. Verify word deduplication
3. Test case sensitivity options
4. Check whitespace trimming
5. Verify statistics accuracy
6. Test duplicate export functionality

## Notes
- Handle large datasets efficiently
- Support various text formats
- Fuzzy matching for similar items
- Export capabilities for analysis
- Performance optimization for large texts