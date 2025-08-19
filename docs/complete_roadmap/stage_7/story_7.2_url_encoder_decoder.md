# Story 7.2: URL Encoder/Decoder

## Story Details
- **Stage**: 7 - Encoding/Decoding Tools
- **Priority**: High
- **Estimated Hours**: 3 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a comprehensive URL encoder/decoder tool that handles percent-encoding, query parameters, full URLs, and various encoding standards with support for batch processing and URL analysis.

## Acceptance Criteria
- [ ] Encode/decode text using percent-encoding
- [ ] Support for encoding entire URLs vs components
- [ ] Query parameter parser and builder
- [ ] Unicode and special character handling
- [ ] URL validation and analysis
- [ ] Batch URL processing
- [ ] Different encoding standards (RFC 3986, application/x-www-form-urlencoded)
- [ ] JavaScript encodeURI vs encodeURIComponent comparison
- [ ] URL shortener detection and expansion
- [ ] Copy URL parts separately

## Implementation Steps

### 1. Create URL Encoding Logic

#### Create `src/lib/encoding/url-encoder.ts`
```typescript
export interface URLEncodingOptions {
  mode: 'component' | 'full' | 'query'
  standard: 'rfc3986' | 'form' | 'javascript'
  plusForSpace?: boolean // For form encoding
  preserveReserved?: boolean // For full URL encoding
}

export interface URLAnalysis {
  protocol?: string
  hostname?: string
  port?: string
  pathname?: string
  search?: string
  hash?: string
  username?: string
  password?: string
  origin?: string
  href?: string
  queryParams?: Record<string, string | string[]>
  isValid: boolean
  isAbsolute: boolean
  isRelative: boolean
}

export interface URLEncodingResult {
  encoded?: string
  decoded?: string
  analysis?: URLAnalysis
  isValid: boolean
  error?: string
  warnings?: string[]
}

export class URLEncoder {
  // RFC 3986 unreserved characters
  private static readonly UNRESERVED = /[A-Za-z0-9\-._~]/
  
  // Reserved characters that have special meaning in URLs
  private static readonly RESERVED = /[!*'();:@&=+$,\/?#\[\]]/
  
  // Characters safe in different contexts
  private static readonly SAFE_CHARS = {
    component: '', // Encode everything except unreserved
    query: '!*\'()~', // Additional safe chars for query values
    path: '!*\'()~/', // Allow forward slash in paths
    full: ':/?#[]@!$&\'()*+,;=', // Preserve URL structure
  }
  
  // Encode text based on options
  static encode(
    input: string,
    options: Partial<URLEncodingOptions> = {}
  ): URLEncodingResult {
    const {
      mode = 'component',
      standard = 'rfc3986',
      plusForSpace = false,
      preserveReserved = false,
    } = options
    
    try {
      let encoded: string
      
      switch (standard) {
        case 'form':
          encoded = this.formEncode(input)
          break
          
        case 'javascript':
          encoded = mode === 'full' ? encodeURI(input) : encodeURIComponent(input)
          break
          
        default: // rfc3986
          encoded = this.percentEncode(input, {
            safeChars: this.getSafeChars(mode, preserveReserved),
            plusForSpace: plusForSpace && mode === 'query',
          })
      }
      
      return {
        encoded,
        isValid: true,
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Encoding failed',
      }
    }
  }
  
  // Decode URL-encoded text
  static decode(
    input: string,
    options: Partial<URLEncodingOptions> = {}
  ): URLEncodingResult {
    const { standard = 'rfc3986' } = options
    
    try {
      let decoded: string
      
      switch (standard) {
        case 'form':
          decoded = this.formDecode(input)
          break
          
        case 'javascript':
          decoded = decodeURIComponent(input)
          break
          
        default: // rfc3986
          decoded = this.percentDecode(input)
      }
      
      return {
        decoded,
        isValid: true,
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Decoding failed',
      }
    }
  }
  
  // Analyze URL structure
  static analyzeURL(urlString: string): URLAnalysis {
    try {
      // Try to parse as absolute URL
      const url = new URL(urlString)
      
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        username: url.username || undefined,
        password: url.password || undefined,
        origin: url.origin,
        href: url.href,
        queryParams: this.parseQueryParams(url.search),
        isValid: true,
        isAbsolute: true,
        isRelative: false,
      }
    } catch {
      // Try to parse as relative URL
      try {
        const url = new URL(urlString, 'http://example.com')
        
        if (urlString.startsWith('/') || urlString.startsWith('?') || urlString.startsWith('#')) {
          return {
            pathname: urlString.startsWith('/') ? url.pathname : undefined,
            search: urlString.includes('?') ? url.search : undefined,
            hash: urlString.includes('#') ? url.hash : undefined,
            queryParams: url.search ? this.parseQueryParams(url.search) : undefined,
            isValid: true,
            isAbsolute: false,
            isRelative: true,
          }
        }
      } catch {
        // Invalid URL
      }
    }
    
    return {
      isValid: false,
      isAbsolute: false,
      isRelative: false,
    }
  }
  
  // Parse query parameters
  static parseQueryParams(queryString: string): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {}
    
    // Remove leading ? if present
    const query = queryString.startsWith('?') ? queryString.slice(1) : queryString
    
    if (!query) return params
    
    // Split by & and parse each pair
    query.split('&').forEach(pair => {
      const [key, value] = pair.split('=').map(part => 
        decodeURIComponent(part.replace(/\+/g, ' '))
      )
      
      if (key) {
        if (params[key]) {
          // Convert to array if multiple values
          if (Array.isArray(params[key])) {
            (params[key] as string[]).push(value || '')
          } else {
            params[key] = [params[key] as string, value || '']
          }
        } else {
          params[key] = value || ''
        }
      }
    })
    
    return params
  }
  
  // Build query string from parameters
  static buildQueryString(
    params: Record<string, string | string[] | number | boolean | undefined | null>,
    options: {
      sort?: boolean
      skipNull?: boolean
      skipEmpty?: boolean
      arrayFormat?: 'brackets' | 'indices' | 'repeat' | 'comma'
    } = {}
  ): string {
    const {
      sort = false,
      skipNull = true,
      skipEmpty = false,
      arrayFormat = 'repeat',
    } = options
    
    const pairs: string[] = []
    
    let keys = Object.keys(params)
    if (sort) {
      keys = keys.sort()
    }
    
    keys.forEach(key => {
      const value = params[key]
      
      // Skip null/undefined values if requested
      if (value === null || value === undefined) {
        if (!skipNull) {
          pairs.push(encodeURIComponent(key))
        }
        return
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        if (skipEmpty && value.length === 0) return
        
        switch (arrayFormat) {
          case 'brackets':
            value.forEach(v => {
              pairs.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(String(v))}`)
            })
            break
            
          case 'indices':
            value.forEach((v, i) => {
              pairs.push(`${encodeURIComponent(key)}[${i}]=${encodeURIComponent(String(v))}`)
            })
            break
            
          case 'comma':
            pairs.push(`${encodeURIComponent(key)}=${value.map(v => encodeURIComponent(String(v))).join(',')}`)
            break
            
          default: // repeat
            value.forEach(v => {
              pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
            })
        }
      } else {
        // Handle single values
        const stringValue = String(value)
        if (!skipEmpty || stringValue) {
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(stringValue)}`)
        }
      }
    })
    
    return pairs.join('&')
  }
  
  // Encode URL with smart component detection
  static smartEncode(url: string): URLEncodingResult {
    const analysis = this.analyzeURL(url)
    
    if (!analysis.isValid) {
      // Not a valid URL, encode as component
      return this.encode(url, { mode: 'component' })
    }
    
    try {
      // Parse and rebuild URL with proper encoding
      const parsed = new URL(url)
      
      // Encode each component appropriately
      if (parsed.pathname) {
        parsed.pathname = parsed.pathname.split('/').map(segment =>
          segment ? encodeURIComponent(decodeURIComponent(segment)) : segment
        ).join('/')
      }
      
      // Re-encode query parameters
      if (parsed.search) {
        const params = this.parseQueryParams(parsed.search)
        parsed.search = this.buildQueryString(params)
      }
      
      // Encode hash
      if (parsed.hash) {
        parsed.hash = '#' + encodeURIComponent(decodeURIComponent(parsed.hash.slice(1)))
      }
      
      return {
        encoded: parsed.toString(),
        analysis,
        isValid: true,
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to encode URL',
      }
    }
  }
  
  // Batch encode/decode URLs
  static batchProcess(
    urls: string[],
    operation: 'encode' | 'decode',
    options: Partial<URLEncodingOptions> = {}
  ): URLEncodingResult[] {
    return urls.map(url => 
      operation === 'encode' ? this.encode(url, options) : this.decode(url, options)
    )
  }
  
  // Compare different encoding methods
  static compareEncodings(input: string): {
    original: string
    encodeURI: string
    encodeURIComponent: string
    rfc3986: string
    formEncoded: string
    differences: string[]
  } {
    const result = {
      original: input,
      encodeURI: '',
      encodeURIComponent: '',
      rfc3986: '',
      formEncoded: '',
      differences: [] as string[],
    }
    
    try {
      result.encodeURI = encodeURI(input)
      result.encodeURIComponent = encodeURIComponent(input)
      result.rfc3986 = this.percentEncode(input, { safeChars: '' })
      result.formEncoded = this.formEncode(input)
      
      // Find differences
      const encodings = [
        { name: 'encodeURI', value: result.encodeURI },
        { name: 'encodeURIComponent', value: result.encodeURIComponent },
        { name: 'RFC 3986', value: result.rfc3986 },
        { name: 'Form Encoded', value: result.formEncoded },
      ]
      
      const unique = new Set(encodings.map(e => e.value))
      if (unique.size > 1) {
        result.differences = encodings
          .filter((e, i, arr) => arr.findIndex(x => x.value === e.value) === i)
          .map(e => `${e.name}: ${e.value}`)
      }
    } catch (error) {
      // Handle encoding errors
    }
    
    return result
  }
  
  // Detect and expand shortened URLs
  static detectShortener(url: string): {
    isShortened: boolean
    service?: string
    warnings?: string[]
  } {
    const shorteners = [
      { pattern: /^https?:\/\/(bit\.ly|bitly\.com)\//, service: 'Bitly' },
      { pattern: /^https?:\/\/tinyurl\.com\//, service: 'TinyURL' },
      { pattern: /^https?:\/\/goo\.gl\//, service: 'Google' },
      { pattern: /^https?:\/\/t\.co\//, service: 'Twitter' },
      { pattern: /^https?:\/\/ow\.ly\//, service: 'Ow.ly' },
      { pattern: /^https?:\/\/short\.link\//, service: 'Short.link' },
      { pattern: /^https?:\/\/buff\.ly\//, service: 'Buffer' },
    ]
    
    for (const shortener of shorteners) {
      if (shortener.pattern.test(url)) {
        return {
          isShortened: true,
          service: shortener.service,
          warnings: ['This appears to be a shortened URL. Be cautious when clicking.'],
        }
      }
    }
    
    return { isShortened: false }
  }
  
  // Helper methods
  private static percentEncode(
    str: string,
    options: { safeChars?: string; plusForSpace?: boolean } = {}
  ): string {
    const { safeChars = '', plusForSpace = false } = options
    
    return str.replace(/./g, (char) => {
      // Handle space
      if (char === ' ' && plusForSpace) {
        return '+'
      }
      
      // Check if character is safe
      if (this.UNRESERVED.test(char) || safeChars.includes(char)) {
        return char
      }
      
      // Encode character
      const code = char.charCodeAt(0)
      if (code < 0x80) {
        return '%' + code.toString(16).toUpperCase().padStart(2, '0')
      } else {
        // Handle multi-byte UTF-8
        return encodeURIComponent(char)
      }
    })
  }
  
  private static percentDecode(str: string): string {
    return str.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    ).replace(/\+/g, ' ')
  }
  
  private static formEncode(str: string): string {
    return encodeURIComponent(str).replace(/%20/g, '+')
  }
  
  private static formDecode(str: string): string {
    return decodeURIComponent(str.replace(/\+/g, ' '))
  }
  
  private static getSafeChars(mode: string, preserveReserved: boolean): string {
    if (preserveReserved && mode === 'full') {
      return this.SAFE_CHARS.full
    }
    return this.SAFE_CHARS[mode as keyof typeof this.SAFE_CHARS] || ''
  }
}

// Export convenience functions
export const encodeURL = (input: string, options?: Partial<URLEncodingOptions>) =>
  URLEncoder.encode(input, options)

export const decodeURL = (input: string, options?: Partial<URLEncodingOptions>) =>
  URLEncoder.decode(input, options)

export const analyzeURL = (url: string) =>
  URLEncoder.analyzeURL(url)

export const buildQueryString = (params: Record<string, any>, options?: any) =>
  URLEncoder.buildQueryString(params, options)
```

### 2. Create URL Encoder Tool Component

#### Create `src/components/tools/encoding/url-encoder-tool.tsx`
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Link,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle,
  Code,
  ExternalLink,
  Hash,
  Search,
  Sliders
} from 'lucide-react'
import {
  URLEncoder,
  URLEncodingOptions,
  URLEncodingResult,
  URLAnalysis,
  encodeURL,
  decodeURL,
  analyzeURL,
  buildQueryString
} from '@/lib/encoding/url-encoder'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function URLEncoderTool() {
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode')
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [encodingMode, setEncodingMode] = React.useState<URLEncodingOptions['mode']>('component')
  const [standard, setStandard] = React.useState<URLEncodingOptions['standard']>('rfc3986')
  const [plusForSpace, setPlusForSpace] = React.useState(false)
  const [preserveReserved, setPreserveReserved] = React.useState(false)
  const [analysis, setAnalysis] = React.useState<URLAnalysis | null>(null)
  const [queryParams, setQueryParams] = React.useState<Record<string, string>>({})
  const [newParamKey, setNewParamKey] = React.useState('')
  const [newParamValue, setNewParamValue] = React.useState('')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'url-encoder',
    toolName: 'URL Encoder/Decoder',
    category: 'encoding',
  })
  
  // Process encoding/decoding
  React.useEffect(() => {
    if (!input) {
      setOutput('')
      setAnalysis(null)
      return
    }
    
    trackStart(input)
    
    const options: Partial<URLEncodingOptions> = {
      mode: encodingMode,
      standard,
      plusForSpace,
      preserveReserved,
    }
    
    if (mode === 'encode') {
      const result = encodeURL(input, options)
      if (result.isValid) {
        setOutput(result.encoded!)
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
      const result = decodeURL(input, options)
      if (result.isValid) {
        setOutput(result.decoded!)
        trackComplete(input, result.decoded!)
      } else {
        setOutput('')
        toast({
          title: 'Decoding failed',
          description: result.error,
          variant: 'destructive',
        })
      }
    }
    
    // Analyze URL
    const urlAnalysis = analyzeURL(input)
    setAnalysis(urlAnalysis)
    
    if (urlAnalysis.queryParams) {
      setQueryParams(
        Object.fromEntries(
          Object.entries(urlAnalysis.queryParams).map(([k, v]) => [
            k,
            Array.isArray(v) ? v.join(', ') : v,
          ])
        )
      )
    }
  }, [input, mode, encodingMode, standard, plusForSpace, preserveReserved, trackStart, trackComplete, toast])
  
  const handleSwapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput('')
    
    trackFeature('swap_mode')
  }
  
  const handleSmartEncode = () => {
    if (!input) return
    
    const result = URLEncoder.smartEncode(input)
    if (result.isValid) {
      setOutput(result.encoded!)
      setAnalysis(result.analysis!)
      
      trackFeature('smart_encode')
      
      toast({
        title: 'Smart encoded!',
        description: 'URL components encoded appropriately',
      })
    }
  }
  
  const addQueryParam = () => {
    if (!newParamKey) return
    
    const updatedParams = {
      ...queryParams,
      [newParamKey]: newParamValue,
    }
    
    setQueryParams(updatedParams)
    const queryString = buildQueryString(updatedParams)
    const newUrl = analysis?.search ? input.replace(analysis.search, '?' + queryString) : input + '?' + queryString
    setInput(newUrl)
    
    setNewParamKey('')
    setNewParamValue('')
    
    trackFeature('add_query_param')
  }
  
  const removeQueryParam = (key: string) => {
    const updatedParams = { ...queryParams }
    delete updatedParams[key]
    
    setQueryParams(updatedParams)
    const queryString = buildQueryString(updatedParams)
    const newUrl = analysis?.search 
      ? input.replace(analysis.search, queryString ? '?' + queryString : '')
      : input
    setInput(newUrl)
    
    trackFeature('remove_query_param')
  }
  
  const compareEncodings = () => {
    if (!input) return
    
    const comparison = URLEncoder.compareEncodings(input)
    
    trackFeature('compare_encodings')
    
    return comparison
  }
  
  const comparison = React.useMemo(() => {
    if (mode === 'encode' && input) {
      return compareEncodings()
    }
    return null
  }, [input, mode])
  
  const shortenerInfo = React.useMemo(() => {
    if (analysis?.isValid) {
      return URLEncoder.detectShortener(input)
    }
    return null
  }, [input, analysis])
  
  const copyURLPart = (part: string, value: string) => {
    navigator.clipboard.writeText(value)
    
    trackFeature('copy_url_part', { part })
    
    toast({
      title: 'Copied!',
      description: `${part} copied to clipboard`,
    })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            URL Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Encode and decode URLs, query parameters, and URL components
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapMode}
              disabled={!output}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Swap
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="input">
              {mode === 'encode' ? 'Text or URL to encode' : 'Encoded text to decode'}
            </Label>
            <Textarea
              id="input"
              placeholder={mode === 'encode' ? 'Enter URL or text...' : 'Enter encoded URL...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] font-mono"
            />
            <CounterDisplay
              current={input.length}
              label="characters"
            />
          </div>
          
          <Tabs defaultValue="options" className="w-full">
            <TabsList>
              <TabsTrigger value="options">
                <Sliders className="h-4 w-4 mr-2" />
                Options
              </TabsTrigger>
              <TabsTrigger value="analysis" disabled={!analysis?.isValid}>
                <Search className="h-4 w-4 mr-2" />
                URL Analysis
              </TabsTrigger>
              <TabsTrigger value="query" disabled={!analysis?.isValid}>
                <Hash className="h-4 w-4 mr-2" />
                Query Params
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="options" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="encoding-mode">Encoding Mode</Label>
                  <Select value={encodingMode} onValueChange={setEncodingMode as any}>
                    <SelectTrigger id="encoding-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="component">Component (Most restrictive)</SelectItem>
                      <SelectItem value="query">Query Parameter</SelectItem>
                      <SelectItem value="full">Full URL (Preserves structure)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="standard">Encoding Standard</Label>
                  <Select value={standard} onValueChange={setStandard as any}>
                    <SelectTrigger id="standard">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rfc3986">RFC 3986 (Standard)</SelectItem>
                      <SelectItem value="form">Form URL Encoded</SelectItem>
                      <SelectItem value="javascript">JavaScript (encodeURI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="plus-space" className="font-normal">
                    Use + for spaces (form encoding)
                  </Label>
                  <Switch
                    id="plus-space"
                    checked={plusForSpace}
                    onCheckedChange={setPlusForSpace}
                    disabled={standard !== 'form'}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="preserve-reserved" className="font-normal">
                    Preserve reserved characters
                  </Label>
                  <Switch
                    id="preserve-reserved"
                    checked={preserveReserved}
                    onCheckedChange={setPreserveReserved}
                    disabled={encodingMode !== 'full'}
                  />
                </div>
              </div>
              
              {mode === 'encode' && analysis?.isValid && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSmartEncode}
                >
                  <Code className="h-4 w-4 mr-2" />
                  Smart Encode (Auto-detect components)
                </Button>
              )}
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              {analysis?.isValid && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {analysis.isAbsolute ? (
                      <Badge variant="secondary">Absolute URL</Badge>
                    ) : (
                      <Badge variant="outline">Relative URL</Badge>
                    )}
                    {shortenerInfo?.isShortened && (
                      <Badge variant="destructive">
                        {shortenerInfo.service} Short URL
                      </Badge>
                    )}
                  </div>
                  
                  {shortenerInfo?.warnings && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        {shortenerInfo.warnings[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    {analysis.protocol && (
                      <URLPart label="Protocol" value={analysis.protocol} onCopy={copyURLPart} />
                    )}
                    {analysis.hostname && (
                      <URLPart label="Hostname" value={analysis.hostname} onCopy={copyURLPart} />
                    )}
                    {analysis.port && (
                      <URLPart label="Port" value={analysis.port} onCopy={copyURLPart} />
                    )}
                    {analysis.pathname && (
                      <URLPart label="Path" value={analysis.pathname} onCopy={copyURLPart} />
                    )}
                    {analysis.search && (
                      <URLPart label="Query" value={analysis.search} onCopy={copyURLPart} />
                    )}
                    {analysis.hash && (
                      <URLPart label="Hash" value={analysis.hash} onCopy={copyURLPart} />
                    )}
                    {analysis.username && (
                      <URLPart label="Username" value={analysis.username} onCopy={copyURLPart} />
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="query" className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Parameter name"
                    value={newParamKey}
                    onChange={(e) => setNewParamKey(e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={newParamValue}
                    onChange={(e) => setNewParamValue(e.target.value)}
                  />
                  <Button onClick={addQueryParam} disabled={!newParamKey}>
                    Add
                  </Button>
                </div>
                
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {Object.entries(queryParams).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(queryParams).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex-1">
                            <code className="text-sm">
                              <span className="text-blue-600">{key}</span>
                              <span className="mx-1">=</span>
                              <span className="text-green-600">{value}</span>
                            </code>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQueryParam(key)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No query parameters</p>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {output && (
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <div className="flex gap-2">
              <CopyButton
                text={output}
                onCopy={() => trackFeature('copy_output')}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(output, '_blank')}
                disabled={mode === 'encode' || !analysis?.isValid}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open URL
              </Button>
            </div>
            
            {comparison && comparison.differences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Encoding Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-2 bg-muted rounded font-mono text-sm">
                      <div>Original: {comparison.original}</div>
                    </div>
                    {comparison.differences.map((diff, i) => (
                      <div key={i} className="p-2 bg-muted rounded font-mono text-sm">
                        {diff}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function URLPart({ 
  label, 
  value, 
  onCopy 
}: { 
  label: string
  value: string
  onCopy: (label: string, value: string) => void 
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted rounded">
      <div className="flex-1">
        <span className="text-sm text-muted-foreground mr-2">{label}:</span>
        <code className="text-sm">{value}</code>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCopy(label, value)}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  )
}
```

### 3. Create Page and Tests

#### Create `src/app/[locale]/tools/url-encoder/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { URLEncoderTool } from '@/components/tools/encoding/url-encoder-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.urlEncoder' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['url encoder', 'url decoder', 'percent encoding', 'query parameters', 'url escape'],
    locale,
    path: '/tools/url-encoder',
  })
}

export default function URLEncoderPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="url-encoder"
      locale={locale}
    >
      <URLEncoderTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test URL encoding/decoding
2. Verify query parameter parsing
3. Test different encoding standards
4. Check URL analysis accuracy
5. Verify smart encoding
6. Test batch processing

## Notes
- Support for international domains (IDN)
- Handle malformed URLs gracefully
- Query parameter array formats
- URL shortener detection
- Comparison between encoding methods