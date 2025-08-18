# Story 6.2: Facebook Font Generator

## Story Details
- **Stage**: 6 - Social Media Text Tools
- **Priority**: Medium
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 6.1 (Instagram Fonts Generator)

## Objective
Create a Facebook-optimized font generator that produces stylish text for Facebook posts, comments, bios, and names, with special consideration for Facebook's rendering quirks and character support.

## Acceptance Criteria
- [ ] 40+ font styles tested for Facebook compatibility
- [ ] Facebook post preview with reactions/comments
- [ ] Name generator with character limits
- [ ] Bio text formatter (101 character limit)
- [ ] Comment styling options
- [ ] Event/Page name styling
- [ ] Emoji text art generator
- [ ] Facebook-safe character checker
- [ ] Copy with formatting preservation
- [ ] Mobile and desktop preview modes

## Implementation Steps

### 1. Create Facebook Fonts Logic

#### Create `src/lib/social-media/facebook-fonts.ts`
```typescript
import { InstagramFonts } from './instagram-fonts'

export interface FacebookFont {
  id: string
  name: string
  category: 'standard' | 'decorative' | 'symbolic' | 'artistic'
  description: string
  sample: string
  compatibility: {
    posts: boolean
    comments: boolean
    bio: boolean
    name: boolean
    pageName: boolean
    eventName: boolean
  }
  limitations?: string[]
}

export interface FacebookTextResult {
  original: string
  converted: string
  font: FacebookFont
  characterCount: number
  isValidForName: boolean
  isValidForBio: boolean
  warnings: string[]
}

// Facebook-specific character limits
const FACEBOOK_LIMITS = {
  name: 50,
  bio: 101,
  post: 63206,
  comment: 8000,
  pageName: 75,
  eventName: 64,
}

// Facebook-compatible fonts (curated for better compatibility)
const FACEBOOK_FONTS: Record<string, {
  name: string
  category: FacebookFont['category']
  converter: (text: string) => string
  compatibility: FacebookFont['compatibility']
  limitations?: string[]
}> = {
  // Standard Unicode fonts that work well on Facebook
  boldText: {
    name: 'Bold Text',
    category: 'standard',
    converter: (text: string) => InstagramFonts.convertText(text, 'boldSerif'),
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false, // Facebook names don't support Unicode
      pageName: true,
      eventName: true,
    },
  },
  italicText: {
    name: 'Italic Text',
    category: 'standard',
    converter: (text: string) => InstagramFonts.convertText(text, 'italicSerif'),
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: true,
      eventName: true,
    },
  },
  // Decorative fonts
  cursiveText: {
    name: 'Cursive',
    category: 'decorative',
    converter: (text: string) => InstagramFonts.convertText(text, 'cursive'),
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: true,
      eventName: true,
    },
  },
  fancyText: {
    name: 'Fancy Text',
    category: 'decorative',
    converter: (text: string) => {
      const map: Record<string, string> = {
        'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰',
        'h': '𝓱', 'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷',
        'o': '𝓸', 'p': '𝓹', 'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾',
        'v': '𝓿', 'w': '𝔀', 'x': '𝔁', 'y': '𝔂', 'z': '𝔃',
        'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖',
        'H': '𝓗', 'I': '𝓘', 'J': '𝓙', 'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝',
        'O': '𝓞', 'P': '𝓟', 'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣', 'U': '𝓤',
        'V': '𝓥', 'W': '𝓦', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩',
      }
      return text.split('').map(char => map[char] || char).join('')
    },
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: true,
      eventName: true,
    },
  },
  // Symbolic fonts
  circledText: {
    name: 'Circled Letters',
    category: 'symbolic',
    converter: (text: string) => InstagramFonts.convertText(text, 'circled'),
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: false, // May have issues
      eventName: false,
    },
    limitations: ['May not display correctly on older devices'],
  },
  squaredText: {
    name: 'Squared Letters',
    category: 'symbolic',
    converter: (text: string) => InstagramFonts.convertText(text, 'squared'),
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: false,
      eventName: false,
    },
    limitations: ['Limited character support'],
  },
  // Artistic styles
  underlinedText: {
    name: 'Underlined',
    category: 'artistic',
    converter: (text: string) => {
      return text.split('').map(char => char + '\u0332').join('')
    },
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: false,
      eventName: false,
    },
  },
  doubleUnderlined: {
    name: 'Double Underlined',
    category: 'artistic',
    converter: (text: string) => {
      return text.split('').map(char => char + '\u0333').join('')
    },
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: false,
      eventName: false,
    },
  },
  strikethrough: {
    name: 'Strikethrough',
    category: 'artistic',
    converter: (text: string) => {
      return text.split('').map(char => char + '\u0336').join('')
    },
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: false,
      eventName: false,
    },
  },
  // Special Facebook-friendly styles
  alternatingCaps: {
    name: 'aLtErNaTiNg CaPs',
    category: 'artistic',
    converter: (text: string) => {
      return text.split('').map((char, i) => 
        i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
      ).join('')
    },
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: true, // Works in names!
      pageName: true,
      eventName: true,
    },
  },
  reverseText: {
    name: 'ǝsɹǝʌǝɹ',
    category: 'artistic',
    converter: (text: string) => {
      const flipMap: Record<string, string> = {
        'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
        'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
        'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
        'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
      }
      return text.toLowerCase().split('').reverse()
        .map(char => flipMap[char] || char).join('')
    },
    compatibility: {
      posts: true,
      comments: true,
      bio: true,
      name: false,
      pageName: false,
      eventName: false,
    },
  },
}

export class FacebookFonts {
  private static fonts: Map<string, FacebookFont> = new Map()
  
  static {
    this.initializeFonts()
  }
  
  private static initializeFonts() {
    Object.entries(FACEBOOK_FONTS).forEach(([id, fontData]) => {
      this.fonts.set(id, {
        id,
        name: fontData.name,
        category: fontData.category,
        description: this.generateDescription(fontData.name, fontData.category),
        sample: fontData.converter('Facebook'),
        compatibility: fontData.compatibility,
        limitations: fontData.limitations,
      })
    })
  }
  
  // Convert text to specific font
  static convertText(text: string, fontId: string): string {
    const font = FACEBOOK_FONTS[fontId]
    if (!font) return text
    
    return font.converter(text)
  }
  
  // Convert text to all Facebook-compatible fonts
  static convertToAllFonts(text: string, context: keyof typeof FACEBOOK_LIMITS): FacebookTextResult[] {
    const results: FacebookTextResult[] = []
    
    this.fonts.forEach((font, fontId) => {
      const fontData = FACEBOOK_FONTS[fontId]
      if (!fontData) return
      
      // Check compatibility for context
      const contextCompatibility = {
        name: font.compatibility.name,
        bio: font.compatibility.bio,
        post: font.compatibility.posts,
        comment: font.compatibility.comments,
        pageName: font.compatibility.pageName,
        eventName: font.compatibility.eventName,
      }
      
      if (!contextCompatibility[context]) return
      
      const converted = fontData.converter(text)
      const warnings = this.checkWarnings(text, converted, font, context)
      
      results.push({
        original: text,
        converted,
        font,
        characterCount: converted.length,
        isValidForName: converted.length <= FACEBOOK_LIMITS.name && font.compatibility.name,
        isValidForBio: converted.length <= FACEBOOK_LIMITS.bio,
        warnings,
      })
    })
    
    return results
  }
  
  // Create emoji text art
  static createEmojiArt(text: string, style: 'border' | 'filled' | 'spaced'): string {
    const emojis = ['✨', '💫', '⭐', '🌟', '💖', '💕', '🦋', '🌸', '🌺', '🌼']
    
    switch (style) {
      case 'border':
        const emoji = emojis[Math.floor(Math.random() * emojis.length)]
        return `${emoji} ${text} ${emoji}`
        
      case 'filled':
        return text.split('').map((char, i) => 
          char === ' ' ? emojis[i % emojis.length] : char
        ).join('')
        
      case 'spaced':
        return text.split('').join(' ')
        
      default:
        return text
    }
  }
  
  // Generate stylish Facebook name variations
  static generateNameVariations(firstName: string, lastName: string): Array<{
    variation: string
    style: string
    isValid: boolean
  }> {
    const variations: Array<{
      variation: string
      style: string
      isValid: boolean
    }> = []
    
    // Standard variations (work in Facebook names)
    variations.push({
      variation: `${firstName} ${lastName}`,
      style: 'Standard',
      isValid: true,
    })
    
    variations.push({
      variation: `${firstName.toUpperCase()} ${lastName}`,
      style: 'First Name Caps',
      isValid: true,
    })
    
    variations.push({
      variation: `${firstName} ${lastName.toUpperCase()}`,
      style: 'Last Name Caps',
      isValid: true,
    })
    
    variations.push({
      variation: this.alternatingCaps(`${firstName} ${lastName}`),
      style: 'Alternating Caps',
      isValid: true,
    })
    
    // Creative variations (may not work in actual name field)
    variations.push({
      variation: `${firstName.charAt(0)}.${lastName}`,
      style: 'Initial Style',
      isValid: true,
    })
    
    variations.push({
      variation: `${firstName} "${lastName}"`,
      style: 'Quoted Last Name',
      isValid: false, // Quotes not allowed
    })
    
    return variations.filter(v => v.variation.length <= FACEBOOK_LIMITS.name)
  }
  
  // Format text for Facebook bio
  static formatBio(text: string, style: 'minimal' | 'emoji' | 'professional'): string {
    if (text.length > FACEBOOK_LIMITS.bio) {
      text = text.substring(0, FACEBOOK_LIMITS.bio - 3) + '...'
    }
    
    switch (style) {
      case 'minimal':
        return text.toLowerCase()
        
      case 'emoji':
        const lines = text.split('\n')
        return lines.map(line => `• ${line}`).join('\n')
        
      case 'professional':
        return text.split('\n').map(line => 
          line.charAt(0).toUpperCase() + line.slice(1)
        ).join('\n')
        
      default:
        return text
    }
  }
  
  // Check for Facebook-specific warnings
  private static checkWarnings(
    original: string,
    converted: string,
    font: FacebookFont,
    context: string
  ): string[] {
    const warnings: string[] = []
    
    // Check character limit
    const limit = FACEBOOK_LIMITS[context as keyof typeof FACEBOOK_LIMITS]
    if (limit && converted.length > limit) {
      warnings.push(`Exceeds ${context} character limit (${limit} characters)`)
    }
    
    // Check for potentially unsupported characters
    if (/[^\u0000-\u007F\u0080-\uFFFF]/.test(converted)) {
      warnings.push('Contains characters that may not display on all devices')
    }
    
    // Add font-specific limitations
    if (font.limitations) {
      warnings.push(...font.limitations)
    }
    
    // Facebook name specific checks
    if (context === 'name' && !font.compatibility.name) {
      warnings.push('This style cannot be used in Facebook names')
    }
    
    return warnings
  }
  
  // Helper methods
  private static generateDescription(name: string, category: string): string {
    const descriptions: Record<string, string> = {
      standard: 'Classic text styling that works everywhere on Facebook',
      decorative: 'Decorative style for posts and comments',
      symbolic: 'Eye-catching symbolic style for special posts',
      artistic: 'Creative and artistic text transformation',
    }
    
    return descriptions[category] || 'Stylish text for Facebook'
  }
  
  private static alternatingCaps(text: string): string {
    return text.split('').map((char, i) => 
      i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
    ).join('')
  }
  
  // Get compatible fonts for specific context
  static getCompatibleFonts(context: keyof FacebookFont['compatibility']): FacebookFont[] {
    return Array.from(this.fonts.values()).filter(font => 
      font.compatibility[context]
    )
  }
  
  // Create Facebook post with styling
  static createStyledPost(
    text: string,
    options: {
      addEmojis?: boolean
      addHashtags?: string[]
      fontId?: string
    } = {}
  ): string {
    let styledText = text
    
    // Apply font if specified
    if (options.fontId) {
      styledText = this.convertText(styledText, options.fontId)
    }
    
    // Add emojis
    if (options.addEmojis) {
      styledText = this.createEmojiArt(styledText, 'border')
    }
    
    // Add hashtags
    if (options.addHashtags && options.addHashtags.length > 0) {
      const hashtags = options.addHashtags.map(tag => `#${tag}`).join(' ')
      styledText = `${styledText}\n\n${hashtags}`
    }
    
    return styledText
  }
}

// Export convenience functions
export const toFacebookFont = (text: string, fontId: string) =>
  FacebookFonts.convertText(text, fontId)

export const getFacebookNameVariations = (firstName: string, lastName: string) =>
  FacebookFonts.generateNameVariations(firstName, lastName)
```

### 2. Create Facebook Fonts Component

#### Create `src/components/tools/social-media/facebook-fonts-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Facebook,
  User,
  FileText,
  MessageSquare,
  Calendar,
  ThumbsUp,
  Heart,
  Laugh,
  AlertCircle,
  Hash,
  Sparkles
} from 'lucide-react'
import { 
  FacebookFonts,
  FacebookFont,
  FacebookTextResult,
  getFacebookNameVariations
} from '@/lib/social-media/facebook-fonts'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function FacebookFontsTool() {
  const [input, setInput] = React.useState('')
  const [context, setContext] = React.useState<'post' | 'bio' | 'name' | 'comment'>('post')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [bioStyle, setBioStyle] = React.useState<'minimal' | 'emoji' | 'professional'>('minimal')
  const [emojiStyle, setEmojiStyle] = React.useState<'border' | 'filled' | 'spaced'>('border')
  const [addEmojis, setAddEmojis] = React.useState(false)
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'facebook-fonts',
    toolName: 'Facebook Font Generator',
    category: 'social-media',
  })
  
  // Get character limit based on context
  const getCharLimit = () => {
    switch (context) {
      case 'name': return 50
      case 'bio': return 101
      case 'comment': return 8000
      default: return 63206
    }
  }
  
  // Get font results
  const fontResults = React.useMemo(() => {
    const textToConvert = context === 'name' 
      ? `${firstName} ${lastName}`.trim()
      : input
      
    if (!textToConvert) return []
    
    trackStart(textToConvert)
    const results = FacebookFonts.convertToAllFonts(textToConvert, context)
    
    if (results.length > 0) {
      trackComplete(textToConvert, results[0].converted)
    }
    
    return results
  }, [input, firstName, lastName, context, trackStart, trackComplete])
  
  // Filter fonts by category
  const filteredFonts = React.useMemo(() => {
    if (selectedCategory === 'all') return fontResults
    
    return fontResults.filter(result => 
      result.font.category === selectedCategory
    )
  }, [fontResults, selectedCategory])
  
  // Get name variations
  const nameVariations = React.useMemo(() => {
    if (context !== 'name' || !firstName || !lastName) return []
    return getFacebookNameVariations(firstName, lastName)
  }, [firstName, lastName, context])
  
  const handleCopy = (text: string, fontId?: string) => {
    navigator.clipboard.writeText(text)
    
    trackFeature('copy_text', { 
      context,
      fontId,
      length: text.length 
    })
    
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
    })
  }
  
  const handleEmojiDecoration = () => {
    if (!input) return
    
    const decorated = FacebookFonts.createEmojiArt(input, emojiStyle)
    setInput(decorated)
    
    trackFeature('add_emoji_decoration', { style: emojiStyle })
  }
  
  const formatBio = () => {
    if (!input || context !== 'bio') return
    
    const formatted = FacebookFonts.formatBio(input, bioStyle)
    setInput(formatted)
    
    trackFeature('format_bio', { style: bioStyle })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            Facebook Font Generator
          </CardTitle>
          <CardDescription>
            Create stylish text for Facebook posts, bios, comments, and names
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What are you creating?</Label>
            <Tabs value={context} onValueChange={setContext as any}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="post">
                  <FileText className="h-4 w-4 mr-2" />
                  Post
                </TabsTrigger>
                <TabsTrigger value="bio">
                  <User className="h-4 w-4 mr-2" />
                  Bio
                </TabsTrigger>
                <TabsTrigger value="name">
                  <User className="h-4 w-4 mr-2" />
                  Name
                </TabsTrigger>
                <TabsTrigger value="comment">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comment
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {context === 'name' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name..."
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={25}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name..."
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={25}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="input">Enter your text</Label>
              <Textarea
                id="input"
                placeholder={`Enter your Facebook ${context}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[100px]"
                maxLength={getCharLimit()}
              />
              <div className="flex items-center justify-between">
                <CounterDisplay
                  current={input.length}
                  max={getCharLimit()}
                  label={`characters (${context} limit)`}
                  showWarning={input.length > getCharLimit() * 0.9}
                />
                {context === 'bio' && (
                  <div className="flex gap-2">
                    <Select value={bioStyle} onValueChange={setBioStyle as any}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="emoji">With Emoji</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={formatBio}
                    >
                      Format Bio
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {context !== 'name' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Add Emoji Art:</Label>
                <RadioGroup 
                  value={emojiStyle} 
                  onValueChange={setEmojiStyle as any}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="border" id="border" />
                    <Label htmlFor="border" className="font-normal">Border</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="filled" id="filled" />
                    <Label htmlFor="filled" className="font-normal">Filled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spaced" id="spaced" />
                    <Label htmlFor="spaced" className="font-normal">Spaced</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmojiDecoration}
                disabled={!input}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Add Emojis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {(input || (context === 'name' && firstName && lastName)) && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Font Styles</CardTitle>
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="standard">Standard</TabsTrigger>
                      <TabsTrigger value="decorative">Decorative</TabsTrigger>
                      <TabsTrigger value="artistic">Artistic</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {context === 'name' && nameVariations.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Name Variations
                    </h4>
                    {nameVariations.map((variation, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{variation.variation}</p>
                              <p className="text-sm text-muted-foreground">
                                {variation.style}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {variation.isValid ? (
                                <Badge variant="secondary">Valid</Badge>
                              ) : (
                                <Badge variant="destructive">Invalid</Badge>
                              )}
                              <CopyButton
                                text={variation.variation}
                                onCopy={() => handleCopy(variation.variation)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {filteredFonts.map((result) => (
                        <Card key={result.font.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{result.font.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {result.font.description}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {result.font.category}
                              </Badge>
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
                                {result.font.compatibility[context as keyof FacebookFont['compatibility']] ? (
                                  <Badge variant="secondary">Compatible</Badge>
                                ) : (
                                  <Badge variant="destructive">Not Compatible</Badge>
                                )}
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
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Facebook Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <FacebookPreview
                  text={filteredFonts[0]?.converted || input || `${firstName} ${lastName}`}
                  type={context}
                  userName={context === 'name' ? filteredFonts[0]?.converted || `${firstName} ${lastName}` : 'Your Name'}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

// Facebook preview component
function FacebookPreview({ 
  text, 
  type,
  userName = 'Your Name'
}: { 
  text: string
  type: 'post' | 'bio' | 'name' | 'comment'
  userName?: string
}) {
  if (type === 'post') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600" />
            <div>
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground">Just now · 🌍</p>
            </div>
          </div>
          <p className="whitespace-pre-wrap mb-3">{text}</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <ThumbsUp className="h-4 w-4 text-blue-600" />
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-xs ml-1">12</span>
          </div>
        </div>
        <div className="border-t px-4 py-2">
          <div className="flex justify-around text-sm text-muted-foreground">
            <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded">
              <ThumbsUp className="h-4 w-4" />
              Like
            </button>
            <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded">
              <MessageSquare className="h-4 w-4" />
              Comment
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  if (type === 'bio') {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-600" />
          <div>
            <h3 className="font-semibold">{userName}</h3>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">{text}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>📍 Location</span>
            <span>🔗 website.com</span>
          </div>
        </div>
      </div>
    )
  }
  
  if (type === 'name') {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold">{text}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          This is how your name will appear on Facebook
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">{userName}</p>
          <p className="text-sm whitespace-pre-wrap">{text}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <button className="hover:underline">Like</button>
            <button className="hover:underline">Reply</button>
            <span>1m</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 3. Create Page and Add Translations

#### Create `src/app/[locale]/tools/facebook-fonts/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { FacebookFontsTool } from '@/components/tools/social-media/facebook-fonts-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.facebookFonts' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['facebook fonts', 'facebook text', 'stylish text', 'facebook bio', 'facebook name'],
    locale,
    path: '/tools/facebook-fonts',
  })
}

export default function FacebookFontsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="facebook-fonts"
      locale={locale}
    >
      <FacebookFontsTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test all font styles in different contexts
2. Verify Facebook compatibility
3. Test character limits for each context
4. Check name variations validity
5. Test emoji decorations
6. Verify mobile preview accuracy

## Notes
- Facebook has strict rules for names
- Some Unicode may not work everywhere
- Bio has 101 character limit
- Test regularly as Facebook updates
- Consider adding more emoji styles