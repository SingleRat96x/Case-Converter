# Story 5.4: Remove Line Breaks Tool

## Story Details
- **Stage**: 5 - Text Formatting Tools
- **Priority**: High
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a tool that removes or replaces line breaks from text, with options for different types of line breaks, paragraph handling, and whitespace normalization.

## Acceptance Criteria
- [ ] Remove all line breaks (CR, LF, CRLF)
- [ ] Replace line breaks with spaces or custom text
- [ ] Preserve paragraph breaks option
- [ ] Handle multiple consecutive line breaks
- [ ] Whitespace normalization options
- [ ] Preserve or remove indentation
- [ ] Smart paragraph detection
- [ ] Undo/redo functionality
- [ ] Support for different text formats
- [ ] Real-time preview

## Implementation Steps

### 1. Create Line Break Removal Logic

#### Create `src/lib/text-format/line-break-remover.ts`
```typescript
export interface LineBreakOptions {
  text: string
  removeType: 'all' | 'single' | 'multiple' | 'paragraph'
  replaceWith: string
  preserveParagraphs: boolean
  normalizeWhitespace: boolean
  preserveIndentation: boolean
  trimLines: boolean
  minParagraphBreaks: number
}

export interface LineBreakResult {
  output: string
  stats: {
    linesRemoved: number
    paragraphsPreserved: number
    charactersRemoved: number
    originalLineCount: number
    resultLineCount: number
  }
}

export class LineBreakRemover {
  // Line break patterns
  private static readonly LINE_BREAKS = {
    CRLF: /\r\n/g,
    CR: /\r/g,
    LF: /\n/g,
    ALL: /\r\n|\r|\n/g,
    MULTIPLE: /(\r\n|\r|\n){2,}/g,
    PARAGRAPH: /(\r\n|\r|\n){2,}/g,
  }
  
  // Main function to process line breaks
  static removeLineBreaks(options: LineBreakOptions): LineBreakResult {
    const {
      text,
      removeType = 'all',
      replaceWith = ' ',
      preserveParagraphs = false,
      normalizeWhitespace = true,
      preserveIndentation = false,
      trimLines = true,
      minParagraphBreaks = 2,
    } = options
    
    if (!text) {
      return {
        output: '',
        stats: {
          linesRemoved: 0,
          paragraphsPreserved: 0,
          charactersRemoved: 0,
          originalLineCount: 0,
          resultLineCount: 0,
        },
      }
    }
    
    // Calculate original stats
    const originalLineCount = this.countLines(text)
    const originalLength = text.length
    
    let output = text
    let paragraphsPreserved = 0
    
    // Process based on remove type
    switch (removeType) {
      case 'all':
        output = this.removeAll(output, replaceWith, preserveIndentation, trimLines)
        break
        
      case 'single':
        output = this.removeSingle(output, replaceWith, preserveParagraphs, preserveIndentation, trimLines)
        paragraphsPreserved = preserveParagraphs ? this.countParagraphs(output) : 0
        break
        
      case 'multiple':
        output = this.removeMultiple(output, replaceWith, minParagraphBreaks)
        break
        
      case 'paragraph':
        output = this.processParagraphs(output, replaceWith, minParagraphBreaks)
        paragraphsPreserved = this.countParagraphs(output)
        break
    }
    
    // Normalize whitespace if requested
    if (normalizeWhitespace) {
      output = this.normalizeWhitespace(output, preserveIndentation)
    }
    
    // Calculate result stats
    const resultLineCount = this.countLines(output)
    const linesRemoved = originalLineCount - resultLineCount
    const charactersRemoved = originalLength - output.length
    
    return {
      output,
      stats: {
        linesRemoved,
        paragraphsPreserved,
        charactersRemoved,
        originalLineCount,
        resultLineCount,
      },
    }
  }
  
  // Remove all line breaks
  private static removeAll(
    text: string, 
    replaceWith: string,
    preserveIndentation: boolean,
    trimLines: boolean
  ): string {
    let lines = text.split(this.LINE_BREAKS.ALL)
    
    if (trimLines) {
      lines = lines.map(line => line.trim())
    }
    
    if (!preserveIndentation) {
      lines = lines.map(line => line.trimStart())
    }
    
    return lines.filter(line => line.length > 0).join(replaceWith)
  }
  
  // Remove single line breaks but preserve paragraphs
  private static removeSingle(
    text: string,
    replaceWith: string,
    preserveParagraphs: boolean,
    preserveIndentation: boolean,
    trimLines: boolean
  ): string {
    if (!preserveParagraphs) {
      return this.removeAll(text, replaceWith, preserveIndentation, trimLines)
    }
    
    // Split by paragraph breaks
    const paragraphs = text.split(this.LINE_BREAKS.PARAGRAPH)
    
    // Process each paragraph
    const processedParagraphs = paragraphs.map(paragraph => {
      let lines = paragraph.split(this.LINE_BREAKS.ALL)
      
      if (trimLines) {
        lines = lines.map(line => line.trim())
      }
      
      if (!preserveIndentation) {
        lines = lines.map(line => line.trimStart())
      }
      
      return lines.filter(line => line.length > 0).join(replaceWith)
    }).filter(p => p.length > 0)
    
    return processedParagraphs.join('\n\n')
  }
  
  // Remove multiple consecutive line breaks
  private static removeMultiple(
    text: string,
    replaceWith: string,
    minBreaks: number
  ): string {
    const pattern = new RegExp(`(\\r\\n|\\r|\\n){${minBreaks},}`, 'g')
    return text.replace(pattern, replaceWith)
  }
  
  // Process paragraphs
  private static processParagraphs(
    text: string,
    separator: string,
    minBreaks: number
  ): string {
    // Split by multiple line breaks
    const pattern = new RegExp(`(\\r\\n|\\r|\\n){${minBreaks},}`)
    const paragraphs = text.split(pattern).filter(p => p.trim().length > 0)
    
    // Join paragraphs with separator
    return paragraphs.map(p => {
      // Remove single line breaks within paragraphs
      return p.replace(this.LINE_BREAKS.ALL, ' ').trim()
    }).join(separator)
  }
  
  // Normalize whitespace
  private static normalizeWhitespace(text: string, preserveIndentation: boolean): string {
    // Replace multiple spaces with single space
    let normalized = text.replace(/[ \t]+/g, ' ')
    
    if (!preserveIndentation) {
      // Remove leading/trailing whitespace from lines
      normalized = normalized
        .split('\n')
        .map(line => line.trim())
        .join('\n')
    }
    
    // Remove trailing whitespace
    normalized = normalized.replace(/[ \t]+$/gm, '')
    
    return normalized
  }
  
  // Count lines in text
  private static countLines(text: string): number {
    if (!text) return 0
    return text.split(this.LINE_BREAKS.ALL).length
  }
  
  // Count paragraphs (separated by double line breaks)
  private static countParagraphs(text: string): number {
    if (!text) return 0
    const paragraphs = text.split(this.LINE_BREAKS.PARAGRAPH).filter(p => p.trim().length > 0)
    return paragraphs.length
  }
  
  // Detect line break type
  static detectLineBreakType(text: string): {
    type: 'CRLF' | 'LF' | 'CR' | 'mixed' | 'none'
    counts: {
      crlf: number
      lf: number
      cr: number
    }
  } {
    const crlf = (text.match(/\r\n/g) || []).length
    const lf = (text.match(/(?<!\r)\n/g) || []).length
    const cr = (text.match(/\r(?!\n)/g) || []).length
    
    const total = crlf + lf + cr
    
    if (total === 0) {
      return { type: 'none', counts: { crlf, lf, cr } }
    }
    
    if (crlf > 0 && lf === 0 && cr === 0) {
      return { type: 'CRLF', counts: { crlf, lf, cr } }
    }
    
    if (lf > 0 && crlf === 0 && cr === 0) {
      return { type: 'LF', counts: { crlf, lf, cr } }
    }
    
    if (cr > 0 && crlf === 0 && lf === 0) {
      return { type: 'CR', counts: { crlf, lf, cr } }
    }
    
    return { type: 'mixed', counts: { crlf, lf, cr } }
  }
  
  // Smart paragraph detection
  static detectParagraphs(text: string): {
    paragraphs: string[]
    averageLength: number
    hasIndentation: boolean
  } {
    // Split by potential paragraph breaks
    const potentialParagraphs = text.split(/(\r\n|\r|\n){2,}/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
    
    const hasIndentation = potentialParagraphs.some(p => 
      p.startsWith('  ') || p.startsWith('\t')
    )
    
    const totalLength = potentialParagraphs.reduce((sum, p) => sum + p.length, 0)
    const averageLength = potentialParagraphs.length > 0 
      ? Math.round(totalLength / potentialParagraphs.length)
      : 0
    
    return {
      paragraphs: potentialParagraphs,
      averageLength,
      hasIndentation,
    }
  }
  
  // Format options for common use cases
  static readonly PRESETS = {
    SINGLE_LINE: {
      removeType: 'all' as const,
      replaceWith: ' ',
      preserveParagraphs: false,
      normalizeWhitespace: true,
      preserveIndentation: false,
      trimLines: true,
      minParagraphBreaks: 2,
    },
    
    PRESERVE_PARAGRAPHS: {
      removeType: 'single' as const,
      replaceWith: ' ',
      preserveParagraphs: true,
      normalizeWhitespace: true,
      preserveIndentation: false,
      trimLines: true,
      minParagraphBreaks: 2,
    },
    
    CSV_FORMAT: {
      removeType: 'all' as const,
      replaceWith: ',',
      preserveParagraphs: false,
      normalizeWhitespace: true,
      preserveIndentation: false,
      trimLines: true,
      minParagraphBreaks: 2,
    },
    
    CODE_CLEANUP: {
      removeType: 'multiple' as const,
      replaceWith: '\n',
      preserveParagraphs: false,
      normalizeWhitespace: false,
      preserveIndentation: true,
      trimLines: false,
      minParagraphBreaks: 2,
    },
  }
}

// Export convenience functions
export const toSingleLine = (text: string) => 
  LineBreakRemover.removeLineBreaks({
    text,
    ...LineBreakRemover.PRESETS.SINGLE_LINE
  })

export const preserveParagraphs = (text: string) =>
  LineBreakRemover.removeLineBreaks({
    text,
    ...LineBreakRemover.PRESETS.PRESERVE_PARAGRAPHS
  })
```

### 2. Create Line Break Remover Component

#### Create `src/components/tools/text-format/line-break-remover-tool.tsx`
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
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  FileText,
  Info,
  Undo2,
  Redo2,
  SplitSquareVertical
} from 'lucide-react'
import { LineBreakRemover, LineBreakOptions } from '@/lib/text-format/line-break-remover'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { useHistory } from '@/hooks/use-history'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { cn } from '@/lib/utils'

export function LineBreakRemoverTool() {
  const [input, setInput] = React.useState('')
  const [removeType, setRemoveType] = React.useState<LineBreakOptions['removeType']>('all')
  const [replaceWith, setReplaceWith] = React.useState(' ')
  const [preserveParagraphs, setPreserveParagraphs] = React.useState(false)
  const [normalizeWhitespace, setNormalizeWhitespace] = React.useState(true)
  const [preserveIndentation, setPreserveIndentation] = React.useState(false)
  const [trimLines, setTrimLines] = React.useState(true)
  const [showStats, setShowStats] = React.useState(true)
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'line-break-remover',
    toolName: 'Remove Line Breaks',
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
  
  // Detect line break info
  const lineBreakInfo = React.useMemo(() => {
    return LineBreakRemover.detectLineBreakType(input)
  }, [input])
  
  // Process text
  const result = React.useMemo(() => {
    if (!input) return null
    
    trackStart(input)
    
    const options: LineBreakOptions = {
      text: input,
      removeType,
      replaceWith,
      preserveParagraphs,
      normalizeWhitespace,
      preserveIndentation,
      trimLines,
      minParagraphBreaks: 2,
    }
    
    const result = LineBreakRemover.removeLineBreaks(options)
    trackComplete(input, result.output)
    
    return result
  }, [
    input, 
    removeType, 
    replaceWith, 
    preserveParagraphs, 
    normalizeWhitespace,
    preserveIndentation,
    trimLines,
    trackStart,
    trackComplete
  ])
  
  const handlePreset = (presetName: keyof typeof LineBreakRemover.PRESETS) => {
    const preset = LineBreakRemover.PRESETS[presetName]
    setRemoveType(preset.removeType)
    setReplaceWith(preset.replaceWith)
    setPreserveParagraphs(preset.preserveParagraphs)
    setNormalizeWhitespace(preset.normalizeWhitespace)
    setPreserveIndentation(preset.preserveIndentation)
    setTrimLines(preset.trimLines)
    
    trackFeature('use_preset', { preset: presetName })
  }
  
  const handleInputChange = (value: string) => {
    setInput(value)
    push(value)
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SplitSquareVertical className="h-5 w-5" />
            Remove Line Breaks
          </CardTitle>
          <CardDescription>
            Remove or replace line breaks from your text with various options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input">Input text</Label>
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
              placeholder="Paste your text with line breaks here..."
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              className="min-h-[150px] font-mono"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <CounterDisplay
                current={input.length}
                label="characters"
              />
              {lineBreakInfo.type !== 'none' && (
                <Badge variant="secondary">
                  {lineBreakInfo.type === 'mixed' ? 'Mixed' : lineBreakInfo.type} line endings
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('SINGLE_LINE')}
              >
                Single Line
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('PRESERVE_PARAGRAPHS')}
              >
                Keep Paragraphs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('CSV_FORMAT')}
              >
                CSV Format
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('CODE_CLEANUP')}
              >
                Code Cleanup
              </Button>
            </div>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label>Remove type</Label>
                  <RadioGroup value={removeType} onValueChange={setRemoveType as any}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-normal">
                        Remove all line breaks
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="font-normal">
                        Remove single line breaks only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple" />
                      <Label htmlFor="multiple" className="font-normal">
                        Remove multiple consecutive breaks
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paragraph" id="paragraph" />
                      <Label htmlFor="paragraph" className="font-normal">
                        Process as paragraphs
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="replaceWith">Replace with</Label>
                  <Input
                    id="replaceWith"
                    value={replaceWith}
                    onChange={(e) => setReplaceWith(e.target.value)}
                    placeholder="Space, comma, or custom text..."
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplaceWith(' ')}
                    >
                      Space
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplaceWith('')}
                    >
                      Nothing
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplaceWith(', ')}
                    >
                      Comma
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplaceWith(' | ')}
                    >
                      Pipe
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-3">
                  {removeType === 'single' && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="preserveParagraphs" className="font-normal">
                        Preserve paragraphs
                      </Label>
                      <Switch
                        id="preserveParagraphs"
                        checked={preserveParagraphs}
                        onCheckedChange={setPreserveParagraphs}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="normalizeWhitespace" className="font-normal">
                      Normalize whitespace
                    </Label>
                    <Switch
                      id="normalizeWhitespace"
                      checked={normalizeWhitespace}
                      onCheckedChange={setNormalizeWhitespace}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preserveIndentation" className="font-normal">
                      Preserve indentation
                    </Label>
                    <Switch
                      id="preserveIndentation"
                      checked={preserveIndentation}
                      onCheckedChange={setPreserveIndentation}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trimLines" className="font-normal">
                      Trim line whitespace
                    </Label>
                    <Switch
                      id="trimLines"
                      checked={trimLines}
                      onCheckedChange={setTrimLines}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Output</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <Info className="h-4 w-4 mr-2" />
                {showStats ? 'Hide' : 'Show'} Stats
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Lines removed</div>
                  <div className="text-xl font-semibold">{result.stats.linesRemoved}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Paragraphs kept</div>
                  <div className="text-xl font-semibold">{result.stats.paragraphsPreserved}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Original lines</div>
                  <div className="text-xl font-semibold">{result.stats.originalLineCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Result lines</div>
                  <div className="text-xl font-semibold">{result.stats.resultLineCount}</div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Textarea
                value={result.output}
                readOnly
                className="min-h-[150px] font-mono"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <CounterDisplay
                  current={result.output.length}
                  label="characters"
                />
                <span>
                  {result.stats.charactersRemoved} characters removed
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
                    description: 'Processed text copied to clipboard',
                  })
                }}
              />
              <DownloadButton
                text={result.output}
                filename="text-no-line-breaks.txt"
                onDownload={() => trackFeature('download_output')}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput('')
                  push('')
                }}
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

#### Create `src/app/[locale]/tools/remove-line-breaks/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LineBreakRemoverTool } from '@/components/tools/text-format/line-break-remover-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.lineBreakRemover' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['remove line breaks', 'line break remover', 'text formatter', 'paragraph merger'],
    locale,
    path: '/tools/remove-line-breaks',
  })
}

export default function RemoveLineBreaksPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="remove-line-breaks"
      locale={locale}
    >
      <LineBreakRemoverTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test different line break types (CRLF, LF, CR)
2. Verify paragraph preservation
3. Test whitespace normalization
4. Check indentation handling
5. Verify undo/redo functionality
6. Test with large texts

## Notes
- Handle mixed line endings gracefully
- Preserve formatting when needed
- Smart paragraph detection
- Performance optimization for large texts
- Support for code formatting