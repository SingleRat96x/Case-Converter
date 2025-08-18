# Story 6.3: Discord Font Generator

## Story Details
- **Stage**: 6 - Social Media Text Tools
- **Priority**: Medium
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 6.1 and 6.2 Complete

## Objective
Create a Discord-optimized font generator that produces stylish text for Discord messages, usernames, channel names, and status messages, with support for Discord's markdown and special formatting features.

## Acceptance Criteria
- [ ] 30+ font styles compatible with Discord
- [ ] Discord markdown integration
- [ ] Username styling (32 char limit)
- [ ] Status message formatting
- [ ] Channel name generator
- [ ] Role name styling
- [ ] Embed text formatting
- [ ] Code block styling
- [ ] Emoji text combinations
- [ ] Discord-specific preview

## Implementation Steps

### 1. Create Discord Fonts Logic

#### Create `src/lib/social-media/discord-fonts.ts`
```typescript
import { InstagramFonts } from './instagram-fonts'

export interface DiscordFont {
  id: string
  name: string
  category: 'unicode' | 'markdown' | 'combined' | 'special'
  description: string
  sample: string
  compatibility: {
    messages: boolean
    username: boolean
    nickname: boolean
    channelName: boolean
    status: boolean
    embed: boolean
  }
  discordFeatures?: string[]
}

export interface DiscordTextResult {
  original: string
  converted: string
  font: DiscordFont
  characterCount: number
  markdown?: string
  embedCode?: string
  warnings: string[]
}

// Discord character limits
const DISCORD_LIMITS = {
  message: 2000,
  username: 32,
  nickname: 32,
  channelName: 100,
  status: 128,
  embed: {
    title: 256,
    description: 4096,
    field: {
      name: 256,
      value: 1024,
    },
  },
}

// Discord markdown styles
const DISCORD_MARKDOWN = {
  bold: (text: string) => `**${text}**`,
  italic: (text: string) => `*${text}*`,
  underline: (text: string) => `__${text}__`,
  strikethrough: (text: string) => `~~${text}~~`,
  spoiler: (text: string) => `||${text}||`,
  code: (text: string) => `\`${text}\``,
  codeBlock: (text: string, lang = '') => `\`\`\`${lang}\n${text}\n\`\`\``,
  quote: (text: string) => `> ${text}`,
  blockQuote: (text: string) => `>>> ${text}`,
}

// Discord-compatible fonts
const DISCORD_FONTS: Record<string, {
  name: string
  category: DiscordFont['category']
  converter: (text: string) => string
  compatibility: DiscordFont['compatibility']
  discordFeatures?: string[]
}> = {
  // Unicode fonts
  boldUnicode: {
    name: 'Bold Unicode',
    category: 'unicode',
    converter: (text: string) => InstagramFonts.convertText(text, 'boldSerif'),
    compatibility: {
      messages: true,
      username: false, // Discord usernames don't support Unicode
      nickname: true,
      channelName: false,
      status: true,
      embed: true,
    },
  },
  italicUnicode: {
    name: 'Italic Unicode',
    category: 'unicode',
    converter: (text: string) => InstagramFonts.convertText(text, 'italicSerif'),
    compatibility: {
      messages: true,
      username: false,
      nickname: true,
      channelName: false,
      status: true,
      embed: true,
    },
  },
  // Markdown styles
  boldMarkdown: {
    name: 'Bold (Markdown)',
    category: 'markdown',
    converter: (text: string) => DISCORD_MARKDOWN.bold(text),
    compatibility: {
      messages: true,
      username: false,
      nickname: false,
      channelName: false,
      status: false,
      embed: true,
    },
    discordFeatures: ['Native Discord formatting'],
  },
  italicMarkdown: {
    name: 'Italic (Markdown)',
    category: 'markdown',
    converter: (text: string) => DISCORD_MARKDOWN.italic(text),
    compatibility: {
      messages: true,
      username: false,
      nickname: false,
      channelName: false,
      status: false,
      embed: true,
    },
    discordFeatures: ['Native Discord formatting'],
  },
  // Combined styles
  boldItalicMarkdown: {
    name: 'Bold Italic (Markdown)',
    category: 'combined',
    converter: (text: string) => DISCORD_MARKDOWN.bold(DISCORD_MARKDOWN.italic(text)),
    compatibility: {
      messages: true,
      username: false,
      nickname: false,
      channelName: false,
      status: false,
      embed: true,
    },
    discordFeatures: ['Native Discord formatting'],
  },
  underlineBold: {
    name: 'Underline Bold',
    category: 'combined',
    converter: (text: string) => DISCORD_MARKDOWN.underline(DISCORD_MARKDOWN.bold(text)),
    compatibility: {
      messages: true,
      username: false,
      nickname: false,
      channelName: false,
      status: false,
      embed: true,
    },
  },
  // Special Discord styles
  spoilerText: {
    name: 'Spoiler Text',
    category: 'special',
    converter: (text: string) => DISCORD_MARKDOWN.spoiler(text),
    compatibility: {
      messages: true,
      username: false,
      nickname: false,
      channelName: false,
      status: false,
      embed: false,
    },
    discordFeatures: ['Click to reveal'],
  },
  codeText: {
    name: 'Inline Code',
    category: 'special',
    converter: (text: string) => DISCORD_MARKDOWN.code(text),
    compatibility: {
      messages: true,
      username: false,
      nickname: false,
      channelName: false,
      status: false,
      embed: true,
    },
    discordFeatures: ['Monospace font'],
  },
  // More Unicode styles
  smallCaps: {
    name: 'Small Caps',
    category: 'unicode',
    converter: (text: string) => {
      const map: Record<string, string> = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ',
        'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
        'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
        'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
      }
      return text.split('').map(char => map[char.toLowerCase()] || char).join('')
    },
    compatibility: {
      messages: true,
      username: false,
      nickname: true,
      channelName: false,
      status: true,
      embed: true,
    },
  },
  fullwidth: {
    name: 'Fullwidth',
    category: 'unicode',
    converter: (text: string) => {
      return text.split('').map(char => {
        const code = char.charCodeAt(0)
        if (code >= 33 && code <= 126) {
          return String.fromCharCode(code + 0xFEE0)
        }
        return char
      }).join('')
    },
    compatibility: {
      messages: true,
      username: false,
      nickname: true,
      channelName: false,
      status: true,
      embed: true,
    },
  },
  // Emoji styles
  regionalIndicator: {
    name: 'Regional Indicator',
    category: 'special',
    converter: (text: string) => {
      return text.toUpperCase().split('').map(char => {
        const code = char.charCodeAt(0)
        if (code >= 65 && code <= 90) {
          return String.fromCodePoint(code - 65 + 0x1F1E6) + ' '
        }
        return char
      }).join('').trim()
    },
    compatibility: {
      messages: true,
      username: false,
      nickname: false,
      channelName: false,
      status: false,
      embed: true,
    },
    discordFeatures: ['Flag letter emojis'],
  },
}

export class DiscordFonts {
  private static fonts: Map<string, DiscordFont> = new Map()
  
  static {
    this.initializeFonts()
  }
  
  private static initializeFonts() {
    Object.entries(DISCORD_FONTS).forEach(([id, fontData]) => {
      this.fonts.set(id, {
        id,
        name: fontData.name,
        category: fontData.category,
        description: this.generateDescription(fontData.name, fontData.category),
        sample: fontData.converter('Discord'),
        compatibility: fontData.compatibility,
        discordFeatures: fontData.discordFeatures,
      })
    })
  }
  
  // Convert text to specific font
  static convertText(text: string, fontId: string): string {
    const font = DISCORD_FONTS[fontId]
    if (!font) return text
    
    return font.converter(text)
  }
  
  // Convert text to all Discord-compatible fonts
  static convertToAllFonts(text: string, context: keyof typeof DISCORD_LIMITS): DiscordTextResult[] {
    const results: DiscordTextResult[] = []
    
    this.fonts.forEach((font, fontId) => {
      const fontData = DISCORD_FONTS[fontId]
      if (!fontData) return
      
      // Check compatibility
      const isCompatible = this.checkCompatibility(font, context)
      if (!isCompatible) return
      
      const converted = fontData.converter(text)
      const warnings = this.checkWarnings(text, converted, font, context)
      
      const result: DiscordTextResult = {
        original: text,
        converted,
        font,
        characterCount: converted.length,
        warnings,
      }
      
      // Add markdown version if applicable
      if (font.category === 'unicode') {
        result.markdown = this.createMarkdownVersion(converted)
      }
      
      // Add embed code if requested
      if (context === 'embed') {
        result.embedCode = this.createEmbedCode(converted)
      }
      
      results.push(result)
    })
    
    return results
  }
  
  // Create Discord username variations
  static createUsernameVariations(username: string): Array<{
    variation: string
    isValid: boolean
    warning?: string
  }> {
    const variations: Array<{
      variation: string
      isValid: boolean
      warning?: string
    }> = []
    
    // Original
    variations.push({
      variation: username,
      isValid: username.length <= DISCORD_LIMITS.username,
    })
    
    // With numbers
    variations.push({
      variation: `${username}#0001`,
      isValid: username.length <= DISCORD_LIMITS.username - 5,
      warning: 'Old discriminator style',
    })
    
    // With underscores
    variations.push({
      variation: username.replace(/\s+/g, '_'),
      isValid: username.length <= DISCORD_LIMITS.username,
    })
    
    // With dots
    variations.push({
      variation: username.toLowerCase().replace(/\s+/g, '.'),
      isValid: username.length <= DISCORD_LIMITS.username,
    })
    
    // leetspeak
    const leet = username.replace(/[aeioAEIO]/g, char => {
      const map: Record<string, string> = {
        'a': '4', 'e': '3', 'i': '1', 'o': '0',
        'A': '4', 'E': '3', 'I': '1', 'O': '0',
      }
      return map[char] || char
    })
    variations.push({
      variation: leet,
      isValid: leet.length <= DISCORD_LIMITS.username,
    })
    
    return variations
  }
  
  // Create channel name from text
  static createChannelName(text: string, type: 'text' | 'voice' | 'forum' = 'text'): string {
    // Discord channel names: lowercase, no spaces, hyphens instead
    let channelName = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    
    // Add prefix based on type
    const prefix = type === 'voice' ? '🔊' : type === 'forum' ? '💬' : ''
    channelName = prefix + channelName
    
    // Truncate if too long
    if (channelName.length > DISCORD_LIMITS.channelName) {
      channelName = channelName.substring(0, DISCORD_LIMITS.channelName - 3) + '...'
    }
    
    return channelName
  }
  
  // Create Discord embed
  static createEmbed(
    title: string,
    description: string,
    options: {
      color?: string
      footer?: string
      thumbnail?: boolean
      fields?: Array<{ name: string; value: string; inline?: boolean }>
    } = {}
  ): string {
    const embed = {
      title: title.substring(0, DISCORD_LIMITS.embed.title),
      description: description.substring(0, DISCORD_LIMITS.embed.description),
      color: options.color ? parseInt(options.color.replace('#', ''), 16) : 0x5865F2,
      footer: options.footer ? { text: options.footer } : undefined,
      thumbnail: options.thumbnail ? { url: 'https://example.com/image.png' } : undefined,
      fields: options.fields?.map(field => ({
        name: field.name.substring(0, DISCORD_LIMITS.embed.field.name),
        value: field.value.substring(0, DISCORD_LIMITS.embed.field.value),
        inline: field.inline ?? false,
      })),
    }
    
    return '```json\n' + JSON.stringify(embed, null, 2) + '\n```'
  }
  
  // Create animated text (using Discord timestamp)
  static createAnimatedText(text: string, style: 'typewriter' | 'countdown'): string {
    if (style === 'countdown') {
      const future = new Date()
      future.setHours(future.getHours() + 1)
      const timestamp = Math.floor(future.getTime() / 1000)
      return `${text} <t:${timestamp}:R>`
    }
    
    // Typewriter effect using zero-width spaces
    return text.split('').map((char, i) => 
      i === 0 ? char : '\u200B' + char
    ).join('')
  }
  
  // Format status message
  static formatStatus(text: string, emoji?: string): string {
    let status = text
    
    // Add emoji if provided
    if (emoji) {
      status = `${emoji} ${status}`
    }
    
    // Truncate if too long
    if (status.length > DISCORD_LIMITS.status) {
      status = status.substring(0, DISCORD_LIMITS.status - 3) + '...'
    }
    
    return status
  }
  
  // Create role name
  static createRoleName(text: string, options: {
    color?: string
    emoji?: string
    style?: 'default' | 'bracket' | 'fancy'
  } = {}): {
    name: string
    color: string
    preview: string
  } {
    let roleName = text
    
    // Apply style
    switch (options.style) {
      case 'bracket':
        roleName = `[${roleName}]`
        break
      case 'fancy':
        roleName = `✦ ${roleName} ✦`
        break
    }
    
    // Add emoji
    if (options.emoji) {
      roleName = `${options.emoji} ${roleName}`
    }
    
    // Truncate if needed
    if (roleName.length > 100) {
      roleName = roleName.substring(0, 97) + '...'
    }
    
    return {
      name: roleName,
      color: options.color || '#5865F2',
      preview: `@${roleName}`,
    }
  }
  
  // Helper methods
  private static checkCompatibility(font: DiscordFont, context: string): boolean {
    const compatMap: Record<string, keyof DiscordFont['compatibility']> = {
      message: 'messages',
      username: 'username',
      nickname: 'nickname',
      channelName: 'channelName',
      status: 'status',
      embed: 'embed',
    }
    
    const compatKey = compatMap[context] || 'messages'
    return font.compatibility[compatKey]
  }
  
  private static checkWarnings(
    original: string,
    converted: string,
    font: DiscordFont,
    context: string
  ): string[] {
    const warnings: string[] = []
    
    // Check length limits
    const limits: Record<string, number> = {
      message: DISCORD_LIMITS.message,
      username: DISCORD_LIMITS.username,
      nickname: DISCORD_LIMITS.nickname,
      channelName: DISCORD_LIMITS.channelName,
      status: DISCORD_LIMITS.status,
      embed: DISCORD_LIMITS.embed.description,
    }
    
    const limit = limits[context]
    if (limit && converted.length > limit) {
      warnings.push(`Exceeds ${context} character limit (${limit} characters)`)
    }
    
    // Check for Discord username restrictions
    if (context === 'username') {
      if (!/^[a-zA-Z0-9._]+$/.test(converted)) {
        warnings.push('Discord usernames only support letters, numbers, dots, and underscores')
      }
    }
    
    // Check for markdown in certain contexts
    if ((context === 'username' || context === 'channelName') && 
        (converted.includes('*') || converted.includes('_') || converted.includes('`'))) {
      warnings.push('Markdown characters not supported in this context')
    }
    
    return warnings
  }
  
  private static createMarkdownVersion(text: string): string {
    // Suggest markdown equivalent for Unicode text
    if (text.match(/𝐀-𝐙𝐚-𝐳/)) {
      return `Bold: **${text}**`
    }
    if (text.match(/𝐴-𝑍𝑎-𝑧/)) {
      return `Italic: *${text}*`
    }
    return text
  }
  
  private static createEmbedCode(text: string): string {
    return `{
  "embeds": [{
    "description": "${text.replace(/"/g, '\\"')}",
    "color": 5814783
  }]
}`
  }
  
  private static generateDescription(name: string, category: string): string {
    const descriptions: Record<string, string> = {
      unicode: 'Unicode text style that works in most Discord contexts',
      markdown: 'Native Discord markdown formatting',
      combined: 'Combined markdown styles for emphasis',
      special: 'Special Discord formatting features',
    }
    
    return descriptions[category] || 'Stylish text for Discord'
  }
  
  // Get fonts by category
  static getFontsByCategory(category: DiscordFont['category']): DiscordFont[] {
    return Array.from(this.fonts.values()).filter(font => font.category === category)
  }
}

// Export convenience functions
export const toDiscordFont = (text: string, fontId: string) =>
  DiscordFonts.convertText(text, fontId)

export const createDiscordChannel = (text: string) =>
  DiscordFonts.createChannelName(text)

export const createDiscordUsername = (text: string) =>
  DiscordFonts.createUsernameVariations(text)
```

### 2. Create Discord Fonts Component

#### Create `src/components/tools/social-media/discord-fonts-tool.tsx`
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  MessageSquare,
  User,
  Hash,
  AtSign,
  Code,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Volume2,
  MessageCircle
} from 'lucide-react'
import { 
  DiscordFonts,
  DiscordFont,
  DiscordTextResult,
  createDiscordChannel,
  createDiscordUsername
} from '@/lib/social-media/discord-fonts'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function DiscordFontsTool() {
  const [input, setInput] = React.useState('')
  const [context, setContext] = React.useState<'message' | 'username' | 'status' | 'channel'>('message')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [showMarkdown, setShowMarkdown] = React.useState(true)
  const [embedOptions, setEmbedOptions] = React.useState({
    color: '#5865F2',
    addFooter: false,
    addThumbnail: false,
  })
  const [channelType, setChannelType] = React.useState<'text' | 'voice' | 'forum'>('text')
  const [statusEmoji, setStatusEmoji] = React.useState('')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'discord-fonts',
    toolName: 'Discord Font Generator',
    category: 'social-media',
  })
  
  // Get character limit based on context
  const getCharLimit = () => {
    switch (context) {
      case 'username': return 32
      case 'status': return 128
      case 'channel': return 100
      default: return 2000
    }
  }
  
  // Get font results
  const fontResults = React.useMemo(() => {
    if (!input) return []
    
    trackStart(input)
    const results = DiscordFonts.convertToAllFonts(input, context as any)
    
    if (results.length > 0) {
      trackComplete(input, results[0].converted)
    }
    
    return results
  }, [input, context, trackStart, trackComplete])
  
  // Filter fonts by category
  const filteredFonts = React.useMemo(() => {
    if (selectedCategory === 'all') return fontResults
    
    return fontResults.filter(result => 
      result.font.category === selectedCategory
    )
  }, [fontResults, selectedCategory])
  
  // Get username variations
  const usernameVariations = React.useMemo(() => {
    if (context !== 'username' || !input) return []
    return createDiscordUsername(input)
  }, [input, context])
  
  // Generate channel name
  const channelName = React.useMemo(() => {
    if (context !== 'channel' || !input) return ''
    return createDiscordChannel(input, channelType)
  }, [input, context, channelType])
  
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
  
  const handleCreateEmbed = () => {
    if (!input) return
    
    const embed = DiscordFonts.createEmbed(
      'Custom Title',
      input,
      {
        color: embedOptions.color,
        footer: embedOptions.addFooter ? 'Footer text' : undefined,
        thumbnail: embedOptions.addThumbnail,
      }
    )
    
    navigator.clipboard.writeText(embed)
    
    trackFeature('create_embed')
    
    toast({
      title: 'Embed code copied!',
      description: 'Paste this in Discord to create an embed',
    })
  }
  
  const formatStatus = () => {
    if (!input || context !== 'status') return
    
    const formatted = DiscordFonts.formatStatus(input, statusEmoji)
    setInput(formatted)
    
    trackFeature('format_status', { hasEmoji: !!statusEmoji })
  }
  
  const handleAnimatedText = (style: 'typewriter' | 'countdown') => {
    if (!input) return
    
    const animated = DiscordFonts.createAnimatedText(input, style)
    setInput(animated)
    
    trackFeature('animated_text', { style })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discord Font Generator
          </CardTitle>
          <CardDescription>
            Create stylish text for Discord messages, usernames, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What are you creating?</Label>
            <Tabs value={context} onValueChange={setContext as any}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="message">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </TabsTrigger>
                <TabsTrigger value="username">
                  <User className="h-4 w-4 mr-2" />
                  Username
                </TabsTrigger>
                <TabsTrigger value="status">
                  <AtSign className="h-4 w-4 mr-2" />
                  Status
                </TabsTrigger>
                <TabsTrigger value="channel">
                  <Hash className="h-4 w-4 mr-2" />
                  Channel
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="input">Enter your text</Label>
            <Textarea
              id="input"
              placeholder={`Enter your Discord ${context}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] font-mono"
              maxLength={getCharLimit()}
            />
            <div className="flex items-center justify-between">
              <CounterDisplay
                current={input.length}
                max={getCharLimit()}
                label={`characters (${context} limit)`}
                showWarning={input.length > getCharLimit() * 0.9}
              />
              {context === 'status' && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Emoji"
                    value={statusEmoji}
                    onChange={(e) => setStatusEmoji(e.target.value)}
                    className="w-20"
                    maxLength={2}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={formatStatus}
                  >
                    Format Status
                  </Button>
                </div>
              )}
              {context === 'channel' && (
                <RadioGroup 
                  value={channelType} 
                  onValueChange={setChannelType as any}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="text" />
                    <Label htmlFor="text" className="font-normal">
                      <Hash className="h-4 w-4 inline mr-1" />
                      Text
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="voice" id="voice" />
                    <Label htmlFor="voice" className="font-normal">
                      <Volume2 className="h-4 w-4 inline mr-1" />
                      Voice
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="forum" id="forum" />
                    <Label htmlFor="forum" className="font-normal">
                      <MessageCircle className="h-4 w-4 inline mr-1" />
                      Forum
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          </div>
          
          {context === 'message' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAnimatedText('typewriter')}
                disabled={!input}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Typewriter Effect
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAnimatedText('countdown')}
                disabled={!input}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Add Countdown
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateEmbed}
                disabled={!input}
              >
                <Code className="h-4 w-4 mr-2" />
                Create Embed
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {input && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Font Styles</CardTitle>
                  <div className="flex items-center gap-4">
                    {context === 'message' && (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="markdown"
                          checked={showMarkdown}
                          onCheckedChange={setShowMarkdown}
                        />
                        <Label htmlFor="markdown" className="text-sm">
                          Show Markdown
                        </Label>
                      </div>
                    )}
                    <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unicode">Unicode</TabsTrigger>
                        <TabsTrigger value="markdown">Markdown</TabsTrigger>
                        <TabsTrigger value="special">Special</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {context === 'username' && usernameVariations.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Username Variations
                    </h4>
                    {usernameVariations.map((variation, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium font-mono">{variation.variation}</p>
                              {variation.warning && (
                                <p className="text-sm text-muted-foreground">
                                  {variation.warning}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {variation.isValid ? (
                                <Badge variant="secondary">Valid</Badge>
                              ) : (
                                <Badge variant="destructive">Too Long</Badge>
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
                ) : context === 'channel' ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Channel Name</p>
                          <p className="text-xl font-mono">{channelName}</p>
                        </div>
                        <CopyButton
                          text={channelName}
                          onCopy={() => handleCopy(channelName)}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {filteredFonts.map((result) => (
                        <Card key={result.font.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  {result.font.name}
                                  {result.font.discordFeatures && (
                                    <Badge variant="outline" className="text-xs">
                                      {result.font.discordFeatures[0]}
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {result.font.description}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {result.font.category}
                              </Badge>
                            </div>
                            
                            <div className="p-3 bg-muted rounded-md mb-3 break-all font-mono">
                              <p className="text-sm">{result.converted}</p>
                            </div>
                            
                            {showMarkdown && result.markdown && (
                              <div className="p-2 bg-muted/50 rounded-md mb-3">
                                <p className="text-xs text-muted-foreground">
                                  Markdown: {result.markdown}
                                </p>
                              </div>
                            )}
                            
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
                                {result.font.compatibility[context as keyof DiscordFont['compatibility']] ? (
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
                <CardTitle>Discord Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <DiscordPreview
                  text={filteredFonts[0]?.converted || input}
                  type={context}
                  channelName={context === 'channel' ? channelName : undefined}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

// Discord preview component
function DiscordPreview({ 
  text, 
  type,
  channelName
}: { 
  text: string
  type: 'message' | 'username' | 'status' | 'channel'
  channelName?: string
}) {
  if (type === 'message') {
    return (
      <div className="bg-[#36393f] text-white rounded-lg p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">Username</span>
              <span className="text-xs text-gray-400">Today at 12:00 PM</span>
            </div>
            <div className="text-gray-100 whitespace-pre-wrap">{text}</div>
          </div>
        </div>
      </div>
    )
  }
  
  if (type === 'username') {
    return (
      <div className="bg-[#2f3136] rounded-lg p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#5865F2] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">{text}</h2>
        <p className="text-sm text-gray-400 mt-1">@{text.toLowerCase().replace(/\s+/g, '')}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Badge className="bg-[#5865F2] hover:bg-[#4752C4]">Online</Badge>
        </div>
      </div>
    )
  }
  
  if (type === 'status') {
    return (
      <div className="bg-[#2f3136] rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[#5865F2]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#2f3136]" />
          </div>
          <div className="text-white">
            <p className="font-semibold">Username</p>
            <p className="text-sm text-gray-400">{text}</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-[#2f3136] rounded-lg p-4">
      <div className="space-y-2">
        <p className="text-xs text-gray-400">CHANNEL</p>
        <p className="text-white font-medium">{channelName || text}</p>
        <p className="text-sm text-gray-400">
          This is how your channel name will appear in Discord
        </p>
      </div>
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/discord-fonts/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DiscordFontsTool } from '@/components/tools/social-media/discord-fonts-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.discordFonts' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['discord fonts', 'discord text', 'stylish text', 'discord username', 'discord formatting'],
    locale,
    path: '/tools/discord-fonts',
  })
}

export default function DiscordFontsPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="discord-fonts"
      locale={locale}
    >
      <DiscordFontsTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test all font styles in Discord
2. Verify character limits for each context
3. Test markdown formatting
4. Check username validity
5. Test channel name generation
6. Verify embed code generation

## Notes
- Discord has strict username rules
- Some Unicode works in nicknames but not usernames
- Markdown doesn't work in all contexts
- Test embeds in actual Discord
- Consider rate limits for bots