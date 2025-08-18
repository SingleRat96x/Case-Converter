# Story 5.5: Find & Replace Tool

## Story Details
- **Stage**: 5 - Text Formatting Tools
- **Priority**: High
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a powerful find and replace tool with support for regular expressions, case sensitivity options, whole word matching, and batch replacements with preview capability.

## Acceptance Criteria
- [ ] Basic find and replace functionality
- [ ] Regular expression support
- [ ] Case sensitive/insensitive options
- [ ] Whole word matching
- [ ] Replace all or replace one by one
- [ ] Match highlighting and preview
- [ ] Undo/redo functionality
- [ ] Multiple find/replace patterns
- [ ] Export replacement history
- [ ] Real-time match counting

## Implementation Steps

### 1. Create Find & Replace Logic

#### Create `src/lib/text-format/find-replace.ts`
```typescript
export interface FindReplaceOptions {
  text: string
  pattern: string
  replacement: string
  useRegex: boolean
  caseSensitive: boolean
  wholeWord: boolean
  replaceAll: boolean
  multiline?: boolean
}

export interface FindReplaceResult {
  output: string
  matches: Match[]
  replacedCount: number
  preview?: string
}

export interface Match {
  index: number
  length: number
  text: string
  lineNumber: number
  columnStart: number
  context: string
}

export interface BatchReplacement {
  id: string
  pattern: string
  replacement: string
  options: Partial<FindReplaceOptions>
  enabled: boolean
}

export class FindReplace {
  // Perform find and replace
  static findAndReplace(options: FindReplaceOptions): FindReplaceResult {
    const {
      text,
      pattern,
      replacement,
      useRegex = false,
      caseSensitive = true,
      wholeWord = false,
      replaceAll = true,
      multiline = false,
    } = options
    
    if (!text || !pattern) {
      return {
        output: text,
        matches: [],
        replacedCount: 0,
      }
    }
    
    const matches = this.findMatches(text, pattern, {
      useRegex,
      caseSensitive,
      wholeWord,
      multiline,
    })
    
    if (matches.length === 0) {
      return {
        output: text,
        matches,
        replacedCount: 0,
      }
    }
    
    let output = text
    let replacedCount = 0
    
    if (replaceAll) {
      const regex = this.createRegex(pattern, {
        useRegex,
        caseSensitive,
        wholeWord,
        multiline,
        global: true,
      })
      
      output = text.replace(regex, replacement)
      replacedCount = matches.length
    } else {
      // Replace only first match
      const regex = this.createRegex(pattern, {
        useRegex,
        caseSensitive,
        wholeWord,
        multiline,
        global: false,
      })
      
      output = text.replace(regex, replacement)
      replacedCount = 1
    }
    
    return {
      output,
      matches,
      replacedCount,
      preview: this.generatePreview(text, matches, replacement),
    }
  }
  
  // Find all matches
  static findMatches(
    text: string,
    pattern: string,
    options: {
      useRegex?: boolean
      caseSensitive?: boolean
      wholeWord?: boolean
      multiline?: boolean
    } = {}
  ): Match[] {
    if (!text || !pattern) return []
    
    const regex = this.createRegex(pattern, {
      ...options,
      global: true,
    })
    
    const matches: Match[] = []
    const lines = text.split('\n')
    let lineStartIndex = 0
    
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber]
      const lineRegex = new RegExp(regex.source, regex.flags.replace('g', ''))
      let match: RegExpExecArray | null
      
      while ((match = regex.exec(text)) !== null) {
        // Find which line this match is on
        while (lineStartIndex + lines[lineNumber].length < match.index) {
          lineStartIndex += lines[lineNumber].length + 1 // +1 for newline
          lineNumber++
          if (lineNumber >= lines.length) break
        }
        
        const columnStart = match.index - lineStartIndex
        const contextStart = Math.max(0, columnStart - 20)
        const contextEnd = Math.min(lines[lineNumber].length, columnStart + match[0].length + 20)
        
        matches.push({
          index: match.index,
          length: match[0].length,
          text: match[0],
          lineNumber: lineNumber + 1,
          columnStart: columnStart + 1,
          context: lines[lineNumber].substring(contextStart, contextEnd),
        })
        
        // Prevent infinite loop with zero-width matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }
      }
      
      // Reset regex for next iteration
      regex.lastIndex = 0
    }
    
    return matches
  }
  
  // Create regex from pattern
  private static createRegex(
    pattern: string,
    options: {
      useRegex?: boolean
      caseSensitive?: boolean
      wholeWord?: boolean
      multiline?: boolean
      global?: boolean
    }
  ): RegExp {
    const {
      useRegex = false,
      caseSensitive = true,
      wholeWord = false,
      multiline = false,
      global = true,
    } = options
    
    let regexPattern = pattern
    
    if (!useRegex) {
      // Escape special regex characters
      regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
    
    if (wholeWord) {
      regexPattern = `\\b${regexPattern}\\b`
    }
    
    const flags = [
      global ? 'g' : '',
      caseSensitive ? '' : 'i',
      multiline ? 'm' : '',
    ].join('')
    
    try {
      return new RegExp(regexPattern, flags)
    } catch (error) {
      // Return a regex that won't match anything if pattern is invalid
      return new RegExp('(?!.*)', flags)
    }
  }
  
  // Validate regex pattern
  static validateRegex(pattern: string): {
    valid: boolean
    error?: string
  } {
    try {
      new RegExp(pattern)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
      }
    }
  }
  
  // Generate preview with highlighted matches
  private static generatePreview(
    text: string,
    matches: Match[],
    replacement: string
  ): string {
    if (matches.length === 0) return ''
    
    // Show first 3 replacements
    const previewMatches = matches.slice(0, 3)
    const previews: string[] = []
    
    for (const match of previewMatches) {
      const before = text.substring(match.index - 30, match.index)
      const after = text.substring(match.index + match.length, match.index + match.length + 30)
      
      previews.push(
        `...${before}[${match.text} → ${replacement}]${after}...`
      )
    }
    
    if (matches.length > 3) {
      previews.push(`... and ${matches.length - 3} more matches`)
    }
    
    return previews.join('\n')
  }
  
  // Batch find and replace
  static batchFindReplace(
    text: string,
    replacements: BatchReplacement[]
  ): {
    output: string
    totalReplacements: number
    results: Array<{
      id: string
      replacedCount: number
      matches: Match[]
    }>
  } {
    let output = text
    let totalReplacements = 0
    const results: Array<{
      id: string
      replacedCount: number
      matches: Match[]
    }> = []
    
    for (const replacement of replacements) {
      if (!replacement.enabled) continue
      
      const result = this.findAndReplace({
        text: output,
        pattern: replacement.pattern,
        replacement: replacement.replacement,
        useRegex: replacement.options.useRegex ?? false,
        caseSensitive: replacement.options.caseSensitive ?? true,
        wholeWord: replacement.options.wholeWord ?? false,
        replaceAll: replacement.options.replaceAll ?? true,
        multiline: replacement.options.multiline ?? false,
      })
      
      output = result.output
      totalReplacements += result.replacedCount
      
      results.push({
        id: replacement.id,
        replacedCount: result.replacedCount,
        matches: result.matches,
      })
    }
    
    return {
      output,
      totalReplacements,
      results,
    }
  }
  
  // Common replacement patterns
  static readonly COMMON_PATTERNS = {
    TRIM_WHITESPACE: {
      pattern: '^\\s+|\\s+$',
      replacement: '',
      useRegex: true,
      name: 'Trim whitespace',
    },
    MULTIPLE_SPACES: {
      pattern: ' +',
      replacement: ' ',
      useRegex: true,
      name: 'Multiple spaces to single',
    },
    TABS_TO_SPACES: {
      pattern: '\t',
      replacement: '    ',
      useRegex: false,
      name: 'Tabs to spaces',
    },
    REMOVE_EMPTY_LINES: {
      pattern: '^\\s*$\\n',
      replacement: '',
      useRegex: true,
      multiline: true,
      name: 'Remove empty lines',
    },
    SMART_QUOTES: {
      pattern: '[""]',
      replacement: '"',
      useRegex: true,
      name: 'Smart quotes to regular',
    },
  }
  
  // Create highlighted text with matches
  static highlightMatches(
    text: string,
    matches: Match[],
    highlightClass: string = 'highlight'
  ): string {
    if (matches.length === 0) return text
    
    // Sort matches by index in reverse order
    const sortedMatches = [...matches].sort((a, b) => b.index - a.index)
    
    let result = text
    
    for (const match of sortedMatches) {
      const before = result.substring(0, match.index)
      const matchText = result.substring(match.index, match.index + match.length)
      const after = result.substring(match.index + match.length)
      
      result = `${before}<span class="${highlightClass}">${matchText}</span>${after}`
    }
    
    return result
  }
}

// Export convenience functions
export const findAll = (text: string, pattern: string, caseSensitive = true) =>
  FindReplace.findMatches(text, pattern, { caseSensitive })

export const replaceAll = (text: string, pattern: string, replacement: string) =>
  FindReplace.findAndReplace({
    text,
    pattern,
    replacement,
    useRegex: false,
    caseSensitive: true,
    wholeWord: false,
    replaceAll: true,
  })
```

### 2. Create Find & Replace Component

#### Create `src/components/tools/text-format/find-replace-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Search,
  Replace,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  Info
} from 'lucide-react'
import { 
  FindReplace, 
  FindReplaceOptions,
  BatchReplacement,
  Match 
} from '@/lib/text-format/find-replace'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { useHistory } from '@/hooks/use-history'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { cn } from '@/lib/utils'

export function FindReplaceTool() {
  const [input, setInput] = React.useState('')
  const [findPattern, setFindPattern] = React.useState('')
  const [replacePattern, setReplacePattern] = React.useState('')
  const [useRegex, setUseRegex] = React.useState(false)
  const [caseSensitive, setCaseSensitive] = React.useState(true)
  const [wholeWord, setWholeWord] = React.useState(false)
  const [multiline, setMultiline] = React.useState(false)
  const [showMatches, setShowMatches] = React.useState(true)
  const [batchMode, setBatchMode] = React.useState(false)
  const [batchReplacements, setBatchReplacements] = React.useState<BatchReplacement[]>([])
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'find-replace',
    toolName: 'Find & Replace',
    category: 'text-formatting',
  })
  
  const { 
    current,
    push,
    undo,
    redo,
    canUndo,
    canRedo 
  } = useHistory(input)
  
  React.useEffect(() => {
    if (current !== input) {
      setInput(current)
    }
  }, [current])
  
  // Validate regex pattern
  const regexValidation = React.useMemo(() => {
    if (!useRegex || !findPattern) return { valid: true }
    return FindReplace.validateRegex(findPattern)
  }, [useRegex, findPattern])
  
  // Find matches
  const matches = React.useMemo(() => {
    if (!input || !findPattern || (useRegex && !regexValidation.valid)) {
      return []
    }
    
    return FindReplace.findMatches(input, findPattern, {
      useRegex,
      caseSensitive,
      wholeWord,
      multiline,
    })
  }, [input, findPattern, useRegex, caseSensitive, wholeWord, multiline, regexValidation])
  
  // Perform replacement
  const handleReplace = (replaceAll: boolean) => {
    if (!input || !findPattern) return
    
    trackStart(input)
    
    const result = FindReplace.findAndReplace({
      text: input,
      pattern: findPattern,
      replacement: replacePattern,
      useRegex,
      caseSensitive,
      wholeWord,
      replaceAll,
      multiline,
    })
    
    setInput(result.output)
    push(result.output)
    
    trackComplete(input, result.output)
    trackFeature('replace', {
      replaceAll,
      useRegex,
      matchCount: result.replacedCount,
    })
    
    toast({
      title: 'Replaced!',
      description: `${result.replacedCount} ${result.replacedCount === 1 ? 'match' : 'matches'} replaced`,
    })
  }
  
  // Batch replacement
  const handleBatchReplace = () => {
    if (!input || batchReplacements.length === 0) return
    
    trackStart(input)
    
    const result = FindReplace.batchFindReplace(input, batchReplacements)
    
    setInput(result.output)
    push(result.output)
    
    trackComplete(input, result.output)
    trackFeature('batch_replace', {
      replacementCount: batchReplacements.filter(r => r.enabled).length,
      totalReplacements: result.totalReplacements,
    })
    
    toast({
      title: 'Batch replacement complete!',
      description: `${result.totalReplacements} total replacements made`,
    })
  }
  
  // Add batch replacement
  const addBatchReplacement = () => {
    const newReplacement: BatchReplacement = {
      id: Date.now().toString(),
      pattern: findPattern,
      replacement: replacePattern,
      options: {
        useRegex,
        caseSensitive,
        wholeWord,
        multiline,
        replaceAll: true,
      },
      enabled: true,
    }
    
    setBatchReplacements([...batchReplacements, newReplacement])
    setFindPattern('')
    setReplacePattern('')
  }
  
  // Remove batch replacement
  const removeBatchReplacement = (id: string) => {
    setBatchReplacements(batchReplacements.filter(r => r.id !== id))
  }
  
  // Toggle batch replacement
  const toggleBatchReplacement = (id: string) => {
    setBatchReplacements(
      batchReplacements.map(r =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    )
  }
  
  // Use common pattern
  const useCommonPattern = (patternKey: keyof typeof FindReplace.COMMON_PATTERNS) => {
    const pattern = FindReplace.COMMON_PATTERNS[patternKey]
    setFindPattern(pattern.pattern)
    setReplacePattern(pattern.replacement)
    setUseRegex(pattern.useRegex)
    if (pattern.multiline !== undefined) {
      setMultiline(pattern.multiline)
    }
    
    trackFeature('use_common_pattern', { pattern: patternKey })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find & Replace
          </CardTitle>
          <CardDescription>
            Search and replace text with support for regular expressions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input">Text</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Textarea
              id="input"
              placeholder="Enter or paste your text here..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                push(e.target.value)
              }}
              className="min-h-[200px] font-mono"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <CounterDisplay
                current={input.length}
                label="characters"
              />
              {matches.length > 0 && (
                <Badge variant="secondary">
                  {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
                </Badge>
              )}
            </div>
          </div>
          
          <Tabs value={batchMode ? 'batch' : 'single'} onValueChange={(v) => setBatchMode(v === 'batch')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Replace</TabsTrigger>
              <TabsTrigger value="batch">Batch Replace</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="find">Find</Label>
                  <Input
                    id="find"
                    placeholder={useRegex ? "Enter regex pattern..." : "Text to find..."}
                    value={findPattern}
                    onChange={(e) => setFindPattern(e.target.value)}
                  />
                  {useRegex && !regexValidation.valid && (
                    <p className="text-sm text-destructive">
                      {regexValidation.error}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="replace">Replace with</Label>
                  <Input
                    id="replace"
                    placeholder="Replacement text..."
                    value={replacePattern}
                    onChange={(e) => setReplacePattern(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="regex"
                    checked={useRegex}
                    onCheckedChange={setUseRegex}
                  />
                  <Label htmlFor="regex" className="text-sm font-normal">
                    Regex
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="case"
                    checked={caseSensitive}
                    onCheckedChange={setCaseSensitive}
                  />
                  <Label htmlFor="case" className="text-sm font-normal">
                    Case sensitive
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="word"
                    checked={wholeWord}
                    onCheckedChange={setWholeWord}
                    disabled={useRegex}
                  />
                  <Label htmlFor="word" className="text-sm font-normal">
                    Whole word
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="multiline"
                    checked={multiline}
                    onCheckedChange={setMultiline}
                    disabled={!useRegex}
                  />
                  <Label htmlFor="multiline" className="text-sm font-normal">
                    Multiline
                  </Label>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useCommonPattern('TRIM_WHITESPACE')}
                >
                  Trim Whitespace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useCommonPattern('MULTIPLE_SPACES')}
                >
                  Fix Spaces
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useCommonPattern('TABS_TO_SPACES')}
                >
                  Tabs → Spaces
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => useCommonPattern('REMOVE_EMPTY_LINES')}
                >
                  Remove Empty Lines
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReplace(false)}
                  disabled={!findPattern || matches.length === 0}
                >
                  <Replace className="h-4 w-4 mr-2" />
                  Replace First
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleReplace(true)}
                  disabled={!findPattern || matches.length === 0}
                >
                  <Replace className="h-4 w-4 mr-2" />
                  Replace All ({matches.length})
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="batch" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Batch Replacements</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addBatchReplacement}
                    disabled={!findPattern}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Current
                  </Button>
                </div>
                
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {batchReplacements.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No replacements added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {batchReplacements.map((replacement) => (
                        <div
                          key={replacement.id}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-md",
                            replacement.enabled ? "bg-muted" : "opacity-50"
                          )}
                        >
                          <div className="flex-1">
                            <code className="text-sm">
                              {replacement.pattern} → {replacement.replacement}
                            </code>
                            <div className="flex gap-2 mt-1">
                              {replacement.options.useRegex && (
                                <Badge variant="outline" className="text-xs">Regex</Badge>
                              )}
                              {!replacement.options.caseSensitive && (
                                <Badge variant="outline" className="text-xs">Case-i</Badge>
                              )}
                              {replacement.options.wholeWord && (
                                <Badge variant="outline" className="text-xs">Word</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Switch
                              checked={replacement.enabled}
                              onCheckedChange={() => toggleBatchReplacement(replacement.id)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBatchReplacement(replacement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <Button
                onClick={handleBatchReplace}
                disabled={batchReplacements.filter(r => r.enabled).length === 0}
                className="w-full"
              >
                <Replace className="h-4 w-4 mr-2" />
                Run Batch Replace ({batchReplacements.filter(r => r.enabled).length} active)
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {matches.length > 0 && showMatches && !batchMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Matches</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMatches(!showMatches)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] w-full">
              <div className="space-y-2">
                {matches.slice(0, 100).map((match, index) => (
                  <div
                    key={`${match.index}-${index}`}
                    className="p-2 bg-muted rounded-md font-mono text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Line {match.lineNumber}, Col {match.columnStart}
                      </span>
                      <Badge variant="secondary">{match.text}</Badge>
                    </div>
                    <div className="mt-1 text-xs">
                      ...{match.context}...
                    </div>
                  </div>
                ))}
                {matches.length > 100 && (
                  <div className="text-center text-muted-foreground">
                    ... and {matches.length - 100} more matches
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      <div className="flex gap-2">
        <CopyButton
          text={input}
          onCopy={() => {
            trackFeature('copy_output')
            toast({
              title: 'Copied!',
              description: 'Text copied to clipboard',
            })
          }}
        />
        <DownloadButton
          text={input}
          filename="find-replace-result.txt"
          onDownload={() => trackFeature('download_output')}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setInput('')
            setFindPattern('')
            setReplacePattern('')
            setBatchReplacements([])
            push('')
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/find-replace/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { FindReplaceTool } from '@/components/tools/text-format/find-replace-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.findReplace' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['find replace', 'text search', 'regex replace', 'batch replace', 'text editor'],
    locale,
    path: '/tools/find-replace',
  })
}

export default function FindReplacePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="find-replace"
      locale={locale}
    >
      <FindReplaceTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test basic find and replace
2. Verify regex functionality
3. Test case sensitivity options
4. Check whole word matching
5. Verify batch replacements
6. Test undo/redo functionality

## Notes
- Support complex regex patterns
- Preview replacements before applying
- Batch processing for multiple patterns
- Performance optimization for large texts
- Export/import replacement patterns