# Story 4.3: Encoding/Decoding Tools

## Story Details
- **Stage**: 4 - Core Text Tools Implementation
- **Priority**: High
- **Estimated Hours**: 4-5 hours
- **Dependencies**: Story 4.2 (Text Formatting Tools)

## Objective
Implement comprehensive encoding and decoding tools for various formats including Base64, URL encoding, HTML entities, and more. These tools should handle edge cases, support different character encodings, and provide clear error messages.

## Acceptance Criteria
- [ ] Base64 encode/decode
- [ ] URL encode/decode
- [ ] HTML entity encode/decode
- [ ] ASCII to Hex/Binary
- [ ] Unicode escape/unescape
- [ ] JWT decoder
- [ ] MD5/SHA hash generator
- [ ] ROT13/ROT47 cipher
- [ ] Morse code encoder/decoder
- [ ] Binary to text converter
- [ ] Character encoding converter (UTF-8, ASCII, etc.)
- [ ] Error handling for invalid input

## Implementation Steps

### 1. Create Encoding/Decoding Utilities

#### Create `src/lib/encoding/encoders.ts`
```typescript
/**
 * Core encoding and decoding functions
 */

import { createHash } from 'crypto'

export const encoders = {
  // Base64 Encoding
  base64: {
    encode: (text: string): string => {
      try {
        return Buffer.from(text, 'utf-8').toString('base64')
      } catch (error) {
        throw new Error('Failed to encode Base64')
      }
    },
    
    decode: (encoded: string): string => {
      try {
        // Remove whitespace and validate
        const cleaned = encoded.replace(/\s/g, '')
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
          throw new Error('Invalid Base64 string')
        }
        return Buffer.from(cleaned, 'base64').toString('utf-8')
      } catch (error) {
        throw new Error('Invalid Base64 string')
      }
    },
    
    isValid: (text: string): boolean => {
      const cleaned = text.replace(/\s/g, '')
      return /^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) && cleaned.length % 4 === 0
    },
  },

  // URL Encoding
  url: {
    encode: (text: string): string => {
      return encodeURIComponent(text)
    },
    
    decode: (encoded: string): string => {
      try {
        return decodeURIComponent(encoded)
      } catch (error) {
        throw new Error('Invalid URL-encoded string')
      }
    },
    
    encodeRFC3986: (text: string): string => {
      // More strict encoding following RFC3986
      return encodeURIComponent(text).replace(
        /[!'()*]/g,
        (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
      )
    },
  },

  // HTML Entity Encoding
  html: {
    encode: (text: string, mode: 'all' | 'special' = 'special'): string => {
      const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }
      
      if (mode === 'special') {
        return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char)
      } else {
        // Encode all non-ASCII characters
        return text.replace(/[\u00A0-\u9999<>&"']/g, (char) => {
          return '&#' + char.charCodeAt(0) + ';'
        })
      }
    },
    
    decode: (encoded: string): string => {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = encoded
      return textarea.value
    },
  },

  // Hex Encoding
  hex: {
    encode: (text: string): string => {
      return text
        .split('')
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ')
    },
    
    decode: (hex: string): string => {
      const cleaned = hex.replace(/\s/g, '')
      if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length % 2 !== 0) {
        throw new Error('Invalid hex string')
      }
      
      let result = ''
      for (let i = 0; i < cleaned.length; i += 2) {
        result += String.fromCharCode(parseInt(cleaned.substr(i, 2), 16))
      }
      return result
    },
  },

  // Binary Encoding
  binary: {
    encode: (text: string): string => {
      return text
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ')
    },
    
    decode: (binary: string): string => {
      const cleaned = binary.replace(/\s/g, '')
      if (!/^[01]*$/.test(cleaned) || cleaned.length % 8 !== 0) {
        throw new Error('Invalid binary string')
      }
      
      let result = ''
      for (let i = 0; i < cleaned.length; i += 8) {
        result += String.fromCharCode(parseInt(cleaned.substr(i, 8), 2))
      }
      return result
    },
  },

  // Unicode Escape
  unicode: {
    encode: (text: string): string => {
      return text.replace(/[\s\S]/g, (char) => {
        const code = char.charCodeAt(0)
        if (code <= 0x7F) {
          // ASCII characters
          return char
        } else if (code <= 0xFFFF) {
          // BMP characters
          return '\\u' + code.toString(16).padStart(4, '0')
        } else {
          // Surrogate pairs for characters outside BMP
          const high = Math.floor((code - 0x10000) / 0x400) + 0xD800
          const low = ((code - 0x10000) % 0x400) + 0xDC00
          return '\\u' + high.toString(16) + '\\u' + low.toString(16)
        }
      })
    },
    
    decode: (escaped: string): string => {
      return escaped.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(parseInt(match.replace('\\u', ''), 16))
      })
    },
  },

  // ROT13 Cipher
  rot13: {
    encode: (text: string): string => {
      return text.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0)
        const base = code < 97 ? 65 : 97
        return String.fromCharCode(((code - base + 13) % 26) + base)
      })
    },
    
    decode: (text: string): string => {
      // ROT13 is its own inverse
      return encoders.rot13.encode(text)
    },
  },

  // ROT47 Cipher
  rot47: {
    encode: (text: string): string => {
      return text.replace(/[!-~]/g, (char) => {
        const code = char.charCodeAt(0)
        return String.fromCharCode(33 + ((code - 33 + 47) % 94))
      })
    },
    
    decode: (text: string): string => {
      // ROT47 is its own inverse
      return encoders.rot47.encode(text)
    },
  },

  // Morse Code
  morse: {
    alphabet: {
      'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
      'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
      'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
      'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
      'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
      '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
      '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
      "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
      '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
      '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
      ' ': '/'
    },
    
    encode: function(text: string): string {
      return text
        .toUpperCase()
        .split('')
        .map(char => this.alphabet[char as keyof typeof this.alphabet] || char)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    },
    
    decode: function(morse: string): string {
      const reverseAlphabet = Object.fromEntries(
        Object.entries(this.alphabet).map(([k, v]) => [v, k])
      )
      
      return morse
        .split(' ')
        .map(code => reverseAlphabet[code] || code)
        .join('')
        .replace(/\//g, ' ')
    },
  },

  // JWT Decoder (decode only, no verify)
  jwt: {
    decode: (token: string): { header: any; payload: any; signature: string } => {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }
      
      try {
        const header = JSON.parse(encoders.base64.decode(parts[0]))
        const payload = JSON.parse(encoders.base64.decode(parts[1]))
        
        return {
          header,
          payload,
          signature: parts[2],
        }
      } catch (error) {
        throw new Error('Invalid JWT token')
      }
    },
    
    isValid: (token: string): boolean => {
      const parts = token.split('.')
      return parts.length === 3 && parts.every(part => /^[A-Za-z0-9_-]+$/.test(part))
    },
  },
}

// Hash generators
export const hashGenerators = {
  md5: (text: string): string => {
    return createHash('md5').update(text).digest('hex')
  },
  
  sha1: (text: string): string => {
    return createHash('sha1').update(text).digest('hex')
  },
  
  sha256: (text: string): string => {
    return createHash('sha256').update(text).digest('hex')
  },
  
  sha512: (text: string): string => {
    return createHash('sha512').update(text).digest('hex')
  },
}

// Character encoding converter
export function convertCharacterEncoding(
  text: string,
  from: BufferEncoding,
  to: BufferEncoding
): string {
  try {
    const buffer = Buffer.from(text, from)
    return buffer.toString(to)
  } catch (error) {
    throw new Error(`Failed to convert from ${from} to ${to}`)
  }
}
```

### 2. Create Encoding/Decoding Components

#### Create `src/components/tools/encoding/base64-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { FileCode } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { ToolInput } from '@/components/tools/tool-input'
import { ToolOutput } from '@/components/tools/tool-output'
import { ToolOptions } from '@/components/tools/tool-options'
import { useToolContext } from '@/contexts/tool-context'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { encoders } from '@/lib/encoding/encoders'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'base64',
  name: 'Base64 Encoder/Decoder',
  description: 'Encode and decode Base64 strings',
  category: ToolCategory.ENCODING,
  icon: FileCode,
  keywords: ['base64', 'encode', 'decode', 'converter'],
  component: null,
}

export function Base64Tool() {
  const t = useTranslations('tools.base64')
  const { input, output, setInput, setOutput, error, setError } = useToolContext()
  
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode')
  const [options, setOptions] = React.useState({
    urlSafe: false,
    noPadding: false,
    lineBreaks: false,
  })

  React.useEffect(() => {
    if (!input) {
      setOutput('')
      setError(null)
      return
    }

    try {
      let result: string
      
      if (mode === 'encode') {
        result = encoders.base64.encode(input)
        
        // Apply options
        if (options.urlSafe) {
          result = result.replace(/\+/g, '-').replace(/\//g, '_')
        }
        if (options.noPadding) {
          result = result.replace(/=/g, '')
        }
        if (options.lineBreaks) {
          // Add line breaks every 76 characters (MIME standard)
          result = result.match(/.{1,76}/g)?.join('\n') || result
        }
      } else {
        let toDecode = input
        
        // Reverse URL-safe if needed
        if (options.urlSafe) {
          toDecode = toDecode.replace(/-/g, '+').replace(/_/g, '/')
        }
        
        // Add padding if needed
        if (options.noPadding) {
          const padding = (4 - (toDecode.length % 4)) % 4
          toDecode += '='.repeat(padding)
        }
        
        result = encoders.base64.decode(toDecode)
      }
      
      setOutput(result)
      setError(null)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : t('error'))
    }
  }, [input, mode, options, setOutput, setError, t])

  const isValidBase64 = React.useMemo(() => {
    return mode === 'decode' && input ? encoders.base64.isValid(input) : null
  }, [input, mode])

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder={
              mode === 'encode' 
                ? t('encodePlaceholder')
                : t('decodePlaceholder')
            }
            error={error}
          />
          
          {mode === 'decode' && input && (
            <Alert variant={isValidBase64 ? 'default' : 'destructive'}>
              <AlertDescription>
                {isValidBase64 
                  ? t('validBase64')
                  : t('invalidBase64')
                }
              </AlertDescription>
            </Alert>
          )}
          
          <ToolOutput
            value={output}
            placeholder={
              mode === 'encode'
                ? t('encodedPlaceholder')
                : t('decodedPlaceholder')
            }
          />
        </div>
        
        <div className="lg:col-span-1">
          <ToolOptions title={t('options')}>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>{t('mode')}</Label>
                <RadioGroup value={mode} onValueChange={setMode as any}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="encode" id="encode" />
                      <Label htmlFor="encode">{t('encode')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="decode" id="decode" />
                      <Label htmlFor="decode">{t('decode')}</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="url-safe">
                    {t('urlSafe')}
                  </Label>
                  <Switch
                    id="url-safe"
                    checked={options.urlSafe}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, urlSafe: checked })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('urlSafeDescription')}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="no-padding">
                    {t('noPadding')}
                  </Label>
                  <Switch
                    id="no-padding"
                    checked={options.noPadding}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, noPadding: checked })
                    }
                  />
                </div>
              </div>
              
              {mode === 'encode' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="line-breaks">
                      {t('lineBreaks')}
                    </Label>
                    <Switch
                      id="line-breaks"
                      checked={options.lineBreaks}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, lineBreaks: checked })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('lineBreaksDescription')}
                  </p>
                </div>
              )}
            </div>
          </ToolOptions>
        </div>
      </div>
    </ToolLayout>
  )
}
```

#### Create `src/components/tools/encoding/multi-encoder-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Code } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { encoders, hashGenerators } from '@/lib/encoding/encoders'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'multi-encoder',
  name: 'Multi-Format Encoder',
  description: 'Encode text in multiple formats simultaneously',
  category: ToolCategory.ENCODING,
  icon: Code,
  keywords: ['encode', 'decode', 'multi', 'converter', 'hash'],
  component: null,
}

export function MultiEncoderTool() {
  const t = useTranslations('tools.multiEncoder')
  const [input, setInput] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('encoding')
  
  const encodingResults = React.useMemo(() => {
    if (!input) return {}
    
    const results: Record<string, { value: string; error?: string }> = {}
    
    // Encodings
    try {
      results.base64 = { value: encoders.base64.encode(input) }
    } catch (e) {
      results.base64 = { value: '', error: 'Error' }
    }
    
    try {
      results.url = { value: encoders.url.encode(input) }
    } catch (e) {
      results.url = { value: '', error: 'Error' }
    }
    
    try {
      results.html = { value: encoders.html.encode(input) }
    } catch (e) {
      results.html = { value: '', error: 'Error' }
    }
    
    try {
      results.hex = { value: encoders.hex.encode(input) }
    } catch (e) {
      results.hex = { value: '', error: 'Error' }
    }
    
    try {
      results.binary = { value: encoders.binary.encode(input) }
    } catch (e) {
      results.binary = { value: '', error: 'Error' }
    }
    
    try {
      results.unicode = { value: encoders.unicode.encode(input) }
    } catch (e) {
      results.unicode = { value: '', error: 'Error' }
    }
    
    // Ciphers
    try {
      results.rot13 = { value: encoders.rot13.encode(input) }
    } catch (e) {
      results.rot13 = { value: '', error: 'Error' }
    }
    
    try {
      results.rot47 = { value: encoders.rot47.encode(input) }
    } catch (e) {
      results.rot47 = { value: '', error: 'Error' }
    }
    
    try {
      results.morse = { value: encoders.morse.encode(input) }
    } catch (e) {
      results.morse = { value: '', error: 'Error' }
    }
    
    // Hashes
    try {
      results.md5 = { value: hashGenerators.md5(input) }
    } catch (e) {
      results.md5 = { value: '', error: 'Error' }
    }
    
    try {
      results.sha1 = { value: hashGenerators.sha1(input) }
    } catch (e) {
      results.sha1 = { value: '', error: 'Error' }
    }
    
    try {
      results.sha256 = { value: hashGenerators.sha256(input) }
    } catch (e) {
      results.sha256 = { value: '', error: 'Error' }
    }
    
    try {
      results.sha512 = { value: hashGenerators.sha512(input) }
    } catch (e) {
      results.sha512 = { value: '', error: 'Error' }
    }
    
    return results
  }, [input])

  const ResultCard = ({ 
    title, 
    value, 
    error 
  }: { 
    title: string
    value: string
    error?: string 
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {value && <CopyButton text={value} size="sm" variant="ghost" />}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-sm font-mono break-all bg-muted p-2 rounded">
            {value || '-'}
          </p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div>
          <Label htmlFor="input">{t('input')}</Label>
          <Input
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="mt-2"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="encoding">{t('encoding')}</TabsTrigger>
            <TabsTrigger value="ciphers">{t('ciphers')}</TabsTrigger>
            <TabsTrigger value="hashes">{t('hashes')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="encoding" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ResultCard
                title="Base64"
                value={encodingResults.base64?.value || ''}
                error={encodingResults.base64?.error}
              />
              <ResultCard
                title="URL Encode"
                value={encodingResults.url?.value || ''}
                error={encodingResults.url?.error}
              />
              <ResultCard
                title="HTML Entities"
                value={encodingResults.html?.value || ''}
                error={encodingResults.html?.error}
              />
              <ResultCard
                title="Hex"
                value={encodingResults.hex?.value || ''}
                error={encodingResults.hex?.error}
              />
              <ResultCard
                title="Binary"
                value={encodingResults.binary?.value || ''}
                error={encodingResults.binary?.error}
              />
              <ResultCard
                title="Unicode Escape"
                value={encodingResults.unicode?.value || ''}
                error={encodingResults.unicode?.error}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="ciphers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ResultCard
                title="ROT13"
                value={encodingResults.rot13?.value || ''}
                error={encodingResults.rot13?.error}
              />
              <ResultCard
                title="ROT47"
                value={encodingResults.rot47?.value || ''}
                error={encodingResults.rot47?.error}
              />
              <ResultCard
                title="Morse Code"
                value={encodingResults.morse?.value || ''}
                error={encodingResults.morse?.error}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="hashes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard
                title="MD5"
                value={encodingResults.md5?.value || ''}
                error={encodingResults.md5?.error}
              />
              <ResultCard
                title="SHA-1"
                value={encodingResults.sha1?.value || ''}
                error={encodingResults.sha1?.error}
              />
              <ResultCard
                title="SHA-256"
                value={encodingResults.sha256?.value || ''}
                error={encodingResults.sha256?.error}
              />
              <ResultCard
                title="SHA-512"
                value={encodingResults.sha512?.value || ''}
                error={encodingResults.sha512?.error}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  )
}
```

### 3. Update Translations

Add to `src/i18n/locales/en/tools.json`:
```json
{
  "base64": {
    "encodePlaceholder": "Enter text to encode in Base64",
    "decodePlaceholder": "Enter Base64 string to decode",
    "encodedPlaceholder": "Base64 encoded text will appear here",
    "decodedPlaceholder": "Decoded text will appear here",
    "options": "Options",
    "mode": "Mode",
    "encode": "Encode",
    "decode": "Decode",
    "urlSafe": "URL Safe",
    "urlSafeDescription": "Use URL-safe alphabet (- and _ instead of + and /)",
    "noPadding": "No Padding",
    "lineBreaks": "Add Line Breaks",
    "lineBreaksDescription": "Break into 76-character lines (MIME standard)",
    "validBase64": "Valid Base64 format",
    "invalidBase64": "Invalid Base64 format",
    "error": "Error processing Base64"
  },
  "multiEncoder": {
    "input": "Input Text",
    "inputPlaceholder": "Enter text to encode",
    "encoding": "Encoding",
    "ciphers": "Ciphers",
    "hashes": "Hashes"
  }
}
```

## Testing & Verification

1. Test all encoding/decoding functions
2. Verify error handling for invalid input
3. Test with Unicode and special characters
4. Check hash generation accuracy
5. Verify JWT decoding
6. Test with various text sizes

## Success Indicators
- ✅ All encoders work correctly
- ✅ Error handling for invalid input
- ✅ Unicode support
- ✅ Real-time encoding/decoding
- ✅ Multiple format support

## Next Steps
Proceed to Story 4.4: Text Generator Tools

## Notes
- Consider adding file upload for encoding
- Add support for more hash algorithms
- Consider streaming for large texts
- Add encoding detection