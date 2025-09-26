# Story 5.1: Bold Text Generator

## Story Details
- **Stage**: 5 - Text Formatting Tools
- **Priority**: High
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Implement a bold text generator that converts regular text into various bold Unicode characters, supporting multiple bold styles and maintaining compatibility across different platforms.

## Acceptance Criteria
- [ ] Convert regular text to Unicode bold characters
- [ ] Support multiple bold styles (serif, sans-serif, double-struck)
- [ ] Preserve spaces, numbers, and special characters
- [ ] Real-time conversion as user types
- [ ] Copy individual styles or all variations
- [ ] Character limit handling (5000 characters)
- [ ] Mobile-responsive design
- [ ] Multi-language UI support
- [ ] Fallback for unsupported characters
- [ ] Preview in different contexts (social media mockups)

## Implementation Steps

### 1. Create Bold Text Conversion Logic

#### Create `src/lib/text-format/bold-generator.ts`
```typescript
// Unicode bold character mappings
const BOLD_STYLES = {
  serifBold: {
    name: 'Serif Bold',
    description: 'Classic bold style',
    offset: 0x1D400 - 0x41, // Mathematical Bold
    uppercase: true,
    lowercase: true,
    numbers: 0x1D7CE - 0x30,
  },
  sansSerifBold: {
    name: 'Sans-Serif Bold',
    description: 'Modern bold style',
    offset: 0x1D5D4 - 0x41, // Mathematical Sans-Serif Bold
    uppercase: true,
    lowercase: true,
    numbers: 0x1D7EC - 0x30,
  },
  serifItalicBold: {
    name: 'Serif Italic Bold',
    description: 'Elegant bold italic style',
    offset: 0x1D468 - 0x41, // Mathematical Bold Italic
    uppercase: true,
    lowercase: true,
    numbers: null, // No special italic bold numbers
  },
  sansSerifItalicBold: {
    name: 'Sans-Serif Italic Bold',
    description: 'Modern bold italic style',
    offset: 0x1D63C - 0x41, // Mathematical Sans-Serif Bold Italic
    uppercase: true,
    lowercase: true,
    numbers: null,
  },
  scriptBold: {
    name: 'Script Bold',
    description: 'Decorative bold script',
    offset: 0x1D4D0 - 0x41, // Mathematical Bold Script
    uppercase: true,
    lowercase: true,
    numbers: null,
  },
  frakturBold: {
    name: 'Fraktur Bold',
    description: 'Gothic bold style',
    offset: 0x1D56C - 0x41, // Mathematical Bold Fraktur
    uppercase: true,
    lowercase: true,
    numbers: null,
  },
  doubleStruck: {
    name: 'Double-Struck',
    description: 'Blackboard bold style',
    offset: 0x1D538 - 0x41, // Mathematical Double-Struck
    uppercase: true,
    lowercase: true,
    numbers: 0x1D7D8 - 0x30,
  },
  regionalIndicator: {
    name: 'Regional Indicator',
    description: 'Emoji letter blocks',
    offset: 0x1F1E6 - 0x41, // Regional Indicator Symbols
    uppercase: true,
    lowercase: false,
    numbers: null,
    special: true,
  },
}

// Special character mappings for certain styles
const SPECIAL_MAPPINGS: Record<string, Record<string, string>> = {
  doubleStruck: {
    'C': '\u2102', // ℂ
    'H': '\u210D', // ℍ
    'N': '\u2115', // ℕ
    'P': '\u2119', // ℙ
    'Q': '\u211A', // ℚ
    'R': '\u211D', // ℝ
    'Z': '\u2124', // ℤ
  },
}

export interface BoldStyle {
  id: string
  name: string
  description: string
  convert: (text: string) => string
  sample: string
}

export class BoldTextGenerator {
  // Convert text to specific bold style
  static convertToStyle(text: string, styleId: string): string {
    const style = BOLD_STYLES[styleId as keyof typeof BOLD_STYLES]
    if (!style) return text
    
    return text.split('').map(char => {
      // Handle special mappings
      if (SPECIAL_MAPPINGS[styleId]?.[char]) {
        return SPECIAL_MAPPINGS[styleId][char]
      }
      
      // Handle uppercase letters
      if (char >= 'A' && char <= 'Z' && style.uppercase) {
        if (styleId === 'regionalIndicator') {
          return String.fromCodePoint(char.charCodeAt(0) + style.offset)
        }
        const offset = char === 'B' && styleId === 'scriptBold' ? 0x212C - 0x42 : style.offset
        return String.fromCodePoint(char.charCodeAt(0) + offset)
      }
      
      // Handle lowercase letters
      if (char >= 'a' && char <= 'z' && style.lowercase) {
        const offset = style.offset + 0x20 // Lowercase offset
        return String.fromCodePoint(char.charCodeAt(0) + offset - 0x20)
      }
      
      // Handle numbers
      if (char >= '0' && char <= '9' && style.numbers) {
        return String.fromCodePoint(char.charCodeAt(0) + style.numbers)
      }
      
      // Return unchanged for unsupported characters
      return char
    }).join('')
  }
  
  // Get all available styles
  static getAllStyles(): BoldStyle[] {
    return Object.entries(BOLD_STYLES).map(([id, style]) => ({
      id,
      name: style.name,
      description: style.description,
      convert: (text: string) => this.convertToStyle(text, id),
      sample: this.convertToStyle('Bold Text', id),
    }))
  }
  
  // Convert to all styles
  static convertToAllStyles(text: string): Record<string, string> {
    const results: Record<string, string> = {}
    
    for (const [id] of Object.entries(BOLD_STYLES)) {
      results[id] = this.convertToStyle(text, id)
    }
    
    return results
  }
  
  // Check if text contains bold characters
  static containsBoldCharacters(text: string): boolean {
    // Check for various Unicode bold ranges
    const boldRanges = [
      [0x1D400, 0x1D433], // Mathematical Bold
      [0x1D468, 0x1D49B], // Mathematical Bold Italic
      [0x1D4D0, 0x1D503], // Mathematical Bold Script
      [0x1D538, 0x1D56B], // Mathematical Double-Struck
      [0x1D56C, 0x1D59F], // Mathematical Bold Fraktur
      [0x1D5D4, 0x1D607], // Mathematical Sans-Serif Bold
      [0x1D63C, 0x1D66F], // Mathematical Sans-Serif Bold Italic
      [0x1D7CE, 0x1D7D7], // Mathematical Bold Digits
      [0x1F1E6, 0x1F1FF], // Regional Indicator Symbols
    ]
    
    return text.split('').some(char => {
      const code = char.codePointAt(0) || 0
      return boldRanges.some(([start, end]) => code >= start && code <= end)
    })
  }
  
  // Convert bold text back to regular text
  static convertToRegular(text: string): string {
    return text.split('').map(char => {
      const code = char.codePointAt(0) || 0
      
      // Check each bold range and convert back
      for (const [styleId, style] of Object.entries(BOLD_STYLES)) {
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
      for (const [styleId, mappings] of Object.entries(SPECIAL_MAPPINGS)) {
        for (const [regular, special] of Object.entries(mappings)) {
          if (char === special) return regular
        }
      }
      
      return char
    }).join('')
  }
  
  // Validate if text can be converted
  static canConvert(text: string): { 
    canConvert: boolean
    unsupportedChars: string[]
  } {
    const unsupportedChars: string[] = []
    
    for (const char of text) {
      if (!/[A-Za-z0-9\s]/.test(char) && !unsupportedChars.includes(char)) {
        unsupportedChars.push(char)
      }
    }
    
    return {
      canConvert: unsupportedChars.length === 0,
      unsupportedChars,
    }
  }
}

// Export individual conversion functions for convenience
export const toBoldSerif = (text: string) => BoldTextGenerator.convertToStyle(text, 'serifBold')
export const toBoldSansSerif = (text: string) => BoldTextGenerator.convertToStyle(text, 'sansSerifBold')
export const toBoldScript = (text: string) => BoldTextGenerator.convertToStyle(text, 'scriptBold')
export const toDoubleStruck = (text: string) => BoldTextGenerator.convertToStyle(text, 'doubleStruck')
export const toRegionalIndicator = (text: string) => BoldTextGenerator.convertToStyle(text, 'regionalIndicator')
```

### 2. Create Bold Text Tool Component

#### Create `src/components/tools/text-format/bold-text-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Copy, Download, RefreshCw, AlertCircle, Smartphone, Monitor } from 'lucide-react'
import { BoldTextGenerator } from '@/lib/text-format/bold-generator'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { cn } from '@/lib/utils'

export function BoldTextTool() {
  const [input, setInput] = React.useState('')
  const [results, setResults] = React.useState<Record<string, string>>({})
  const [selectedStyle, setSelectedStyle] = React.useState('serifBold')
  const [previewMode, setPreviewMode] = React.useState<'text' | 'social'>('text')
  const [favorites, setFavorites] = useLocalStorage<string[]>('bold-text-favorites', [])
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'bold-text',
    toolName: 'Bold Text Generator',
    category: 'text-formatting',
  })
  
  const styles = React.useMemo(() => BoldTextGenerator.getAllStyles(), [])
  const validation = React.useMemo(() => BoldTextGenerator.canConvert(input), [input])
  
  // Convert text when input changes
  React.useEffect(() => {
    if (input) {
      trackStart(input)
      const converted = BoldTextGenerator.convertToAllStyles(input)
      setResults(converted)
      trackComplete(input, converted[selectedStyle] || '')
    } else {
      setResults({})
    }
  }, [input, trackStart, trackComplete, selectedStyle])
  
  const handleCopy = (styleId: string, text: string) => {
    navigator.clipboard.writeText(text)
    trackFeature('copy_style', { style: styleId })
    toast({
      title: 'Copied!',
      description: `${styles.find(s => s.id === styleId)?.name} text copied to clipboard`,
    })
  }
  
  const handleCopyAll = () => {
    const allText = Object.entries(results)
      .map(([id, text]) => `${styles.find(s => s.id === id)?.name}:\n${text}`)
      .join('\n\n')
    
    navigator.clipboard.writeText(allText)
    trackFeature('copy_all')
    toast({
      title: 'All styles copied!',
      description: 'All bold text variations copied to clipboard',
    })
  }
  
  const toggleFavorite = (styleId: string) => {
    setFavorites(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    )
    trackFeature('toggle_favorite', { style: styleId })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bold Text Generator</CardTitle>
          <CardDescription>
            Convert your text into various bold Unicode styles for social media and messaging
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
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <CounterDisplay 
                current={input.length} 
                max={5000} 
                label="characters"
              />
              {validation.unsupportedChars.length > 0 && (
                <Alert className="py-1 px-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="text-xs">
                    Some characters cannot be converted: {validation.unsupportedChars.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Styles
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {input && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bold Text Styles</CardTitle>
              <Tabs value={previewMode} onValueChange={setPreviewMode as any}>
                <TabsList>
                  <TabsTrigger value="text">
                    <Monitor className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Social
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {styles.map((style) => {
                const isFavorite = favorites.includes(style.id)
                const result = results[style.id] || ''
                
                return (
                  <Card key={style.id} className={cn(
                    "transition-all",
                    isFavorite && "ring-2 ring-primary"
                  )}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {style.name}
                            {isFavorite && (
                              <Badge variant="secondary" className="text-xs">
                                Favorite
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {style.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(style.id)}
                        >
                          {isFavorite ? '★' : '☆'}
                        </Button>
                      </div>
                      
                      {previewMode === 'text' ? (
                        <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                          {result}
                        </div>
                      ) : (
                        <SocialMediaPreview text={result} platform="twitter" />
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <CopyButton
                          text={result}
                          onCopy={() => handleCopy(style.id, result)}
                        />
                        <DownloadButton
                          text={result}
                          filename={`bold-text-${style.id}.txt`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Social media preview component
function SocialMediaPreview({ 
  text, 
  platform 
}: { 
  text: string
  platform: 'twitter' | 'instagram' | 'facebook' 
}) {
  const previewStyles = {
    twitter: 'bg-black text-white p-4 rounded-lg max-w-md',
    instagram: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white p-4 rounded-lg max-w-md',
    facebook: 'bg-blue-600 text-white p-4 rounded-lg max-w-md',
  }
  
  return (
    <div className={previewStyles[platform]}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-10 h-10 bg-white/20 rounded-full" />
        <div>
          <div className="font-medium">Your Name</div>
          <div className="text-sm opacity-70">@username</div>
        </div>
      </div>
      <div className="whitespace-pre-wrap">{text}</div>
      <div className="flex gap-4 mt-3 text-sm opacity-70">
        <span>♡ 42</span>
        <span>↻ 12</span>
        <span>💬 5</span>
      </div>
    </div>
  )
}
```

### 3. Create Bold Text Page

#### Create `src/app/[locale]/tools/bold-text/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BoldTextTool } from '@/components/tools/text-format/bold-text-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.boldText' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['bold text', 'unicode bold', 'bold font', 'text formatting', 'social media text'],
    locale,
    path: '/tools/bold-text',
  })
}

export default function BoldTextPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="bold-text"
      locale={locale}
    >
      <BoldTextTool />
    </ToolLayout>
  )
}
```

### 4. Add Translations

#### Update `messages/en/tools.json`
```json
{
  "boldText": {
    "title": "Bold Text Generator",
    "description": "Convert regular text into various bold Unicode styles for social media",
    "inputLabel": "Enter your text",
    "inputPlaceholder": "Type or paste your text here...",
    "outputLabel": "Bold text styles",
    "styles": {
      "serifBold": {
        "name": "Serif Bold",
        "description": "Classic bold style"
      },
      "sansSerifBold": {
        "name": "Sans-Serif Bold",
        "description": "Modern bold style"
      },
      "serifItalicBold": {
        "name": "Serif Italic Bold",
        "description": "Elegant bold italic style"
      },
      "sansSerifItalicBold": {
        "name": "Sans-Serif Italic Bold",
        "description": "Modern bold italic style"
      },
      "scriptBold": {
        "name": "Script Bold",
        "description": "Decorative bold script"
      },
      "frakturBold": {
        "name": "Fraktur Bold",
        "description": "Gothic bold style"
      },
      "doubleStruck": {
        "name": "Double-Struck",
        "description": "Blackboard bold style"
      },
      "regionalIndicator": {
        "name": "Regional Indicator",
        "description": "Emoji letter blocks"
      }
    },
    "actions": {
      "copyStyle": "Copy this style",
      "copyAll": "Copy all styles",
      "clear": "Clear",
      "download": "Download",
      "favorite": "Add to favorites"
    },
    "preview": {
      "text": "Text Preview",
      "social": "Social Media Preview"
    },
    "alerts": {
      "copied": "Copied to clipboard!",
      "unsupportedChars": "Some characters cannot be converted"
    }
  }
}
```

### 5. Add Tests

#### Create `src/lib/text-format/__tests__/bold-generator.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { BoldTextGenerator, toBoldSerif, toBoldSansSerif } from '../bold-generator'

describe('BoldTextGenerator', () => {
  describe('convertToStyle', () => {
    it('converts to serif bold', () => {
      expect(BoldTextGenerator.convertToStyle('Hello', 'serifBold')).toBe('𝐇𝐞𝐥𝐥𝐨')
      expect(BoldTextGenerator.convertToStyle('ABC', 'serifBold')).toBe('𝐀𝐁𝐂')
      expect(BoldTextGenerator.convertToStyle('123', 'serifBold')).toBe('𝟏𝟐𝟑')
    })
    
    it('converts to sans-serif bold', () => {
      expect(BoldTextGenerator.convertToStyle('Test', 'sansSerifBold')).toBe('𝗧𝗲𝘀𝘁')
    })
    
    it('converts to double-struck with special characters', () => {
      expect(BoldTextGenerator.convertToStyle('NRQZ', 'doubleStruck')).toBe('ℕℝℚℤ')
    })
    
    it('preserves unsupported characters', () => {
      expect(BoldTextGenerator.convertToStyle('Hello!', 'serifBold')).toBe('𝐇𝐞𝐥𝐥𝐨!')
      expect(BoldTextGenerator.convertToStyle('Test 123', 'serifBold')).toBe('𝐓𝐞𝐬𝐭 𝟏𝟐𝟑')
    })
  })
  
  describe('convertToRegular', () => {
    it('converts bold text back to regular', () => {
      expect(BoldTextGenerator.convertToRegular('𝐇𝐞𝐥𝐥𝐨')).toBe('Hello')
      expect(BoldTextGenerator.convertToRegular('𝗧𝗲𝘀𝘁')).toBe('Test')
      expect(BoldTextGenerator.convertToRegular('𝟏𝟐𝟑')).toBe('123')
    })
    
    it('handles mixed bold and regular text', () => {
      expect(BoldTextGenerator.convertToRegular('𝐇𝐞𝐥𝐥𝐨 World!')).toBe('Hello World!')
    })
  })
  
  describe('containsBoldCharacters', () => {
    it('detects bold characters', () => {
      expect(BoldTextGenerator.containsBoldCharacters('𝐇𝐞𝐥𝐥𝐨')).toBe(true)
      expect(BoldTextGenerator.containsBoldCharacters('Hello')).toBe(false)
      expect(BoldTextGenerator.containsBoldCharacters('Hello 𝐖𝐨𝐫𝐥𝐝')).toBe(true)
    })
  })
  
  describe('canConvert', () => {
    it('validates convertible text', () => {
      expect(BoldTextGenerator.canConvert('Hello World')).toEqual({
        canConvert: true,
        unsupportedChars: [],
      })
      
      expect(BoldTextGenerator.canConvert('Hello! @#$')).toEqual({
        canConvert: false,
        unsupportedChars: ['!', '@', '#', '$'],
      })
    })
  })
  
  describe('convenience functions', () => {
    it('provides direct conversion functions', () => {
      expect(toBoldSerif('Test')).toBe('𝐓𝐞𝐬𝐭')
      expect(toBoldSansSerif('Test')).toBe('𝗧𝗲𝘀𝘁')
    })
  })
})
```

## Testing & Verification

1. Test all bold style conversions
2. Verify Unicode character support
3. Test copy functionality
4. Check social media previews
5. Verify mobile responsiveness
6. Test character limit handling

## Notes
- Unicode bold characters may not display correctly in all fonts
- Some platforms may not support all Unicode styles
- Consider adding a compatibility checker
- Add examples for each style
- Consider adding custom text effects