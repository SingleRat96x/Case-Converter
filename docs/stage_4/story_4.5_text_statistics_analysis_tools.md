# Story 4.5: Text Statistics & Analysis Tools

## Story Details
- **Stage**: 4 - Core Text Tools Implementation
- **Priority**: Medium
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 4.4 (Text Generator Tools)

## Objective
Implement comprehensive text statistics and analysis tools that provide detailed insights about text content including character counts, word frequency, readability scores, and linguistic analysis. These tools should support multiple languages and provide actionable insights.

## Acceptance Criteria
- [ ] Character/word/sentence/paragraph counter
- [ ] Word frequency analyzer
- [ ] Reading time estimator
- [ ] Readability score calculators (Flesch, SMOG, etc.)
- [ ] Language detection
- [ ] Text density analyzer
- [ ] Keyword density checker
- [ ] Character frequency distribution
- [ ] Syllable counter
- [ ] Unique word counter
- [ ] Export statistics as JSON/CSV
- [ ] Real-time analysis updates

## Implementation Steps

### 1. Create Text Analysis Utilities

#### Create `src/lib/analysis/text-analyzers.ts`
```typescript
/**
 * Text analysis and statistics utilities
 */

// Language detection library would be imported here
// import { detect } from 'langdetect'

export const analyzers = {
  // Basic Statistics
  basicStats: {
    countCharacters: (text: string, includeSpaces = true): number => {
      return includeSpaces ? text.length : text.replace(/\s/g, '').length
    },

    countWords: (text: string): number => {
      if (!text.trim()) return 0
      // Split by whitespace and filter out empty strings
      return text.trim().split(/\s+/).filter(word => word.length > 0).length
    },

    countSentences: (text: string): number => {
      if (!text.trim()) return 0
      // Split by sentence-ending punctuation
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      return sentences.length
    },

    countParagraphs: (text: string): number => {
      if (!text.trim()) return 0
      // Split by double line breaks
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      return paragraphs.length
    },

    countLines: (text: string): number => {
      if (!text) return 0
      return text.split('\n').length
    },

    countSyllables: (word: string): number => {
      // Simple syllable counting algorithm
      word = word.toLowerCase().replace(/[^a-z]/g, '')
      if (word.length <= 3) return 1
      
      // Count vowel groups
      let syllables = word.match(/[aeiouy]+/g)?.length || 0
      
      // Subtract silent e
      if (word.endsWith('e') && syllables > 1) {
        syllables--
      }
      
      // Handle special cases
      if (word.endsWith('le') && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) {
        syllables++
      }
      
      return Math.max(1, syllables)
    },

    averageWordLength: (text: string): number => {
      const words = text.trim().split(/\s+/).filter(word => word.length > 0)
      if (words.length === 0) return 0
      
      const totalLength = words.reduce((sum, word) => sum + word.length, 0)
      return parseFloat((totalLength / words.length).toFixed(2))
    },

    averageSentenceLength: (text: string): number => {
      const words = analyzers.basicStats.countWords(text)
      const sentences = analyzers.basicStats.countSentences(text)
      
      if (sentences === 0) return 0
      return parseFloat((words / sentences).toFixed(2))
    },
  },

  // Word Frequency Analysis
  wordFrequency: {
    analyze: (text: string, options?: {
      caseSensitive?: boolean
      minLength?: number
      maxResults?: number
      excludeCommon?: boolean
    }): Array<{ word: string; count: number; percentage: number }> => {
      const { 
        caseSensitive = false, 
        minLength = 1,
        maxResults = 50,
        excludeCommon = false
      } = options || {}

      // Common words to exclude (stop words)
      const commonWords = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
        'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
        'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
        'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
        'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
        'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work'
      ])

      // Extract words
      const words = text.match(/\b[\w']+\b/g) || []
      const processedWords = words
        .map(word => caseSensitive ? word : word.toLowerCase())
        .filter(word => word.length >= minLength)
        .filter(word => !excludeCommon || !commonWords.has(word.toLowerCase()))

      // Count frequencies
      const frequency: Record<string, number> = {}
      processedWords.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1
      })

      // Convert to array and sort
      const total = processedWords.length
      const results = Object.entries(frequency)
        .map(([word, count]) => ({
          word,
          count,
          percentage: parseFloat(((count / total) * 100).toFixed(2))
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, maxResults)

      return results
    },

    getUniqueWords: (text: string): string[] => {
      const words = text.match(/\b[\w']+\b/g) || []
      return [...new Set(words.map(w => w.toLowerCase()))]
    },

    countUniqueWords: (text: string): number => {
      return analyzers.wordFrequency.getUniqueWords(text).length
    },
  },

  // Character Analysis
  characterFrequency: {
    analyze: (text: string, includeWhitespace = false): Array<{
      char: string
      count: number
      percentage: number
    }> => {
      const chars = includeWhitespace ? text.split('') : text.replace(/\s/g, '').split('')
      const frequency: Record<string, number> = {}
      
      chars.forEach(char => {
        frequency[char] = (frequency[char] || 0) + 1
      })

      const total = chars.length
      return Object.entries(frequency)
        .map(([char, count]) => ({
          char,
          count,
          percentage: parseFloat(((count / total) * 100).toFixed(2))
        }))
        .sort((a, b) => b.count - a.count)
    },

    getCharacterTypes: (text: string): {
      letters: number
      digits: number
      spaces: number
      punctuation: number
      other: number
    } => {
      const types = {
        letters: 0,
        digits: 0,
        spaces: 0,
        punctuation: 0,
        other: 0,
      }

      for (const char of text) {
        if (/[a-zA-Z]/.test(char)) types.letters++
        else if (/\d/.test(char)) types.digits++
        else if (/\s/.test(char)) types.spaces++
        else if (/[.,!?;:'"-]/.test(char)) types.punctuation++
        else types.other++
      }

      return types
    },
  },

  // Readability Scores
  readability: {
    // Flesch Reading Ease Score
    fleschReadingEase: (text: string): number => {
      const sentences = analyzers.basicStats.countSentences(text)
      const words = analyzers.basicStats.countWords(text)
      const syllables = text
        .split(/\s+/)
        .filter(w => w.length > 0)
        .reduce((sum, word) => sum + analyzers.basicStats.countSyllables(word), 0)

      if (sentences === 0 || words === 0) return 0

      const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
      return Math.max(0, Math.min(100, parseFloat(score.toFixed(2))))
    },

    // Flesch-Kincaid Grade Level
    fleschKincaidGrade: (text: string): number => {
      const sentences = analyzers.basicStats.countSentences(text)
      const words = analyzers.basicStats.countWords(text)
      const syllables = text
        .split(/\s+/)
        .filter(w => w.length > 0)
        .reduce((sum, word) => sum + analyzers.basicStats.countSyllables(word), 0)

      if (sentences === 0 || words === 0) return 0

      const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
      return Math.max(0, parseFloat(grade.toFixed(1)))
    },

    // Gunning Fog Index
    gunningFog: (text: string): number => {
      const sentences = analyzers.basicStats.countSentences(text)
      const words = analyzers.basicStats.countWords(text)
      const complexWords = text
        .split(/\s+/)
        .filter(w => w.length > 0 && analyzers.basicStats.countSyllables(w) >= 3)
        .length

      if (sentences === 0 || words === 0) return 0

      const fog = 0.4 * ((words / sentences) + 100 * (complexWords / words))
      return parseFloat(fog.toFixed(1))
    },

    // SMOG (Simple Measure of Gobbledygook)
    smog: (text: string): number => {
      const sentences = analyzers.basicStats.countSentences(text)
      if (sentences < 30) return 0 // SMOG requires at least 30 sentences

      const polysyllables = text
        .split(/\s+/)
        .filter(w => w.length > 0 && analyzers.basicStats.countSyllables(w) >= 3)
        .length

      const smog = 1.0430 * Math.sqrt(polysyllables * (30 / sentences)) + 3.1291
      return parseFloat(smog.toFixed(1))
    },

    // Coleman-Liau Index
    colemanLiau: (text: string): number => {
      const chars = analyzers.basicStats.countCharacters(text, false)
      const words = analyzers.basicStats.countWords(text)
      const sentences = analyzers.basicStats.countSentences(text)

      if (words === 0 || sentences === 0) return 0

      const L = (chars / words) * 100 // Average letters per 100 words
      const S = (sentences / words) * 100 // Average sentences per 100 words

      const cli = 0.0588 * L - 0.296 * S - 15.8
      return parseFloat(cli.toFixed(1))
    },

    interpretScore: (scoreName: string, score: number): {
      level: string
      description: string
      ageRange?: string
    } => {
      switch (scoreName) {
        case 'fleschReadingEase':
          if (score >= 90) return { level: 'Very Easy', description: 'Very easy to read', ageRange: '5th grade' }
          if (score >= 80) return { level: 'Easy', description: 'Easy to read', ageRange: '6th grade' }
          if (score >= 70) return { level: 'Fairly Easy', description: 'Fairly easy to read', ageRange: '7th grade' }
          if (score >= 60) return { level: 'Standard', description: 'Standard difficulty', ageRange: '8th-9th grade' }
          if (score >= 50) return { level: 'Fairly Difficult', description: 'Fairly difficult to read', ageRange: '10th-12th grade' }
          if (score >= 30) return { level: 'Difficult', description: 'Difficult to read', ageRange: 'College' }
          return { level: 'Very Difficult', description: 'Very difficult to read', ageRange: 'College graduate' }
        
        default:
          // For grade-level scores
          if (score < 6) return { level: 'Elementary', description: 'Elementary school level' }
          if (score < 9) return { level: 'Middle School', description: 'Middle school level' }
          if (score < 13) return { level: 'High School', description: 'High school level' }
          if (score < 16) return { level: 'College', description: 'College level' }
          return { level: 'Graduate', description: 'Graduate level' }
      }
    },
  },

  // Reading Time Estimation
  readingTime: {
    estimate: (text: string, wordsPerMinute = 200): {
      minutes: number
      seconds: number
      formatted: string
    } => {
      const words = analyzers.basicStats.countWords(text)
      const totalSeconds = Math.ceil((words / wordsPerMinute) * 60)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      let formatted = ''
      if (minutes > 0) {
        formatted = `${minutes} min`
        if (seconds > 0) formatted += ` ${seconds} sec`
      } else {
        formatted = `${seconds} sec`
      }

      return { minutes, seconds, formatted }
    },

    estimateSpeakingTime: (text: string, wordsPerMinute = 150): {
      minutes: number
      seconds: number
      formatted: string
    } => {
      return analyzers.readingTime.estimate(text, wordsPerMinute)
    },
  },

  // Keyword Density
  keywordDensity: {
    analyze: (text: string, keywords: string[]): Array<{
      keyword: string
      count: number
      density: number
    }> => {
      const lowerText = text.toLowerCase()
      const wordCount = analyzers.basicStats.countWords(text)

      return keywords.map(keyword => {
        const lowerKeyword = keyword.toLowerCase()
        const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'gi')
        const matches = text.match(regex) || []
        const count = matches.length
        const density = wordCount > 0 ? (count / wordCount) * 100 : 0

        return {
          keyword,
          count,
          density: parseFloat(density.toFixed(2))
        }
      })
    },
  },

  // Language Detection (simplified - would use a library in production)
  language: {
    detect: (text: string): {
      language: string
      confidence: number
    } => {
      // Simplified language detection based on common words
      const languagePatterns = {
        english: /\b(the|and|of|to|in|is|it|that|with|for)\b/gi,
        french: /\b(le|la|de|et|un|une|est|dans|pour|que)\b/gi,
        russian: /[а-яА-Я]/,
        italian: /\b(il|la|di|e|un|una|che|per|con|non)\b/gi,
      }

      const scores: Record<string, number> = {}
      
      for (const [lang, pattern] of Object.entries(languagePatterns)) {
        const matches = text.match(pattern) || []
        scores[lang] = matches.length
      }

      const maxScore = Math.max(...Object.values(scores))
      const detectedLang = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'unknown'
      
      const confidence = maxScore > 10 ? 0.9 : maxScore > 5 ? 0.7 : 0.5

      return {
        language: detectedLang,
        confidence: parseFloat(confidence.toFixed(2))
      }
    },
  },

  // Complete Analysis
  fullAnalysis: (text: string): {
    basicStats: any
    readability: any
    wordFrequency: any
    characterTypes: any
    readingTime: any
    language: any
  } => {
    return {
      basicStats: {
        characters: analyzers.basicStats.countCharacters(text),
        charactersNoSpaces: analyzers.basicStats.countCharacters(text, false),
        words: analyzers.basicStats.countWords(text),
        uniqueWords: analyzers.wordFrequency.countUniqueWords(text),
        sentences: analyzers.basicStats.countSentences(text),
        paragraphs: analyzers.basicStats.countParagraphs(text),
        lines: analyzers.basicStats.countLines(text),
        averageWordLength: analyzers.basicStats.averageWordLength(text),
        averageSentenceLength: analyzers.basicStats.averageSentenceLength(text),
      },
      readability: {
        fleschReadingEase: analyzers.readability.fleschReadingEase(text),
        fleschKincaidGrade: analyzers.readability.fleschKincaidGrade(text),
        gunningFog: analyzers.readability.gunningFog(text),
        colemanLiau: analyzers.readability.colemanLiau(text),
      },
      wordFrequency: analyzers.wordFrequency.analyze(text, { maxResults: 10 }),
      characterTypes: analyzers.characterFrequency.getCharacterTypes(text),
      readingTime: analyzers.readingTime.estimate(text),
      language: analyzers.language.detect(text),
    }
  },
}

// Export functions
export function exportAnalysis(analysis: any, format: 'json' | 'csv'): string {
  if (format === 'json') {
    return JSON.stringify(analysis, null, 2)
  } else {
    // CSV export (simplified)
    const rows: string[] = ['Metric,Value']
    
    const flattenObject = (obj: any, prefix = ''): void => {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenObject(value, newKey)
        } else {
          rows.push(`"${newKey}","${value}"`)
        }
      }
    }
    
    flattenObject(analysis)
    return rows.join('\n')
  }
}
```

### 2. Create Text Analysis Components

#### Create `src/components/tools/analysis/text-statistics-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { BarChart3, Download } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { ToolInput } from '@/components/tools/tool-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { analyzers, exportAnalysis } from '@/lib/analysis/text-analyzers'
import { ToolCategory } from '@/types/tool'
import { saveAs } from 'file-saver'

const tool = {
  id: 'text-statistics',
  name: 'Text Statistics & Analysis',
  description: 'Comprehensive text analysis with readability scores and statistics',
  category: ToolCategory.ANALYSIS,
  icon: BarChart3,
  keywords: ['statistics', 'analysis', 'readability', 'word count'],
  component: null,
}

export function TextStatisticsTool() {
  const t = useTranslations('tools.textStatistics')
  const [input, setInput] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('overview')
  
  const analysis = React.useMemo(() => {
    if (!input) return null
    return analyzers.fullAnalysis(input)
  }, [input])

  const exportData = (format: 'json' | 'csv') => {
    if (!analysis) return
    
    const data = exportAnalysis(analysis, format)
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    })
    saveAs(blob, `text-analysis.${format}`)
  }

  const StatCard = ({ 
    title, 
    value, 
    subtitle 
  }: { 
    title: string
    value: string | number
    subtitle?: string 
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolInput
          value={input}
          onChange={setInput}
          placeholder={t('inputPlaceholder')}
          rows={8}
        />
        
        {analysis && (
          <>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData('json')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                <TabsTrigger value="readability">{t('readability')}</TabsTrigger>
                <TabsTrigger value="frequency">{t('frequency')}</TabsTrigger>
                <TabsTrigger value="details">{t('details')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title={t('characters')}
                    value={analysis.basicStats.characters.toLocaleString()}
                    subtitle={`${analysis.basicStats.charactersNoSpaces.toLocaleString()} without spaces`}
                  />
                  <StatCard
                    title={t('words')}
                    value={analysis.basicStats.words.toLocaleString()}
                    subtitle={`${analysis.basicStats.uniqueWords.toLocaleString()} unique`}
                  />
                  <StatCard
                    title={t('sentences')}
                    value={analysis.basicStats.sentences.toLocaleString()}
                    subtitle={`~${analysis.basicStats.averageSentenceLength} words/sentence`}
                  />
                  <StatCard
                    title={t('readingTime')}
                    value={analysis.readingTime.formatted}
                    subtitle="At 200 WPM"
                  />
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('characterTypes')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analysis.characterTypes).map(([type, count]) => (
                        <div key={type}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{type}</span>
                            <span>{count as number}</span>
                          </div>
                          <Progress 
                            value={(count as number / analysis.basicStats.characters) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="readability" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(analysis.readability).map(([scoreName, score]) => {
                    const interpretation = analyzers.readability.interpretScore(
                      scoreName, 
                      score as number
                    )
                    
                    return (
                      <Card key={scoreName}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {t(`scores.${scoreName}`)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">{score}</div>
                          <p className="text-sm text-muted-foreground">
                            {interpretation.level}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {interpretation.description}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="frequency" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('topWords')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.wordFrequency.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{item.word}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {item.count} ({item.percentage}%)
                            </span>
                            <Progress 
                              value={item.percentage} 
                              className="w-24 h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('textMetrics')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">{t('paragraphs')}</dt>
                          <dd className="text-sm font-medium">{analysis.basicStats.paragraphs}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">{t('lines')}</dt>
                          <dd className="text-sm font-medium">{analysis.basicStats.lines}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">{t('avgWordLength')}</dt>
                          <dd className="text-sm font-medium">{analysis.basicStats.averageWordLength}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('language')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-medium capitalize">
                        {analysis.language.language}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('confidence')}: {(analysis.language.confidence * 100).toFixed(0)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
```

### 3. Update Translations

Add to `src/i18n/locales/en/tools.json`:
```json
{
  "textStatistics": {
    "inputPlaceholder": "Enter or paste text to analyze",
    "overview": "Overview",
    "readability": "Readability",
    "frequency": "Word Frequency",
    "details": "Details",
    "characters": "Characters",
    "words": "Words",
    "sentences": "Sentences",
    "readingTime": "Reading Time",
    "characterTypes": "Character Types",
    "scores": {
      "fleschReadingEase": "Flesch Reading Ease",
      "fleschKincaidGrade": "Flesch-Kincaid Grade",
      "gunningFog": "Gunning Fog Index",
      "colemanLiau": "Coleman-Liau Index"
    },
    "topWords": "Top Words",
    "textMetrics": "Text Metrics",
    "paragraphs": "Paragraphs",
    "lines": "Lines",
    "avgWordLength": "Avg Word Length",
    "language": "Language",
    "confidence": "Confidence"
  }
}
```

## Testing & Verification

1. Test with various text lengths and languages
2. Verify readability score accuracy
3. Test word frequency analysis
4. Check export functionality
5. Verify real-time updates

## Success Indicators
- ✅ All statistics calculate correctly
- ✅ Readability scores are accurate
- ✅ Real-time analysis updates
- ✅ Export functionality works
- ✅ Multi-language support

## Next Steps
Proceed to Story 4.6: Advanced Text Manipulation Tools

## Notes
- Consider adding more readability formulas
- Add visualization charts
- Consider caching for performance
- Add text comparison tools