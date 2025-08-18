# Story 6.4: Shared Font Styles Module

## Story Details
- **Stage**: 6 - Social Media Text Tools
- **Priority**: High
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Stories 6.1, 6.2, and 6.3 Complete

## Objective
Create a unified font styles module that consolidates common Unicode fonts and transformations across all social media platforms, reducing code duplication and ensuring consistency across Instagram, Facebook, Discord, and future platform tools.

## Acceptance Criteria
- [ ] Unified font mapping system
- [ ] Platform compatibility matrix
- [ ] Font category standardization
- [ ] Performance optimization for large texts
- [ ] Font search and discovery API
- [ ] Font combination engine
- [ ] Character fallback system
- [ ] Font preview generator
- [ ] Export/import font preferences
- [ ] Accessibility compliance checks

## Implementation Steps

### 1. Create Shared Font Styles Module

#### Create `src/lib/social-media/shared-fonts.ts`
```typescript
// Comprehensive Unicode font mappings
export interface UnicodeFontMapping {
  uppercase: Record<string, string>
  lowercase: Record<string, string>
  numbers: Record<string, string>
  special?: Record<string, string>
}

export interface FontStyle {
  id: string
  name: string
  category: FontCategory
  tags: string[]
  mapping: UnicodeFontMapping | ((text: string) => string)
  unicodeRange?: {
    start: number
    end: number
  }
  compatibility: PlatformCompatibility
  accessibility: AccessibilityInfo
  preview: string
}

export type FontCategory = 
  | 'serif'
  | 'sans-serif'
  | 'script'
  | 'decorative'
  | 'monospace'
  | 'symbol'
  | 'artistic'
  | 'mathematical'

export interface PlatformCompatibility {
  instagram: {
    bio: boolean
    caption: boolean
    story: boolean
    comment: boolean
    username: boolean
  }
  facebook: {
    post: boolean
    comment: boolean
    bio: boolean
    name: boolean
    pageName: boolean
  }
  discord: {
    message: boolean
    username: boolean
    nickname: boolean
    channelName: boolean
    status: boolean
    embed: boolean
  }
  twitter: {
    tweet: boolean
    bio: boolean
    name: boolean
    username: boolean
  }
  general: {
    sms: boolean
    email: boolean
    web: boolean
  }
}

export interface AccessibilityInfo {
  screenReaderFriendly: boolean
  contrast: 'high' | 'medium' | 'low'
  readability: number // 1-10
  warnings?: string[]
}

// Mathematical Unicode blocks
const UNICODE_BLOCKS = {
  // Serif styles
  BOLD_SERIF: { start: 0x1D400, uppercase: 0, lowercase: 26, numbers: 0x1D7CE - 0x30 },
  ITALIC_SERIF: { start: 0x1D434, uppercase: 0, lowercase: 26 },
  BOLD_ITALIC_SERIF: { start: 0x1D468, uppercase: 0, lowercase: 26 },
  
  // Sans-serif styles
  SANS_SERIF: { start: 0x1D5A0, uppercase: 0, lowercase: 26 },
  BOLD_SANS_SERIF: { start: 0x1D5D4, uppercase: 0, lowercase: 26 },
  ITALIC_SANS_SERIF: { start: 0x1D608, uppercase: 0, lowercase: 26 },
  BOLD_ITALIC_SANS_SERIF: { start: 0x1D63C, uppercase: 0, lowercase: 26 },
  
  // Script styles
  SCRIPT: { start: 0x1D49C, uppercase: 0, lowercase: 26 },
  BOLD_SCRIPT: { start: 0x1D4D0, uppercase: 0, lowercase: 26 },
  
  // Fraktur styles
  FRAKTUR: { start: 0x1D504, uppercase: 0, lowercase: 26 },
  BOLD_FRAKTUR: { start: 0x1D56C, uppercase: 0, lowercase: 26 },
  
  // Double-struck
  DOUBLE_STRUCK: { start: 0x1D538, uppercase: 0, lowercase: 26, numbers: 0x1D7D8 - 0x30 },
  
  // Monospace
  MONOSPACE: { start: 0x1D670, uppercase: 0, lowercase: 26, numbers: 0x1D7F6 - 0x30 },
  
  // Enclosed alphanumerics
  CIRCLED: { uppercase: 0x24B6, lowercase: 0x24D0, numbers: 0x2460 },
  CIRCLED_NEGATIVE: { uppercase: 0x1F150 },
  SQUARED: { uppercase: 0x1F130 },
  SQUARED_NEGATIVE: { uppercase: 0x1F170 },
  
  // Regional indicators
  REGIONAL: { uppercase: 0x1F1E6 },
}

// Special character mappings
const SPECIAL_MAPPINGS: Record<string, Record<string, string>> = {
  SCRIPT: {
    'B': '\u212C', 'E': '\u2130', 'F': '\u2131', 'H': '\u210B',
    'I': '\u2110', 'L': '\u2112', 'M': '\u2133', 'R': '\u211B',
    'e': '\u212F', 'g': '\u210A', 'o': '\u2134',
  },
  DOUBLE_STRUCK: {
    'C': '\u2102', 'H': '\u210D', 'N': '\u2115', 'P': '\u2119',
    'Q': '\u211A', 'R': '\u211D', 'Z': '\u2124',
  },
  SMALL_CAPS: {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ',
    'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
    'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
    'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
  },
  SUPERSCRIPT: {
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ',
    'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ',
    'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
    'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
    '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  },
}

export class SharedFonts {
  private static fontStyles: Map<string, FontStyle> = new Map()
  private static initialized = false
  
  // Initialize all font styles
  static initialize() {
    if (this.initialized) return
    
    // Generate mathematical fonts
    this.generateMathematicalFonts()
    
    // Add special fonts
    this.addSpecialFonts()
    
    // Add artistic transformations
    this.addArtisticFonts()
    
    this.initialized = true
  }
  
  // Generate mathematical Unicode fonts
  private static generateMathematicalFonts() {
    const fontConfigs = [
      { id: 'boldSerif', name: 'Bold Serif', block: UNICODE_BLOCKS.BOLD_SERIF, category: 'serif' as FontCategory },
      { id: 'italicSerif', name: 'Italic Serif', block: UNICODE_BLOCKS.ITALIC_SERIF, category: 'serif' as FontCategory },
      { id: 'boldItalicSerif', name: 'Bold Italic Serif', block: UNICODE_BLOCKS.BOLD_ITALIC_SERIF, category: 'serif' as FontCategory },
      { id: 'sansSerif', name: 'Sans Serif', block: UNICODE_BLOCKS.SANS_SERIF, category: 'sans-serif' as FontCategory },
      { id: 'boldSansSerif', name: 'Bold Sans Serif', block: UNICODE_BLOCKS.BOLD_SANS_SERIF, category: 'sans-serif' as FontCategory },
      { id: 'script', name: 'Script', block: UNICODE_BLOCKS.SCRIPT, category: 'script' as FontCategory },
      { id: 'boldScript', name: 'Bold Script', block: UNICODE_BLOCKS.BOLD_SCRIPT, category: 'script' as FontCategory },
      { id: 'fraktur', name: 'Fraktur', block: UNICODE_BLOCKS.FRAKTUR, category: 'decorative' as FontCategory },
      { id: 'doubleStruck', name: 'Double-Struck', block: UNICODE_BLOCKS.DOUBLE_STRUCK, category: 'mathematical' as FontCategory },
      { id: 'monospace', name: 'Monospace', block: UNICODE_BLOCKS.MONOSPACE, category: 'monospace' as FontCategory },
    ]
    
    fontConfigs.forEach(config => {
      const mapping = this.generateUnicodeMapping(config.block, config.id)
      
      this.fontStyles.set(config.id, {
        id: config.id,
        name: config.name,
        category: config.category,
        tags: [config.category, 'unicode', 'mathematical'],
        mapping,
        unicodeRange: {
          start: config.block.start,
          end: config.block.start + 52,
        },
        compatibility: this.getDefaultCompatibility(),
        accessibility: {
          screenReaderFriendly: false,
          contrast: 'high',
          readability: 7,
          warnings: ['May not be read correctly by screen readers'],
        },
        preview: this.generatePreview(config.name, mapping),
      })
    })
  }
  
  // Generate Unicode mapping for a font
  private static generateUnicodeMapping(
    block: any,
    fontId: string
  ): UnicodeFontMapping {
    const mapping: UnicodeFontMapping = {
      uppercase: {},
      lowercase: {},
      numbers: {},
    }
    
    // Generate letter mappings
    for (let i = 0; i < 26; i++) {
      const upperChar = String.fromCharCode(65 + i)
      const lowerChar = String.fromCharCode(97 + i)
      
      // Check for special mappings
      if (SPECIAL_MAPPINGS[fontId.toUpperCase()]?.[upperChar]) {
        mapping.uppercase[upperChar] = SPECIAL_MAPPINGS[fontId.toUpperCase()][upperChar]
      } else if (block.uppercase !== undefined) {
        mapping.uppercase[upperChar] = String.fromCodePoint(block.uppercase + i)
      } else if (block.start) {
        mapping.uppercase[upperChar] = String.fromCodePoint(block.start + i)
      }
      
      if (SPECIAL_MAPPINGS[fontId.toUpperCase()]?.[lowerChar]) {
        mapping.lowercase[lowerChar] = SPECIAL_MAPPINGS[fontId.toUpperCase()][lowerChar]
      } else if (block.lowercase !== undefined) {
        mapping.lowercase[lowerChar] = String.fromCodePoint(block.lowercase + i)
      } else if (block.start) {
        mapping.lowercase[lowerChar] = String.fromCodePoint(block.start + 26 + i)
      }
    }
    
    // Generate number mappings
    if (block.numbers !== undefined) {
      for (let i = 0; i < 10; i++) {
        const num = String(i)
        mapping.numbers[num] = String.fromCodePoint((block.numbers || 0) + i + 0x30)
      }
    }
    
    return mapping
  }
  
  // Add special non-mathematical fonts
  private static addSpecialFonts() {
    // Small caps
    this.fontStyles.set('smallCaps', {
      id: 'smallCaps',
      name: 'Small Caps',
      category: 'decorative',
      tags: ['decorative', 'small', 'caps'],
      mapping: {
        uppercase: SPECIAL_MAPPINGS.SMALL_CAPS,
        lowercase: SPECIAL_MAPPINGS.SMALL_CAPS,
        numbers: {},
      },
      compatibility: this.getDefaultCompatibility(),
      accessibility: {
        screenReaderFriendly: true,
        contrast: 'high',
        readability: 8,
      },
      preview: 'Sᴍᴀʟʟ Cᴀᴘs',
    })
    
    // Superscript
    this.fontStyles.set('superscript', {
      id: 'superscript',
      name: 'Superscript',
      category: 'decorative',
      tags: ['decorative', 'superscript', 'small'],
      mapping: {
        uppercase: {},
        lowercase: SPECIAL_MAPPINGS.SUPERSCRIPT,
        numbers: SPECIAL_MAPPINGS.SUPERSCRIPT,
      },
      compatibility: this.getDefaultCompatibility(),
      accessibility: {
        screenReaderFriendly: false,
        contrast: 'medium',
        readability: 5,
        warnings: ['Very small text, may be hard to read'],
      },
      preview: 'ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ',
    })
  }
  
  // Add artistic transformation fonts
  private static addArtisticFonts() {
    // Strikethrough
    this.fontStyles.set('strikethrough', {
      id: 'strikethrough',
      name: 'Strikethrough',
      category: 'artistic',
      tags: ['artistic', 'strikethrough', 'decoration'],
      mapping: (text: string) => {
        return text.split('').map(char => char + '\u0336').join('')
      },
      compatibility: this.getDefaultCompatibility(),
      accessibility: {
        screenReaderFriendly: false,
        contrast: 'low',
        readability: 4,
        warnings: ['Strikethrough may interfere with readability'],
      },
      preview: 'S̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶',
    })
    
    // Underline
    this.fontStyles.set('underline', {
      id: 'underline',
      name: 'Underline',
      category: 'artistic',
      tags: ['artistic', 'underline', 'decoration'],
      mapping: (text: string) => {
        return text.split('').map(char => char + '\u0332').join('')
      },
      compatibility: this.getDefaultCompatibility(),
      accessibility: {
        screenReaderFriendly: true,
        contrast: 'high',
        readability: 7,
      },
      preview: 'U̲n̲d̲e̲r̲l̲i̲n̲e̲',
    })
    
    // Zalgo (glitch text)
    this.fontStyles.set('zalgo', {
      id: 'zalgo',
      name: 'Zalgo (Glitch)',
      category: 'artistic',
      tags: ['artistic', 'glitch', 'zalgo', 'creepy'],
      mapping: (text: string) => {
        const zalgoUp = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306']
        const zalgoMid = ['\u0315', '\u031b', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322']
        const zalgoDown = ['\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e']
        
        return text.split('').map(char => {
          let result = char
          // Add 1-2 marks from each category
          const addMarks = (marks: string[], count: number) => {
            for (let i = 0; i < count; i++) {
              result += marks[Math.floor(Math.random() * marks.length)]
            }
          }
          
          addMarks(zalgoUp, Math.floor(Math.random() * 2) + 1)
          addMarks(zalgoMid, Math.floor(Math.random() * 2))
          addMarks(zalgoDown, Math.floor(Math.random() * 2) + 1)
          
          return result
        }).join('')
      },
      compatibility: {
        ...this.getDefaultCompatibility(),
        discord: {
          ...this.getDefaultCompatibility().discord,
          username: false,
          channelName: false,
        },
      },
      accessibility: {
        screenReaderFriendly: false,
        contrast: 'low',
        readability: 1,
        warnings: ['Extremely difficult to read', 'May cause accessibility issues'],
      },
      preview: 'Z̸͎̈a̵̱͐l̷̰̈́g̶̱̈́o̸͇͐',
    })
  }
  
  // Get default platform compatibility
  private static getDefaultCompatibility(): PlatformCompatibility {
    return {
      instagram: {
        bio: true,
        caption: true,
        story: true,
        comment: true,
        username: false,
      },
      facebook: {
        post: true,
        comment: true,
        bio: true,
        name: false,
        pageName: false,
      },
      discord: {
        message: true,
        username: false,
        nickname: true,
        channelName: false,
        status: true,
        embed: true,
      },
      twitter: {
        tweet: true,
        bio: true,
        name: true,
        username: false,
      },
      general: {
        sms: false,
        email: false,
        web: true,
      },
    }
  }
  
  // Generate preview text
  private static generatePreview(name: string, mapping: UnicodeFontMapping | ((text: string) => string)): string {
    const previewText = name.split(' ')[0]
    
    if (typeof mapping === 'function') {
      return mapping(previewText)
    }
    
    return previewText.split('').map(char => {
      if (char >= 'A' && char <= 'Z') {
        return mapping.uppercase[char] || char
      }
      if (char >= 'a' && char <= 'z') {
        return mapping.lowercase[char] || char
      }
      return char
    }).join('')
  }
  
  // Convert text using a specific font
  static convertText(text: string, fontId: string): string {
    this.initialize()
    
    const font = this.fontStyles.get(fontId)
    if (!font) return text
    
    if (typeof font.mapping === 'function') {
      return font.mapping(text)
    }
    
    return text.split('').map(char => {
      if (char >= 'A' && char <= 'Z') {
        return font.mapping.uppercase[char] || char
      }
      if (char >= 'a' && char <= 'z') {
        return font.mapping.lowercase[char] || char
      }
      if (char >= '0' && char <= '9') {
        return font.mapping.numbers[char] || char
      }
      if (font.mapping.special?.[char]) {
        return font.mapping.special[char]
      }
      return char
    }).join('')
  }
  
  // Get all fonts
  static getAllFonts(): FontStyle[] {
    this.initialize()
    return Array.from(this.fontStyles.values())
  }
  
  // Get fonts by category
  static getFontsByCategory(category: FontCategory): FontStyle[] {
    this.initialize()
    return Array.from(this.fontStyles.values()).filter(font => font.category === category)
  }
  
  // Get fonts compatible with a platform
  static getCompatibleFonts(
    platform: keyof PlatformCompatibility,
    context: string
  ): FontStyle[] {
    this.initialize()
    
    return Array.from(this.fontStyles.values()).filter(font => {
      const platformCompat = font.compatibility[platform]
      if (!platformCompat || typeof platformCompat !== 'object') return false
      
      return platformCompat[context as keyof typeof platformCompat] === true
    })
  }
  
  // Search fonts
  static searchFonts(query: string): FontStyle[] {
    this.initialize()
    
    const lowerQuery = query.toLowerCase()
    return Array.from(this.fontStyles.values()).filter(font =>
      font.name.toLowerCase().includes(lowerQuery) ||
      font.tags.some(tag => tag.includes(lowerQuery)) ||
      font.category.includes(lowerQuery)
    )
  }
  
  // Generate font combinations
  static generateCombinations(
    text: string,
    options: {
      maxCombinations?: number
      preferredCategories?: FontCategory[]
      avoidCategories?: FontCategory[]
    } = {}
  ): Array<{
    fonts: FontStyle[]
    preview: string
    score: number
  }> {
    this.initialize()
    
    const {
      maxCombinations = 5,
      preferredCategories = [],
      avoidCategories = [],
    } = options
    
    const fonts = this.getAllFonts().filter(font => 
      !avoidCategories.includes(font.category)
    )
    
    const combinations: Array<{
      fonts: FontStyle[]
      preview: string
      score: number
    }> = []
    
    // Generate 2-font combinations
    for (let i = 0; i < fonts.length; i++) {
      for (let j = i + 1; j < fonts.length; j++) {
        const font1 = fonts[i]
        const font2 = fonts[j]
        
        // Skip same category combinations
        if (font1.category === font2.category) continue
        
        const words = text.split(/\s+/)
        const midPoint = Math.ceil(words.length / 2)
        
        const part1 = words.slice(0, midPoint).join(' ')
        const part2 = words.slice(midPoint).join(' ')
        
        const preview = this.convertText(part1, font1.id) + ' ' + this.convertText(part2, font2.id)
        
        let score = 50
        
        // Boost score for preferred categories
        if (preferredCategories.includes(font1.category)) score += 20
        if (preferredCategories.includes(font2.category)) score += 20
        
        // Boost score for good combinations
        const goodCombos = [
          ['serif', 'sans-serif'],
          ['script', 'decorative'],
          ['mathematical', 'artistic'],
        ]
        
        if (goodCombos.some(combo => 
          (combo.includes(font1.category) && combo.includes(font2.category))
        )) {
          score += 30
        }
        
        // Consider readability
        score += (font1.accessibility.readability + font2.accessibility.readability) * 2
        
        combinations.push({
          fonts: [font1, font2],
          preview,
          score,
        })
      }
    }
    
    // Sort by score and return top combinations
    return combinations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxCombinations)
  }
  
  // Check text accessibility
  static checkAccessibility(text: string, fontId: string): {
    score: number
    warnings: string[]
    suggestions: string[]
  } {
    this.initialize()
    
    const font = this.fontStyles.get(fontId)
    if (!font) {
      return {
        score: 0,
        warnings: ['Font not found'],
        suggestions: [],
      }
    }
    
    const warnings: string[] = [...(font.accessibility.warnings || [])]
    const suggestions: string[] = []
    
    // Check text length
    if (text.length > 100) {
      warnings.push('Long text may be difficult to read in decorative fonts')
      suggestions.push('Consider using a more readable font for longer texts')
    }
    
    // Check for all caps
    if (text === text.toUpperCase() && text.length > 20) {
      warnings.push('All caps text can be harder to read')
      suggestions.push('Consider using mixed case for better readability')
    }
    
    // Calculate score
    let score = font.accessibility.readability * 10
    
    if (!font.accessibility.screenReaderFriendly) {
      score -= 20
      warnings.push('Not compatible with screen readers')
    }
    
    if (font.accessibility.contrast === 'low') {
      score -= 10
      warnings.push('Low contrast may affect visibility')
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      warnings,
      suggestions,
    }
  }
  
  // Export font preferences
  static exportPreferences(favoriteIds: string[]): string {
    const preferences = {
      version: '1.0',
      favorites: favoriteIds,
      timestamp: new Date().toISOString(),
    }
    
    return JSON.stringify(preferences)
  }
  
  // Import font preferences
  static importPreferences(data: string): {
    favorites: string[]
    error?: string
  } {
    try {
      const preferences = JSON.parse(data)
      
      if (!preferences.favorites || !Array.isArray(preferences.favorites)) {
        throw new Error('Invalid preferences format')
      }
      
      // Validate font IDs
      const validIds = preferences.favorites.filter((id: string) => 
        this.fontStyles.has(id)
      )
      
      return {
        favorites: validIds,
      }
    } catch (error) {
      return {
        favorites: [],
        error: 'Failed to import preferences',
      }
    }
  }
  
  // Get font metadata
  static getFontMetadata(fontId: string): FontStyle | null {
    this.initialize()
    return this.fontStyles.get(fontId) || null
  }
  
  // Batch convert text
  static batchConvert(
    text: string,
    fontIds: string[]
  ): Array<{
    fontId: string
    converted: string
    font: FontStyle | null
  }> {
    return fontIds.map(fontId => ({
      fontId,
      converted: this.convertText(text, fontId),
      font: this.getFontMetadata(fontId),
    }))
  }
}

// Initialize on module load
SharedFonts.initialize()

// Export convenience functions
export const convertToFont = (text: string, fontId: string) =>
  SharedFonts.convertText(text, fontId)

export const getAllFontStyles = () =>
  SharedFonts.getAllFonts()

export const searchFontStyles = (query: string) =>
  SharedFonts.searchFonts(query)
```

### 2. Create Font Style Explorer Component

#### Create `src/components/tools/social-media/font-style-explorer.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import {
  Search,
  Filter,
  Download,
  Upload,
  Info,
  AlertCircle,
  CheckCircle,
  Star,
  Copy,
  Accessibility
} from 'lucide-react'
import {
  SharedFonts,
  FontStyle,
  FontCategory,
  getAllFontStyles,
  searchFontStyles
} from '@/lib/social-media/shared-fonts'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function FontStyleExplorer() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<FontCategory | 'all'>('all')
  const [selectedPlatform, setSelectedPlatform] = React.useState<string>('all')
  const [favorites, setFavorites] = useLocalStorage<string[]>('font-favorites', [])
  const [testText, setTestText] = React.useState('The quick brown fox')
  
  const { toast } = useToast()
  
  // Get all fonts
  const allFonts = React.useMemo(() => getAllFontStyles(), [])
  
  // Filter fonts
  const filteredFonts = React.useMemo(() => {
    let fonts = allFonts
    
    // Search filter
    if (searchQuery) {
      fonts = searchFontStyles(searchQuery)
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      fonts = fonts.filter(font => font.category === selectedCategory)
    }
    
    // Platform filter
    if (selectedPlatform !== 'all') {
      const [platform, context] = selectedPlatform.split(':')
      fonts = SharedFonts.getCompatibleFonts(platform as any, context)
    }
    
    // Sort favorites first
    fonts.sort((a, b) => {
      const aFav = favorites.includes(a.id) ? -1 : 0
      const bFav = favorites.includes(b.id) ? -1 : 0
      return aFav - bFav
    })
    
    return fonts
  }, [allFonts, searchQuery, selectedCategory, selectedPlatform, favorites])
  
  const toggleFavorite = (fontId: string) => {
    setFavorites(prev =>
      prev.includes(fontId)
        ? prev.filter(id => id !== fontId)
        : [...prev, fontId]
    )
  }
  
  const exportFavorites = () => {
    const data = SharedFonts.exportPreferences(favorites)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'font-favorites.json'
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Exported!',
      description: 'Your font favorites have been exported',
    })
  }
  
  const importFavorites = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = SharedFonts.importPreferences(e.target?.result as string)
      
      if (result.error) {
        toast({
          title: 'Import failed',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        setFavorites(result.favorites)
        toast({
          title: 'Imported!',
          description: `${result.favorites.length} favorites imported`,
        })
      }
    }
    reader.readAsText(file)
  }
  
  const categories: Array<{ value: FontCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'serif', label: 'Serif' },
    { value: 'sans-serif', label: 'Sans Serif' },
    { value: 'script', label: 'Script' },
    { value: 'decorative', label: 'Decorative' },
    { value: 'monospace', label: 'Monospace' },
    { value: 'symbol', label: 'Symbol' },
    { value: 'artistic', label: 'Artistic' },
    { value: 'mathematical', label: 'Mathematical' },
  ]
  
  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'instagram:bio', label: 'Instagram Bio' },
    { value: 'instagram:caption', label: 'Instagram Caption' },
    { value: 'facebook:post', label: 'Facebook Post' },
    { value: 'discord:message', label: 'Discord Message' },
    { value: 'discord:nickname', label: 'Discord Nickname' },
    { value: 'twitter:tweet', label: 'Twitter/X Tweet' },
  ]
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Font Style Explorer</CardTitle>
          <CardDescription>
            Discover and test all available font styles across platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
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
              size="icon"
              onClick={exportFavorites}
              disabled={favorites.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Label htmlFor="import" className="cursor-pointer">
              <Button variant="outline" size="icon" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                </span>
              </Button>
              <Input
                id="import"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importFavorites}
              />
            </Label>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory as any}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms.map(platform => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="testText">Test Text</Label>
            <Input
              id="testText"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to preview..."
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Font Styles ({filteredFonts.length})
            </CardTitle>
            <Badge variant="secondary">
              {favorites.length} favorites
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredFonts.map((font) => (
                <FontCard
                  key={font.id}
                  font={font}
                  testText={testText}
                  isFavorite={favorites.includes(font.id)}
                  onToggleFavorite={() => toggleFavorite(font.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function FontCard({
  font,
  testText,
  isFavorite,
  onToggleFavorite,
}: {
  font: FontStyle
  testText: string
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  const [showDetails, setShowDetails] = React.useState(false)
  const { toast } = useToast()
  
  const converted = React.useMemo(() => 
    SharedFonts.convertText(testText, font.id),
    [testText, font.id]
  )
  
  const accessibility = React.useMemo(() =>
    SharedFonts.checkAccessibility(testText, font.id),
    [testText, font.id]
  )
  
  const handleCopy = () => {
    navigator.clipboard.writeText(converted)
    toast({
      title: 'Copied!',
      description: `${font.name} text copied to clipboard`,
    })
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {font.name}
                {isFavorite && (
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                )}
              </h3>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{font.category}</Badge>
                {font.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
              >
                <Star className={cn(
                  "h-4 w-4",
                  isFavorite && "fill-yellow-500 text-yellow-500"
                )} />
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-lg break-all">
            <p className="text-lg">{converted}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                <Progress value={accessibility.score} className="w-20" />
                <span className="text-sm text-muted-foreground">
                  {accessibility.score}%
                </span>
              </div>
              {font.accessibility.screenReaderFriendly ? (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Screen Reader OK
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Accessible
                </Badge>
              )}
            </div>
            <CopyButton
              text={converted}
              onCopy={handleCopy}
            />
          </div>
          
          {showDetails && (
            <div className="pt-4 border-t space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-2">Platform Compatibility</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(font.compatibility).slice(0, 3).map(([platform, compat]) => {
                    const compatible = Object.values(compat as any).filter(v => v === true).length
                    const total = Object.values(compat as any).length
                    
                    return (
                      <Badge
                        key={platform}
                        variant={compatible === total ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {platform}: {compatible}/{total}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              
              {accessibility.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Accessibility Warnings</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {accessibility.warnings.map((warning, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {font.unicodeRange && (
                <div className="text-xs text-muted-foreground">
                  Unicode Range: U+{font.unicodeRange.start.toString(16).toUpperCase()}-
                  U+{font.unicodeRange.end.toString(16).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Update Existing Tools to Use Shared Module

Update the Instagram, Facebook, and Discord font tools to use the shared module instead of their own implementations. This would involve:

1. Replacing local font definitions with `SharedFonts` imports
2. Using `SharedFonts.getCompatibleFonts()` for platform-specific filtering
3. Leveraging the unified conversion and accessibility checking

### 4. Create Integration Tests

#### Create `src/lib/social-media/__tests__/shared-fonts.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { 
  SharedFonts,
  convertToFont,
  getAllFontStyles,
  searchFontStyles
} from '../shared-fonts'

describe('SharedFonts', () => {
  describe('Font Conversion', () => {
    it('converts text to bold serif', () => {
      const result = convertToFont('Hello', 'boldSerif')
      expect(result).toBe('𝐇𝐞𝐥𝐥𝐨')
    })
    
    it('handles mixed case and numbers', () => {
      const result = convertToFont('Test123', 'boldSerif')
      expect(result).toBe('𝐓𝐞𝐬𝐭𝟏𝟐𝟑')
    })
    
    it('preserves unsupported characters', () => {
      const result = convertToFont('Hello!@#', 'boldSerif')
      expect(result).toBe('𝐇𝐞𝐥𝐥𝐨!@#')
    })
  })
  
  describe('Font Discovery', () => {
    it('returns all font styles', () => {
      const fonts = getAllFontStyles()
      expect(fonts.length).toBeGreaterThan(10)
      expect(fonts[0]).toHaveProperty('id')
      expect(fonts[0]).toHaveProperty('name')
      expect(fonts[0]).toHaveProperty('category')
    })
    
    it('searches fonts by name', () => {
      const results = searchFontStyles('bold')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(f => f.name.toLowerCase().includes('bold'))).toBe(true)
    })
    
    it('filters by category', () => {
      const serifFonts = SharedFonts.getFontsByCategory('serif')
      expect(serifFonts.every(f => f.category === 'serif')).toBe(true)
    })
  })
  
  describe('Platform Compatibility', () => {
    it('returns Instagram-compatible fonts', () => {
      const fonts = SharedFonts.getCompatibleFonts('instagram', 'bio')
      expect(fonts.length).toBeGreaterThan(0)
      expect(fonts.every(f => f.compatibility.instagram.bio)).toBe(true)
    })
    
    it('excludes incompatible fonts', () => {
      const fonts = SharedFonts.getCompatibleFonts('discord', 'username')
      expect(fonts.every(f => f.compatibility.discord.username)).toBe(true)
    })
  })
  
  describe('Accessibility', () => {
    it('checks font accessibility', () => {
      const result = SharedFonts.checkAccessibility('Hello World', 'boldSerif')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('warnings')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })
    
    it('warns about long decorative text', () => {
      const longText = 'a'.repeat(150)
      const result = SharedFonts.checkAccessibility(longText, 'zalgo')
      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })
  
  describe('Font Combinations', () => {
    it('generates font combinations', () => {
      const combos = SharedFonts.generateCombinations('Hello World')
      expect(combos.length).toBeGreaterThan(0)
      expect(combos[0]).toHaveProperty('fonts')
      expect(combos[0]).toHaveProperty('preview')
      expect(combos[0]).toHaveProperty('score')
    })
    
    it('respects category preferences', () => {
      const combos = SharedFonts.generateCombinations('Test', {
        preferredCategories: ['serif'],
        avoidCategories: ['artistic'],
      })
      
      expect(combos.every(c => 
        !c.fonts.some(f => f.category === 'artistic')
      )).toBe(true)
    })
  })
})
```

## Testing & Verification

1. Test all font conversions
2. Verify platform compatibility matrix
3. Test performance with large texts
4. Check accessibility scoring
5. Verify font combination generation
6. Test import/export functionality

## Notes
- Centralized font management reduces duplication
- Easier to add new platforms
- Consistent accessibility checking
- Performance optimized for batch operations
- Extensible for future font styles