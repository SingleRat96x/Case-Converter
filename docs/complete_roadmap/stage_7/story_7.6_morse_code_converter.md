# Story 7.6: Morse Code Converter

## Story Details
- **Stage**: 7 - Encoding/Decoding Tools
- **Priority**: Medium
- **Estimated Hours**: 3 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create an interactive Morse code converter with audio playback, visual representation, customizable timing, support for multiple Morse variants (International, American), and learning features.

## Acceptance Criteria
- [ ] Text to Morse code conversion
- [ ] Morse code to text conversion
- [ ] Audio playback with adjustable speed
- [ ] Visual dot/dash representation
- [ ] Light signal simulation
- [ ] Support for numbers and punctuation
- [ ] International and American Morse code
- [ ] Prosigns (procedural signals)
- [ ] Learning mode with practice
- [ ] Export as audio file (WAV)

## Implementation Steps

### 1. Create Morse Code Logic

#### Create `src/lib/encoding/morse-code.ts`
```typescript
export interface MorseCodeOptions {
  variant: 'international' | 'american'
  spacing: {
    dot: number // Duration of a dot (ms)
    dash: number // Duration of a dash (3x dot)
    intraChar: number // Gap between dots/dashes (1x dot)
    interChar: number // Gap between characters (3x dot)
    interWord: number // Gap between words (7x dot)
  }
  frequency: number // Audio frequency (Hz)
  volume: number // 0-1
}

export interface MorseCodeResult {
  encoded?: string
  decoded?: string
  variant: string
  isValid: boolean
  error?: string
  timing?: {
    totalDuration: number // ms
    charCount: number
    wordCount: number
  }
}

export interface MorseCharacter {
  char: string
  morse: string
  category: 'letter' | 'number' | 'punctuation' | 'prosign'
  audio?: number[] // Audio sample data
}

export class MorseCodeConverter {
  // International Morse Code (ITU)
  private static readonly INTERNATIONAL_MORSE: Record<string, string> = {
    // Letters
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    
    // Numbers
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    
    // Punctuation
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
    '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
    '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
    '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
    '$': '...-..-', '@': '.--.-.', ' ': '/',
  }
  
  // American Morse Code (Railroad Morse)
  private static readonly AMERICAN_MORSE: Record<string, string> = {
    // Letters (some differences from International)
    'A': '.-', 'B': '-...', 'C': '.. .', 'D': '-..', 'E': '.', 'F': '.-..',
    'G': '--.', 'H': '....', 'I': '..', 'J': '-.-. ', 'K': '-.-', 'L': '⸺',
    'M': '--', 'N': '-.', 'O': '. .', 'P': '.....', 'Q': '..-.', 'R': '. ..',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '.-. ',
    'Y': '.. ..', 'Z': '... .',
    
    // Numbers (different pattern)
    '0': '⸺⸺', '1': '.--. ', '2': '..-.', '3': '...-', '4': '....-',
    '5': '---', '6': '......', '7': '--..', '8': '-....', '9': '-..-',
    
    // Limited punctuation
    '.': '..--..', ',': '.-.-', '?': '-..-. ', '!': '---.',
  }
  
  // Prosigns (procedural signals)
  private static readonly PROSIGNS: Record<string, { morse: string; meaning: string }> = {
    'AR': { morse: '.-.-.', meaning: 'End of message' },
    'AS': { morse: '.-...', meaning: 'Stand by' },
    'BK': { morse: '-...-.-', meaning: 'Break' },
    'BT': { morse: '-...-', meaning: 'New paragraph' },
    'CL': { morse: '-.-..-..', meaning: 'Closing' },
    'CT': { morse: '-.-.-', meaning: 'Start copying' },
    'KN': { morse: '-.--.', meaning: 'Specific station only' },
    'SK': { morse: '...-.-', meaning: 'End of contact' },
    'SOS': { morse: '...---...', meaning: 'Distress signal' },
  }
  
  // Default timing based on PARIS standard (50 units)
  private static readonly DEFAULT_TIMING: MorseCodeOptions['spacing'] = {
    dot: 60, // 60ms for a dot at 20 WPM
    dash: 180, // 3x dot
    intraChar: 60, // 1x dot
    interChar: 180, // 3x dot
    interWord: 420, // 7x dot
  }
  
  // Audio context for playback
  private static audioContext: AudioContext | null = null
  
  // Convert text to Morse code
  static encode(
    text: string,
    options: Partial<MorseCodeOptions> = {}
  ): MorseCodeResult {
    const {
      variant = 'international',
      spacing = this.DEFAULT_TIMING,
    } = options
    
    try {
      const morseMap = variant === 'international' 
        ? this.INTERNATIONAL_MORSE 
        : this.AMERICAN_MORSE
      
      const upperText = text.toUpperCase()
      const encoded: string[] = []
      let totalDuration = 0
      let charCount = 0
      let wordCount = 1
      
      for (let i = 0; i < upperText.length; i++) {
        const char = upperText[i]
        
        if (char === ' ') {
          encoded.push('/')
          totalDuration += spacing.interWord
          wordCount++
        } else if (morseMap[char]) {
          encoded.push(morseMap[char])
          charCount++
          
          // Calculate duration
          const morse = morseMap[char]
          for (const symbol of morse) {
            if (symbol === '.') totalDuration += spacing.dot
            else if (symbol === '-') totalDuration += spacing.dash
            else if (symbol === ' ') totalDuration += spacing.intraChar
          }
          
          // Add inter-character spacing
          if (i < upperText.length - 1 && upperText[i + 1] !== ' ') {
            totalDuration += spacing.interChar
          }
        } else {
          // Skip unknown characters
          continue
        }
      }
      
      return {
        encoded: encoded.join(' '),
        variant,
        isValid: true,
        timing: {
          totalDuration,
          charCount,
          wordCount,
        },
      }
    } catch (error) {
      return {
        variant,
        isValid: false,
        error: error instanceof Error ? error.message : 'Encoding failed',
      }
    }
  }
  
  // Convert Morse code to text
  static decode(
    morse: string,
    options: Partial<MorseCodeOptions> = {}
  ): MorseCodeResult {
    const { variant = 'international' } = options
    
    try {
      const morseMap = variant === 'international' 
        ? this.INTERNATIONAL_MORSE 
        : this.AMERICAN_MORSE
      
      // Create reverse mapping
      const reverseMap = new Map<string, string>()
      for (const [char, code] of Object.entries(morseMap)) {
        reverseMap.set(code, char)
      }
      
      // Handle prosigns
      for (const [prosign, data] of Object.entries(this.PROSIGNS)) {
        reverseMap.set(data.morse, `[${prosign}]`)
      }
      
      // Split by word boundaries
      const words = morse.trim().split(/\s+\/\s+/)
      const decoded: string[] = []
      
      for (const word of words) {
        const chars = word.trim().split(/\s+/)
        const decodedWord: string[] = []
        
        for (const morseChar of chars) {
          if (morseChar === '/') {
            decodedWord.push(' ')
          } else if (reverseMap.has(morseChar)) {
            decodedWord.push(reverseMap.get(morseChar)!)
          } else {
            // Unknown Morse code
            decodedWord.push('?')
          }
        }
        
        decoded.push(decodedWord.join(''))
      }
      
      return {
        decoded: decoded.join(' '),
        variant,
        isValid: true,
      }
    } catch (error) {
      return {
        variant,
        isValid: false,
        error: error instanceof Error ? error.message : 'Decoding failed',
      }
    }
  }
  
  // Play Morse code audio
  static async playAudio(
    morse: string,
    options: Partial<MorseCodeOptions> = {}
  ): Promise<void> {
    const {
      spacing = this.DEFAULT_TIMING,
      frequency = 600,
      volume = 0.5,
    } = options
    
    // Initialize audio context
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    const ctx = this.audioContext
    const now = ctx.currentTime
    let time = now
    
    // Parse Morse code and schedule beeps
    const chars = morse.split(' ')
    
    for (const char of chars) {
      if (char === '/') {
        // Word space
        time += spacing.interWord / 1000
      } else {
        // Play character
        for (const symbol of char) {
          if (symbol === '.') {
            this.scheduleBeep(ctx, time, spacing.dot / 1000, frequency, volume)
            time += spacing.dot / 1000
          } else if (symbol === '-') {
            this.scheduleBeep(ctx, time, spacing.dash / 1000, frequency, volume)
            time += spacing.dash / 1000
          }
          
          // Intra-character spacing
          time += spacing.intraChar / 1000
        }
        
        // Inter-character spacing
        time += spacing.interChar / 1000
      }
    }
  }
  
  // Schedule a beep
  private static scheduleBeep(
    ctx: AudioContext,
    startTime: number,
    duration: number,
    frequency: number,
    volume: number
  ): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.setValueAtTime(frequency, startTime)
    oscillator.type = 'sine'
    
    // Envelope to avoid clicks
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + duration - 0.01)
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }
  
  // Generate WAV file
  static generateWAV(
    morse: string,
    options: Partial<MorseCodeOptions> = {}
  ): Blob {
    const {
      spacing = this.DEFAULT_TIMING,
      frequency = 600,
      volume = 0.5,
    } = options
    
    const sampleRate = 44100
    const samples: number[] = []
    
    // Parse Morse code and generate samples
    const chars = morse.split(' ')
    
    for (const char of chars) {
      if (char === '/') {
        // Word space - silence
        const silenceSamples = Math.floor(sampleRate * spacing.interWord / 1000)
        for (let i = 0; i < silenceSamples; i++) {
          samples.push(0)
        }
      } else {
        // Generate character
        for (const symbol of char) {
          if (symbol === '.' || symbol === '-') {
            const duration = symbol === '.' ? spacing.dot : spacing.dash
            const beepSamples = Math.floor(sampleRate * duration / 1000)
            
            // Generate sine wave
            for (let i = 0; i < beepSamples; i++) {
              const t = i / sampleRate
              const sample = Math.sin(2 * Math.PI * frequency * t) * volume
              samples.push(sample)
            }
          }
          
          // Intra-character spacing
          const intraSamples = Math.floor(sampleRate * spacing.intraChar / 1000)
          for (let i = 0; i < intraSamples; i++) {
            samples.push(0)
          }
        }
        
        // Inter-character spacing
        const interSamples = Math.floor(sampleRate * spacing.interChar / 1000)
        for (let i = 0; i < interSamples; i++) {
          samples.push(0)
        }
      }
    }
    
    // Create WAV file
    return this.createWAVFile(samples, sampleRate)
  }
  
  // Create WAV file from samples
  private static createWAVFile(samples: number[], sampleRate: number): Blob {
    const length = samples.length
    const buffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(buffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true) // PCM
    view.setUint16(22, 1, true) // Mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // Byte rate
    view.setUint16(32, 2, true) // Block align
    view.setUint16(34, 16, true) // Bits per sample
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)
    
    // Convert samples to 16-bit PCM
    let offset = 44
    for (const sample of samples) {
      const s = Math.max(-1, Math.min(1, sample))
      view.setInt16(offset, s * 0x7FFF, true)
      offset += 2
    }
    
    return new Blob([buffer], { type: 'audio/wav' })
  }
  
  // Get Morse code reference
  static getMorseReference(
    variant: 'international' | 'american' = 'international'
  ): MorseCharacter[] {
    const morseMap = variant === 'international' 
      ? this.INTERNATIONAL_MORSE 
      : this.AMERICAN_MORSE
    
    const reference: MorseCharacter[] = []
    
    // Add regular characters
    for (const [char, morse] of Object.entries(morseMap)) {
      let category: MorseCharacter['category'] = 'letter'
      
      if (/\d/.test(char)) category = 'number'
      else if (!/[A-Z]/.test(char)) category = 'punctuation'
      
      reference.push({
        char,
        morse,
        category,
      })
    }
    
    // Add prosigns
    for (const [prosign, data] of Object.entries(this.PROSIGNS)) {
      reference.push({
        char: prosign,
        morse: data.morse,
        category: 'prosign',
      })
    }
    
    return reference.sort((a, b) => {
      // Sort by category, then by character
      if (a.category !== b.category) {
        const order = ['letter', 'number', 'punctuation', 'prosign']
        return order.indexOf(a.category) - order.indexOf(b.category)
      }
      return a.char.localeCompare(b.char)
    })
  }
  
  // Calculate WPM from timing
  static calculateWPM(timing: MorseCodeOptions['spacing']): number {
    // PARIS standard: 50 units per word
    const unitTime = timing.dot
    const parisTime = 50 * unitTime // Time for "PARIS" in ms
    const wpm = 60000 / parisTime // Words per minute
    
    return Math.round(wpm)
  }
  
  // Get timing from WPM
  static getTimingFromWPM(wpm: number): MorseCodeOptions['spacing'] {
    // PARIS standard: 50 units per word
    const unitTime = 60000 / (wpm * 50) // ms per unit
    
    return {
      dot: unitTime,
      dash: unitTime * 3,
      intraChar: unitTime,
      interChar: unitTime * 3,
      interWord: unitTime * 7,
    }
  }
  
  // Learning mode helpers
  static generatePracticeText(
    level: 'beginner' | 'intermediate' | 'advanced'
  ): string {
    const texts = {
      beginner: ['SOS', 'HELLO', 'ABC', '123', 'CQ CQ CQ'],
      intermediate: ['THE QUICK BROWN FOX', 'MORSE CODE IS FUN', 'PRACTICE MAKES PERFECT'],
      advanced: ['THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG 1234567890', 
                 'WHAT IS YOUR QTH? MY QTH IS LONDON.',
                 'CQ CQ CQ DE W1AW W1AW W1AW K'],
    }
    
    const options = texts[level]
    return options[Math.floor(Math.random() * options.length)]
  }
}

// Export convenience functions
export const textToMorse = (text: string, options?: Partial<MorseCodeOptions>) =>
  MorseCodeConverter.encode(text, options)

export const morseToText = (morse: string, options?: Partial<MorseCodeOptions>) =>
  MorseCodeConverter.decode(morse, options)

export const playMorse = (morse: string, options?: Partial<MorseCodeOptions>) =>
  MorseCodeConverter.playAudio(morse, options)

export const getMorseReference = (variant?: 'international' | 'american') =>
  MorseCodeConverter.getMorseReference(variant)
```

### 2. Create Morse Code Tool Component

#### Create `src/components/tools/encoding/morse-code-tool.tsx`
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
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Radio,
  Volume2,
  Lightbulb,
  PlayCircle,
  PauseCircle,
  BookOpen,
  Zap,
  Info
} from 'lucide-react'
import {
  MorseCodeConverter,
  MorseCodeOptions,
  MorseCodeResult,
  MorseCharacter,
  textToMorse,
  morseToText,
  playMorse,
  getMorseReference
} from '@/lib/encoding/morse-code'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function MorseCodeTool() {
  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode')
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [variant, setVariant] = React.useState<'international' | 'american'>('international')
  const [wpm, setWpm] = React.useState(20)
  const [frequency, setFrequency] = React.useState(600)
  const [volume, setVolume] = React.useState(0.5)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [showLight, setShowLight] = React.useState(false)
  const [practiceLevel, setPracticeLevel] = React.useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [referenceSearch, setReferenceSearch] = React.useState('')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'morse-code',
    toolName: 'Morse Code Converter',
    category: 'encoding',
  })
  
  // Get timing from WPM
  const timing = React.useMemo(() => 
    MorseCodeConverter.getTimingFromWPM(wpm),
    [wpm]
  )
  
  // Get Morse reference
  const morseReference = React.useMemo(() => {
    const all = getMorseReference(variant)
    
    if (!referenceSearch) return all
    
    const search = referenceSearch.toUpperCase()
    return all.filter(item => 
      item.char.includes(search) || 
      item.morse.includes(search)
    )
  }, [variant, referenceSearch])
  
  // Process encoding/decoding
  React.useEffect(() => {
    if (!input) {
      setOutput('')
      return
    }
    
    trackStart(input)
    
    const options: Partial<MorseCodeOptions> = {
      variant,
      spacing: timing,
    }
    
    let result: MorseCodeResult
    
    if (mode === 'encode') {
      result = textToMorse(input, options)
    } else {
      result = morseToText(input, options)
    }
    
    if (result.isValid) {
      setOutput(result.encoded || result.decoded || '')
      trackComplete(input, result.encoded || result.decoded || '')
    } else {
      setOutput('')
      toast({
        title: 'Conversion failed',
        description: result.error,
        variant: 'destructive',
      })
    }
  }, [input, mode, variant, timing, trackStart, trackComplete, toast])
  
  const handlePlay = async () => {
    if (!output || mode !== 'encode') return
    
    setIsPlaying(true)
    trackFeature('play_audio')
    
    try {
      await playMorse(output, {
        spacing: timing,
        frequency,
        volume,
      })
    } catch (error) {
      toast({
        title: 'Playback failed',
        description: 'Could not play audio',
        variant: 'destructive',
      })
    } finally {
      setIsPlaying(false)
    }
  }
  
  const handleDownloadWAV = () => {
    if (!output || mode !== 'encode') return
    
    trackFeature('download_wav')
    
    const blob = MorseCodeConverter.generateWAV(output, {
      spacing: timing,
      frequency,
      volume,
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'morse-code.wav'
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Downloaded!',
      description: 'Morse code audio saved as WAV file',
    })
  }
  
  const handlePractice = () => {
    const text = MorseCodeConverter.generatePracticeText(practiceLevel)
    setInput(text)
    setMode('encode')
    
    trackFeature('practice_mode', { level: practiceLevel })
  }
  
  const renderVisualMorse = () => {
    if (!output || mode !== 'encode') return null
    
    return output.split('').map((char, i) => {
      if (char === '.') {
        return (
          <span
            key={i}
            className="inline-block w-2 h-2 bg-primary rounded-full mx-1"
          />
        )
      } else if (char === '-') {
        return (
          <span
            key={i}
            className="inline-block w-8 h-2 bg-primary rounded-full mx-1"
          />
        )
      } else if (char === ' ') {
        return <span key={i} className="inline-block w-4" />
      } else if (char === '/') {
        return <span key={i} className="inline-block w-8" />
      }
      return null
    })
  }
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Morse Code Converter
          </CardTitle>
          <CardDescription>
            Convert text to Morse code and back with audio playback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="convert" className="w-full">
            <TabsList>
              <TabsTrigger value="convert">Convert</TabsTrigger>
              <TabsTrigger value="settings">
                Settings
              </TabsTrigger>
              <TabsTrigger value="reference">
                <BookOpen className="h-4 w-4 mr-2" />
                Reference
              </TabsTrigger>
              <TabsTrigger value="practice">
                <Zap className="h-4 w-4 mr-2" />
                Practice
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="convert" className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={mode} onValueChange={setMode as any}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encode">Text to Morse</SelectItem>
                    <SelectItem value="decode">Morse to Text</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={variant} onValueChange={setVariant as any}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="international">International (ITU)</SelectItem>
                    <SelectItem value="american">American (Railroad)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="input">
                  {mode === 'encode' ? 'Text to convert' : 'Morse code to decode'}
                </Label>
                <Textarea
                  id="input"
                  placeholder={mode === 'encode' 
                    ? 'Enter text to convert to Morse code...' 
                    : 'Enter Morse code (use . and - with spaces)...'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[150px] font-mono"
                />
                <CounterDisplay
                  current={input.length}
                  label="characters"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Speed: {wpm} WPM</Label>
                  <Slider
                    min={5}
                    max={50}
                    step={1}
                    value={[wpm]}
                    onValueChange={([value]) => setWpm(value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Words per minute (PARIS standard)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Frequency: {frequency} Hz</Label>
                  <Slider
                    min={300}
                    max={1200}
                    step={50}
                    value={[frequency]}
                    onValueChange={([value]) => setFrequency(value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Audio tone frequency
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Volume: {Math.round(volume * 100)}%</Label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[volume]}
                    onValueChange={([value]) => setVolume(value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Visual Options</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="light"
                      checked={showLight}
                      onCheckedChange={setShowLight}
                    />
                    <Label htmlFor="light" className="font-normal">
                      Show light signal
                    </Label>
                  </div>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Timing: Dot = {timing.dot}ms, Dash = {timing.dash}ms, 
                  Letter gap = {timing.interChar}ms, Word gap = {timing.interWord}ms
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="reference" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search reference</Label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search character or Morse code..."
                  value={referenceSearch}
                  onChange={(e) => setReferenceSearch(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Character</TableHead>
                      <TableHead>Morse Code</TableHead>
                      <TableHead>Visual</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {morseReference.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono font-bold">
                          {item.char}
                        </TableCell>
                        <TableCell className="font-mono">
                          {item.morse}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {item.morse.split('').map((char, i) => {
                              if (char === '.') {
                                return (
                                  <span
                                    key={i}
                                    className="inline-block w-1.5 h-1.5 bg-foreground rounded-full mx-0.5"
                                  />
                                )
                              } else if (char === '-') {
                                return (
                                  <span
                                    key={i}
                                    className="inline-block w-4 h-1.5 bg-foreground rounded-full mx-0.5"
                                  />
                                )
                              }
                              return <span key={i} className="inline-block w-2" />
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="practice" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Practice Level</Label>
                  <Select value={practiceLevel} onValueChange={setPracticeLevel as any}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (Short words)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Sentences)</SelectItem>
                      <SelectItem value="advanced">Advanced (Full messages)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handlePractice} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Practice Text
                </Button>
                
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Practice by converting the generated text to Morse code, 
                    then try to decode it back without looking at the original!
                  </AlertDescription>
                </Alert>
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
              {mode === 'encode' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlay}
                    disabled={isPlaying}
                  >
                    {isPlaying ? (
                      <>
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadWAV}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    WAV
                  </Button>
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
            
            {mode === 'encode' && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm mb-2 block">Visual Representation</Label>
                  <div className="flex items-center flex-wrap">
                    {renderVisualMorse()}
                  </div>
                </div>
                
                {showLight && (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <Label className="text-sm mb-2 block">Light Signal</Label>
                    <div
                      className={cn(
                        "w-20 h-20 rounded-full mx-auto transition-colors",
                        isPlaying ? "bg-yellow-400" : "bg-gray-300"
                      )}
                    />
                  </div>
                )}
              </div>
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
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/morse-code/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { MorseCodeTool } from '@/components/tools/encoding/morse-code-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.morseCode' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['morse code', 'morse converter', 'morse audio', 'dit dah', 'telegraph'],
    locale,
    path: '/tools/morse-code',
  })
}

export default function MorseCodePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="morse-code"
      locale={locale}
    >
      <MorseCodeTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test text to Morse conversion
2. Verify Morse to text decoding
3. Test audio playback at different speeds
4. Check WAV file generation
5. Verify visual representations
6. Test practice mode

## Notes
- Support for International and American Morse
- Audio playback with Web Audio API
- WAV file export functionality
- Visual dot/dash representation
- Practice mode for learning