# Story 5.3: Text Repeater Tool

## Story Details
- **Stage**: 5 - Text Formatting Tools
- **Priority**: Medium
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a text repeater tool that allows users to repeat text, words, or phrases multiple times with various separator options, useful for creating patterns, emphasis, or bulk content generation.

## Acceptance Criteria
- [ ] Repeat text from 1 to 10,000 times
- [ ] Multiple separator options (space, newline, comma, custom)
- [ ] Word vs phrase repetition modes
- [ ] Pattern repetition (e.g., ABAB, ABCABC)
- [ ] Preview with truncation for large outputs
- [ ] Performance optimization for large repetitions
- [ ] Export options for large results
- [ ] Character/word count display
- [ ] Memory-efficient generation
- [ ] Undo/redo functionality

## Implementation Steps

### 1. Create Text Repeater Logic

#### Create `src/lib/text-format/text-repeater.ts`
```typescript
export interface RepeatOptions {
  text: string
  count: number
  separator: string
  mode: 'text' | 'word' | 'line' | 'pattern'
  patternItems?: string[]
  trimOutput?: boolean
  maxLength?: number
}

export interface RepeatResult {
  output: string
  truncated: boolean
  actualCount: number
  totalLength: number
  preview?: string
}

export class TextRepeater {
  private static readonly MAX_PREVIEW_LENGTH = 1000
  private static readonly MAX_OUTPUT_LENGTH = 1000000 // 1MB limit
  
  // Main repeat function
  static repeat(options: RepeatOptions): RepeatResult {
    const { 
      text, 
      count, 
      separator = '', 
      mode = 'text',
      patternItems = [],
      trimOutput = true,
      maxLength = this.MAX_OUTPUT_LENGTH
    } = options
    
    if (!text || count < 1) {
      return {
        output: '',
        truncated: false,
        actualCount: 0,
        totalLength: 0,
      }
    }
    
    let result: string
    let actualCount = count
    
    switch (mode) {
      case 'word':
        result = this.repeatWords(text, count, separator)
        break
      case 'line':
        result = this.repeatLines(text, count, separator)
        break
      case 'pattern':
        result = this.repeatPattern(patternItems.length > 0 ? patternItems : [text], count, separator)
        break
      default:
        result = this.repeatText(text, count, separator)
    }
    
    // Trim if needed
    if (trimOutput) {
      result = result.trim()
    }
    
    // Check length limit
    const truncated = result.length > maxLength
    if (truncated) {
      result = result.substring(0, maxLength)
      // Recalculate actual count for truncated output
      actualCount = this.calculateActualCount(result, text, separator, mode)
    }
    
    return {
      output: result,
      truncated,
      actualCount,
      totalLength: result.length,
      preview: result.length > this.MAX_PREVIEW_LENGTH 
        ? result.substring(0, this.MAX_PREVIEW_LENGTH) + '...'
        : undefined,
    }
  }
  
  // Repeat entire text
  private static repeatText(text: string, count: number, separator: string): string {
    // Use array join for better performance
    return new Array(count).fill(text).join(separator)
  }
  
  // Repeat individual words
  private static repeatWords(text: string, count: number, separator: string): string {
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length === 0) return ''
    
    const repeatedWords = words.map(word => 
      new Array(count).fill(word).join(separator)
    )
    
    return repeatedWords.join(' ')
  }
  
  // Repeat lines
  private static repeatLines(text: string, count: number, separator: string): string {
    const lines = text.split('\n').filter(line => line.length > 0)
    if (lines.length === 0) return ''
    
    const repeatedLines = lines.map(line =>
      new Array(count).fill(line).join(separator)
    )
    
    return repeatedLines.join('\n')
  }
  
  // Repeat pattern (e.g., A,B,C -> ABCABCABC)
  private static repeatPattern(items: string[], count: number, separator: string): string {
    if (items.length === 0) return ''
    
    const pattern = items.join(separator)
    return new Array(count).fill(pattern).join(separator)
  }
  
  // Calculate actual repetitions in truncated output
  private static calculateActualCount(
    output: string, 
    text: string, 
    separator: string,
    mode: string
  ): number {
    if (mode === 'text') {
      // Count occurrences of the repeated text
      const regex = new RegExp(this.escapeRegex(text), 'g')
      const matches = output.match(regex)
      return matches ? matches.length : 0
    }
    
    // For other modes, approximate based on length
    const unitLength = text.length + separator.length
    return Math.floor(output.length / unitLength)
  }
  
  // Escape special regex characters
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  
  // Generate preview for large outputs
  static generatePreview(options: RepeatOptions): string {
    const result = this.repeat({ ...options, maxLength: this.MAX_PREVIEW_LENGTH })
    return result.output + (result.truncated ? '...' : '')
  }
  
  // Common separator presets
  static readonly SEPARATORS = {
    SPACE: ' ',
    NEWLINE: '\n',
    COMMA: ', ',
    SEMICOLON: '; ',
    PIPE: ' | ',
    TAB: '\t',
    DOUBLE_NEWLINE: '\n\n',
    DASH: ' - ',
    DOT: ' • ',
    ARROW: ' → ',
  }
  
  // Validate input
  static validate(options: RepeatOptions): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (!options.text) {
      errors.push('Text is required')
    }
    
    if (options.count < 1) {
      errors.push('Count must be at least 1')
    }
    
    if (options.count > 10000) {
      errors.push('Count cannot exceed 10,000')
    }
    
    if (options.mode === 'pattern' && (!options.patternItems || options.patternItems.length === 0)) {
      errors.push('Pattern items are required for pattern mode')
    }
    
    // Estimate output size
    const estimatedSize = options.text.length * options.count + 
                         (options.separator.length * (options.count - 1))
    
    if (estimatedSize > this.MAX_OUTPUT_LENGTH) {
      errors.push(`Estimated output size (${estimatedSize} characters) exceeds maximum allowed (${this.MAX_OUTPUT_LENGTH})`)
    }
    
    return {
      valid: errors.length === 0,
      errors,
    }
  }
  
  // Create patterns
  static createPattern(items: string[], patternType: 'sequential' | 'alternating' | 'random'): string[] {
    switch (patternType) {
      case 'alternating':
        // ABABAB pattern
        if (items.length >= 2) {
          return [items[0], items[1]]
        }
        return items
        
      case 'random':
        // Randomize order
        return [...items].sort(() => Math.random() - 0.5)
        
      default:
        // Sequential: ABC ABC ABC
        return items
    }
  }
  
  // Format output for different use cases
  static formatOutput(
    output: string, 
    format: 'plain' | 'list' | 'array' | 'csv'
  ): string {
    const items = output.split(/[\n,]\s*/).filter(Boolean)
    
    switch (format) {
      case 'list':
        return items.map((item, i) => `${i + 1}. ${item}`).join('\n')
        
      case 'array':
        return JSON.stringify(items, null, 2)
        
      case 'csv':
        return items.map(item => `"${item.replace(/"/g, '""')}"`).join(',')
        
      default:
        return output
    }
  }
}

// Export preset patterns
export const REPEAT_PATTERNS = {
  EMPHASIS: (text: string) => TextRepeater.repeat({
    text,
    count: 3,
    separator: '! ',
    mode: 'text'
  }),
  
  CHANT: (text: string) => TextRepeater.repeat({
    text,
    count: 5,
    separator: ' ',
    mode: 'text'
  }),
  
  LIST: (text: string, count: number) => TextRepeater.repeat({
    text,
    count,
    separator: '\n',
    mode: 'text'
  }),
  
  SPAM: (text: string, count: number) => TextRepeater.repeat({
    text,
    count,
    separator: ' ',
    mode: 'text'
  }),
}
```

### 2. Create Text Repeater Component

#### Create `src/components/tools/text-format/text-repeater-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/use-toast'
import { 
  Copy, 
  Download, 
  RefreshCw, 
  AlertCircle,
  Repeat,
  Eye,
  EyeOff,
  Plus,
  X
} from 'lucide-react'
import { TextRepeater, RepeatOptions, REPEAT_PATTERNS } from '@/lib/text-format/text-repeater'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { cn } from '@/lib/utils'

export function TextRepeaterTool() {
  const [input, setInput] = React.useState('')
  const [count, setCount] = React.useState(1)
  const [separator, setSeparator] = React.useState(' ')
  const [customSeparator, setCustomSeparator] = React.useState('')
  const [mode, setMode] = React.useState<RepeatOptions['mode']>('text')
  const [patternItems, setPatternItems] = React.useState<string[]>([])
  const [showPreview, setShowPreview] = React.useState(true)
  const [outputFormat, setOutputFormat] = React.useState<'plain' | 'list' | 'array' | 'csv'>('plain')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'text-repeater',
    toolName: 'Text Repeater',
    category: 'text-formatting',
  })
  
  // Generate output
  const result = React.useMemo(() => {
    if (!input && mode !== 'pattern') return null
    
    const options: RepeatOptions = {
      text: input,
      count,
      separator: separator === 'custom' ? customSeparator : separator,
      mode,
      patternItems: mode === 'pattern' ? patternItems : undefined,
    }
    
    const validation = TextRepeater.validate(options)
    if (!validation.valid) {
      return { error: validation.errors[0] }
    }
    
    trackStart(input)
    const repeatResult = TextRepeater.repeat(options)
    
    // Format output if needed
    const formattedOutput = TextRepeater.formatOutput(repeatResult.output, outputFormat)
    
    trackComplete(input, formattedOutput)
    
    return {
      ...repeatResult,
      output: formattedOutput,
    }
  }, [input, count, separator, customSeparator, mode, patternItems, outputFormat, trackStart, trackComplete])
  
  const handleQuickPattern = (patternName: keyof typeof REPEAT_PATTERNS) => {
    if (!input) return
    
    const pattern = REPEAT_PATTERNS[patternName]
    const result = pattern(input, patternName === 'LIST' || patternName === 'SPAM' ? count : undefined)
    
    // Update UI to match the pattern
    if (patternName === 'EMPHASIS') {
      setCount(3)
      setSeparator('! ')
    } else if (patternName === 'CHANT') {
      setCount(5)
      setSeparator(' ')
    } else if (patternName === 'LIST') {
      setSeparator('\n')
    }
    
    trackFeature('quick_pattern', { pattern: patternName })
  }
  
  const addPatternItem = () => {
    if (input && !patternItems.includes(input)) {
      setPatternItems([...patternItems, input])
      setInput('')
    }
  }
  
  const removePatternItem = (index: number) => {
    setPatternItems(patternItems.filter((_, i) => i !== index))
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Text Repeater
          </CardTitle>
          <CardDescription>
            Repeat text, words, or create patterns with custom separators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Text to repeat</Label>
            <Textarea
              id="input"
              placeholder="Enter text, word, or phrase..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[80px] font-mono"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Repeat mode</Label>
              <RadioGroup value={mode} onValueChange={setMode as any}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="font-normal">
                    Entire text
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="word" id="word" />
                  <Label htmlFor="word" className="font-normal">
                    Each word separately
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="line" id="line" />
                  <Label htmlFor="line" className="font-normal">
                    Each line separately
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pattern" id="pattern" />
                  <Label htmlFor="pattern" className="font-normal">
                    Pattern sequence
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="count">
                Repeat count: {count}
              </Label>
              <Slider
                id="count"
                min={1}
                max={1000}
                step={1}
                value={[count]}
                onValueChange={(value) => setCount(value[0])}
                className="w-full"
              />
              <Input
                type="number"
                min={1}
                max={10000}
                value={count}
                onChange={(e) => setCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full"
              />
            </div>
          </div>
          
          {mode === 'pattern' && (
            <div className="space-y-2">
              <Label>Pattern items</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add pattern item..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPatternItem()}
                />
                <Button onClick={addPatternItem} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {patternItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-3 py-1 bg-muted rounded-md"
                  >
                    <span className="text-sm">{item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removePatternItem(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="separator">Separator</Label>
              <Select value={separator} onValueChange={setSeparator}>
                <SelectTrigger id="separator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Space</SelectItem>
                  <SelectItem value="\n">New Line</SelectItem>
                  <SelectItem value=", ">Comma</SelectItem>
                  <SelectItem value="; ">Semicolon</SelectItem>
                  <SelectItem value=" | ">Pipe</SelectItem>
                  <SelectItem value="\t">Tab</SelectItem>
                  <SelectItem value="\n\n">Double Line</SelectItem>
                  <SelectItem value=" - ">Dash</SelectItem>
                  <SelectItem value=" • ">Bullet</SelectItem>
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {separator === 'custom' && (
                <Input
                  placeholder="Enter custom separator..."
                  value={customSeparator}
                  onChange={(e) => setCustomSeparator(e.target.value)}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Output format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat as any}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plain">Plain text</SelectItem>
                  <SelectItem value="list">Numbered list</SelectItem>
                  <SelectItem value="array">JSON array</SelectItem>
                  <SelectItem value="csv">CSV format</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPattern('EMPHASIS')}
              disabled={!input}
            >
              Emphasis (3x!)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPattern('CHANT')}
              disabled={!input}
            >
              Chant (5x)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickPattern('LIST')}
              disabled={!input}
            >
              List
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {result && !('error' in result) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Output</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Repeated {result.actualCount} times
              </span>
              <CounterDisplay
                current={result.totalLength}
                max={1000000}
                label="characters"
              />
            </div>
            
            {result.truncated && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Output was truncated to prevent browser performance issues.
                  Use the download button to get the full result.
                </AlertDescription>
              </Alert>
            )}
            
            {showPreview && (
              <div className="relative">
                <Textarea
                  value={result.preview || result.output}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
                {result.preview && (
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    Preview only
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <CopyButton
                text={result.output}
                onCopy={() => {
                  trackFeature('copy_output')
                  toast({
                    title: 'Copied!',
                    description: 'Repeated text copied to clipboard',
                  })
                }}
              />
              <DownloadButton
                text={result.output}
                filename="repeated-text.txt"
                onDownload={() => trackFeature('download_output')}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput('')
                  setCount(1)
                  setPatternItems([])
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {result && 'error' in result && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

### 3. Create Page and Tests

#### Create `src/app/[locale]/tools/text-repeater/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { TextRepeaterTool } from '@/components/tools/text-format/text-repeater-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.textRepeater' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['text repeater', 'repeat text', 'text multiplier', 'pattern generator'],
    locale,
    path: '/tools/text-repeater',
  })
}

export default function TextRepeaterPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="text-repeater"
      locale={locale}
    >
      <TextRepeaterTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test different repeat modes
2. Verify performance with large counts
3. Test pattern creation
4. Check output formats
5. Verify memory efficiency
6. Test separator options

## Notes
- Performance optimization for large repetitions
- Memory-efficient string building
- Preview mode for large outputs
- Export functionality for bulk generation
- Pattern builder for complex sequences