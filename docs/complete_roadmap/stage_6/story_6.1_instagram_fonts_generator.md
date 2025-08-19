# Story 6.1: Instagram Fonts Generator

## Story Details
- **Stage**: 6 - Social Media Text Tools
- **Priority**: High
- **Estimated Hours**: 4-5 hours
- **Dependencies**: Stage 5 Complete (Text Formatting Tools)

## Objective
Create a comprehensive Instagram fonts generator that converts regular text into various stylish Unicode fonts perfect for Instagram bios, captions, and stories, with preview capabilities and copy-paste functionality.

## Acceptance Criteria
- [ ] 50+ unique font styles optimized for Instagram
- [ ] Real-time text conversion
- [ ] Instagram bio character counter (150 chars)
- [ ] Preview in Instagram-like UI mockup
- [ ] Font compatibility checker
- [ ] Favorite fonts feature
- [ ] Font combinations generator
- [ ] Hashtag styling options
- [ ] Emoji integration
- [ ] Mobile-optimized interface

## Implementation Steps

### 1. Create Instagram Fonts Logic

#### Create `src/lib/social-media/instagram-fonts.ts`
```typescript
export interface InstagramFont {
  id: string
  name: string
  category: 'serif' | 'sans-serif' | 'script' | 'decorative' | 'symbol' | 'bubble'
  description: string
  sample: string
  tags: string[]
  popularity: number
  compatibility: {
    bio: boolean
    caption: boolean
    story: boolean
    comment: boolean
  }
}

export interface FontConversionResult {
  original: string
  converted: string
  font: InstagramFont
  characterCount: number
  isValidForBio: boolean
  warnings: string[]
}

// Unicode font mappings for Instagram
const INSTAGRAM_FONTS: Record<string, {
  name: string
  category: InstagramFont['category']
  map: Record<string, string>
  fullAlphabet?: boolean
}> = {
  boldSerif: {
    name: 'Bold Serif',
    category: 'serif',
    map: {}, // Populated by generateFontMap
    fullAlphabet: true,
  },
  italicSerif: {
    name: 'Italic Serif',
    category: 'serif',
    map: {},
    fullAlphabet: true,
  },
  boldItalicSerif: {
    name: 'Bold Italic Serif',
    category: 'serif',
    map: {},
    fullAlphabet: true,
  },
  sansSerif: {
    name: 'Sans Serif',
    category: 'sans-serif',
    map: {},
    fullAlphabet: true,
  },
  boldSansSerif: {
    name: 'Bold Sans Serif',
    category: 'sans-serif',
    map: {},
    fullAlphabet: true,
  },
  italicSansSerif: {
    name: 'Italic Sans Serif',
    category: 'sans-serif',
    map: {},
    fullAlphabet: true,
  },
  script: {
    name: 'Script',
    category: 'script',
    map: {},
    fullAlphabet: true,
  },
  boldScript: {
    name: 'Bold Script',
    category: 'script',
    map: {},
    fullAlphabet: true,
  },
  fraktur: {
    name: 'Fraktur',
    category: 'decorative',
    map: {},
    fullAlphabet: true,
  },
  doublestruck: {
    name: 'Double-struck',
    category: 'decorative',
    map: {},
    fullAlphabet: true,
  },
  monospace: {
    name: 'Monospace',
    category: 'sans-serif',
    map: {},
    fullAlphabet: true,
  },
  circled: {
    name: 'Circled',
    category: 'bubble',
    map: {},
    fullAlphabet: true,
  },
  circledNegative: {
    name: 'Circled Negative',
    category: 'bubble',
    map: {},
    fullAlphabet: true,
  },
  squared: {
    name: 'Squared',
    category: 'bubble',
    map: {},
    fullAlphabet: true,
  },
  squaredNegative: {
    name: 'Squared Negative',
    category: 'bubble',
    map: {},
    fullAlphabet: true,
  },
  // Special decorative fonts
  cursive: {
    name: 'Cursive',
    category: 'script',
    map: {
      'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': '𝑒', 'f': '𝒻', 'g': '𝑔',
      'h': '𝒽', 'i': '𝒾', 'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃',
      'o': '𝑜', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇', 's': '𝓈', 't': '𝓉', 'u': '𝓊',
      'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏',
      'A': '𝒜', 'B': 'ℬ', 'C': '𝒞', 'D': '𝒟', 'E': 'ℰ', 'F': 'ℱ', 'G': '𝒢',
      'H': 'ℋ', 'I': 'ℐ', 'J': '𝒥', 'K': '𝒦', 'L': 'ℒ', 'M': 'ℳ', 'N': '𝒩',
      'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': 'ℛ', 'S': '𝒮', 'T': '𝒯', 'U': '𝒰',
      'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵',
    },
  },
  smallCaps: {
    name: 'Small Caps',
    category: 'decorative',
    map: {
      'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ',
      'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
      'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
      'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
    },
  },
  superscript: {
    name: 'Superscript',
    category: 'decorative',
    map: {
      'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ',
      'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ',
      'o': 'ᵒ', 'p': 'ᵖ', 'q': 'ᵠ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
      'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
      '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    },
  },
  subscript: {
    name: 'Subscript',
    category: 'decorative',
    map: {
      'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ',
      'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ',
      'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ',
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
      '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    },
  },
}

export class InstagramFonts {
  private static fonts: Map<string, InstagramFont> = new Map()
  
  // Initialize fonts
  static {
    this.initializeFonts()
  }
  
  private static initializeFonts() {
    // Generate mathematical alphanumeric symbols
    this.generateMathematicalFonts()
    
    // Create font metadata
    Object.entries(INSTAGRAM_FONTS).forEach(([id, fontData]) => {
      this.fonts.set(id, {
        id,
        name: fontData.name,
        category: fontData.category,
        description: this.generateDescription(fontData.name, fontData.category),
        sample: this.convertText('Instagram', id),
        tags: this.generateTags(fontData.name, fontData.category),
        popularity: this.calculatePopularity(id),
        compatibility: {
          bio: true,
          caption: true,
          story: true,
          comment: fontData.category !== 'bubble', // Some bubble fonts may not work in comments
        },
      })
    })
  }
  
  // Generate mathematical Unicode fonts
  private static generateMathematicalFonts() {
    const fonts = [
      { id: 'boldSerif', start: 0x1D400 },
      { id: 'italicSerif', start: 0x1D434 },
      { id: 'boldItalicSerif', start: 0x1D468 },
      { id: 'sansSerif', start: 0x1D5A0 },
      { id: 'boldSansSerif', start: 0x1D5D4 },
      { id: 'italicSansSerif', start: 0x1D608 },
      { id: 'boldItalicSansSerif', start: 0x1D63C },
      { id: 'script', start: 0x1D49C },
      { id: 'boldScript', start: 0x1D4D0 },
      { id: 'fraktur', start: 0x1D504 },
      { id: 'doublestruck', start: 0x1D538 },
      { id: 'monospace', start: 0x1D670 },
    ]
    
    fonts.forEach(({ id, start }) => {
      if (INSTAGRAM_FONTS[id]) {
        const map: Record<string, string> = {}
        
        // Uppercase letters
        for (let i = 0; i < 26; i++) {
          const char = String.fromCharCode(65 + i) // A-Z
          const unicode = String.fromCodePoint(start + i)
          map[char] = unicode
        }
        
        // Lowercase letters
        for (let i = 0; i < 26; i++) {
          const char = String.fromCharCode(97 + i) // a-z
          const unicode = String.fromCodePoint(start + 26 + i)
          map[char] = unicode
        }
        
        // Numbers for some fonts
        if (id === 'boldSerif' || id === 'doublestruck' || id === 'monospace') {
          const numberStart = id === 'boldSerif' ? 0x1D7CE :
                            id === 'doublestruck' ? 0x1D7D8 :
                            0x1D7F6
          
          for (let i = 0; i < 10; i++) {
            const char = String.fromCharCode(48 + i) // 0-9
            const unicode = String.fromCodePoint(numberStart + i)
            map[char] = unicode
          }
        }
        
        INSTAGRAM_FONTS[id].map = map
      }
    })
    
    // Generate circled and squared letters
    this.generateEnclosedFonts()
  }
  
  // Generate enclosed alphanumerics
  private static generateEnclosedFonts() {
    // Circled letters
    const circledMap: Record<string, string> = {}
    for (let i = 0; i < 26; i++) {
      const upperChar = String.fromCharCode(65 + i)
      const lowerChar = String.fromCharCode(97 + i)
      circledMap[upperChar] = String.fromCodePoint(0x24B6 + i) // Ⓐ-Ⓩ
      circledMap[lowerChar] = String.fromCodePoint(0x24D0 + i) // ⓐ-ⓩ
    }
    for (let i = 0; i < 10; i++) {
      circledMap[String(i)] = i === 0 ? '⓪' : String.fromCodePoint(0x245F + i) // ①-⑨
    }
    INSTAGRAM_FONTS.circled.map = circledMap
    
    // Negative circled
    const negCircledMap: Record<string, string> = {}
    for (let i = 0; i < 26; i++) {
      const upperChar = String.fromCharCode(65 + i)
      negCircledMap[upperChar] = String.fromCodePoint(0x1F150 + i) // 🅐-🅩
    }
    INSTAGRAM_FONTS.circledNegative.map = negCircledMap
    
    // Squared letters
    const squaredMap: Record<string, string> = {}
    for (let i = 0; i < 26; i++) {
      const upperChar = String.fromCharCode(65 + i)
      squaredMap[upperChar] = String.fromCodePoint(0x1F130 + i) // 🄰-🅉
    }
    INSTAGRAM_FONTS.squared.map = squaredMap
    
    // Negative squared
    const negSquaredMap: Record<string, string> = {}
    for (let i = 0; i < 26; i++) {
      const upperChar = String.fromCharCode(65 + i)
      negSquaredMap[upperChar] = String.fromCodePoint(0x1F170 + i) // 🅰-🆉
    }
    INSTAGRAM_FONTS.squaredNegative.map = negSquaredMap
  }
  
  // Convert text to specific font
  static convertText(text: string, fontId: string): string {
    const font = INSTAGRAM_FONTS[fontId]
    if (!font) return text
    
    return text.split('').map(char => font.map[char] || char).join('')
  }
  
  // Convert text to all fonts
  static convertToAllFonts(text: string): FontConversionResult[] {
    const results: FontConversionResult[] = []
    
    this.fonts.forEach((font, fontId) => {
      const converted = this.convertText(text, fontId)
      const warnings = this.checkCompatibility(converted, font)
      
      results.push({
        original: text,
        converted,
        font,
        characterCount: converted.length,
        isValidForBio: converted.length <= 150,
        warnings,
      })
    })
    
    return results.sort((a, b) => b.font.popularity - a.font.popularity)
  }
  
  // Get fonts by category
  static getFontsByCategory(category: InstagramFont['category']): InstagramFont[] {
    return Array.from(this.fonts.values())
      .filter(font => font.category === category)
      .sort((a, b) => b.popularity - a.popularity)
  }
  
  // Search fonts
  static searchFonts(query: string): InstagramFont[] {
    const lowerQuery = query.toLowerCase()
    
    return Array.from(this.fonts.values()).filter(font =>
      font.name.toLowerCase().includes(lowerQuery) ||
      font.tags.some(tag => tag.includes(lowerQuery)) ||
      font.category.includes(lowerQuery)
    )
  }
  
  // Generate font combinations
  static generateCombinations(text: string, maxCombos: number = 5): Array<{
    primary: FontConversionResult
    secondary: FontConversionResult
    score: number
  }> {
    const words = text.split(/\s+/)
    if (words.length < 2) return []
    
    const combinations: Array<{
      primary: FontConversionResult
      secondary: FontConversionResult
      score: number
    }> = []
    
    const fonts = Array.from(this.fonts.values())
    
    // Try different font combinations
    for (let i = 0; i < fonts.length; i++) {
      for (let j = i + 1; j < fonts.length; j++) {
        const font1 = fonts[i]
        const font2 = fonts[j]
        
        // Skip if same category
        if (font1.category === font2.category) continue
        
        // Create combination
        const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(' ')
        const secondHalf = words.slice(Math.ceil(words.length / 2)).join(' ')
        
        const primary = {
          original: firstHalf,
          converted: this.convertText(firstHalf, font1.id),
          font: font1,
          characterCount: firstHalf.length,
          isValidForBio: true,
          warnings: [],
        }
        
        const secondary = {
          original: secondHalf,
          converted: this.convertText(secondHalf, font2.id),
          font: font2,
          characterCount: secondHalf.length,
          isValidForBio: true,
          warnings: [],
        }
        
        const score = this.calculateCombinationScore(font1, font2)
        
        combinations.push({ primary, secondary, score })
      }
    }
    
    // Sort by score and return top combinations
    return combinations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxCombos)
  }
  
  // Generate hashtag styles
  static styleHashtags(text: string, fontId: string): string {
    // Style hashtags differently
    return text.replace(/#(\w+)/g, (match, hashtag) => {
      const styled = this.convertText(hashtag, fontId)
      return `#${styled}`
    })
  }
  
  // Check font compatibility
  private static checkCompatibility(text: string, font: InstagramFont): string[] {
    const warnings: string[] = []
    
    // Check for unsupported characters
    const unsupportedChars = text.match(/[^\u0000-\u007F\u0080-\uFFFF]/g)
    if (unsupportedChars) {
      warnings.push('Some characters may not display correctly')
    }
    
    // Check length for bio
    if (text.length > 150) {
      warnings.push('Text exceeds Instagram bio limit (150 characters)')
    }
    
    // Check for potential rendering issues
    if (font.category === 'bubble' && text.length > 50) {
      warnings.push('Bubble fonts may not display well with long text')
    }
    
    return warnings
  }
  
  // Helper methods
  private static generateDescription(name: string, category: string): string {
    const descriptions: Record<string, string> = {
      serif: 'Classic and elegant style perfect for quotes',
      'sans-serif': 'Clean and modern look for contemporary content',
      script: 'Artistic and decorative for creative posts',
      decorative: 'Unique and eye-catching for special content',
      symbol: 'Fun and playful for casual posts',
      bubble: 'Bold and attention-grabbing for highlights',
    }
    
    return descriptions[category] || 'Stylish font for Instagram'
  }
  
  private static generateTags(name: string, category: string): string[] {
    const baseTags = [category, 'instagram', 'social']
    const nameTags = name.toLowerCase().split(/\s+/)
    
    return [...baseTags, ...nameTags]
  }
  
  private static calculatePopularity(fontId: string): number {
    // Assign popularity based on common usage
    const popularFonts: Record<string, number> = {
      boldSerif: 95,
      cursive: 90,
      boldSansSerif: 85,
      script: 80,
      italicSerif: 75,
      circled: 70,
      smallCaps: 65,
      fraktur: 60,
      monospace: 55,
      doublestruck: 50,
    }
    
    return popularFonts[fontId] || 40
  }
  
  private static calculateCombinationScore(font1: InstagramFont, font2: InstagramFont): number {
    let score = 0
    
    // Prefer contrasting categories
    if (font1.category !== font2.category) score += 30
    
    // Prefer popular fonts
    score += (font1.popularity + font2.popularity) / 4
    
    // Bonus for specific good combinations
    const goodCombos = [
      ['serif', 'sans-serif'],
      ['script', 'decorative'],
      ['bold', 'italic'],
    ]
    
    if (goodCombos.some(combo => 
      (font1.category === combo[0] && font2.category === combo[1]) ||
      (font1.category === combo[1] && font2.category === combo[0])
    )) {
      score += 20
    }
    
    return score
  }
}

// Export convenience functions
export const toInstagramFont = (text: string, fontId: string) =>
  InstagramFonts.convertText(text, fontId)

export const getAllInstagramFonts = (text: string) =>
  InstagramFonts.convertToAllFonts(text)
```

### 2. Create Instagram Fonts Component

#### Create `src/components/tools/social-media/instagram-fonts-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Instagram,
  Heart,
  Search,
  Star,
  Hash,
  Sparkles,
  AlertCircle,
  Smartphone,
  Type
} from 'lucide-react'
import { 
  InstagramFonts,
  InstagramFont,
  FontConversionResult,
  getAllInstagramFonts
} from '@/lib/social-media/instagram-fonts'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function InstagramFontsTool() {
  const [input, setInput] = React.useState('')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [favorites, setFavorites] = useLocalStorage<string[]>('instagram-fonts-favorites', [])
  const [recentlyUsed, setRecentlyUsed] = useLocalStorage<string[]>('instagram-fonts-recent', [])
  const [showPreview, setShowPreview] = React.useState(true)
  const [previewType, setPreviewType] = React.useState<'bio' | 'caption' | 'story'>('bio')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'instagram-fonts',
    toolName: 'Instagram Fonts Generator',
    category: 'social-media',
  })
  
  // Get all font conversions
  const fontResults = React.useMemo(() => {
    if (!input) return []
    
    trackStart(input)
    const results = getAllInstagramFonts(input)
    
    if (results.length > 0) {
      trackComplete(input, results[0].converted)
    }
    
    return results
  }, [input, trackStart, trackComplete])
  
  // Filter fonts
  const filteredFonts = React.useMemo(() => {
    let filtered = fontResults
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => 
        result.font.category === selectedCategory ||
        (selectedCategory === 'favorites' && favorites.includes(result.font.id))
      )
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(result =>
        result.font.name.toLowerCase().includes(query) ||
        result.font.tags.some(tag => tag.includes(query))
      )
    }
    
    return filtered
  }, [fontResults, selectedCategory, searchQuery, favorites])
  
  // Get font combinations
  const fontCombinations = React.useMemo(() => {
    if (!input || input.split(/\s+/).length < 2) return []
    return InstagramFonts.generateCombinations(input, 3)
  }, [input])
  
  const handleCopy = (text: string, fontId: string) => {
    navigator.clipboard.writeText(text)
    
    // Update recently used
    setRecentlyUsed(prev => {
      const updated = [fontId, ...prev.filter(id => id !== fontId)].slice(0, 5)
      return updated
    })
    
    trackFeature('copy_font', { fontId })
    
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
    })
  }
  
  const toggleFavorite = (fontId: string) => {
    setFavorites(prev =>
      prev.includes(fontId)
        ? prev.filter(id => id !== fontId)
        : [...prev, fontId]
    )
    
    trackFeature('toggle_favorite', { fontId })
  }
  
  const handleHashtagStyle = () => {
    if (!input.includes('#')) {
      toast({
        title: 'No hashtags found',
        description: 'Add hashtags to your text first (e.g., #instagram)',
        variant: 'destructive',
      })
      return
    }
    
    const styled = InstagramFonts.styleHashtags(input, 'boldSerif')
    setInput(styled)
    
    trackFeature('style_hashtags')
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Fonts Generator
          </CardTitle>
          <CardDescription>
            Transform your text into stylish fonts for Instagram bios, captions, and stories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Enter your text</Label>
            <Textarea
              id="input"
              placeholder="Type your Instagram text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <CounterDisplay
                current={input.length}
                max={150}
                label="characters (bio limit)"
                showWarning={input.length > 150}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHashtagStyle}
                disabled={!input}
              >
                <Hash className="h-4 w-4 mr-2" />
                Style Hashtags
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fonts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput('')
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {input && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Font Styles</CardTitle>
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="serif">Serif</TabsTrigger>
                      <TabsTrigger value="sans-serif">Sans</TabsTrigger>
                      <TabsTrigger value="script">Script</TabsTrigger>
                      <TabsTrigger value="decorative">Decorative</TabsTrigger>
                      <TabsTrigger value="bubble">Bubble</TabsTrigger>
                      <TabsTrigger value="favorites">
                        <Star className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {filteredFonts.map((result) => {
                      const isFavorite = favorites.includes(result.font.id)
                      const isRecent = recentlyUsed.includes(result.font.id)
                      
                      return (
                        <Card key={result.font.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  {result.font.name}
                                  {isFavorite && (
                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                  )}
                                  {isRecent && (
                                    <Badge variant="secondary" className="text-xs">
                                      Recent
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {result.font.description}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(result.font.id)}
                              >
                                <Heart className={cn(
                                  "h-4 w-4",
                                  isFavorite && "fill-red-500 text-red-500"
                                )} />
                              </Button>
                            </div>
                            
                            <div className="p-3 bg-muted rounded-md mb-3 break-all">
                              <p className="text-lg">{result.converted}</p>
                            </div>
                            
                            {result.warnings.length > 0 && (
                              <Alert className="mb-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  {result.warnings[0]}
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {result.font.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {result.characterCount} chars
                                </Badge>
                              </div>
                              <CopyButton
                                text={result.converted}
                                onCopy={() => handleCopy(result.converted, result.font.id)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                    
                    {filteredFonts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No fonts found matching your criteria
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {fontCombinations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Font Combinations
                  </CardTitle>
                  <CardDescription>
                    Creative font pairings for your text
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fontCombinations.map((combo, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">
                              {combo.primary.font.name} + {combo.secondary.font.name}
                            </span>
                          </div>
                          <div className="p-3 bg-muted rounded-md">
                            <span>{combo.primary.converted}</span>
                            <span> </span>
                            <span>{combo.secondary.converted}</span>
                          </div>
                          <CopyButton
                            text={`${combo.primary.converted} ${combo.secondary.converted}`}
                            variant="outline"
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Preview
                </CardTitle>
                <Tabs value={previewType} onValueChange={setPreviewType as any}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bio">Bio</TabsTrigger>
                    <TabsTrigger value="caption">Caption</TabsTrigger>
                    <TabsTrigger value="story">Story</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <InstagramPreview
                  text={filteredFonts[0]?.converted || input}
                  type={previewType}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

// Instagram preview component
function InstagramPreview({ 
  text, 
  type 
}: { 
  text: string
  type: 'bio' | 'caption' | 'story'
}) {
  if (type === 'bio') {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <div>
            <h3 className="font-semibold">username</h3>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span><strong>123</strong> posts</span>
              <span><strong>10k</strong> followers</span>
              <span><strong>500</strong> following</span>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Your Name</p>
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    )
  }
  
  if (type === 'caption') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            <span className="font-semibold text-sm">username</span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{text}</p>
          <p className="text-xs text-muted-foreground mt-2">2 HOURS AGO</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-8 text-white aspect-[9/16] flex items-center justify-center">
      <p className="text-2xl text-center whitespace-pre-wrap">{text}</p>
    </div>
  )
}
```

### 3. Create Instagram Fonts Page

#### Create `src/app/[locale]/tools/instagram-fonts/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { InstagramFontsTool } from '@/components/tools/social-media/instagram-fonts-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.instagramFonts' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['instagram fonts', 'instagram text', 'stylish fonts', 'bio fonts', 'caption fonts'],
    locale,
    path: '/tools/instagram-fonts',
  })
}

export default function InstagramFontsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="instagram-fonts"
      locale={locale}
    >
      <InstagramFontsTool />
    </ToolLayout>
  )
}
```

### 4. Add Translations

#### Update `messages/en/tools.json`
```json
{
  "instagramFonts": {
    "title": "Instagram Fonts Generator",
    "description": "Create stylish text for Instagram bios, captions and stories",
    "inputLabel": "Enter your text",
    "inputPlaceholder": "Type your Instagram text here...",
    "searchPlaceholder": "Search fonts...",
    "categories": {
      "all": "All Fonts",
      "serif": "Serif",
      "sansSerif": "Sans Serif",
      "script": "Script",
      "decorative": "Decorative",
      "bubble": "Bubble",
      "favorites": "Favorites"
    },
    "preview": {
      "title": "Preview",
      "bio": "Bio",
      "caption": "Caption",
      "story": "Story"
    },
    "actions": {
      "copy": "Copy",
      "copyAll": "Copy All",
      "favorite": "Add to Favorites",
      "unfavorite": "Remove from Favorites",
      "styleHashtags": "Style Hashtags",
      "reset": "Reset"
    },
    "warnings": {
      "bioLimit": "Exceeds Instagram bio limit (150 characters)",
      "unsupportedChars": "Some characters may not display correctly",
      "longText": "Text may not display well with this font style"
    },
    "combinations": {
      "title": "Font Combinations",
      "description": "Creative font pairings for your text"
    }
  }
}
```

## Testing & Verification

1. Test all 50+ font styles
2. Verify Instagram compatibility
3. Test character counter for bio limit
4. Check font search functionality
5. Verify favorites persistence
6. Test mobile responsiveness

## Notes
- Instagram has character limits for different areas
- Some Unicode fonts may not display on all devices
- Regular testing needed as Instagram updates
- Consider adding more decorative styles
- Font combinations for creative posts