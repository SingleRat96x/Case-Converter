# Story 7.3: HTML Entity Encoder/Decoder

## Story Details
- **Stage**: 7 - Encoding/Decoding Tools
- **Priority**: Medium
- **Estimated Hours**: 3 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a comprehensive HTML entity encoder/decoder that supports named entities, numeric entities (decimal and hexadecimal), special characters, and provides options for different encoding levels with XSS prevention features.

## Acceptance Criteria
- [ ] Encode/decode HTML named entities (&amp;, &lt;, etc.)
- [ ] Support numeric entities (&#65; and &#x41;)
- [ ] Encode all non-ASCII characters option
- [ ] Selective encoding (quotes only, tags only, etc.)
- [ ] XSS prevention mode
- [ ] Entity reference table
- [ ] Batch processing
- [ ] Preview HTML rendering
- [ ] Copy as HTML-safe string
- [ ] Support for HTML5 entities

## Implementation Steps

### 1. Create HTML Entity Logic

#### Create `src/lib/encoding/html-entities.ts`
```typescript
export interface HTMLEntityOptions {
  mode: 'named' | 'numeric' | 'hex' | 'mixed'
  encodeLevel: 'basic' | 'extended' | 'all' | 'nonASCII'
  encodeQuotes: boolean
  encodeNewlines: boolean
  doubleEncode: boolean
  decimal: boolean // For numeric mode
  lowercase: boolean // For hex mode
}

export interface HTMLEntityResult {
  encoded?: string
  decoded?: string
  entityCount: number
  isValid: boolean
  error?: string
  xssRisks?: string[]
}

export interface EntityReference {
  character: string
  named?: string
  numeric: string
  hex: string
  description: string
  category: string
}

export class HTMLEntityEncoder {
  // Basic HTML entities that should always be encoded for safety
  private static readonly BASIC_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  
  // Extended HTML entities
  private static readonly EXTENDED_ENTITIES: Record<string, string> = {
    ' ': '&nbsp;',
    '¡': '&iexcl;',
    '¢': '&cent;',
    '£': '&pound;',
    '¤': '&curren;',
    '¥': '&yen;',
    '¦': '&brvbar;',
    '§': '&sect;',
    '¨': '&uml;',
    '©': '&copy;',
    'ª': '&ordf;',
    '«': '&laquo;',
    '¬': '&not;',
    '­': '&shy;',
    '®': '&reg;',
    '¯': '&macr;',
    '°': '&deg;',
    '±': '&plusmn;',
    '²': '&sup2;',
    '³': '&sup3;',
    '´': '&acute;',
    'µ': '&micro;',
    '¶': '&para;',
    '·': '&middot;',
    '¸': '&cedil;',
    '¹': '&sup1;',
    'º': '&ordm;',
    '»': '&raquo;',
    '¼': '&frac14;',
    '½': '&frac12;',
    '¾': '&frac34;',
    '¿': '&iquest;',
    '×': '&times;',
    '÷': '&divide;',
    // ... many more HTML5 entities
  }
  
  // Reverse mapping for decoding
  private static readonly ENTITY_TO_CHAR: Map<string, string> = new Map([
    ...Object.entries(this.BASIC_ENTITIES).map(([char, entity]) => [entity, char] as [string, string]),
    ...Object.entries(this.EXTENDED_ENTITIES).map(([char, entity]) => [entity, char] as [string, string]),
  ])
  
  // Categories for entity reference
  private static readonly ENTITY_CATEGORIES = {
    'Control': ['&amp;', '&lt;', '&gt;', '&quot;', '&#39;'],
    'Punctuation': ['&nbsp;', '&iexcl;', '&iquest;', '&sect;', '&para;'],
    'Currency': ['&cent;', '&pound;', '&yen;', '&curren;', '&euro;'],
    'Math': ['&plusmn;', '&times;', '&divide;', '&ne;', '&le;', '&ge;'],
    'Symbols': ['&copy;', '&reg;', '&trade;', '&deg;', '&permil;'],
    'Arrows': ['&larr;', '&rarr;', '&uarr;', '&darr;', '&harr;'],
    'Greek': ['&alpha;', '&beta;', '&gamma;', '&delta;', '&epsilon;'],
  }
  
  // Encode HTML entities
  static encode(
    input: string,
    options: Partial<HTMLEntityOptions> = {}
  ): HTMLEntityResult {
    const {
      mode = 'named',
      encodeLevel = 'basic',
      encodeQuotes = true,
      encodeNewlines = false,
      doubleEncode = false,
      decimal = true,
      lowercase = false,
    } = options
    
    try {
      let encoded = input
      let entityCount = 0
      
      // Check if already encoded (to prevent double encoding)
      if (!doubleEncode && this.hasEntities(input)) {
        encoded = this.decode(input).decoded || input
      }
      
      // Apply encoding based on level
      switch (encodeLevel) {
        case 'basic':
          encoded = this.encodeBasic(encoded, encodeQuotes, mode, decimal, lowercase)
          break
          
        case 'extended':
          encoded = this.encodeExtended(encoded, mode, decimal, lowercase)
          break
          
        case 'all':
          encoded = this.encodeAll(encoded, mode, decimal, lowercase)
          break
          
        case 'nonASCII':
          encoded = this.encodeNonASCII(encoded, mode, decimal, lowercase)
          break
      }
      
      // Encode newlines if requested
      if (encodeNewlines) {
        encoded = encoded
          .replace(/\r\n/g, '&#13;&#10;')
          .replace(/\n/g, '&#10;')
          .replace(/\r/g, '&#13;')
      }
      
      // Count entities
      entityCount = (encoded.match(/&[#\w]+;/g) || []).length
      
      return {
        encoded,
        entityCount,
        isValid: true,
      }
    } catch (error) {
      return {
        entityCount: 0,
        isValid: false,
        error: error instanceof Error ? error.message : 'Encoding failed',
      }
    }
  }
  
  // Decode HTML entities
  static decode(input: string): HTMLEntityResult {
    try {
      let decoded = input
      let entityCount = 0
      
      // Count entities before decoding
      const entities = input.match(/&[#\w]+;/g) || []
      entityCount = entities.length
      
      // Decode numeric entities (decimal)
      decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
        const num = parseInt(dec, 10)
        return num <= 0x10FFFF ? String.fromCharCode(num) : match
      })
      
      // Decode numeric entities (hexadecimal)
      decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
        const num = parseInt(hex, 16)
        return num <= 0x10FFFF ? String.fromCharCode(num) : match
      })
      
      // Decode named entities
      decoded = decoded.replace(/&([#\w]+);/g, (match, entity) => {
        const char = this.ENTITY_TO_CHAR.get(match)
        return char || match
      })
      
      // Check for XSS risks
      const xssRisks = this.detectXSSRisks(decoded)
      
      return {
        decoded,
        entityCount,
        isValid: true,
        xssRisks: xssRisks.length > 0 ? xssRisks : undefined,
      }
    } catch (error) {
      return {
        entityCount: 0,
        isValid: false,
        error: error instanceof Error ? error.message : 'Decoding failed',
      }
    }
  }
  
  // XSS prevention encoding
  static encodeForXSS(input: string): string {
    // Encode all potentially dangerous characters
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#47;')
      .replace(/=/g, '&#61;')
      .replace(/`/g, '&#96;')
      .replace(/\(/g, '&#40;')
      .replace(/\)/g, '&#41;')
  }
  
  // Get entity reference table
  static getEntityReference(
    category?: string,
    searchTerm?: string
  ): EntityReference[] {
    const references: EntityReference[] = []
    
    // Add basic entities
    Object.entries(this.BASIC_ENTITIES).forEach(([char, entity]) => {
      references.push({
        character: char,
        named: entity,
        numeric: `&#${char.charCodeAt(0)};`,
        hex: `&#x${char.charCodeAt(0).toString(16)};`,
        description: this.getEntityDescription(entity),
        category: 'Control',
      })
    })
    
    // Add extended entities
    Object.entries(this.EXTENDED_ENTITIES).forEach(([char, entity]) => {
      references.push({
        character: char,
        named: entity,
        numeric: `&#${char.charCodeAt(0)};`,
        hex: `&#x${char.charCodeAt(0).toString(16)};`,
        description: this.getEntityDescription(entity),
        category: this.getEntityCategory(entity),
      })
    })
    
    // Filter by category
    let filtered = references
    if (category) {
      filtered = filtered.filter(ref => ref.category === category)
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(ref =>
        ref.character.includes(term) ||
        ref.named?.toLowerCase().includes(term) ||
        ref.description.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }
  
  // Batch encode/decode
  static batchProcess(
    inputs: string[],
    operation: 'encode' | 'decode',
    options?: Partial<HTMLEntityOptions>
  ): HTMLEntityResult[] {
    return inputs.map(input =>
      operation === 'encode' ? this.encode(input, options) : this.decode(input)
    )
  }
  
  // Convert between entity formats
  static convertEntityFormat(
    input: string,
    toFormat: 'named' | 'numeric' | 'hex'
  ): string {
    // First decode everything
    const decoded = this.decode(input).decoded || input
    
    // Then encode in the desired format
    return this.encode(decoded, {
      mode: toFormat,
      encodeLevel: 'all',
    }).encoded || input
  }
  
  // Create HTML preview
  static createPreview(html: string, safe: boolean = true): {
    preview: string
    isSafe: boolean
    warnings?: string[]
  } {
    const warnings: string[] = []
    let preview = html
    
    if (safe) {
      // Remove potentially dangerous tags and attributes
      preview = preview
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '[SCRIPT REMOVED]')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '[STYLE REMOVED]')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '[IFRAME REMOVED]')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
        .replace(/javascript:/gi, '') // Remove javascript: protocol
      
      if (preview !== html) {
        warnings.push('Potentially dangerous content was removed for preview')
      }
    }
    
    return {
      preview,
      isSafe: safe,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }
  
  // Helper methods
  private static encodeBasic(
    str: string,
    encodeQuotes: boolean,
    mode: string,
    decimal: boolean,
    lowercase: boolean
  ): string {
    return str.replace(/[&<>"']/g, (char) => {
      if (!encodeQuotes && (char === '"' || char === "'")) {
        return char
      }
      
      if (mode === 'named' && this.BASIC_ENTITIES[char]) {
        return this.BASIC_ENTITIES[char]
      }
      
      return this.toNumericEntity(char, mode === 'hex', decimal, lowercase)
    })
  }
  
  private static encodeExtended(
    str: string,
    mode: string,
    decimal: boolean,
    lowercase: boolean
  ): string {
    return str.replace(/./g, (char) => {
      const allEntities = { ...this.BASIC_ENTITIES, ...this.EXTENDED_ENTITIES }
      
      if (mode === 'named' && allEntities[char]) {
        return allEntities[char]
      }
      
      if (allEntities[char] || char.charCodeAt(0) > 127) {
        return this.toNumericEntity(char, mode === 'hex', decimal, lowercase)
      }
      
      return char
    })
  }
  
  private static encodeAll(
    str: string,
    mode: string,
    decimal: boolean,
    lowercase: boolean
  ): string {
    return str.replace(/./g, (char) => {
      if (mode === 'named') {
        const allEntities = { ...this.BASIC_ENTITIES, ...this.EXTENDED_ENTITIES }
        if (allEntities[char]) {
          return allEntities[char]
        }
      }
      
      // Encode everything except basic ASCII letters and numbers
      if (!/[A-Za-z0-9\s]/.test(char)) {
        return this.toNumericEntity(char, mode === 'hex', decimal, lowercase)
      }
      
      return char
    })
  }
  
  private static encodeNonASCII(
    str: string,
    mode: string,
    decimal: boolean,
    lowercase: boolean
  ): string {
    return str.replace(/[^\x00-\x7F]/g, (char) => {
      if (mode === 'named') {
        const allEntities = { ...this.BASIC_ENTITIES, ...this.EXTENDED_ENTITIES }
        if (allEntities[char]) {
          return allEntities[char]
        }
      }
      
      return this.toNumericEntity(char, mode === 'hex', decimal, lowercase)
    })
  }
  
  private static toNumericEntity(
    char: string,
    hex: boolean,
    decimal: boolean,
    lowercase: boolean
  ): string {
    const code = char.charCodeAt(0)
    
    if (hex) {
      const hexStr = code.toString(16)
      return `&#x${lowercase ? hexStr : hexStr.toUpperCase()};`
    }
    
    return `&#${code};`
  }
  
  private static hasEntities(str: string): boolean {
    return /&[#\w]+;/.test(str)
  }
  
  private static detectXSSRisks(html: string): string[] {
    const risks: string[] = []
    
    if (/<script/i.test(html)) {
      risks.push('Contains <script> tags')
    }
    
    if (/on\w+\s*=/i.test(html)) {
      risks.push('Contains event handlers (onclick, onload, etc.)')
    }
    
    if (/javascript:/i.test(html)) {
      risks.push('Contains javascript: protocol')
    }
    
    if (/<iframe/i.test(html)) {
      risks.push('Contains <iframe> tags')
    }
    
    if (/<object|<embed/i.test(html)) {
      risks.push('Contains <object> or <embed> tags')
    }
    
    if (/style\s*=\s*["'][^"']*expression\s*\(/i.test(html)) {
      risks.push('Contains CSS expressions')
    }
    
    return risks
  }
  
  private static getEntityDescription(entity: string): string {
    const descriptions: Record<string, string> = {
      '&amp;': 'Ampersand',
      '&lt;': 'Less than',
      '&gt;': 'Greater than',
      '&quot;': 'Double quote',
      '&#39;': 'Single quote',
      '&nbsp;': 'Non-breaking space',
      '&copy;': 'Copyright',
      '&reg;': 'Registered trademark',
      '&trade;': 'Trademark',
      '&euro;': 'Euro sign',
      // ... more descriptions
    }
    
    return descriptions[entity] || 'Special character'
  }
  
  private static getEntityCategory(entity: string): string {
    for (const [category, entities] of Object.entries(this.ENTITY_CATEGORIES)) {
      if (entities.includes(entity)) {
        return category
      }
    }
    return 'Other'
  }
}

// Export convenience functions
export const encodeHTMLEntities = (input: string, options?: Partial<HTMLEntityOptions>) =>
  HTMLEntityEncoder.encode(input, options)

export const decodeHTMLEntities = (input: string) =>
  HTMLEntityEncoder.decode(input)

export const encodeForXSS = (input: string) =>
  HTMLEntityEncoder.encodeForXSS(input)

export const getHTMLEntityReference = (category?: string, search?: string) =>
  HTMLEntityEncoder.getEntityReference(category, search)
```

### 2. Create HTML Entity Tool Component

#### Create `src/components/tools/encoding/html-entity-tool.tsx`
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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Code,
  ArrowRightLeft,
  AlertCircle,
  Shield,
  Search,
  Eye,
  BookOpen
} from 'lucide-react'
import {
  HTMLEntityEncoder,
  HTMLEntityOptions,
  HTMLEntityResult,
  EntityReference,
  encodeHTMLEntities,
  decodeHTMLEntities,
  encodeForXSS,
  getHTMLEntityReference
} from '@/lib/encoding/html-entities'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function HTMLEntityTool() {
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode')
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [entityMode, setEntityMode] = React.useState<HTMLEntityOptions['mode']>('named')
  const [encodeLevel, setEncodeLevel] = React.useState<HTMLEntityOptions['encodeLevel']>('basic')
  const [encodeQuotes, setEncodeQuotes] = React.useState(true)
  const [encodeNewlines, setEncodeNewlines] = React.useState(false)
  const [doubleEncode, setDoubleEncode] = React.useState(false)
  const [result, setResult] = React.useState<HTMLEntityResult | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)
  const [referenceSearch, setReferenceSearch] = React.useState('')
  const [referenceCategory, setReferenceCategory] = React.useState<string>('all')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'html-entities',
    toolName: 'HTML Entity Encoder/Decoder',
    category: 'encoding',
  })
  
  // Get entity reference
  const entityReference = React.useMemo(() => {
    return getHTMLEntityReference(
      referenceCategory === 'all' ? undefined : referenceCategory,
      referenceSearch
    )
  }, [referenceCategory, referenceSearch])
  
  // Process encoding/decoding
  React.useEffect(() => {
    if (!input) {
      setOutput('')
      setResult(null)
      return
    }
    
    trackStart(input)
    
    if (mode === 'encode') {
      const options: Partial<HTMLEntityOptions> = {
        mode: entityMode,
        encodeLevel,
        encodeQuotes,
        encodeNewlines,
        doubleEncode,
        decimal: true,
        lowercase: false,
      }
      
      const result = encodeHTMLEntities(input, options)
      if (result.isValid) {
        setOutput(result.encoded!)
        setResult(result)
        trackComplete(input, result.encoded!)
      } else {
        setOutput('')
        toast({
          title: 'Encoding failed',
          description: result.error,
          variant: 'destructive',
        })
      }
    } else {
      const result = decodeHTMLEntities(input)
      if (result.isValid) {
        setOutput(result.decoded!)
        setResult(result)
        trackComplete(input, result.decoded!)
        
        if (result.xssRisks && result.xssRisks.length > 0) {
          toast({
            title: 'Security Warning',
            description: 'Decoded content contains potential XSS risks',
            variant: 'destructive',
          })
        }
      } else {
        setOutput('')
        toast({
          title: 'Decoding failed',
          description: result.error,
          variant: 'destructive',
        })
      }
    }
  }, [
    input,
    mode,
    entityMode,
    encodeLevel,
    encodeQuotes,
    encodeNewlines,
    doubleEncode,
    trackStart,
    trackComplete,
    toast
  ])
  
  const handleSwapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput('')
    
    trackFeature('swap_mode')
  }
  
  const handleXSSEncode = () => {
    if (!input) return
    
    const encoded = encodeForXSS(input)
    setOutput(encoded)
    
    trackFeature('xss_encode')
    
    toast({
      title: 'XSS Safe Encoding',
      description: 'Text encoded with maximum XSS protection',
    })
  }
  
  const handleConvertFormat = (format: 'named' | 'numeric' | 'hex') => {
    if (!input) return
    
    const converted = HTMLEntityEncoder.convertEntityFormat(input, format)
    setInput(converted)
    
    trackFeature('convert_format', { format })
  }
  
  const handleCopyFromReference = (entity: EntityReference, type: 'character' | 'named' | 'numeric' | 'hex') => {
    let textToCopy = ''
    
    switch (type) {
      case 'character':
        textToCopy = entity.character
        break
      case 'named':
        textToCopy = entity.named || entity.numeric
        break
      case 'numeric':
        textToCopy = entity.numeric
        break
      case 'hex':
        textToCopy = entity.hex
        break
    }
    
    navigator.clipboard.writeText(textToCopy)
    
    trackFeature('copy_entity', { type })
    
    toast({
      title: 'Copied!',
      description: `${type} entity copied to clipboard`,
    })
  }
  
  const createPreview = () => {
    if (!output || mode !== 'decode') return null
    
    return HTMLEntityEncoder.createPreview(output, true)
  }
  
  const preview = React.useMemo(() => {
    if (showPreview && mode === 'decode' && output) {
      return createPreview()
    }
    return null
  }, [showPreview, mode, output])
  
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Control', label: 'Control Characters' },
    { value: 'Punctuation', label: 'Punctuation' },
    { value: 'Currency', label: 'Currency' },
    { value: 'Math', label: 'Mathematical' },
    { value: 'Symbols', label: 'Symbols' },
    { value: 'Arrows', label: 'Arrows' },
    { value: 'Greek', label: 'Greek Letters' },
  ]
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            HTML Entity Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Encode and decode HTML entities for safe HTML display
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <RadioGroup value={mode} onValueChange={setMode as any}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="encode" id="encode" />
                  <Label htmlFor="encode">Encode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decode" id="decode" />
                  <Label htmlFor="decode">Decode</Label>
                </div>
              </div>
            </RadioGroup>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwapMode}
                disabled={!output}
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Swap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleXSSEncode}
                disabled={!input || mode === 'decode'}
              >
                <Shield className="h-4 w-4 mr-2" />
                XSS Safe
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="input">
              {mode === 'encode' ? 'Text to encode' : 'HTML entities to decode'}
            </Label>
            <Textarea
              id="input"
              placeholder={mode === 'encode' ? 'Enter text or HTML...' : 'Enter HTML entities...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] font-mono"
            />
            <CounterDisplay
              current={input.length}
              label="characters"
            />
          </div>
          
          {mode === 'encode' && (
            <Tabs defaultValue="options" className="w-full">
              <TabsList>
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="format">Format</TabsTrigger>
              </TabsList>
              
              <TabsContent value="options" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="entity-mode">Entity Format</Label>
                    <Select value={entityMode} onValueChange={setEntityMode as any}>
                      <SelectTrigger id="entity-mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="named">Named (&amp;amp;)</SelectItem>
                        <SelectItem value="numeric">Numeric (&#38;)</SelectItem>
                        <SelectItem value="hex">Hexadecimal (&#x26;)</SelectItem>
                        <SelectItem value="mixed">Mixed (Best fit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="encode-level">Encoding Level</Label>
                    <Select value={encodeLevel} onValueChange={setEncodeLevel as any}>
                      <SelectTrigger id="encode-level">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (&lt; &gt; &amp; " ')</SelectItem>
                        <SelectItem value="extended">Extended (Common entities)</SelectItem>
                        <SelectItem value="all">All (Non-alphanumeric)</SelectItem>
                        <SelectItem value="nonASCII">Non-ASCII only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="encode-quotes" className="font-normal">
                      Encode quotes (" and ')
                    </Label>
                    <Switch
                      id="encode-quotes"
                      checked={encodeQuotes}
                      onCheckedChange={setEncodeQuotes}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="encode-newlines" className="font-normal">
                      Encode newlines
                    </Label>
                    <Switch
                      id="encode-newlines"
                      checked={encodeNewlines}
                      onCheckedChange={setEncodeNewlines}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="double-encode" className="font-normal">
                      Double encode (encode existing entities)
                    </Label>
                    <Switch
                      id="double-encode"
                      checked={doubleEncode}
                      onCheckedChange={setDoubleEncode}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="format" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Convert between different entity formats
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConvertFormat('named')}
                  >
                    To Named
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConvertFormat('numeric')}
                  >
                    To Numeric
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConvertFormat('hex')}
                  >
                    To Hex
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Output</CardTitle>
              <div className="flex items-center gap-2">
                {result && (
                  <Badge variant="secondary">
                    {result.entityCount} entities
                  </Badge>
                )}
                {mode === 'decode' && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="preview"
                      checked={showPreview}
                      onCheckedChange={setShowPreview}
                    />
                    <Label htmlFor="preview" className="text-sm">
                      Preview
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result?.xssRisks && result.xssRisks.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Security Warning</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {result.xssRisks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Textarea
                value={output}
                readOnly
                className="min-h-[150px] font-mono"
              />
              <CounterDisplay
                current={output.length}
                label="characters"
              />
            </div>
            
            {showPreview && preview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    HTML Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {preview.warnings && (
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {preview.warnings[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div 
                    className="p-4 border rounded-md"
                    dangerouslySetInnerHTML={{ __html: preview.preview }}
                  />
                </CardContent>
              </Card>
            )}
            
            <div className="flex gap-2">
              <CopyButton
                text={output}
                onCopy={() => trackFeature('copy_output')}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Entity Reference
          </CardTitle>
          <CardDescription>
            Browse and search HTML entities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={referenceSearch}
                  onChange={(e) => setReferenceSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={referenceCategory} onValueChange={setReferenceCategory}>
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
          </div>
          
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[100px]">Character</TableHead>
                  <TableHead>Named</TableHead>
                  <TableHead>Numeric</TableHead>
                  <TableHead>Hex</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entityReference.slice(0, 100).map((entity, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-lg text-center">
                      {entity.character}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entity.named || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entity.numeric}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entity.hex}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entity.description}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyFromReference(entity, 'named')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/html-entities/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { HTMLEntityTool } from '@/components/tools/encoding/html-entity-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.htmlEntities' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['html entities', 'html encoder', 'html decoder', 'escape html', 'xss prevention'],
    locale,
    path: '/tools/html-entities',
  })
}

export default function HTMLEntitiesPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="html-entities"
      locale={locale}
    >
      <HTMLEntityTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test entity encoding/decoding
2. Verify XSS prevention mode
3. Test different encoding levels
4. Check entity reference table
5. Verify HTML preview safety
6. Test format conversion

## Notes
- Complete HTML5 entity support
- XSS risk detection and prevention
- Safe HTML preview rendering
- Entity reference lookup
- Support for all encoding formats