# Story 4.6: Advanced Text Manipulation Tools

## Story Details
- **Stage**: 4 - Core Text Tools Implementation
- **Priority**: Medium
- **Estimated Hours**: 4-5 hours
- **Dependencies**: Story 4.5 (Text Statistics & Analysis Tools)

## Objective
Implement advanced text manipulation tools that handle complex transformations including text diff/comparison, JSON/XML formatting, CSV manipulation, text extraction, and other sophisticated text operations. These tools should provide powerful features for developers and content creators.

## Acceptance Criteria
- [ ] Text diff/comparison tool
- [ ] JSON formatter/validator
- [ ] XML formatter/validator
- [ ] CSV to JSON converter
- [ ] JSON to CSV converter
- [ ] Text extractor (URLs, emails, phone numbers)
- [ ] Markdown to HTML converter
- [ ] HTML to Markdown converter
- [ ] SQL formatter
- [ ] Code beautifier (multiple languages)
- [ ] Text merger/combiner
- [ ] Column extractor/manipulator

## Implementation Steps

### 1. Create Advanced Text Manipulation Utilities

#### Create `src/lib/advanced/text-manipulators.ts`
```typescript
/**
 * Advanced text manipulation utilities
 */

import { diffLines, diffWords, diffChars, Change } from 'diff'
import * as prettier from 'prettier'
import { marked } from 'marked'
import TurndownService from 'turndown'

export const advancedManipulators = {
  // Text Diff/Comparison
  diff: {
    compareLines: (text1: string, text2: string): Change[] => {
      return diffLines(text1, text2)
    },

    compareWords: (text1: string, text2: string): Change[] => {
      return diffWords(text1, text2)
    },

    compareChars: (text1: string, text2: string): Change[] => {
      return diffChars(text1, text2)
    },

    generateUnifiedDiff: (text1: string, text2: string, options?: {
      contextLines?: number
      oldFileName?: string
      newFileName?: string
    }): string => {
      const { contextLines = 3, oldFileName = 'Original', newFileName = 'Modified' } = options || {}
      const changes = diffLines(text1, text2)
      
      let unifiedDiff = `--- ${oldFileName}\n+++ ${newFileName}\n`
      let lineNumber1 = 1
      let lineNumber2 = 1
      
      changes.forEach((change, index) => {
        const lines = change.value.split('\n').filter(l => l !== '')
        
        if (change.added) {
          lines.forEach(line => {
            unifiedDiff += `+${line}\n`
            lineNumber2++
          })
        } else if (change.removed) {
          lines.forEach(line => {
            unifiedDiff += `-${line}\n`
            lineNumber1++
          })
        } else {
          lines.forEach(line => {
            unifiedDiff += ` ${line}\n`
            lineNumber1++
            lineNumber2++
          })
        }
      })
      
      return unifiedDiff
    },

    getSimilarityPercentage: (text1: string, text2: string): number => {
      const changes = diffChars(text1, text2)
      const totalLength = Math.max(text1.length, text2.length)
      
      if (totalLength === 0) return 100
      
      let matchedChars = 0
      changes.forEach(change => {
        if (!change.added && !change.removed) {
          matchedChars += change.value.length
        }
      })
      
      return parseFloat(((matchedChars / totalLength) * 100).toFixed(2))
    },
  },

  // JSON Operations
  json: {
    format: (jsonString: string, indent = 2): string => {
      try {
        const parsed = JSON.parse(jsonString)
        return JSON.stringify(parsed, null, indent)
      } catch (error) {
        throw new Error('Invalid JSON: ' + (error as Error).message)
      }
    },

    minify: (jsonString: string): string => {
      try {
        const parsed = JSON.parse(jsonString)
        return JSON.stringify(parsed)
      } catch (error) {
        throw new Error('Invalid JSON: ' + (error as Error).message)
      }
    },

    validate: (jsonString: string): { valid: boolean; error?: string } => {
      try {
        JSON.parse(jsonString)
        return { valid: true }
      } catch (error) {
        return { valid: false, error: (error as Error).message }
      }
    },

    toCSV: (jsonString: string, options?: {
      delimiter?: string
      includeHeaders?: boolean
    }): string => {
      const { delimiter = ',', includeHeaders = true } = options || {}
      
      try {
        const data = JSON.parse(jsonString)
        
        if (!Array.isArray(data)) {
          throw new Error('JSON must be an array of objects')
        }
        
        if (data.length === 0) return ''
        
        // Get headers from first object
        const headers = Object.keys(data[0])
        const rows: string[] = []
        
        if (includeHeaders) {
          rows.push(headers.map(h => `"${h}"`).join(delimiter))
        }
        
        // Convert each object to CSV row
        data.forEach(obj => {
          const values = headers.map(header => {
            const value = obj[header]
            if (value === null || value === undefined) return ''
            if (typeof value === 'string') {
              // Escape quotes and wrap in quotes if contains delimiter
              const escaped = value.replace(/"/g, '""')
              return value.includes(delimiter) || value.includes('"') || value.includes('\n')
                ? `"${escaped}"`
                : escaped
            }
            return String(value)
          })
          rows.push(values.join(delimiter))
        })
        
        return rows.join('\n')
      } catch (error) {
        throw new Error('Failed to convert JSON to CSV: ' + (error as Error).message)
      }
    },
  },

  // CSV Operations
  csv: {
    toJSON: (csvString: string, options?: {
      delimiter?: string
      hasHeaders?: boolean
    }): string => {
      const { delimiter = ',', hasHeaders = true } = options || {}
      
      const lines = csvString.trim().split('\n')
      if (lines.length === 0) return '[]'
      
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const nextChar = line[i + 1]
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"'
              i++ // Skip next quote
            } else {
              inQuotes = !inQuotes
            }
          } else if (char === delimiter && !inQuotes) {
            result.push(current)
            current = ''
          } else {
            current += char
          }
        }
        
        result.push(current)
        return result
      }
      
      const headers = hasHeaders ? parseCSVLine(lines[0]) : []
      const dataLines = hasHeaders ? lines.slice(1) : lines
      
      const data = dataLines.map(line => {
        const values = parseCSVLine(line)
        
        if (hasHeaders) {
          const obj: Record<string, string> = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        } else {
          return values
        }
      })
      
      return JSON.stringify(data, null, 2)
    },

    extractColumn: (csvString: string, columnIndex: number, hasHeaders = true): string[] => {
      const lines = csvString.trim().split('\n')
      const startIndex = hasHeaders ? 1 : 0
      
      return lines.slice(startIndex).map(line => {
        const values = line.split(',') // Simplified - doesn't handle quotes
        return values[columnIndex] || ''
      })
    },
  },

  // XML Operations
  xml: {
    format: (xmlString: string, indent = 2): string => {
      // Basic XML formatting
      let formatted = ''
      let pad = 0
      
      xmlString
        .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
        .split('\n')
        .forEach(node => {
          let indent = 0
          if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0
          } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
              pad -= 1
            }
          } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
            indent = 1
          } else {
            indent = 0
          }
          
          formatted += ' '.repeat(pad * indent) + node + '\n'
          pad += indent
        })
      
      return formatted.trim()
    },

    minify: (xmlString: string): string => {
      return xmlString
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim()
    },

    validate: (xmlString: string): { valid: boolean; error?: string } => {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(xmlString, 'text/xml')
        const parserError = doc.querySelector('parsererror')
        
        if (parserError) {
          return { valid: false, error: parserError.textContent || 'XML parsing error' }
        }
        
        return { valid: true }
      } catch (error) {
        return { valid: false, error: (error as Error).message }
      }
    },
  },

  // Text Extraction
  extraction: {
    extractURLs: (text: string): string[] => {
      const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
      return text.match(urlRegex) || []
    },

    extractEmails: (text: string): string[] => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
      return text.match(emailRegex) || []
    },

    extractPhoneNumbers: (text: string): string[] => {
      // Matches various phone formats
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g
      const matches = text.match(phoneRegex) || []
      
      // Filter out numbers that are too short or too long
      return matches.filter(match => {
        const digits = match.replace(/\D/g, '')
        return digits.length >= 7 && digits.length <= 15
      })
    },

    extractHashtags: (text: string): string[] => {
      const hashtagRegex = /#[a-zA-Z0-9_]+/g
      return text.match(hashtagRegex) || []
    },

    extractMentions: (text: string): string[] => {
      const mentionRegex = /@[a-zA-Z0-9_]+/g
      return text.match(mentionRegex) || []
    },

    extractIPAddresses: (text: string): string[] => {
      const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
      return text.match(ipRegex) || []
    },

    extractAll: (text: string): {
      urls: string[]
      emails: string[]
      phones: string[]
      hashtags: string[]
      mentions: string[]
      ips: string[]
    } => {
      return {
        urls: advancedManipulators.extraction.extractURLs(text),
        emails: advancedManipulators.extraction.extractEmails(text),
        phones: advancedManipulators.extraction.extractPhoneNumbers(text),
        hashtags: advancedManipulators.extraction.extractHashtags(text),
        mentions: advancedManipulators.extraction.extractMentions(text),
        ips: advancedManipulators.extraction.extractIPAddresses(text),
      }
    },
  },

  // Markdown/HTML Conversion
  markdown: {
    toHTML: (markdown: string, options?: marked.MarkedOptions): string => {
      marked.setOptions({
        gfm: true,
        breaks: true,
        ...options,
      })
      return marked(markdown)
    },

    fromHTML: (html: string, options?: any): string => {
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        ...options,
      })
      
      // Add custom rules for better conversion
      turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: (content) => `~~${content}~~`,
      })
      
      return turndownService.turndown(html)
    },
  },

  // SQL Formatting
  sql: {
    format: (sql: string, options?: {
      language?: 'sql' | 'mysql' | 'postgresql'
      uppercase?: boolean
      indent?: string
    }): string => {
      const { uppercase = true, indent = '  ' } = options || {}
      
      // Keywords to uppercase
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
        'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
        'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
        'ALTER', 'DROP', 'INDEX', 'VIEW', 'TRIGGER', 'PROCEDURE', 'FUNCTION',
        'IF', 'THEN', 'ELSE', 'END', 'CASE', 'WHEN', 'BEGIN', 'COMMIT', 'ROLLBACK'
      ]
      
      let formatted = sql
      
      // Add newlines before major keywords
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        formatted = formatted.replace(regex, match => {
          return uppercase ? match.toUpperCase() : match.toLowerCase()
        })
      })
      
      // Add newlines and indentation
      formatted = formatted
        .replace(/\bSELECT\b/gi, '\nSELECT')
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE')
        .replace(/\bJOIN\b/gi, '\nJOIN')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
        .replace(/\bHAVING\b/gi, '\nHAVING')
        .replace(/,/g, ',\n' + indent)
        .trim()
      
      return formatted
    },
  },

  // Code Beautifier
  code: {
    format: async (code: string, language: string): Promise<string> => {
      try {
        const parser = {
          javascript: 'babel',
          typescript: 'typescript',
          css: 'css',
          scss: 'scss',
          html: 'html',
          json: 'json',
          markdown: 'markdown',
          yaml: 'yaml',
        }[language]
        
        if (!parser) {
          throw new Error(`Unsupported language: ${language}`)
        }
        
        return await prettier.format(code, {
          parser,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          printWidth: 80,
        })
      } catch (error) {
        throw new Error(`Failed to format code: ${(error as Error).message}`)
      }
    },
  },

  // Text Merger
  merge: {
    concatenate: (texts: string[], separator = '\n'): string => {
      return texts.filter(t => t).join(separator)
    },

    interleave: (text1: string, text2: string, byLine = true): string => {
      if (byLine) {
        const lines1 = text1.split('\n')
        const lines2 = text2.split('\n')
        const maxLength = Math.max(lines1.length, lines2.length)
        const result: string[] = []
        
        for (let i = 0; i < maxLength; i++) {
          if (i < lines1.length) result.push(lines1[i])
          if (i < lines2.length) result.push(lines2[i])
        }
        
        return result.join('\n')
      } else {
        // Interleave by character
        const maxLength = Math.max(text1.length, text2.length)
        let result = ''
        
        for (let i = 0; i < maxLength; i++) {
          if (i < text1.length) result += text1[i]
          if (i < text2.length) result += text2[i]
        }
        
        return result
      }
    },

    zip: (texts: string[], byLine = true): string => {
      if (texts.length === 0) return ''
      
      if (byLine) {
        const allLines = texts.map(t => t.split('\n'))
        const maxLength = Math.max(...allLines.map(lines => lines.length))
        const result: string[] = []
        
        for (let i = 0; i < maxLength; i++) {
          const lineValues = allLines.map(lines => lines[i] || '').filter(l => l)
          if (lineValues.length > 0) {
            result.push(lineValues.join('\t'))
          }
        }
        
        return result.join('\n')
      } else {
        return texts.join('')
      }
    },
  },
}
```

### 2. Create Advanced Tool Components

#### Create `src/components/tools/advanced/text-diff-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { GitCompare } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { advancedManipulators } from '@/lib/advanced/text-manipulators'
import { ToolCategory } from '@/types/tool'
import { cn } from '@/lib/utils'

const tool = {
  id: 'text-diff',
  name: 'Text Diff/Compare',
  description: 'Compare two texts and highlight differences',
  category: ToolCategory.ADVANCED,
  icon: GitCompare,
  keywords: ['diff', 'compare', 'difference', 'changes'],
  component: null,
}

export function TextDiffTool() {
  const t = useTranslations('tools.textDiff')
  const [text1, setText1] = React.useState('')
  const [text2, setText2] = React.useState('')
  const [diffType, setDiffType] = React.useState<'chars' | 'words' | 'lines'>('lines')
  
  const diffResult = React.useMemo(() => {
    if (!text1 && !text2) return []
    
    switch (diffType) {
      case 'chars':
        return advancedManipulators.diff.compareChars(text1, text2)
      case 'words':
        return advancedManipulators.diff.compareWords(text1, text2)
      case 'lines':
        return advancedManipulators.diff.compareLines(text1, text2)
    }
  }, [text1, text2, diffType])
  
  const similarity = React.useMemo(() => {
    if (!text1 && !text2) return 100
    return advancedManipulators.diff.getSimilarityPercentage(text1, text2)
  }, [text1, text2])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <RadioGroup 
            value={diffType} 
            onValueChange={setDiffType as any}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="chars" id="chars" />
              <Label htmlFor="chars">{t('byCharacters')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="words" id="words" />
              <Label htmlFor="words">{t('byWords')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lines" id="lines" />
              <Label htmlFor="lines">{t('byLines')}</Label>
            </div>
          </RadioGroup>
          
          <div className="text-sm">
            {t('similarity')}: <span className="font-semibold">{similarity}%</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('originalText')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder={t('enterOriginalText')}
                rows={10}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('modifiedText')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder={t('enterModifiedText')}
                rows={10}
              />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('differences')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm whitespace-pre-wrap">
              {diffResult.map((part, index) => (
                <span
                  key={index}
                  className={cn(
                    part.added && 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
                    part.removed && 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100 line-through'
                  )}
                >
                  {part.value}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
```

#### Create `src/components/tools/advanced/json-formatter-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { FileJson } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { ToolInput } from '@/components/tools/tool-input'
import { ToolOutput } from '@/components/tools/tool-output'
import { ToolOptions } from '@/components/tools/tool-options'
import { useToolContext } from '@/contexts/tool-context'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { advancedManipulators } from '@/lib/advanced/text-manipulators'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'json-formatter',
  name: 'JSON Formatter & Validator',
  description: 'Format, validate, and convert JSON data',
  category: ToolCategory.ADVANCED,
  icon: FileJson,
  keywords: ['json', 'format', 'validate', 'beautify', 'minify'],
  component: null,
}

export function JsonFormatterTool() {
  const t = useTranslations('tools.jsonFormatter')
  const { input, output, setInput, setOutput } = useToolContext()
  const [indent, setIndent] = React.useState(2)
  const [validation, setValidation] = React.useState<{ valid: boolean; error?: string } | null>(null)
  
  const format = React.useCallback(() => {
    try {
      const formatted = advancedManipulators.json.format(input, indent)
      setOutput(formatted)
      setValidation({ valid: true })
    } catch (error) {
      setOutput('')
      setValidation({ valid: false, error: (error as Error).message })
    }
  }, [input, indent, setOutput])
  
  const minify = React.useCallback(() => {
    try {
      const minified = advancedManipulators.json.minify(input)
      setOutput(minified)
      setValidation({ valid: true })
    } catch (error) {
      setOutput('')
      setValidation({ valid: false, error: (error as Error).message })
    }
  }, [input, setOutput])
  
  const convertToCSV = React.useCallback(() => {
    try {
      const csv = advancedManipulators.json.toCSV(input)
      setOutput(csv)
      setValidation({ valid: true })
    } catch (error) {
      setOutput('')
      setValidation({ valid: false, error: (error as Error).message })
    }
  }, [input, setOutput])
  
  React.useEffect(() => {
    if (input) {
      format()
    } else {
      setOutput('')
      setValidation(null)
    }
  }, [input, format])

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder={t('inputPlaceholder')}
            rows={10}
            monospace
          />
          
          {validation && (
            <Alert variant={validation.valid ? 'default' : 'destructive'}>
              <AlertDescription>
                {validation.valid 
                  ? t('validJson')
                  : `${t('invalidJson')}: ${validation.error}`
                }
              </AlertDescription>
            </Alert>
          )}
          
          <ToolOutput
            value={output}
            placeholder={t('outputPlaceholder')}
            rows={10}
            monospace
          />
        </div>
        
        <div className="lg:col-span-1">
          <ToolOptions title={t('options')}>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('indentation')}</Label>
                  <span className="text-sm font-medium">{indent} spaces</span>
                </div>
                <Slider
                  value={[indent]}
                  onValueChange={([value]) => setIndent(value)}
                  min={0}
                  max={8}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <Button onClick={format} className="w-full">
                  {t('format')}
                </Button>
                <Button onClick={minify} variant="outline" className="w-full">
                  {t('minify')}
                </Button>
                <Button onClick={convertToCSV} variant="outline" className="w-full">
                  {t('convertToCSV')}
                </Button>
              </div>
              
              {input && validation?.valid && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium">{t('statistics')}</p>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t('size')}</dt>
                      <dd>{input.length} chars</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t('compressed')}</dt>
                      <dd>{advancedManipulators.json.minify(input).length} chars</dd>
                    </div>
                  </dl>
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

### 3. Update Translations

Add to `src/i18n/locales/en/tools.json`:
```json
{
  "textDiff": {
    "byCharacters": "Characters",
    "byWords": "Words",
    "byLines": "Lines",
    "similarity": "Similarity",
    "originalText": "Original Text",
    "modifiedText": "Modified Text",
    "enterOriginalText": "Enter original text",
    "enterModifiedText": "Enter modified text",
    "differences": "Differences"
  },
  "jsonFormatter": {
    "inputPlaceholder": "Paste your JSON here",
    "outputPlaceholder": "Formatted JSON will appear here",
    "options": "Options",
    "indentation": "Indentation",
    "format": "Format",
    "minify": "Minify",
    "convertToCSV": "Convert to CSV",
    "validJson": "Valid JSON",
    "invalidJson": "Invalid JSON",
    "statistics": "Statistics",
    "size": "Size",
    "compressed": "Compressed"
  }
}
```

## Testing & Verification

1. Test diff algorithm accuracy
2. Verify JSON/XML validation
3. Test CSV conversion edge cases
4. Check markdown/HTML conversion
5. Test text extraction patterns
6. Verify code formatting

## Success Indicators
- ✅ Accurate diff visualization
- ✅ Reliable JSON/XML formatting
- ✅ CSV conversion handles edge cases
- ✅ Text extraction works for all patterns
- ✅ Code formatting preserves logic

## Next Steps
Proceed to Stage 5: Integration and Optimization

## Notes
- Consider adding syntax highlighting
- Add support for more code languages
- Consider adding merge conflict resolution
- Add batch processing for multiple files