# Story 5.8: Mirror/Reverse Text Tool

## Story Details
- **Stage**: 5 - Text Formatting Tools
- **Priority**: Low
- **Estimated Hours**: 2 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a tool that can reverse or mirror text in various ways including character reversal, word reversal, line reversal, and special effects like upside-down text and mirror writing.

## Acceptance Criteria
- [ ] Reverse entire text (character by character)
- [ ] Reverse words only (keep word order)
- [ ] Reverse lines only
- [ ] Mirror text (horizontal flip)
- [ ] Upside-down text (vertical flip)
- [ ] Reverse within words (keep word positions)
- [ ] Palindrome checker
- [ ] Unicode support
- [ ] RTL/LTR text handling
- [ ] Real-time preview

## Implementation Steps

### 1. Create Mirror/Reverse Logic

#### Create `src/lib/text-format/mirror-reverse.ts`
```typescript
export interface ReverseOptions {
  text: string
  mode: 'characters' | 'words' | 'lines' | 'words-internal' | 'mirror' | 'upside-down'
  preserveSpacing: boolean
  preservePunctuation: boolean
}

export interface ReverseResult {
  output: string
  isPalindrome: boolean
  stats: {
    originalLength: number
    reversedLength: number
    characterCount: number
    wordCount: number
    lineCount: number
  }
}

// Unicode mappings for mirror and upside-down text
const MIRROR_MAP: Record<string, string> = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
  'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
  'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
  'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
  'A': '∀', 'B': 'B', 'C': 'Ɔ', 'D': 'D', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ',
  'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'K', 'L': '˥', 'M': 'W', 'N': 'N',
  'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': '┴', 'U': '∩',
  'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ',
  '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': '\'', '\'': ',', '"': '„', '!': '¡', '?': '¿',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '&': '⅋', '_': '‾', '∴': '∵',
}

const HORIZONTAL_FLIP_MAP: Record<string, string> = {
  'a': 'ɒ', 'b': 'd', 'c': 'ɔ', 'd': 'b', 'e': 'ɘ', 'f': 'ʇ', 'g': 'ǫ',
  'h': 'ʜ', 'i': 'i', 'j': 'ᒐ', 'k': 'ʞ', 'l': 'l', 'm': 'm', 'n': 'ᴎ',
  'o': 'o', 'p': 'q', 'q': 'p', 'r': 'ɿ', 's': 'ꙅ', 't': 'ƚ', 'u': 'u',
  'v': 'v', 'w': 'w', 'x': 'x', 'y': 'ʏ', 'z': 'ƹ',
  'A': 'A', 'B': 'ᙠ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ꟻ', 'G': 'Ꭾ',
  'H': 'H', 'I': 'I', 'J': 'Ⴑ', 'K': '⋊', 'L': '⅃', 'M': 'M', 'N': 'ᴎ',
  'O': 'O', 'P': 'ꟼ', 'Q': 'Ϙ', 'R': 'Я', 'S': 'Ꙅ', 'T': 'T', 'U': 'U',
  'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Ƹ',
  '0': '0', '1': '߁', '2': 'ς', '3': 'Ɛ', '4': 'μ', '5': 'Ϛ',
  '6': 'ϐ', '7': '٢', '8': '8', '9': '୧',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '/': '\\', '\\': '/',
}

export class MirrorReverse {
  // Main reverse function
  static reverse(options: ReverseOptions): ReverseResult {
    const {
      text,
      mode = 'characters',
      preserveSpacing = true,
      preservePunctuation = false,
    } = options
    
    if (!text) {
      return {
        output: '',
        isPalindrome: true,
        stats: {
          originalLength: 0,
          reversedLength: 0,
          characterCount: 0,
          wordCount: 0,
          lineCount: 0,
        },
      }
    }
    
    let output: string
    
    switch (mode) {
      case 'characters':
        output = this.reverseCharacters(text)
        break
        
      case 'words':
        output = this.reverseWords(text, preserveSpacing, preservePunctuation)
        break
        
      case 'lines':
        output = this.reverseLines(text)
        break
        
      case 'words-internal':
        output = this.reverseWordsInternal(text, preservePunctuation)
        break
        
      case 'mirror':
        output = this.mirrorText(text)
        break
        
      case 'upside-down':
        output = this.upsideDownText(text)
        break
        
      default:
        output = text
    }
    
    const isPalindrome = this.checkPalindrome(text)
    
    return {
      output,
      isPalindrome,
      stats: {
        originalLength: text.length,
        reversedLength: output.length,
        characterCount: [...text].length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        lineCount: text.split('\n').length,
      },
    }
  }
  
  // Reverse characters (entire string)
  private static reverseCharacters(text: string): string {
    // Use Array.from to handle Unicode properly
    return Array.from(text).reverse().join('')
  }
  
  // Reverse word order
  private static reverseWords(
    text: string,
    preserveSpacing: boolean,
    preservePunctuation: boolean
  ): string {
    if (preserveSpacing) {
      // Complex word reversal preserving exact spacing
      const words: string[] = []
      const spaces: string[] = []
      let currentWord = ''
      let currentSpace = ''
      let inSpace = false
      
      for (const char of text) {
        if (/\s/.test(char)) {
          if (!inSpace && currentWord) {
            words.push(currentWord)
            currentWord = ''
          }
          currentSpace += char
          inSpace = true
        } else {
          if (inSpace && currentSpace) {
            spaces.push(currentSpace)
            currentSpace = ''
          }
          currentWord += char
          inSpace = false
        }
      }
      
      // Add last word/space
      if (currentWord) words.push(currentWord)
      if (currentSpace) spaces.push(currentSpace)
      
      // Reverse words
      words.reverse()
      
      // Reconstruct with original spacing
      let result = ''
      for (let i = 0; i < Math.max(words.length, spaces.length); i++) {
        if (text[0] === ' ') {
          // Started with space
          if (spaces[i]) result += spaces[i]
          if (words[i]) result += words[i]
        } else {
          // Started with word
          if (words[i]) result += words[i]
          if (spaces[i]) result += spaces[i]
        }
      }
      
      return result
    } else {
      // Simple word reversal
      return text.split(/\s+/).filter(Boolean).reverse().join(' ')
    }
  }
  
  // Reverse lines
  private static reverseLines(text: string): string {
    return text.split('\n').reverse().join('\n')
  }
  
  // Reverse characters within each word
  private static reverseWordsInternal(
    text: string,
    preservePunctuation: boolean
  ): string {
    return text.replace(/\S+/g, (word) => {
      if (preservePunctuation) {
        // Extract punctuation at start and end
        const match = word.match(/^(\W*)(.*?)(\W*)$/)
        if (match) {
          const [, startPunct, content, endPunct] = match
          return startPunct + Array.from(content).reverse().join('') + endPunct
        }
      }
      return Array.from(word).reverse().join('')
    })
  }
  
  // Mirror text (horizontal flip)
  private static mirrorText(text: string): string {
    return Array.from(text)
      .reverse()
      .map(char => HORIZONTAL_FLIP_MAP[char] || char)
      .join('')
  }
  
  // Upside-down text (vertical flip)
  private static upsideDownText(text: string): string {
    return Array.from(text)
      .reverse()
      .map(char => MIRROR_MAP[char] || char)
      .join('')
  }
  
  // Check if text is a palindrome
  private static checkPalindrome(text: string): boolean {
    // Remove spaces and punctuation, convert to lowercase
    const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '')
    const reversed = Array.from(cleaned).reverse().join('')
    return cleaned === reversed && cleaned.length > 0
  }
  
  // Advanced transformations
  static readonly TRANSFORMATIONS = {
    // Leetspeak reverse
    LEETSPEAK: (text: string): string => {
      const leet: Record<string, string> = {
        'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5',
        't': '7', 'A': '4', 'E': '3', 'I': '1', 'O': '0',
        'S': '5', 'T': '7',
      }
      return Array.from(text)
        .reverse()
        .map(char => leet[char] || char)
        .join('')
    },
    
    // ROT13 + reverse
    ROT13_REVERSE: (text: string): string => {
      return Array.from(text)
        .reverse()
        .map(char => {
          const code = char.charCodeAt(0)
          if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + 13) % 26) + 65)
          } else if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + 13) % 26) + 97)
          }
          return char
        })
        .join('')
    },
    
    // Alternating case reverse
    ALTERNATING_CASE: (text: string): string => {
      let upper = true
      return Array.from(text)
        .reverse()
        .map(char => {
          if (/[a-zA-Z]/.test(char)) {
            const result = upper ? char.toUpperCase() : char.toLowerCase()
            upper = !upper
            return result
          }
          return char
        })
        .join('')
    },
  }
  
  // Get all palindromes in text
  static findPalindromes(text: string, minLength: number = 3): string[] {
    const words = text.match(/\b\w+\b/g) || []
    const palindromes: string[] = []
    
    for (const word of words) {
      if (word.length >= minLength && this.checkPalindrome(word)) {
        palindromes.push(word)
      }
    }
    
    return [...new Set(palindromes)]
  }
  
  // Create ambigram suggestions
  static suggestAmbigrams(text: string): Array<{
    original: string
    suggestion: string
    type: 'rotational' | 'mirror'
  }> {
    const suggestions: Array<{
      original: string
      suggestion: string
      type: 'rotational' | 'mirror'
    }> = []
    
    // Check for rotational ambigrams
    const rotated = this.upsideDownText(text)
    if (rotated.toLowerCase() === text.toLowerCase()) {
      suggestions.push({
        original: text,
        suggestion: rotated,
        type: 'rotational',
      })
    }
    
    // Check for mirror ambigrams
    const mirrored = this.mirrorText(text)
    if (mirrored.toLowerCase() === text.toLowerCase()) {
      suggestions.push({
        original: text,
        suggestion: mirrored,
        type: 'mirror',
      })
    }
    
    return suggestions
  }
  
  // Detect text direction (LTR/RTL)
  static detectTextDirection(text: string): 'ltr' | 'rtl' | 'mixed' {
    const rtlChars = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/
    const ltrChars = /[A-Za-z]/
    
    const hasRtl = rtlChars.test(text)
    const hasLtr = ltrChars.test(text)
    
    if (hasRtl && !hasLtr) return 'rtl'
    if (hasLtr && !hasRtl) return 'ltr'
    if (hasRtl && hasLtr) return 'mixed'
    
    return 'ltr' // default
  }
}

// Export convenience functions
export const reverseText = (text: string) =>
  MirrorReverse.reverse({ text, mode: 'characters', preserveSpacing: true, preservePunctuation: false })

export const reverseWords = (text: string) =>
  MirrorReverse.reverse({ text, mode: 'words', preserveSpacing: true, preservePunctuation: false })

export const flipUpsideDown = (text: string) =>
  MirrorReverse.reverse({ text, mode: 'upside-down', preserveSpacing: true, preservePunctuation: false })
```

### 2. Create Mirror/Reverse Component

#### Create `src/components/tools/text-format/mirror-reverse-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Sparkles,
  CheckCircle,
  Info,
  ArrowLeftRight
} from 'lucide-react'
import { 
  MirrorReverse, 
  ReverseOptions,
  flipUpsideDown 
} from '@/lib/text-format/mirror-reverse'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { cn } from '@/lib/utils'

export function MirrorReverseTool() {
  const [input, setInput] = React.useState('')
  const [mode, setMode] = React.useState<ReverseOptions['mode']>('characters')
  const [preserveSpacing, setPreserveSpacing] = React.useState(true)
  const [preservePunctuation, setPreservePunctuation] = React.useState(false)
  const [showEffects, setShowEffects] = React.useState(false)
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'mirror-reverse',
    toolName: 'Mirror/Reverse Text',
    category: 'text-formatting',
  })
  
  // Process text
  const result = React.useMemo(() => {
    if (!input) return null
    
    trackStart(input)
    
    const options: ReverseOptions = {
      text: input,
      mode,
      preserveSpacing,
      preservePunctuation,
    }
    
    const result = MirrorReverse.reverse(options)
    trackComplete(input, result.output)
    
    return result
  }, [input, mode, preserveSpacing, preservePunctuation, trackStart, trackComplete])
  
  // Find palindromes
  const palindromes = React.useMemo(() => {
    if (!input) return []
    return MirrorReverse.findPalindromes(input)
  }, [input])
  
  // Detect text direction
  const textDirection = React.useMemo(() => {
    if (!input) return 'ltr'
    return MirrorReverse.detectTextDirection(input)
  }, [input])
  
  // Quick actions
  const applyTransformation = (transformKey: keyof typeof MirrorReverse.TRANSFORMATIONS) => {
    if (!input) return
    
    const transform = MirrorReverse.TRANSFORMATIONS[transformKey]
    const transformed = transform(input)
    setInput(transformed)
    
    trackFeature('apply_transformation', { type: transformKey })
    
    toast({
      title: 'Transformation applied!',
      description: `Applied ${transformKey.toLowerCase().replace('_', ' ')} transformation`,
    })
  }
  
  const handleQuickAction = (actionMode: ReverseOptions['mode']) => {
    setMode(actionMode)
    trackFeature('quick_action', { mode: actionMode })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlipHorizontal className="h-5 w-5" />
            Mirror & Reverse Text
          </CardTitle>
          <CardDescription>
            Reverse, mirror, or flip your text in various creative ways
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input">Input text</Label>
              {textDirection !== 'ltr' && (
                <Badge variant="secondary">
                  {textDirection === 'rtl' ? 'RTL Text' : 'Mixed Direction'}
                </Badge>
              )}
            </div>
            <Textarea
              id="input"
              placeholder="Enter text to reverse or mirror..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[150px] font-mono"
              dir={textDirection === 'rtl' ? 'rtl' : 'ltr'}
            />
            <CounterDisplay
              current={input.length}
              label="characters"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('characters')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reverse All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('words')}
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Reverse Words
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('mirror')}
            >
              <FlipHorizontal className="h-4 w-4 mr-2" />
              Mirror
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction('upside-down')}
            >
              <FlipVertical className="h-4 w-4 mr-2" />
              Upside Down
            </Button>
          </div>
          
          <Tabs defaultValue="options" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="effects">Special Effects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="options" className="space-y-4">
              <div className="space-y-2">
                <Label>Reverse mode</Label>
                <RadioGroup value={mode} onValueChange={setMode as any}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="characters" id="characters" />
                    <Label htmlFor="characters" className="font-normal">
                      Reverse characters (entire text)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="words" id="words" />
                    <Label htmlFor="words" className="font-normal">
                      Reverse word order
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lines" id="lines" />
                    <Label htmlFor="lines" className="font-normal">
                      Reverse line order
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="words-internal" id="words-internal" />
                    <Label htmlFor="words-internal" className="font-normal">
                      Reverse within words
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mirror" id="mirror" />
                    <Label htmlFor="mirror" className="font-normal">
                      Mirror text (horizontal flip)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upside-down" id="upside-down" />
                    <Label htmlFor="upside-down" className="font-normal">
                      Upside-down text (vertical flip)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {(mode === 'words' || mode === 'words-internal') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preserveSpacing" className="font-normal">
                      Preserve original spacing
                    </Label>
                    <Switch
                      id="preserveSpacing"
                      checked={preserveSpacing}
                      onCheckedChange={setPreserveSpacing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preservePunctuation" className="font-normal">
                      Preserve punctuation position
                    </Label>
                    <Switch
                      id="preservePunctuation"
                      checked={preservePunctuation}
                      onCheckedChange={setPreservePunctuation}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="effects" className="space-y-4">
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  onClick={() => applyTransformation('LEETSPEAK')}
                  className="justify-start"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Leetspeak Reverse
                </Button>
                <Button
                  variant="outline"
                  onClick={() => applyTransformation('ROT13_REVERSE')}
                  className="justify-start"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  ROT13 + Reverse
                </Button>
                <Button
                  variant="outline"
                  onClick={() => applyTransformation('ALTERNATING_CASE')}
                  className="justify-start"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Alternating Case Reverse
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={result.output}
                  readOnly
                  className="min-h-[150px] font-mono"
                  dir={textDirection === 'rtl' ? 'rtl' : 'ltr'}
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <CounterDisplay
                    current={result.output.length}
                    label="characters"
                  />
                  {result.isPalindrome && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Palindrome detected!
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <CopyButton
                  text={result.output}
                  onCopy={() => {
                    trackFeature('copy_output')
                    toast({
                      title: 'Copied!',
                      description: 'Reversed text copied to clipboard',
                    })
                  }}
                />
                <DownloadButton
                  text={result.output}
                  filename="reversed-text.txt"
                  onDownload={() => trackFeature('download_output')}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(result.output)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Use as Input
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {(palindromes.length > 0 || result.isPalindrome) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Interesting Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.isPalindrome && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Perfect Palindrome!</AlertTitle>
                    <AlertDescription>
                      The entire text reads the same forwards and backwards (ignoring spaces and punctuation).
                    </AlertDescription>
                  </Alert>
                )}
                
                {palindromes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Palindromes found in text:</Label>
                    <div className="flex flex-wrap gap-2">
                      {palindromes.map((palindrome, index) => (
                        <Badge key={index} variant="outline">
                          {palindrome}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
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
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/mirror-reverse-text/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { MirrorReverseTool } from '@/components/tools/text-format/mirror-reverse-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.mirrorReverse' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['reverse text', 'mirror text', 'upside down text', 'flip text', 'palindrome checker'],
    locale,
    path: '/tools/mirror-reverse-text',
  })
}

export default function MirrorReverseTextPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="mirror-reverse-text"
      locale={locale}
    >
      <MirrorReverseTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test character reversal with Unicode
2. Verify word order reversal
3. Test mirror and upside-down mappings
4. Check palindrome detection
5. Verify RTL/LTR handling
6. Test special transformations

## Notes
- Full Unicode support for international text
- Creative text transformations
- Palindrome detection feature
- RTL language support
- Fun special effects for social media