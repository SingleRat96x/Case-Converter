# Story 7.5: ROT13/ROT47 Cipher

## Story Details
- **Stage**: 7 - Encoding/Decoding Tools
- **Priority**: Low
- **Estimated Hours**: 2 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a ROT13/ROT47 cipher tool with support for custom rotation values, multiple cipher variants, and educational features explaining the Caesar cipher family.

## Acceptance Criteria
- [ ] ROT13 encoding/decoding (A-Z, a-z)
- [ ] ROT47 encoding/decoding (ASCII 33-126)
- [ ] Custom rotation values (ROT1-ROT25)
- [ ] ROT5 for numbers (0-9)
- [ ] Combined ROT13+ROT5 (letters + numbers)
- [ ] Batch processing
- [ ] Visual rotation wheel
- [ ] Frequency analysis
- [ ] Cipher breaking helper
- [ ] Educational content about Caesar ciphers

## Implementation Steps

### 1. Create ROT Cipher Logic

#### Create `src/lib/encoding/rot-cipher.ts`
```typescript
export interface ROTCipherOptions {
  variant: 'rot13' | 'rot47' | 'rot5' | 'custom' | 'combined'
  rotation?: number // For custom variant
  preserveCase?: boolean
  preserveNonAlpha?: boolean
}

export interface ROTCipherResult {
  encoded?: string
  decoded?: string
  rotation: number
  variant: string
  isValid: boolean
  error?: string
  analysis?: {
    letterFrequency: Record<string, number>
    mostCommonLetter: string
    patternScore: number
  }
}

export interface CaesarBreakResult {
  rotation: number
  text: string
  score: number
  language: string
}

export class ROTCipher {
  // Character sets for different variants
  private static readonly ALPHABETS = {
    rot13: {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
    },
    rot5: '0123456789',
    rot47: '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
  }
  
  // English letter frequency for breaking ciphers
  private static readonly ENGLISH_FREQUENCY: Record<string, number> = {
    'E': 12.7, 'T': 9.06, 'A': 8.17, 'O': 7.51, 'I': 6.97,
    'N': 6.75, 'S': 6.33, 'H': 6.09, 'R': 5.99, 'D': 4.25,
    'L': 4.03, 'C': 2.78, 'U': 2.76, 'M': 2.41, 'W': 2.36,
    'F': 2.23, 'G': 2.02, 'Y': 1.97, 'P': 1.93, 'B': 1.29,
    'V': 0.98, 'K': 0.77, 'J': 0.15, 'X': 0.15, 'Q': 0.10,
    'Z': 0.07,
  }
  
  // Common English words for pattern matching
  private static readonly COMMON_WORDS = [
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL',
    'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'HAD',
  ]
  
  // Encode/decode using ROT cipher
  static process(
    input: string,
    options: Partial<ROTCipherOptions> = {}
  ): ROTCipherResult {
    const {
      variant = 'rot13',
      rotation = this.getDefaultRotation(variant),
      preserveCase = true,
      preserveNonAlpha = true,
    } = options
    
    try {
      let processed: string
      
      switch (variant) {
        case 'rot13':
          processed = this.rot13(input, preserveCase)
          break
          
        case 'rot47':
          processed = this.rot47(input)
          break
          
        case 'rot5':
          processed = this.rot5(input, preserveNonAlpha)
          break
          
        case 'combined':
          processed = this.rotCombined(input, preserveCase)
          break
          
        case 'custom':
          processed = this.rotCustom(input, rotation, preserveCase, preserveNonAlpha)
          break
          
        default:
          throw new Error('Invalid variant')
      }
      
      // Analyze the result for cipher breaking
      const analysis = this.analyzeText(processed)
      
      return {
        encoded: processed,
        decoded: processed, // ROT ciphers are self-inverse for their default rotations
        rotation,
        variant,
        isValid: true,
        analysis,
      }
    } catch (error) {
      return {
        rotation,
        variant,
        isValid: false,
        error: error instanceof Error ? error.message : 'Processing failed',
      }
    }
  }
  
  // ROT13: Rotate letters by 13
  private static rot13(text: string, preserveCase: boolean): string {
    return text.replace(/[A-Za-z]/g, (char) => {
      const isUpperCase = char >= 'A' && char <= 'Z'
      const alphabet = isUpperCase 
        ? this.ALPHABETS.rot13.uppercase 
        : this.ALPHABETS.rot13.lowercase
      
      const index = alphabet.indexOf(char)
      const rotatedIndex = (index + 13) % 26
      const rotatedChar = alphabet[rotatedIndex]
      
      return preserveCase ? rotatedChar : rotatedChar.toLowerCase()
    })
  }
  
  // ROT47: Rotate ASCII printable characters by 47
  private static rot47(text: string): string {
    return text.replace(/[!-~]/g, (char) => {
      const alphabet = this.ALPHABETS.rot47
      const index = alphabet.indexOf(char)
      const rotatedIndex = (index + 47) % alphabet.length
      return alphabet[rotatedIndex]
    })
  }
  
  // ROT5: Rotate numbers by 5
  private static rot5(text: string, preserveNonNumeric: boolean): string {
    if (preserveNonNumeric) {
      return text.replace(/[0-9]/g, (char) => {
        const alphabet = this.ALPHABETS.rot5
        const index = alphabet.indexOf(char)
        const rotatedIndex = (index + 5) % 10
        return alphabet[rotatedIndex]
      })
    } else {
      // Only process numeric strings
      if (!/^\d+$/.test(text)) return text
      
      return text.split('').map(char => {
        const alphabet = this.ALPHABETS.rot5
        const index = alphabet.indexOf(char)
        const rotatedIndex = (index + 5) % 10
        return alphabet[rotatedIndex]
      }).join('')
    }
  }
  
  // Combined ROT13 + ROT5
  private static rotCombined(text: string, preserveCase: boolean): string {
    let result = this.rot13(text, preserveCase)
    result = this.rot5(result, true)
    return result
  }
  
  // Custom rotation
  private static rotCustom(
    text: string,
    rotation: number,
    preserveCase: boolean,
    preserveNonAlpha: boolean
  ): string {
    return text.replace(/./g, (char) => {
      // Check if it's an uppercase letter
      if (char >= 'A' && char <= 'Z') {
        const index = char.charCodeAt(0) - 65
        const rotatedIndex = (index + rotation) % 26
        const rotatedChar = String.fromCharCode(rotatedIndex + 65)
        return preserveCase ? rotatedChar : rotatedChar.toLowerCase()
      }
      
      // Check if it's a lowercase letter
      if (char >= 'a' && char <= 'z') {
        const index = char.charCodeAt(0) - 97
        const rotatedIndex = (index + rotation) % 26
        const rotatedChar = String.fromCharCode(rotatedIndex + 97)
        return rotatedChar
      }
      
      // Check if it's a number
      if (char >= '0' && char <= '9' && !preserveNonAlpha) {
        const index = char.charCodeAt(0) - 48
        const rotatedIndex = (index + rotation) % 10
        return String.fromCharCode(rotatedIndex + 48)
      }
      
      // Preserve non-alphanumeric characters
      return preserveNonAlpha ? char : ''
    })
  }
  
  // Break Caesar cipher by trying all rotations
  static breakCipher(
    ciphertext: string,
    options: {
      variant?: 'caesar' | 'rot47'
      language?: 'english'
    } = {}
  ): CaesarBreakResult[] {
    const { variant = 'caesar', language = 'english' } = options
    const results: CaesarBreakResult[] = []
    
    if (variant === 'caesar') {
      // Try all 26 rotations for Caesar cipher
      for (let rotation = 0; rotation < 26; rotation++) {
        const decoded = this.rotCustom(ciphertext, rotation, true, true)
        const score = this.scoreText(decoded, language)
        
        results.push({
          rotation,
          text: decoded,
          score,
          language,
        })
      }
    } else {
      // Try all 94 rotations for ROT47
      for (let rotation = 0; rotation < 94; rotation++) {
        const decoded = this.rot47Custom(ciphertext, rotation)
        const score = this.scoreText(decoded, language)
        
        results.push({
          rotation,
          text: decoded,
          score,
          language,
        })
      }
    }
    
    // Sort by score (higher is better)
    return results.sort((a, b) => b.score - a.score)
  }
  
  // ROT47 with custom rotation
  private static rot47Custom(text: string, rotation: number): string {
    return text.replace(/[!-~]/g, (char) => {
      const alphabet = this.ALPHABETS.rot47
      const index = alphabet.indexOf(char)
      const rotatedIndex = (index + rotation) % alphabet.length
      return alphabet[rotatedIndex]
    })
  }
  
  // Score text based on language patterns
  private static scoreText(text: string, language: string): number {
    if (language !== 'english') return 0
    
    let score = 0
    const upperText = text.toUpperCase()
    
    // Score based on letter frequency
    const frequency = this.calculateFrequency(upperText)
    for (const [letter, freq] of Object.entries(frequency)) {
      if (this.ENGLISH_FREQUENCY[letter]) {
        const expectedFreq = this.ENGLISH_FREQUENCY[letter]
        const diff = Math.abs(freq - expectedFreq)
        score -= diff
      }
    }
    
    // Bonus for common words
    for (const word of this.COMMON_WORDS) {
      if (upperText.includes(word)) {
        score += 10
      }
    }
    
    // Penalty for non-printable characters
    const nonPrintable = text.match(/[^\x20-\x7E]/g)
    if (nonPrintable) {
      score -= nonPrintable.length * 5
    }
    
    return score
  }
  
  // Analyze text for patterns
  private static analyzeText(text: string): ROTCipherResult['analysis'] {
    const frequency = this.calculateFrequency(text.toUpperCase())
    
    // Find most common letter
    let mostCommonLetter = ''
    let maxFreq = 0
    
    for (const [letter, freq] of Object.entries(frequency)) {
      if (freq > maxFreq) {
        maxFreq = freq
        mostCommonLetter = letter
      }
    }
    
    // Calculate pattern score
    const patternScore = this.scoreText(text, 'english')
    
    return {
      letterFrequency: frequency,
      mostCommonLetter,
      patternScore,
    }
  }
  
  // Calculate letter frequency
  private static calculateFrequency(text: string): Record<string, number> {
    const frequency: Record<string, number> = {}
    const letters = text.match(/[A-Z]/g) || []
    const total = letters.length
    
    if (total === 0) return frequency
    
    // Count occurrences
    for (const letter of letters) {
      frequency[letter] = (frequency[letter] || 0) + 1
    }
    
    // Convert to percentages
    for (const letter in frequency) {
      frequency[letter] = (frequency[letter] / total) * 100
    }
    
    return frequency
  }
  
  // Get default rotation for variant
  private static getDefaultRotation(variant: string): number {
    switch (variant) {
      case 'rot13': return 13
      case 'rot47': return 47
      case 'rot5': return 5
      case 'combined': return 13
      default: return 13
    }
  }
  
  // Generate rotation wheel visualization data
  static generateRotationWheel(
    variant: 'letters' | 'numbers' | 'rot47' = 'letters'
  ): Array<{
    original: string
    rotations: string[]
  }> {
    const wheel: Array<{ original: string; rotations: string[] }> = []
    
    if (variant === 'letters') {
      const alphabet = this.ALPHABETS.rot13.uppercase
      
      for (let i = 0; i < alphabet.length; i++) {
        const rotations: string[] = []
        for (let rotation = 0; rotation < 26; rotation++) {
          const rotatedIndex = (i + rotation) % 26
          rotations.push(alphabet[rotatedIndex])
        }
        wheel.push({
          original: alphabet[i],
          rotations,
        })
      }
    } else if (variant === 'numbers') {
      const numbers = this.ALPHABETS.rot5
      
      for (let i = 0; i < numbers.length; i++) {
        const rotations: string[] = []
        for (let rotation = 0; rotation < 10; rotation++) {
          const rotatedIndex = (i + rotation) % 10
          rotations.push(numbers[rotatedIndex])
        }
        wheel.push({
          original: numbers[i],
          rotations,
        })
      }
    }
    
    return wheel
  }
  
  // Batch process multiple texts
  static batchProcess(
    texts: string[],
    options: Partial<ROTCipherOptions> = {}
  ): ROTCipherResult[] {
    return texts.map(text => this.process(text, options))
  }
  
  // Educational content
  static getEducationalContent(): {
    history: string
    howItWorks: string
    uses: string[]
    limitations: string[]
  } {
    return {
      history: `The Caesar cipher is one of the oldest known encryption techniques, 
        named after Julius Caesar who used it to communicate with his generals. 
        ROT13 is a special case where letters are rotated by 13 positions, making 
        it self-inverse (applying it twice returns the original text).`,
      
      howItWorks: `ROT ciphers work by shifting each letter in the alphabet by a 
        fixed number of positions. When you reach the end of the alphabet, you wrap 
        around to the beginning. ROT13 shifts by 13, ROT47 shifts ASCII printable 
        characters by 47, and ROT5 shifts digits by 5.`,
      
      uses: [
        'Hiding spoilers in online forums',
        'Basic obfuscation of text',
        'Educational tool for learning cryptography',
        'Puzzle games and geocaching',
      ],
      
      limitations: [
        'Provides no real security - easily broken',
        'Vulnerable to frequency analysis',
        'Only 26 possible keys for alphabet rotation',
        'Pattern of language is preserved',
      ],
    }
  }
}

// Export convenience functions
export const rot13 = (text: string) =>
  ROTCipher.process(text, { variant: 'rot13' })

export const rot47 = (text: string) =>
  ROTCipher.process(text, { variant: 'rot47' })

export const rotCustom = (text: string, rotation: number) =>
  ROTCipher.process(text, { variant: 'custom', rotation })

export const breakROTCipher = (ciphertext: string) =>
  ROTCipher.breakCipher(ciphertext)
```

### 2. Create ROT Cipher Tool Component

#### Create `src/components/tools/encoding/rot-cipher-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  RefreshCw,
  RotateCw,
  Info,
  Lightbulb,
  BarChart2,
  Lock,
  Unlock,
  BookOpen
} from 'lucide-react'
import {
  ROTCipher,
  ROTCipherOptions,
  ROTCipherResult,
  CaesarBreakResult,
  rot13,
  rot47,
  rotCustom,
  breakROTCipher
} from '@/lib/encoding/rot-cipher'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function ROTCipherTool() {
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [variant, setVariant] = React.useState<ROTCipherOptions['variant']>('rot13')
  const [customRotation, setCustomRotation] = React.useState(13)
  const [preserveCase, setPreserveCase] = React.useState(true)
  const [preserveNonAlpha, setPreserveNonAlpha] = React.useState(true)
  const [result, setResult] = React.useState<ROTCipherResult | null>(null)
  const [breakResults, setBreakResults] = React.useState<CaesarBreakResult[]>([])
  const [showWheel, setShowWheel] = React.useState(false)
  const [selectedWheelRotation, setSelectedWheelRotation] = React.useState(0)
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'rot-cipher',
    toolName: 'ROT13/ROT47 Cipher',
    category: 'encoding',
  })
  
  // Process encoding/decoding
  React.useEffect(() => {
    if (!input) {
      setOutput('')
      setResult(null)
      return
    }
    
    trackStart(input)
    
    const options: Partial<ROTCipherOptions> = {
      variant,
      rotation: variant === 'custom' ? customRotation : undefined,
      preserveCase,
      preserveNonAlpha,
    }
    
    const result = ROTCipher.process(input, options)
    
    if (result.isValid) {
      setOutput(result.encoded!)
      setResult(result)
      trackComplete(input, result.encoded!)
    } else {
      setOutput('')
      toast({
        title: 'Processing failed',
        description: result.error,
        variant: 'destructive',
      })
    }
  }, [input, variant, customRotation, preserveCase, preserveNonAlpha, trackStart, trackComplete, toast])
  
  // Get rotation wheel data
  const wheelData = React.useMemo(() => {
    const wheelVariant = variant === 'rot5' ? 'numbers' : 
                        variant === 'rot47' ? 'rot47' : 'letters'
    return ROTCipher.generateRotationWheel(wheelVariant)
  }, [variant])
  
  const handleBreakCipher = () => {
    if (!input) return
    
    trackFeature('break_cipher')
    
    const results = breakROTCipher(input)
    setBreakResults(results.slice(0, 10)) // Show top 10 results
    
    if (results.length > 0 && results[0].score > 0) {
      toast({
        title: 'Cipher analysis complete',
        description: `Most likely rotation: ${results[0].rotation}`,
      })
    }
  }
  
  const applyBreakResult = (result: CaesarBreakResult) => {
    setInput(input)
    setOutput(result.text)
    setCustomRotation(result.rotation)
    setVariant('custom')
    
    trackFeature('apply_break_result', { rotation: result.rotation })
  }
  
  const educationalContent = ROTCipher.getEducationalContent()
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCw className="h-5 w-5" />
            ROT13/ROT47 Cipher
          </CardTitle>
          <CardDescription>
            Encode and decode text using rotation ciphers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="cipher" className="w-full">
            <TabsList>
              <TabsTrigger value="cipher">Cipher</TabsTrigger>
              <TabsTrigger value="break">
                <Unlock className="h-4 w-4 mr-2" />
                Break Cipher
              </TabsTrigger>
              <TabsTrigger value="wheel">
                <RotateCw className="h-4 w-4 mr-2" />
                Rotation Wheel
              </TabsTrigger>
              <TabsTrigger value="learn">
                <BookOpen className="h-4 w-4 mr-2" />
                Learn
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cipher" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">Text to encode/decode</Label>
                <Textarea
                  id="input"
                  placeholder="Enter text to encode or decode..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[150px] font-mono"
                />
                <CounterDisplay
                  current={input.length}
                  label="characters"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="variant">Cipher Variant</Label>
                  <Select value={variant} onValueChange={setVariant as any}>
                    <SelectTrigger id="variant">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rot13">ROT13 (Letters A-Z)</SelectItem>
                      <SelectItem value="rot47">ROT47 (ASCII 33-126)</SelectItem>
                      <SelectItem value="rot5">ROT5 (Numbers 0-9)</SelectItem>
                      <SelectItem value="combined">ROT13+5 (Letters + Numbers)</SelectItem>
                      <SelectItem value="custom">Custom Rotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {variant === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="rotation">
                      Rotation Value: {customRotation}
                    </Label>
                    <Slider
                      id="rotation"
                      min={1}
                      max={25}
                      step={1}
                      value={[customRotation]}
                      onValueChange={([value]) => setCustomRotation(value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="preserve-case" className="font-normal">
                    Preserve letter case
                  </Label>
                  <Switch
                    id="preserve-case"
                    checked={preserveCase}
                    onCheckedChange={setPreserveCase}
                    disabled={variant === 'rot47'}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="preserve-non-alpha" className="font-normal">
                    Preserve non-alphabetic characters
                  </Label>
                  <Switch
                    id="preserve-non-alpha"
                    checked={preserveNonAlpha}
                    onCheckedChange={setPreserveNonAlpha}
                    disabled={variant === 'rot47' || variant === 'rot5'}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="break" className="space-y-4">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  This tool attempts to break Caesar ciphers by trying all possible rotations
                  and scoring them based on English letter frequency and common words.
                </AlertDescription>
              </Alert>
              
              <Button onClick={handleBreakCipher} className="w-full">
                <Unlock className="h-4 w-4 mr-2" />
                Analyze and Break Cipher
              </Button>
              
              {breakResults.length > 0 && (
                <ScrollArea className="h-[300px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Rotation</TableHead>
                        <TableHead className="w-20">Score</TableHead>
                        <TableHead>Decoded Text (Preview)</TableHead>
                        <TableHead className="w-20">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{result.rotation}</TableCell>
                          <TableCell>
                            <Badge variant={index === 0 ? 'default' : 'secondary'}>
                              {result.score.toFixed(0)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm max-w-md truncate">
                            {result.text.slice(0, 50)}...
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applyBreakResult(result)}
                            >
                              Use
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>
            
            <TabsContent value="wheel" className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Rotation Wheel - Rotation: {selectedWheelRotation}
                </Label>
                <Slider
                  min={0}
                  max={variant === 'rot5' ? 9 : 25}
                  step={1}
                  value={[selectedWheelRotation]}
                  onValueChange={([value]) => setSelectedWheelRotation(value)}
                  className="w-full"
                />
              </div>
              
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background">Original</TableHead>
                      {Array.from({ length: variant === 'rot5' ? 10 : 26 }, (_, i) => (
                        <TableHead 
                          key={i} 
                          className={cn(
                            "text-center",
                            i === selectedWheelRotation && "bg-primary/10"
                          )}
                        >
                          +{i}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wheelData.map((row) => (
                      <TableRow key={row.original}>
                        <TableCell className="font-mono font-bold sticky left-0 bg-background">
                          {row.original}
                        </TableCell>
                        {row.rotations.map((char, i) => (
                          <TableCell 
                            key={i} 
                            className={cn(
                              "font-mono text-center",
                              i === selectedWheelRotation && "bg-primary/10 font-bold"
                            )}
                          >
                            {char}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="learn" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">History</h3>
                  <p className="text-sm text-muted-foreground">
                    {educationalContent.history}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">How It Works</h3>
                  <p className="text-sm text-muted-foreground">
                    {educationalContent.howItWorks}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Common Uses</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {educationalContent.uses.map((use, i) => (
                      <li key={i}>{use}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Limitations</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {educationalContent.limitations.map((limitation, i) => (
                      <li key={i}>{limitation}</li>
                    ))}
                  </ul>
                </div>
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
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {result.variant.toUpperCase()}
                  </Badge>
                  {result.variant === 'custom' && (
                    <Badge variant="outline">
                      Rotation: {result.rotation}
                    </Badge>
                  )}
                </div>
              )}
            </div>
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
            
            {result?.analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    Text Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Most common letter:</span>
                    <Badge variant="secondary">
                      {result.analysis.mostCommonLetter || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Pattern score:</span>
                    <Badge variant="outline">
                      {result.analysis.patternScore.toFixed(0)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    In English, 'E' is typically the most common letter (12.7%)
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex gap-2">
              <CopyButton
                text={output}
                onCopy={() => trackFeature('copy_output')}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(output)
                  trackFeature('decode_again')
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Decode Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          ROT13 is self-inverse: applying it twice returns the original text.
          This makes it perfect for hiding spoilers or casual obfuscation.
        </AlertDescription>
      </Alert>
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/rot-cipher/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ROTCipherTool } from '@/components/tools/encoding/rot-cipher-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.rotCipher' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['rot13', 'rot47', 'caesar cipher', 'rotation cipher', 'text obfuscation'],
    locale,
    path: '/tools/rot-cipher',
  })
}

export default function ROTCipherPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="rot-cipher"
      locale={locale}
    >
      <ROTCipherTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test ROT13 encoding/decoding
2. Verify ROT47 with special characters
3. Test custom rotation values
4. Check cipher breaking functionality
5. Verify rotation wheel visualization
6. Test batch processing

## Notes
- Self-inverse property of ROT13
- Educational content about Caesar ciphers
- Visual rotation wheel for learning
- Cipher breaking with frequency analysis
- Support for multiple variants