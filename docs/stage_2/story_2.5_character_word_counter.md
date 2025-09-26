# Story 2.5: Character/Word Counter Components

## Story Details
- **Stage**: 2 - Core Features & Shared Components
- **Priority**: Medium
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Story 2.4 (Copy to Clipboard & Action Buttons)

## Objective
Create comprehensive text statistics components that provide real-time character, word, line, and sentence counting with additional metrics like reading time, paragraph count, and language detection.

## Acceptance Criteria
- [ ] Real-time character counting (with/without spaces)
- [ ] Accurate word counting for multiple languages
- [ ] Line and paragraph counting
- [ ] Sentence detection
- [ ] Reading time estimation
- [ ] Language detection
- [ ] Performance optimization for large texts
- [ ] Customizable display options
- [ ] Mobile-responsive layout
- [ ] Support for RTL languages

## Implementation Steps

### 1. Create Text Statistics Types

#### Create `src/types/text-stats.ts`
```typescript
export interface TextStatistics {
  characters: number
  charactersNoSpaces: number
  words: number
  lines: number
  sentences: number
  paragraphs: number
  averageWordLength: number
  averageSentenceLength: number
  readingTime: ReadingTime
  languageInfo?: LanguageInfo
}

export interface ReadingTime {
  minutes: number
  seconds: number
  words: number
  text: string
}

export interface LanguageInfo {
  code: string
  name: string
  confidence: number
  isRTL: boolean
}

export interface CounterDisplayOptions {
  showCharacters?: boolean
  showCharactersNoSpaces?: boolean
  showWords?: boolean
  showLines?: boolean
  showSentences?: boolean
  showParagraphs?: boolean
  showReadingTime?: boolean
  showLanguage?: boolean
  compact?: boolean
  inline?: boolean
}
```

### 2. Create Text Analysis Utilities

#### Create `src/lib/text-analyzer.ts`
```typescript
import { TextStatistics, ReadingTime, LanguageInfo } from '@/types/text-stats'

export class TextAnalyzer {
  analyze(text: string): TextStatistics {
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = this.countWords(text)
    const lines = this.countLines(text)
    const sentences = this.countSentences(text)
    const paragraphs = this.countParagraphs(text)
    const averageWordLength = words > 0 ? charactersNoSpaces / words : 0
    const averageSentenceLength = sentences > 0 ? words / sentences : 0
    const readingTime = this.calculateReadingTime(words)
    const languageInfo = this.detectLanguage(text)

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      averageWordLength: Math.round(averageWordLength * 10) / 10,
      averageSentenceLength: Math.round(averageSentenceLength * 10) / 10,
      readingTime,
      languageInfo,
    }
  }

  private countWords(text: string): number {
    if (!text.trim()) return 0
    const cjkMatch = text.match(/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g)
    const cjkCount = cjkMatch ? cjkMatch.length : 0
    const nonCjkText = text.replace(/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g, ' ')
    const words = nonCjkText.trim().split(/\s+/).filter(word => word.length > 0)
    return words.length + cjkCount
  }

  private countLines(text: string): number {
    if (!text) return 0
    return text.split('\n').length
  }

  private countSentences(text: string): number {
    if (!text.trim()) return 0
    const sentences = text.match(/[^.!?]+[.!?]+/g) || []
    return sentences.length || (text.trim().length > 0 ? 1 : 0)
  }

  private countParagraphs(text: string): number {
    if (!text.trim()) return 0
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    return paragraphs.length || (text.trim().length > 0 ? 1 : 0)
  }

  private calculateReadingTime(words: number): ReadingTime {
    const wordsPerMinute = 200
    const minutes = Math.floor(words / wordsPerMinute)
    const seconds = Math.round((words % wordsPerMinute) / wordsPerMinute * 60)
    
    let text = ''
    if (minutes > 0) {
      text = `${minutes} min read`
    } else if (seconds > 30) {
      text = '1 min read'
    } else {
      text = 'Less than 1 min'
    }
    
    return { minutes, seconds, words, text }
  }

  private detectLanguage(text: string): LanguageInfo | undefined {
    const patterns = {
      en: /\b(the|and|of|to|in|is|it)\b/gi,
      fr: /\b(le|la|de|et|un|une|est)\b/gi,
      ru: /[\u0400-\u04FF]/g,
      it: /\b(il|la|di|e|un|una|che)\b/gi,
    }

    let detectedLang = 'en'
    let highestScore = 0

    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern)
      const score = matches ? matches.length : 0
      if (score > highestScore) {
        highestScore = score
        detectedLang = lang
      }
    }

    const names = { en: 'English', fr: 'French', ru: 'Russian', it: 'Italian' }
    const rtlLanguages = ['ar', 'he', 'fa']

    return {
      code: detectedLang,
      name: names[detectedLang as keyof typeof names] || 'Unknown',
      confidence: 0.8,
      isRTL: rtlLanguages.includes(detectedLang),
    }
  }
}

export const textAnalyzer = new TextAnalyzer()
```

### 3. Create Text Counter Component

#### Update `src/components/ui/text-counter.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { textAnalyzer } from '@/lib/text-analyzer'
import { TextStatistics, CounterDisplayOptions } from '@/types/text-stats'
import { Hash, FileText, Clock, Globe } from 'lucide-react'

export interface TextCounterProps {
  text: string
  options?: CounterDisplayOptions
  className?: string
}

export function TextCounter({ text, options = {}, className }: TextCounterProps) {
  const t = useTranslations('common.stats')
  const [stats, setStats] = React.useState<TextStatistics | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const newStats = textAnalyzer.analyze(text)
      setStats(newStats)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [text])

  if (!stats) return null

  const displayOptions = {
    showCharacters: options.showCharacters ?? true,
    showWords: options.showWords ?? true,
    showLines: options.showLines ?? true,
    showReadingTime: options.showReadingTime ?? false,
    compact: options.compact ?? false,
  }

  if (displayOptions.compact) {
    return (
      <div className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
        {displayOptions.showCharacters && (
          <span>{stats.characters} {t('chars')}</span>
        )}
        {displayOptions.showWords && (
          <span>{stats.words} {t('words')}</span>
        )}
        {displayOptions.showLines && (
          <span>{stats.lines} {t('lines')}</span>
        )}
      </div>
    )
  }

  const statItems = [
    {
      show: displayOptions.showCharacters,
      icon: Hash,
      label: t('characters'),
      value: stats.characters.toLocaleString(),
    },
    {
      show: displayOptions.showWords,
      icon: FileText,
      label: t('words'),
      value: stats.words.toLocaleString(),
    },
    {
      show: displayOptions.showLines,
      icon: FileText,
      label: t('lines'),
      value: stats.lines.toLocaleString(),
    },
    {
      show: displayOptions.showReadingTime,
      icon: Clock,
      label: t('readingTime'),
      value: stats.readingTime.text,
    },
  ].filter(item => item.show)

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {statItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <item.icon className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium text-sm">{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 4. Create Real-time Counter Hook

#### Create `src/hooks/use-text-stats.ts`
```typescript
import * as React from 'react'
import { textAnalyzer } from '@/lib/text-analyzer'
import { TextStatistics } from '@/types/text-stats'

export function useTextStats(text: string, debounceMs: number = 300) {
  const [stats, setStats] = React.useState<TextStatistics | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  React.useEffect(() => {
    setIsAnalyzing(true)
    
    const timer = setTimeout(() => {
      const newStats = textAnalyzer.analyze(text)
      setStats(newStats)
      setIsAnalyzing(false)
    }, debounceMs)
    
    return () => clearTimeout(timer)
  }, [text, debounceMs])

  return { stats, isAnalyzing }
}
```

### 5. Update Translations

Add to `src/i18n/locales/en/common.json`:
```json
{
  "stats": {
    "characters": "Characters",
    "chars": "chars",
    "words": "Words",
    "lines": "Lines",
    "sentences": "Sentences",
    "paragraphs": "Paragraphs",
    "readingTime": "Reading Time"
  }
}
```

## Testing & Verification

1. Test with various text samples
2. Verify multi-language word counting
3. Test performance with large texts
4. Check mobile responsiveness

## Success Indicators
- ✅ Accurate counting for all metrics
- ✅ Multi-language support
- ✅ Real-time updates
- ✅ Performance optimized
- ✅ Mobile responsive

## Next Steps
Proceed to Story 2.6: Tool Card Components

## Notes
- Consider web workers for large texts
- Add unit tests for text analyzer
- Monitor performance metrics