# Story 5.2: Italic Text Generator

## Story Details
- **Stage**: 5 - Text Formatting Tools  
- **Priority**: High
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 5.1 (Bold Text Generator) complete

## Objective
Implement an italic text generator that converts regular text into various italic Unicode styles, similar to the bold text generator but focusing on italic variations for social media and creative text formatting.

## Acceptance Criteria
- [ ] Convert regular text to Unicode italic characters
- [ ] Support multiple italic styles (serif, sans-serif, script)
- [ ] Combine with bold for bold-italic variations
- [ ] Real-time conversion as user types
- [ ] Style comparison view
- [ ] Copy individual or all styles
- [ ] Mobile-responsive design
- [ ] Multi-language UI support
- [ ] Character compatibility checking
- [ ] Integration with bold text generator

## Implementation Steps

### 1. Create Italic Text Conversion Logic

#### Create `src/lib/text-format/italic-generator.ts`
```typescript
import { BoldTextGenerator } from './bold-generator'

// Unicode italic character mappings
const ITALIC_STYLES = {
  serifItalic: {
    name: 'Serif Italic',
    description: 'Classic italic style',
    offset: 0x1D434 - 0x41, // Mathematical Italic
    uppercase: true,
    lowercase: true,
    numbers: null, // No special italic numbers
  },
  sansSerifItalic: {
    name: 'Sans-Serif Italic',
    description: 'Modern italic style',
    offset: 0x1D608 - 0x41, // Mathematical Sans-Serif Italic
    uppercase: true,
    lowercase: true,
    numbers: null,
  },
  serifBoldItalic: {
    name: 'Serif Bold Italic',
    description: 'Bold and italic combined',
    offset: 0x1D468 - 0x41, // Mathematical Bold Italic
    uppercase: true,
    lowercase: true,
    numbers: null,
  },
  sansSerifBoldItalic: {
    name: 'Sans-Serif Bold Italic',
    description: 'Modern bold italic',
    offset: 0x1D63C - 0x41, // Mathematical Sans-Serif Bold Italic
    uppercase: true,
    lowercase: true,
    numbers: null,
  },
  scriptItalic: {
    name: 'Script',
    description: 'Elegant script style',
    offset: 0x1D49C - 0x41, // Mathematical Script
    uppercase: true,
    lowercase: true,
    numbers: null,
    special: true,
  },
  scriptBoldItalic: {
    name: 'Bold Script',
    description: 'Bold script style',
    offset: 0x1D4D0 - 0x41, // Mathematical Bold Script
    uppercase: true,
    lowercase: true,
    numbers: null,
    special: true,
  },
  frakturItalic: {
    name: 'Fraktur',
    description: 'Gothic style',
    offset: 0x1D504 - 0x41, // Mathematical Fraktur
    uppercase: true,
    lowercase: true,
    numbers: null,
  },
  frakturBoldItalic: {
    name: 'Bold Fraktur',
    description: 'Bold gothic style',
    offset: 0x1D56C - 0x41, // Mathematical Bold Fraktur
    uppercase: true,
    lowercase: true,
    numbers: null,
  },
  monospaceItalic: {
    name: 'Monospace',
    description: 'Fixed-width italic',
    offset: 0x1D670 - 0x41, // Mathematical Monospace
    uppercase: true,
    lowercase: true,
    numbers: 0x1D7F6 - 0x30,
  },
}

// Special character mappings for script styles
const SPECIAL_ITALIC_MAPPINGS: Record<string, Record<string, string>> = {
  scriptItalic: {
    'B': '\u212C', // ℬ
    'E': '\u2130', // ℰ
    'F': '\u2131', // ℱ
    'H': '\u210B', // ℋ
    'I': '\u2110', // ℐ
    'L': '\u2112', // ℒ
    'M': '\u2133', // ℳ
    'R': '\u211B', // ℛ
    'e': '\u212F', // ℯ
    'g': '\u210A', // ℊ
    'o': '\u2134', // ℴ
  },
  scriptBoldItalic: {
    'C': '\u212D', // ℭ
  },
}

export interface ItalicStyle {
  id: string
  name: string
  description: string
  convert: (text: string) => string
  sample: string
  isBold?: boolean
}

export class ItalicTextGenerator {
  // Convert text to specific italic style
  static convertToStyle(text: string, styleId: string): string {
    const style = ITALIC_STYLES[styleId as keyof typeof ITALIC_STYLES]
    if (!style) return text
    
    return text.split('').map(char => {
      // Handle special mappings
      if (SPECIAL_ITALIC_MAPPINGS[styleId]?.[char]) {
        return SPECIAL_ITALIC_MAPPINGS[styleId][char]
      }
      
      // Handle uppercase letters
      if (char >= 'A' && char <= 'Z' && style.uppercase) {
        // Special case for script styles
        if (style.special && SPECIAL_ITALIC_MAPPINGS[styleId]?.[char]) {
          return SPECIAL_ITALIC_MAPPINGS[styleId][char]
        }
        return String.fromCodePoint(char.charCodeAt(0) + style.offset)
      }
      
      // Handle lowercase letters
      if (char >= 'a' && char <= 'z' && style.lowercase) {
        // Special case for script styles
        if (style.special && SPECIAL_ITALIC_MAPPINGS[styleId]?.[char]) {
          return SPECIAL_ITALIC_MAPPINGS[styleId][char]
        }
        const offset = style.offset + 0x20 // Lowercase offset
        return String.fromCodePoint(char.charCodeAt(0) + offset - 0x20)
      }
      
      // Handle numbers (only for monospace)
      if (char >= '0' && char <= '9' && style.numbers) {
        return String.fromCodePoint(char.charCodeAt(0) + style.numbers)
      }
      
      // Return unchanged for unsupported characters
      return char
    }).join('')
  }
  
  // Get all available styles
  static getAllStyles(): ItalicStyle[] {
    return Object.entries(ITALIC_STYLES).map(([id, style]) => ({
      id,
      name: style.name,
      description: style.description,
      convert: (text: string) => this.convertToStyle(text, id),
      sample: this.convertToStyle('Italic Text', id),
      isBold: id.includes('Bold'),
    }))
  }
  
  // Convert to all styles
  static convertToAllStyles(text: string): Record<string, string> {
    const results: Record<string, string> = {}
    
    for (const [id] of Object.entries(ITALIC_STYLES)) {
      results[id] = this.convertToStyle(text, id)
    }
    
    return results
  }
  
  // Combine with bold styles
  static getCombinedStyles(text: string): Array<{
    id: string
    name: string
    result: string
    isBold: boolean
    isItalic: boolean
  }> {
    const combined = []
    
    // Regular italic styles
    for (const [id, style] of Object.entries(ITALIC_STYLES)) {
      combined.push({
        id,
        name: style.name,
        result: this.convertToStyle(text, id),
        isBold: id.includes('Bold'),
        isItalic: true,
      })
    }
    
    // Add pure bold styles from BoldTextGenerator
    const boldStyles = BoldTextGenerator.getAllStyles()
    for (const boldStyle of boldStyles) {
      if (!boldStyle.id.includes('Italic')) {
        combined.push({
          id: boldStyle.id,
          name: boldStyle.name,
          result: boldStyle.convert(text),
          isBold: true,
          isItalic: false,
        })
      }
    }
    
    return combined
  }
  
  // Check if text contains italic characters
  static containsItalicCharacters(text: string): boolean {
    const italicRanges = [
      [0x1D434, 0x1D467], // Mathematical Italic
      [0x1D468, 0x1D49B], // Mathematical Bold Italic
      [0x1D49C, 0x1D4CF], // Mathematical Script
      [0x1D4D0, 0x1D503], // Mathematical Bold Script
      [0x1D504, 0x1D537], // Mathematical Fraktur
      [0x1D56C, 0x1D59F], // Mathematical Bold Fraktur
      [0x1D608, 0x1D63B], // Mathematical Sans-Serif Italic
      [0x1D63C, 0x1D66F], // Mathematical Sans-Serif Bold Italic
      [0x1D670, 0x1D6A3], // Mathematical Monospace
    ]
    
    return text.split('').some(char => {
      const code = char.codePointAt(0) || 0
      return italicRanges.some(([start, end]) => code >= start && code <= end)
    })
  }
  
  // Convert italic text back to regular text
  static convertToRegular(text: string): string {
    return text.split('').map(char => {
      const code = char.codePointAt(0) || 0
      
      // Check each italic range and convert back
      for (const [styleId, style] of Object.entries(ITALIC_STYLES)) {
        // Check uppercase
        if (code >= 0x41 + style.offset && code <= 0x5A + style.offset) {
          return String.fromCharCode(code - style.offset)
        }
        
        // Check lowercase
        if (style.lowercase && code >= 0x61 + style.offset && code <= 0x7A + style.offset) {
          return String.fromCharCode(code - style.offset)
        }
        
        // Check numbers
        if (style.numbers && code >= 0x30 + style.numbers && code <= 0x39 + style.numbers) {
          return String.fromCharCode(code - style.numbers)
        }
      }
      
      // Check special mappings
      for (const [styleId, mappings] of Object.entries(SPECIAL_ITALIC_MAPPINGS)) {
        for (const [regular, special] of Object.entries(mappings)) {
          if (char === special) return regular
        }
      }
      
      // Also check bold mappings
      const regularFromBold = BoldTextGenerator.convertToRegular(char)
      if (regularFromBold !== char) return regularFromBold
      
      return char
    }).join('')
  }
  
  // Get style suggestions based on context
  static getStyleSuggestions(context: 'social' | 'formal' | 'creative'): string[] {
    const suggestions = {
      social: ['serifItalic', 'sansSerifItalic', 'scriptItalic'],
      formal: ['serifItalic', 'serifBoldItalic'],
      creative: ['scriptItalic', 'scriptBoldItalic', 'frakturItalic'],
    }
    
    return suggestions[context] || []
  }
}

// Export convenience functions
export const toItalic = (text: string) => ItalicTextGenerator.convertToStyle(text, 'serifItalic')
export const toItalicSansSerif = (text: string) => ItalicTextGenerator.convertToStyle(text, 'sansSerifItalic')
export const toItalicScript = (text: string) => ItalicTextGenerator.convertToStyle(text, 'scriptItalic')
export const toBoldItalic = (text: string) => ItalicTextGenerator.convertToStyle(text, 'serifBoldItalic')
export const toMonospaceItalic = (text: string) => ItalicTextGenerator.convertToStyle(text, 'monospaceItalic')
```

### 2. Create Italic Text Tool Component

#### Create `src/components/tools/text-format/italic-text-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useToast } from '@/components/ui/use-toast'
import { 
  Copy, 
  Download, 
  RefreshCw, 
  Italic, 
  Bold,
  Type,
  Sparkles,
  Grid3x3,
  List
} from 'lucide-react'
import { ItalicTextGenerator } from '@/lib/text-format/italic-generator'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function ItalicTextTool() {
  const [input, setInput] = React.useState('')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [filterMode, setFilterMode] = React.useState<'all' | 'italic' | 'bold' | 'both'>('all')
  const [selectedStyles, setSelectedStyles] = React.useState<string[]>([])
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'italic-text',
    toolName: 'Italic Text Generator',
    category: 'text-formatting',
  })
  
  const allStyles = React.useMemo(() => {
    if (!input) return []
    return ItalicTextGenerator.getCombinedStyles(input)
  }, [input])
  
  const filteredStyles = React.useMemo(() => {
    return allStyles.filter(style => {
      switch (filterMode) {
        case 'italic':
          return style.isItalic && !style.isBold
        case 'bold':
          return style.isBold && !style.isItalic
        case 'both':
          return style.isBold && style.isItalic
        default:
          return true
      }
    })
  }, [allStyles, filterMode])
  
  React.useEffect(() => {
    if (input) {
      trackStart(input)
      const firstResult = filteredStyles[0]?.result || ''
      trackComplete(input, firstResult)
    }
  }, [input, filteredStyles, trackStart, trackComplete])
  
  const handleCopySelected = () => {
    const selectedText = selectedStyles
      .map(id => {
        const style = allStyles.find(s => s.id === id)
        return style ? `${style.name}:\n${style.result}` : ''
      })
      .filter(Boolean)
      .join('\n\n')
    
    if (!selectedText) {
      toast({
        title: 'No styles selected',
        description: 'Please select at least one style to copy',
        variant: 'destructive',
      })
      return
    }
    
    navigator.clipboard.writeText(selectedText)
    trackFeature('copy_selected', { count: selectedStyles.length })
    toast({
      title: 'Copied!',
      description: `${selectedStyles.length} styles copied to clipboard`,
    })
  }
  
  const toggleStyleSelection = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    )
  }
  
  const selectAll = () => {
    setSelectedStyles(filteredStyles.map(s => s.id))
  }
  
  const deselectAll = () => {
    setSelectedStyles([])
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Italic className="h-5 w-5" />
            Italic Text Generator
          </CardTitle>
          <CardDescription>
            Transform your text into italic, bold, and combined Unicode styles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Enter your text</Label>
            <Textarea
              id="input"
              placeholder="Type or paste your text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] font-mono"
              maxLength={5000}
            />
            <CounterDisplay 
              current={input.length} 
              max={5000} 
              label="characters"
            />
          </div>
          
          {input && (
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
          )}
        </CardContent>
      </Card>
      
      {input && (
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>Text Styles</CardTitle>
                <div className="flex gap-2">
                  <ToggleGroup 
                    type="single" 
                    value={viewMode} 
                    onValueChange={setViewMode as any}
                  >
                    <ToggleGroupItem value="grid" aria-label="Grid view">
                      <Grid3x3 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              
              <Tabs value={filterMode} onValueChange={setFilterMode as any}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    <Type className="h-4 w-4 mr-2" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="italic">
                    <Italic className="h-4 w-4 mr-2" />
                    Italic
                  </TabsTrigger>
                  <TabsTrigger value="bold">
                    <Bold className="h-4 w-4 mr-2" />
                    Bold
                  </TabsTrigger>
                  <TabsTrigger value="both">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Both
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {selectedStyles.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">
                    {selectedStyles.length} style{selectedStyles.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={deselectAll}>
                      Deselect All
                    </Button>
                    <Button size="sm" onClick={handleCopySelected}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Selected
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={cn(
              viewMode === 'grid' 
                ? "grid gap-4 md:grid-cols-2" 
                : "space-y-4"
            )}>
              {filteredStyles.map((style) => {
                const isSelected = selectedStyles.includes(style.id)
                
                return (
                  <Card 
                    key={style.id}
                    className={cn(
                      "transition-all cursor-pointer",
                      isSelected && "ring-2 ring-primary"
                    )}
                    onClick={() => toggleStyleSelection(style.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {style.name}
                            <div className="flex gap-1">
                              {style.isBold && (
                                <Badge variant="secondary" className="text-xs">
                                  Bold
                                </Badge>
                              )}
                              {style.isItalic && (
                                <Badge variant="secondary" className="text-xs">
                                  Italic
                                </Badge>
                              )}
                            </div>
                          </h3>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleStyleSelection(style.id)
                          }}
                          className="h-4 w-4"
                        />
                      </div>
                      
                      <div className="p-3 bg-muted rounded-md font-mono text-sm break-all mb-3">
                        {style.result}
                      </div>
                      
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <CopyButton
                          text={style.result}
                          onCopy={() => {
                            trackFeature('copy_style', { style: style.id })
                            toast({
                              title: 'Copied!',
                              description: `${style.name} copied to clipboard`,
                            })
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {filteredStyles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No styles match the selected filter
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 3. Create Italic Text Page

#### Create `src/app/[locale]/tools/italic-text/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ItalicTextTool } from '@/components/tools/text-format/italic-text-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.italicText' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['italic text', 'unicode italic', 'italic font', 'text formatting', 'bold italic'],
    locale,
    path: '/tools/italic-text',
  })
}

export default function ItalicTextPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="italic-text"
      locale={locale}
    >
      <ItalicTextTool />
    </ToolLayout>
  )
}
```

### 4. Add Tests

#### Create `src/lib/text-format/__tests__/italic-generator.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { 
  ItalicTextGenerator, 
  toItalic, 
  toItalicScript,
  toBoldItalic 
} from '../italic-generator'

describe('ItalicTextGenerator', () => {
  describe('convertToStyle', () => {
    it('converts to serif italic', () => {
      expect(ItalicTextGenerator.convertToStyle('Hello', 'serifItalic')).toBe('𝐻𝑒𝑙𝑙𝑜')
      expect(ItalicTextGenerator.convertToStyle('ABC', 'serifItalic')).toBe('𝐴𝐵𝐶')
    })
    
    it('converts to script with special characters', () => {
      const result = ItalicTextGenerator.convertToStyle('BEFHILMR', 'scriptItalic')
      expect(result).toContain('ℬ') // B
      expect(result).toContain('ℰ') // E
      expect(result).toContain('ℱ') // F
    })
    
    it('converts to bold italic', () => {
      expect(ItalicTextGenerator.convertToStyle('Test', 'serifBoldItalic')).toBe('𝑻𝒆𝒔𝒕')
    })
    
    it('preserves unsupported characters', () => {
      expect(ItalicTextGenerator.convertToStyle('Hello!', 'serifItalic')).toBe('𝐻𝑒𝑙𝑙𝑜!')
      expect(ItalicTextGenerator.convertToStyle('Test 123', 'serifItalic')).toBe('𝑇𝑒𝑠𝑡 123')
    })
  })
  
  describe('getCombinedStyles', () => {
    it('returns both italic and bold styles', () => {
      const styles = ItalicTextGenerator.getCombinedStyles('Test')
      
      const italicStyles = styles.filter(s => s.isItalic && !s.isBold)
      const boldStyles = styles.filter(s => s.isBold && !s.isItalic)
      const bothStyles = styles.filter(s => s.isBold && s.isItalic)
      
      expect(italicStyles.length).toBeGreaterThan(0)
      expect(boldStyles.length).toBeGreaterThan(0)
      expect(bothStyles.length).toBeGreaterThan(0)
    })
  })
  
  describe('containsItalicCharacters', () => {
    it('detects italic characters', () => {
      expect(ItalicTextGenerator.containsItalicCharacters('𝐻𝑒𝑙𝑙𝑜')).toBe(true)
      expect(ItalicTextGenerator.containsItalicCharacters('Hello')).toBe(false)
      expect(ItalicTextGenerator.containsItalicCharacters('𝑻𝒆𝒔𝒕')).toBe(true)
    })
  })
  
  describe('getStyleSuggestions', () => {
    it('returns appropriate suggestions for context', () => {
      expect(ItalicTextGenerator.getStyleSuggestions('social')).toContain('serifItalic')
      expect(ItalicTextGenerator.getStyleSuggestions('formal')).toContain('serifBoldItalic')
      expect(ItalicTextGenerator.getStyleSuggestions('creative')).toContain('scriptItalic')
    })
  })
  
  describe('convenience functions', () => {
    it('provides direct conversion functions', () => {
      expect(toItalic('Test')).toBe('𝑇𝑒𝑠𝑡')
      expect(toItalicScript('B')).toBe('ℬ')
      expect(toBoldItalic('Test')).toBe('𝑻𝒆𝒔𝒕')
    })
  })
})
```

## Testing & Verification

1. Test all italic style conversions
2. Verify combined bold+italic styles
3. Test multi-selection and batch copying
4. Check grid/list view switching
5. Test style filtering
6. Verify mobile responsiveness

## Notes
- Script styles have special character mappings
- Numbers are only supported in monospace style
- Some platforms may not render all Unicode styles
- Consider performance with large text inputs
- Add style preview in different contexts