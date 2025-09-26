# Story 7.1: Base64 Encoder/Decoder

## Story Details
- **Stage**: 7 - Encoding/Decoding Tools
- **Priority**: High
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a comprehensive Base64 encoder/decoder tool that supports text, files, images, and data URIs with features for different encoding variants and practical use cases.

## Acceptance Criteria
- [ ] Encode/decode text to/from Base64
- [ ] File upload and download support
- [ ] Image preview for Base64 images
- [ ] Data URI generation
- [ ] URL-safe Base64 variant
- [ ] Line break options (RFC 2045)
- [ ] Character encoding options (UTF-8, ASCII, etc.)
- [ ] Batch processing support
- [ ] Copy as different formats (raw, data URI, HTML, CSS)
- [ ] Real-time validation and error handling

## Implementation Steps

### 1. Create Base64 Logic

#### Create `src/lib/encoding/base64.ts`
```typescript
export interface Base64Options {
  variant: 'standard' | 'urlSafe' | 'mime'
  charset: 'utf-8' | 'ascii' | 'utf-16' | 'iso-8859-1'
  lineLength?: number // For MIME variant
  padding?: boolean
}

export interface Base64Result {
  encoded?: string
  decoded?: string
  format?: 'text' | 'binary' | 'image' | 'file'
  mimeType?: string
  size: {
    original: number
    encoded: number
    ratio: number
  }
  dataUri?: string
  isValid: boolean
  error?: string
}

export interface FileData {
  name: string
  type: string
  size: number
  content: ArrayBuffer
}

export class Base64Encoder {
  // Standard Base64 alphabet
  private static readonly STANDARD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  
  // URL-safe Base64 alphabet
  private static readonly URL_SAFE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  
  // Encode string to Base64
  static encode(
    input: string,
    options: Partial<Base64Options> = {}
  ): Base64Result {
    const {
      variant = 'standard',
      charset = 'utf-8',
      lineLength = 76,
      padding = true,
    } = options
    
    try {
      // Convert string to bytes based on charset
      const bytes = this.stringToBytes(input, charset)
      
      // Encode to Base64
      let encoded = this.bytesToBase64(bytes, variant, padding)
      
      // Apply line breaks for MIME variant
      if (variant === 'mime' && lineLength > 0) {
        encoded = this.addLineBreaks(encoded, lineLength)
      }
      
      return {
        encoded,
        format: 'text',
        size: {
          original: new TextEncoder().encode(input).length,
          encoded: encoded.length,
          ratio: encoded.length / new TextEncoder().encode(input).length,
        },
        isValid: true,
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Encoding failed',
        size: { original: 0, encoded: 0, ratio: 0 },
      }
    }
  }
  
  // Decode Base64 to string
  static decode(
    input: string,
    options: Partial<Base64Options> = {}
  ): Base64Result {
    const {
      variant = 'standard',
      charset = 'utf-8',
    } = options
    
    try {
      // Remove whitespace and line breaks
      const cleaned = input.replace(/[\s\r\n]/g, '')
      
      // Validate Base64
      if (!this.isValidBase64(cleaned, variant)) {
        throw new Error('Invalid Base64 string')
      }
      
      // Decode from Base64
      const bytes = this.base64ToBytes(cleaned, variant)
      
      // Convert bytes to string
      const decoded = this.bytesToString(bytes, charset)
      
      return {
        decoded,
        format: 'text',
        size: {
          original: input.length,
          encoded: bytes.length,
          ratio: bytes.length / input.length,
        },
        isValid: true,
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Decoding failed',
        size: { original: 0, encoded: 0, ratio: 0 },
      }
    }
  }
  
  // Encode file to Base64
  static async encodeFile(file: File): Promise<Base64Result> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      
      const encoded = this.bytesToBase64(bytes, 'standard', true)
      const dataUri = `data:${file.type};base64,${encoded}`
      
      return {
        encoded,
        dataUri,
        format: this.detectFormat(file.type),
        mimeType: file.type,
        size: {
          original: file.size,
          encoded: encoded.length,
          ratio: encoded.length / file.size,
        },
        isValid: true,
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'File encoding failed',
        size: { original: 0, encoded: 0, ratio: 0 },
      }
    }
  }
  
  // Decode Base64 to file
  static decodeToFile(
    base64: string,
    filename: string,
    mimeType: string = 'application/octet-stream'
  ): Blob | null {
    try {
      // Remove data URI prefix if present
      const base64Data = base64.replace(/^data:[^;]+;base64,/, '')
      
      // Decode Base64
      const bytes = this.base64ToBytes(base64Data, 'standard')
      
      // Create blob
      return new Blob([bytes], { type: mimeType })
    } catch (error) {
      console.error('Failed to decode to file:', error)
      return null
    }
  }
  
  // Encode image to Base64 with resizing
  static async encodeImage(
    file: File,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'jpeg' | 'png' | 'webp'
    } = {}
  ): Promise<Base64Result> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.9,
      format = 'jpeg',
    } = options
    
    try {
      // Create image element
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate dimensions
          let { width, height } = img
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }
          
          // Set canvas size
          canvas.width = width
          canvas.height = height
          
          // Draw and resize image
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to Base64
          const dataUri = canvas.toDataURL(`image/${format}`, quality)
          const base64 = dataUri.split(',')[1]
          
          resolve({
            encoded: base64,
            dataUri,
            format: 'image',
            mimeType: `image/${format}`,
            size: {
              original: file.size,
              encoded: base64.length,
              ratio: base64.length / file.size,
            },
            isValid: true,
          })
        }
        
        img.onerror = () => {
          resolve({
            isValid: false,
            error: 'Failed to load image',
            size: { original: 0, encoded: 0, ratio: 0 },
          })
        }
        
        // Load image
        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Image encoding failed',
        size: { original: 0, encoded: 0, ratio: 0 },
      }
    }
  }
  
  // Parse data URI
  static parseDataUri(dataUri: string): {
    mimeType: string
    charset?: string
    base64: boolean
    data: string
  } | null {
    const match = dataUri.match(/^data:([^;]+)(;charset=([^;]+))?(;base64)?,(.+)$/)
    
    if (!match) return null
    
    return {
      mimeType: match[1],
      charset: match[3],
      base64: !!match[4],
      data: match[5],
    }
  }
  
  // Convert between Base64 variants
  static convertVariant(
    input: string,
    from: 'standard' | 'urlSafe',
    to: 'standard' | 'urlSafe'
  ): string {
    if (from === to) return input
    
    if (from === 'standard' && to === 'urlSafe') {
      return input
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    }
    
    if (from === 'urlSafe' && to === 'standard') {
      let result = input
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      
      // Add padding if needed
      const padding = (4 - (result.length % 4)) % 4
      result += '='.repeat(padding)
      
      return result
    }
    
    return input
  }
  
  // Batch encode multiple strings
  static batchEncode(
    inputs: string[],
    options: Partial<Base64Options> = {}
  ): Base64Result[] {
    return inputs.map(input => this.encode(input, options))
  }
  
  // Batch decode multiple strings
  static batchDecode(
    inputs: string[],
    options: Partial<Base64Options> = {}
  ): Base64Result[] {
    return inputs.map(input => this.decode(input, options))
  }
  
  // Generate code snippets for different languages
  static generateCodeSnippet(
    base64: string,
    language: 'javascript' | 'python' | 'java' | 'csharp' | 'php'
  ): string {
    const snippets = {
      javascript: `// Decode Base64 in JavaScript
const decoded = atob('${base64}');

// Encode to Base64
const encoded = btoa('your string here');`,
      
      python: `# Decode Base64 in Python
import base64

decoded = base64.b64decode('${base64}').decode('utf-8')

# Encode to Base64
encoded = base64.b64encode('your string here'.encode('utf-8')).decode('utf-8')`,
      
      java: `// Decode Base64 in Java
import java.util.Base64;

byte[] decodedBytes = Base64.getDecoder().decode("${base64}");
String decoded = new String(decodedBytes);

// Encode to Base64
String encoded = Base64.getEncoder().encodeToString("your string here".getBytes());`,
      
      csharp: `// Decode Base64 in C#
using System;

byte[] decodedBytes = Convert.FromBase64String("${base64}");
string decoded = System.Text.Encoding.UTF8.GetString(decodedBytes);

// Encode to Base64
string encoded = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("your string here"));`,
      
      php: `// Decode Base64 in PHP
$decoded = base64_decode('${base64}');

// Encode to Base64
$encoded = base64_encode('your string here');`,
    }
    
    return snippets[language]
  }
  
  // Helper methods
  private static stringToBytes(str: string, charset: string): Uint8Array {
    switch (charset) {
      case 'utf-8':
        return new TextEncoder().encode(str)
      case 'utf-16':
        const buf = new ArrayBuffer(str.length * 2)
        const bufView = new Uint16Array(buf)
        for (let i = 0; i < str.length; i++) {
          bufView[i] = str.charCodeAt(i)
        }
        return new Uint8Array(buf)
      default:
        // ASCII and ISO-8859-1
        const bytes = new Uint8Array(str.length)
        for (let i = 0; i < str.length; i++) {
          bytes[i] = str.charCodeAt(i) & 0xFF
        }
        return bytes
    }
  }
  
  private static bytesToString(bytes: Uint8Array, charset: string): string {
    switch (charset) {
      case 'utf-8':
        return new TextDecoder().decode(bytes)
      case 'utf-16':
        const view = new Uint16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2)
        return String.fromCharCode(...view)
      default:
        // ASCII and ISO-8859-1
        return String.fromCharCode(...bytes)
    }
  }
  
  private static bytesToBase64(
    bytes: Uint8Array,
    variant: 'standard' | 'urlSafe',
    padding: boolean
  ): string {
    const alphabet = variant === 'urlSafe' ? this.URL_SAFE_ALPHABET : this.STANDARD_ALPHABET
    let result = ''
    
    for (let i = 0; i < bytes.length; i += 3) {
      const byte1 = bytes[i]
      const byte2 = bytes[i + 1] || 0
      const byte3 = bytes[i + 2] || 0
      
      const encoded1 = byte1 >> 2
      const encoded2 = ((byte1 & 0x03) << 4) | (byte2 >> 4)
      const encoded3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6)
      const encoded4 = byte3 & 0x3F
      
      result += alphabet[encoded1]
      result += alphabet[encoded2]
      
      if (i + 1 < bytes.length) {
        result += alphabet[encoded3]
      } else if (padding) {
        result += '='
      }
      
      if (i + 2 < bytes.length) {
        result += alphabet[encoded4]
      } else if (padding) {
        result += '='
      }
    }
    
    return result
  }
  
  private static base64ToBytes(base64: string, variant: 'standard' | 'urlSafe'): Uint8Array {
    const alphabet = variant === 'urlSafe' ? this.URL_SAFE_ALPHABET : this.STANDARD_ALPHABET
    
    // Remove padding
    base64 = base64.replace(/=/g, '')
    
    const bytes = new Uint8Array(Math.floor(base64.length * 3 / 4))
    let byteIndex = 0
    
    for (let i = 0; i < base64.length; i += 4) {
      const encoded1 = alphabet.indexOf(base64[i])
      const encoded2 = alphabet.indexOf(base64[i + 1])
      const encoded3 = i + 2 < base64.length ? alphabet.indexOf(base64[i + 2]) : -1
      const encoded4 = i + 3 < base64.length ? alphabet.indexOf(base64[i + 3]) : -1
      
      bytes[byteIndex++] = (encoded1 << 2) | (encoded2 >> 4)
      
      if (encoded3 !== -1) {
        bytes[byteIndex++] = ((encoded2 & 0x0F) << 4) | (encoded3 >> 2)
      }
      
      if (encoded4 !== -1) {
        bytes[byteIndex++] = ((encoded3 & 0x03) << 6) | encoded4
      }
    }
    
    return bytes.slice(0, byteIndex)
  }
  
  private static isValidBase64(str: string, variant: 'standard' | 'urlSafe'): boolean {
    if (variant === 'urlSafe') {
      return /^[A-Za-z0-9\-_]*$/.test(str)
    }
    return /^[A-Za-z0-9+/]*={0,2}$/.test(str)
  }
  
  private static addLineBreaks(str: string, lineLength: number): string {
    const result: string[] = []
    for (let i = 0; i < str.length; i += lineLength) {
      result.push(str.slice(i, i + lineLength))
    }
    return result.join('\r\n')
  }
  
  private static detectFormat(mimeType: string): 'text' | 'image' | 'file' {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('text/')) return 'text'
    return 'file'
  }
}

// Export convenience functions
export const encodeBase64 = (input: string, options?: Partial<Base64Options>) =>
  Base64Encoder.encode(input, options)

export const decodeBase64 = (input: string, options?: Partial<Base64Options>) =>
  Base64Encoder.decode(input, options)

export const encodeFileBase64 = (file: File) =>
  Base64Encoder.encodeFile(file)
```

### 2. Create Base64 Tool Component

#### Create `src/components/tools/encoding/base64-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Code,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle,
  FileUp
} from 'lucide-react'
import {
  Base64Encoder,
  Base64Options,
  Base64Result,
  encodeBase64,
  decodeBase64
} from '@/lib/encoding/base64'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { cn } from '@/lib/utils'

export function Base64Tool() {
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode')
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [variant, setVariant] = React.useState<Base64Options['variant']>('standard')
  const [charset, setCharset] = React.useState<Base64Options['charset']>('utf-8')
  const [lineLength, setLineLength] = React.useState(76)
  const [usePadding, setUsePadding] = React.useState(true)
  const [file, setFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<Base64Result | null>(null)
  const [showCodeSnippets, setShowCodeSnippets] = React.useState(false)
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'base64',
    toolName: 'Base64 Encoder/Decoder',
    category: 'encoding',
  })
  
  // Process encoding/decoding
  React.useEffect(() => {
    if (!input && !file) {
      setOutput('')
      setResult(null)
      return
    }
    
    trackStart(input || 'file')
    
    const options: Partial<Base64Options> = {
      variant,
      charset,
      lineLength: variant === 'mime' ? lineLength : undefined,
      padding: usePadding,
    }
    
    if (mode === 'encode') {
      if (file) {
        // Handle file encoding
        Base64Encoder.encodeFile(file).then(result => {
          if (result.isValid) {
            setOutput(result.encoded!)
            setResult(result)
            if (result.format === 'image') {
              setImagePreview(result.dataUri!)
            }
            trackComplete('file', result.encoded!)
          } else {
            toast({
              title: 'Encoding failed',
              description: result.error,
              variant: 'destructive',
            })
          }
        })
      } else {
        // Handle text encoding
        const result = encodeBase64(input, options)
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
      }
    } else {
      // Handle decoding
      const result = decodeBase64(input, options)
      if (result.isValid) {
        setOutput(result.decoded!)
        setResult(result)
        
        // Check if it's an image data URI
        const dataUri = Base64Encoder.parseDataUri(input)
        if (dataUri && dataUri.mimeType.startsWith('image/')) {
          setImagePreview(input)
        }
        
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
  }, [input, file, mode, variant, charset, lineLength, usePadding, trackStart, trackComplete, toast])
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setInput('') // Clear text input
      setImagePreview(null)
      
      trackFeature('file_upload', {
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      })
    }
  }
  
  const handleSwapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput('')
    setFile(null)
    setImagePreview(null)
    
    trackFeature('swap_mode')
  }
  
  const handleCopyAs = (format: 'raw' | 'dataUri' | 'html' | 'css') => {
    let textToCopy = output
    
    switch (format) {
      case 'dataUri':
        textToCopy = result?.dataUri || `data:text/plain;base64,${output}`
        break
      case 'html':
        if (result?.format === 'image') {
          textToCopy = `<img src="data:${result.mimeType};base64,${output}" alt="Base64 Image" />`
        } else {
          textToCopy = `<span>${output}</span>`
        }
        break
      case 'css':
        textToCopy = `background-image: url('data:${result?.mimeType || 'image/png'};base64,${output}');`
        break
    }
    
    navigator.clipboard.writeText(textToCopy)
    
    trackFeature('copy_as', { format })
    
    toast({
      title: 'Copied!',
      description: `Copied as ${format} format`,
    })
  }
  
  const handleDownload = () => {
    if (mode === 'decode' && result?.format === 'file') {
      // Download decoded file
      const blob = Base64Encoder.decodeToFile(input, 'decoded-file', result.mimeType)
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'decoded-file'
        a.click()
        URL.revokeObjectURL(url)
      }
    } else {
      // Download as text file
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt'
      a.click()
      URL.revokeObjectURL(url)
    }
    
    trackFeature('download', { mode })
  }
  
  const clearAll = () => {
    setInput('')
    setOutput('')
    setFile(null)
    setImagePreview(null)
    setResult(null)
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Base64 Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Encode and decode text, files, and images to/from Base64 format
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
          
          <Tabs defaultValue="text" className="w-full">
            <TabsList>
              <TabsTrigger value="text">
                <FileText className="h-4 w-4 mr-2" />
                Text
              </TabsTrigger>
              <TabsTrigger value="file" disabled={mode === 'decode'}>
                <FileUp className="h-4 w-4 mr-2" />
                File
              </TabsTrigger>
              <TabsTrigger value="options">
                Options
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">
                  {mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}
                </Label>
                <Textarea
                  id="input"
                  placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setFile(null)
                    setImagePreview(null)
                  }}
                  className="min-h-[200px] font-mono"
                />
                <CounterDisplay
                  current={input.length}
                  label="characters"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select file to encode</Label>
                <div className="flex items-center gap-4">
                  <Label htmlFor="file-input" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      Choose File
                    </div>
                    <Input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </Label>
                  {file && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{file.name}</Badge>
                      <Badge variant="outline">{(file.size / 1024).toFixed(2)} KB</Badge>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="options" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="variant">Base64 Variant</Label>
                  <Select value={variant} onValueChange={setVariant as any}>
                    <SelectTrigger id="variant">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="urlSafe">URL Safe</SelectItem>
                      <SelectItem value="mime">MIME (RFC 2045)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="charset">Character Encoding</Label>
                  <Select value={charset} onValueChange={setCharset as any}>
                    <SelectTrigger id="charset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utf-8">UTF-8</SelectItem>
                      <SelectItem value="ascii">ASCII</SelectItem>
                      <SelectItem value="utf-16">UTF-16</SelectItem>
                      <SelectItem value="iso-8859-1">ISO-8859-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {variant === 'mime' && (
                <div className="space-y-2">
                  <Label htmlFor="lineLength">Line Length</Label>
                  <Input
                    id="lineLength"
                    type="number"
                    min={0}
                    max={1000}
                    value={lineLength}
                    onChange={(e) => setLineLength(parseInt(e.target.value) || 76)}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="padding" className="font-normal">
                  Include padding characters (=)
                </Label>
                <Switch
                  id="padding"
                  checked={usePadding}
                  onCheckedChange={setUsePadding}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="snippets" className="font-normal">
                  Show code snippets
                </Label>
                <Switch
                  id="snippets"
                  checked={showCodeSnippets}
                  onCheckedChange={setShowCodeSnippets}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Output</CardTitle>
              {result && (
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {result.format || 'text'}
                  </Badge>
                  {result.size && (
                    <Badge variant="outline">
                      Ratio: {result.size.ratio.toFixed(2)}x
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {imagePreview && (
              <div className="p-4 border rounded-lg">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-[400px] mx-auto"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Textarea
                value={output}
                readOnly
                className="min-h-[200px] font-mono"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <CounterDisplay
                  current={output.length}
                  label="characters"
                />
                {result?.isValid && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid {mode === 'encode' ? 'Base64' : 'output'}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <CopyButton
                text={output}
                onCopy={() => trackFeature('copy_output')}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyAs('dataUri')}
              >
                Copy as Data URI
              </Button>
              {result?.format === 'image' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAs('html')}
                  >
                    Copy as HTML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAs('css')}
                  >
                    Copy as CSS
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            {showCodeSnippets && output && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Code Snippets</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="javascript">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="javascript">JS</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="java">Java</TabsTrigger>
                      <TabsTrigger value="csharp">C#</TabsTrigger>
                      <TabsTrigger value="php">PHP</TabsTrigger>
                    </TabsList>
                    {(['javascript', 'python', 'java', 'csharp', 'php'] as const).map(lang => (
                      <TabsContent key={lang} value={lang}>
                        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
                          <code className="text-sm">
                            {Base64Encoder.generateCodeSnippet(output.slice(0, 50) + '...', lang)}
                          </code>
                        </pre>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  )
}
```

### 3. Create Base64 Page

#### Create `src/app/[locale]/tools/base64/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Base64Tool } from '@/components/tools/encoding/base64-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.base64' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['base64', 'encode', 'decode', 'base64 encoder', 'base64 decoder', 'data uri'],
    locale,
    path: '/tools/base64',
  })
}

export default function Base64Page({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="base64"
      locale={locale}
    >
      <Base64Tool />
    </ToolLayout>
  )
}
```

### 4. Add Tests

#### Create `src/lib/encoding/__tests__/base64.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { Base64Encoder, encodeBase64, decodeBase64 } from '../base64'

describe('Base64Encoder', () => {
  describe('Text Encoding/Decoding', () => {
    it('encodes text to Base64', () => {
      const result = encodeBase64('Hello World')
      expect(result.isValid).toBe(true)
      expect(result.encoded).toBe('SGVsbG8gV29ybGQ=')
    })
    
    it('decodes Base64 to text', () => {
      const result = decodeBase64('SGVsbG8gV29ybGQ=')
      expect(result.isValid).toBe(true)
      expect(result.decoded).toBe('Hello World')
    })
    
    it('handles URL-safe variant', () => {
      const result = encodeBase64('??>', { variant: 'urlSafe' })
      expect(result.isValid).toBe(true)
      expect(result.encoded).not.toContain('+')
      expect(result.encoded).not.toContain('/')
    })
    
    it('handles different character encodings', () => {
      const text = 'Héllo Wörld'
      const utf8Result = encodeBase64(text, { charset: 'utf-8' })
      const asciiResult = encodeBase64(text, { charset: 'ascii' })
      
      expect(utf8Result.encoded).not.toBe(asciiResult.encoded)
    })
  })
  
  describe('Variant Conversion', () => {
    it('converts between standard and URL-safe', () => {
      const standard = 'SGVsbG8+Pj8/'
      const urlSafe = Base64Encoder.convertVariant(standard, 'standard', 'urlSafe')
      
      expect(urlSafe).toBe('SGVsbG8-Pj8_')
      
      const backToStandard = Base64Encoder.convertVariant(urlSafe, 'urlSafe', 'standard')
      expect(backToStandard).toBe(standard)
    })
  })
  
  describe('Data URI Parsing', () => {
    it('parses valid data URI', () => {
      const dataUri = 'data:image/png;charset=utf-8;base64,iVBORw0KGgo='
      const parsed = Base64Encoder.parseDataUri(dataUri)
      
      expect(parsed).not.toBeNull()
      expect(parsed?.mimeType).toBe('image/png')
      expect(parsed?.charset).toBe('utf-8')
      expect(parsed?.base64).toBe(true)
      expect(parsed?.data).toBe('iVBORw0KGgo=')
    })
  })
  
  describe('Batch Operations', () => {
    it('batch encodes multiple strings', () => {
      const inputs = ['Hello', 'World', 'Test']
      const results = Base64Encoder.batchEncode(inputs)
      
      expect(results).toHaveLength(3)
      expect(results[0].encoded).toBe('SGVsbG8=')
      expect(results[1].encoded).toBe('V29ybGQ=')
      expect(results[2].encoded).toBe('VGVzdA==')
    })
  })
  
  describe('Error Handling', () => {
    it('handles invalid Base64 input', () => {
      const result = decodeBase64('Invalid@Base64!')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
```

## Testing & Verification

1. Test text encoding/decoding
2. Verify file upload and encoding
3. Test image preview functionality
4. Check different Base64 variants
5. Verify character encoding options
6. Test batch processing

## Notes
- Support for large files with chunking
- Image optimization before encoding
- Multiple output formats (data URI, HTML, CSS)
- Code snippet generation for developers
- Performance optimization for large inputs