# Story 4.1: Case Converter Tools

## Story Details
- **Stage**: 4 - Core Text Tools Implementation
- **Priority**: Critical
- **Estimated Hours**: 4-5 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Implement the core case conversion tools that are the primary feature of Text Case Converter. These tools should support multiple text case transformations with proper handling of edge cases, Unicode support, and multilingual text.

## Acceptance Criteria
- [ ] Uppercase converter
- [ ] Lowercase converter
- [ ] Title Case converter
- [ ] Sentence case converter
- [ ] Camel Case converter
- [ ] Pascal Case converter
- [ ] Snake Case converter
- [ ] Kebab Case converter
- [ ] Alternating Case converter
- [ ] Inverse Case converter
- [ ] Proper Unicode support
- [ ] Preserve formatting options
- [ ] Batch processing support
- [ ] Real-time preview

## Implementation Steps

### 1. Create Case Conversion Utilities

#### Create `src/lib/text-case/converters.ts`
```typescript
/**
 * Core case conversion functions with Unicode support
 */

// Helper to check if character is uppercase
function isUpperCase(char: string): boolean {
  return char !== char.toLowerCase() && char === char.toUpperCase()
}

// Helper to check if character is lowercase
function isLowerCase(char: string): boolean {
  return char !== char.toUpperCase() && char === char.toLowerCase()
}

// Helper to check if character is a letter
function isLetter(char: string): boolean {
  return char.toLowerCase() !== char.toUpperCase()
}

export const caseConverters = {
  // UPPERCASE
  uppercase: (text: string): string => {
    return text.toUpperCase()
  },

  // lowercase
  lowercase: (text: string): string => {
    return text.toLowerCase()
  },

  // Title Case - Capitalize First Letter Of Each Word
  titleCase: (text: string, options?: { minorWords?: boolean }): string => {
    const minorWords = new Set([
      'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from',
      'in', 'into', 'nor', 'of', 'on', 'or', 'per', 'the', 'to',
      'up', 'via', 'with'
    ])

    return text.replace(/\w\S*/g, (word, index) => {
      // Always capitalize first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
      }
      
      // Check if it's a minor word and should remain lowercase
      if (options?.minorWords && minorWords.has(word.toLowerCase())) {
        return word.toLowerCase()
      }
      
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    })
  },

  // Sentence case - Capitalize first letter of each sentence
  sentenceCase: (text: string): string => {
    // First lowercase everything
    let result = text.toLowerCase()
    
    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1)
    
    // Capitalize after sentence endings
    result = result.replace(/([.!?]\s+)([a-z])/g, (match, separator, letter) => {
      return separator + letter.toUpperCase()
    })
    
    // Capitalize 'I' when it's a standalone word
    result = result.replace(/\bi\b/g, 'I')
    
    return result
  },

  // camelCase - First word lowercase, rest title case
  camelCase: (text: string): string => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase()
      })
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
  },

  // PascalCase - All words title case, no spaces
  pascalCase: (text: string): string => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase()
      })
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
  },

  // snake_case - All lowercase with underscores
  snakeCase: (text: string): string => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_')
  },

  // kebab-case - All lowercase with hyphens
  kebabCase: (text: string): string => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-')
  },

  // aLtErNaTiNg CaSe
  alternatingCase: (text: string, startWithUpper = true): string => {
    let shouldBeUpper = startWithUpper
    
    return text.split('').map(char => {
      if (isLetter(char)) {
        const result = shouldBeUpper ? char.toUpperCase() : char.toLowerCase()
        shouldBeUpper = !shouldBeUpper
        return result
      }
      return char
    }).join('')
  },

  // iNVERSE cASE - Swap case of each letter
  inverseCase: (text: string): string => {
    return text.split('').map(char => {
      if (isUpperCase(char)) {
        return char.toLowerCase()
      } else if (isLowerCase(char)) {
        return char.toUpperCase()
      }
      return char
    }).join('')
  },

  // Capitalize First Letter Only
  capitalizeFirst: (text: string): string => {
    if (!text) return text
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  // CONSTANT_CASE - All uppercase with underscores
  constantCase: (text: string): string => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toUpperCase())
      .join('_')
  },

  // dot.case - All lowercase with dots
  dotCase: (text: string): string => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('.')
  },

  // Train-Case - Like kebab but with title case
  trainCase: (text: string): string => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-')
  },
}

// Advanced options for case conversion
export interface CaseConversionOptions {
  preserveWhitespace?: boolean
  preservePunctuation?: boolean
  preserveNumbers?: boolean
  customDelimiters?: string[]
  locale?: string
}

// Advanced converter with options
export function convertCase(
  text: string,
  converter: keyof typeof caseConverters,
  options?: CaseConversionOptions
): string {
  // Apply the base conversion
  let result = caseConverters[converter](text)
  
  // Apply additional options if needed
  if (options?.preserveWhitespace) {
    // Implementation for preserving original whitespace
  }
  
  return result
}

// Batch conversion for multiple texts
export function batchConvertCase(
  texts: string[],
  converter: keyof typeof caseConverters,
  options?: CaseConversionOptions
): string[] {
  return texts.map(text => convertCase(text, converter, options))
}

// Smart case detection
export function detectCase(text: string): string | null {
  if (!text || !text.trim()) return null
  
  const trimmed = text.trim()
  
  // Check for specific patterns
  if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    return 'uppercase'
  }
  
  if (trimmed === trimmed.toLowerCase() && /[a-z]/.test(trimmed)) {
    return 'lowercase'
  }
  
  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(trimmed)) {
    return 'titleCase'
  }
  
  if (/^[a-z]+[A-Z]/.test(trimmed.replace(/[^a-zA-Z]/g, ''))) {
    return 'camelCase'
  }
  
  if (/^[A-Z][a-z]+[A-Z]/.test(trimmed.replace(/[^a-zA-Z]/g, ''))) {
    return 'pascalCase'
  }
  
  if (/_/.test(trimmed) && trimmed === trimmed.toLowerCase()) {
    return 'snakeCase'
  }
  
  if (/-/.test(trimmed) && trimmed === trimmed.toLowerCase()) {
    return 'kebabCase'
  }
  
  return null
}
```

### 2. Create Case Converter Components

#### Create `src/components/tools/case-converters/uppercase-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Type } from 'lucide-react'
import { SingleTransformLayout } from '@/components/tools/layouts/single-transform-layout'
import { ToolCategory } from '@/types/tool'
import { caseConverters } from '@/lib/text-case/converters'

const tool = {
  id: 'uppercase',
  name: 'Uppercase Converter',
  description: 'Convert text to UPPERCASE letters',
  category: ToolCategory.TEXT_CASE,
  icon: Type,
  keywords: ['uppercase', 'capital', 'caps', 'all caps'],
  component: null,
}

export function UppercaseTool() {
  const t = useTranslations('tools.uppercase')

  return (
    <SingleTransformLayout
      tool={tool}
      transform={caseConverters.uppercase}
      inputProps={{
        placeholder: t('inputPlaceholder'),
      }}
      outputProps={{
        placeholder: t('outputPlaceholder'),
      }}
    />
  )
}
```

#### Create `src/components/tools/case-converters/multi-case-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Type } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { ToolInput } from '@/components/tools/tool-input'
import { ToolOutput } from '@/components/tools/tool-output'
import { ToolOptions } from '@/components/tools/tool-options'
import { useToolContext } from '@/contexts/tool-context'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { caseConverters, detectCase } from '@/lib/text-case/converters'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'multi-case',
  name: 'Multi-Case Converter',
  description: 'Convert text between multiple case formats',
  category: ToolCategory.TEXT_CASE,
  icon: Type,
  keywords: ['case', 'converter', 'text', 'transform'],
  component: null,
}

type CaseType = keyof typeof caseConverters

export function MultiCaseTool() {
  const t = useTranslations('tools.multiCase')
  const { input, output, setInput, setOutput } = useToolContext()
  
  const [selectedCase, setSelectedCase] = React.useState<CaseType>('uppercase')
  const [options, setOptions] = React.useState({
    preserveWhitespace: false,
    minorWords: true,
    startWithUpper: true,
  })
  
  const [detectedCase, setDetectedCase] = React.useState<string | null>(null)

  // Detect case of input
  React.useEffect(() => {
    const detected = detectCase(input)
    setDetectedCase(detected)
  }, [input])

  // Transform text when input or settings change
  React.useEffect(() => {
    if (!input) {
      setOutput('')
      return
    }

    let result = input
    
    switch (selectedCase) {
      case 'titleCase':
        result = caseConverters.titleCase(input, { minorWords: options.minorWords })
        break
      case 'alternatingCase':
        result = caseConverters.alternatingCase(input, options.startWithUpper)
        break
      default:
        result = caseConverters[selectedCase](input)
    }
    
    setOutput(result)
  }, [input, selectedCase, options, setOutput])

  const caseOptions = [
    { value: 'uppercase', label: t('cases.uppercase'), example: 'HELLO WORLD' },
    { value: 'lowercase', label: t('cases.lowercase'), example: 'hello world' },
    { value: 'titleCase', label: t('cases.titleCase'), example: 'Hello World' },
    { value: 'sentenceCase', label: t('cases.sentenceCase'), example: 'Hello world' },
    { value: 'camelCase', label: t('cases.camelCase'), example: 'helloWorld' },
    { value: 'pascalCase', label: t('cases.pascalCase'), example: 'HelloWorld' },
    { value: 'snakeCase', label: t('cases.snakeCase'), example: 'hello_world' },
    { value: 'kebabCase', label: t('cases.kebabCase'), example: 'hello-world' },
    { value: 'alternatingCase', label: t('cases.alternatingCase'), example: 'hElLo WoRlD' },
    { value: 'inverseCase', label: t('cases.inverseCase'), example: 'HELLO world → hello WORLD' },
    { value: 'constantCase', label: t('cases.constantCase'), example: 'HELLO_WORLD' },
    { value: 'dotCase', label: t('cases.dotCase'), example: 'hello.world' },
    { value: 'trainCase', label: t('cases.trainCase'), example: 'Hello-World' },
  ]

  const quickActions = [
    {
      label: t('quickActions.copyAsIs'),
      onClick: () => navigator.clipboard.writeText(output),
    },
    {
      label: t('quickActions.swapInputOutput'),
      onClick: () => {
        setInput(output)
        setOutput(input)
      },
    },
    {
      label: t('quickActions.clearAll'),
      onClick: () => {
        setInput('')
        setOutput('')
      },
    },
  ]

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ToolInput
            value={input}
            onChange={setInput}
          />
          
          {detectedCase && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('detectedCase')}:</span>
              <code className="px-2 py-1 bg-muted rounded">
                {detectedCase}
              </code>
            </div>
          )}
          
          <ToolOutput
            value={output}
          />
          
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <ToolOptions title={t('options')}>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>{t('selectCase')}</Label>
                <RadioGroup
                  value={selectedCase}
                  onValueChange={(value) => setSelectedCase(value as CaseType)}
                >
                  {caseOptions.map((option) => (
                    <div key={option.value} className="flex items-start space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="grid gap-0.5 leading-none">
                        <Label
                          htmlFor={option.value}
                          className="font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                        <code className="text-xs text-muted-foreground">
                          {option.example}
                        </code>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {selectedCase === 'titleCase' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minor-words">
                      {t('options.minorWords')}
                    </Label>
                    <Switch
                      id="minor-words"
                      checked={options.minorWords}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, minorWords: checked })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('options.minorWordsDescription')}
                  </p>
                </div>
              )}
              
              {selectedCase === 'alternatingCase' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="start-upper">
                      {t('options.startWithUppercase')}
                    </Label>
                    <Switch
                      id="start-upper"
                      checked={options.startWithUpper}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, startWithUpper: checked })
                      }
                    />
                  </div>
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

### 3. Create Batch Case Converter

#### Create `src/components/tools/case-converters/batch-case-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Type, Plus, Trash2, Download } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { batchConvertCase, caseConverters } from '@/lib/text-case/converters'
import { ToolCategory } from '@/types/tool'
import { saveAs } from 'file-saver'

const tool = {
  id: 'batch-case',
  name: 'Batch Case Converter',
  description: 'Convert multiple texts to different cases simultaneously',
  category: ToolCategory.TEXT_CASE,
  icon: Type,
  keywords: ['batch', 'bulk', 'multiple', 'case', 'converter'],
  component: null,
}

interface BatchItem {
  id: string
  input: string
  output: string
  caseType: keyof typeof caseConverters
}

export function BatchCaseTool() {
  const t = useTranslations('tools.batchCase')
  const [items, setItems] = React.useState<BatchItem[]>([
    {
      id: '1',
      input: '',
      output: '',
      caseType: 'uppercase',
    },
  ])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        input: '',
        output: '',
        caseType: 'uppercase',
      },
    ])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<BatchItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates }
        
        // If input or case type changed, update output
        if (updates.input !== undefined || updates.caseType !== undefined) {
          updated.output = updated.input 
            ? caseConverters[updated.caseType](updated.input)
            : ''
        }
        
        return updated
      }
      return item
    }))
  }

  const processAll = () => {
    setItems(items.map(item => ({
      ...item,
      output: item.input ? caseConverters[item.caseType](item.input) : '',
    })))
  }

  const exportResults = () => {
    const content = items
      .map(item => `Input: ${item.input}\nCase: ${item.caseType}\nOutput: ${item.output}\n`)
      .join('\n---\n\n')
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'batch-case-conversion.txt')
  }

  const caseOptions = Object.keys(caseConverters).map(key => ({
    value: key,
    label: t(`cases.${key}`),
  }))

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('title')}</h2>
          <div className="flex gap-2">
            <Button onClick={processAll}>
              {t('processAll')}
            </Button>
            <Button onClick={exportResults} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {t('item')} {index + 1}
                  </CardTitle>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t('input')}
                    </label>
                    <Textarea
                      value={item.input}
                      onChange={(e) => updateItem(item.id, { input: e.target.value })}
                      placeholder={t('inputPlaceholder')}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t('output')}
                    </label>
                    <Textarea
                      value={item.output}
                      readOnly
                      placeholder={t('outputPlaceholder')}
                      rows={3}
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('caseType')}
                  </label>
                  <Select
                    value={item.caseType}
                    onValueChange={(value) => 
                      updateItem(item.id, { caseType: value as keyof typeof caseConverters })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {caseOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={addItem} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t('addItem')}
        </Button>
      </div>
    </ToolLayout>
  )
}
```

### 4. Create Case Converter Routes

#### Create `src/app/[locale]/tools/uppercase/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { UppercaseTool } from '@/components/tools/case-converters/uppercase-tool'

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata.tools.uppercase' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
  }
}

interface Props {
  params: {
    locale: string
  }
}

export default function UppercasePage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale)
  
  return <UppercaseTool />
}
```

### 5. Update Translations

Add to `src/i18n/locales/en/tools.json`:
```json
{
  "uppercase": {
    "inputPlaceholder": "Enter text to convert to UPPERCASE",
    "outputPlaceholder": "UPPERCASE text will appear here"
  },
  "multiCase": {
    "detectedCase": "Detected case",
    "selectCase": "Select case type",
    "options": "Options",
    "cases": {
      "uppercase": "UPPERCASE",
      "lowercase": "lowercase",
      "titleCase": "Title Case",
      "sentenceCase": "Sentence case",
      "camelCase": "camelCase",
      "pascalCase": "PascalCase",
      "snakeCase": "snake_case",
      "kebabCase": "kebab-case",
      "alternatingCase": "aLtErNaTiNg CaSe",
      "inverseCase": "iNVERSE cASE",
      "constantCase": "CONSTANT_CASE",
      "dotCase": "dot.case",
      "trainCase": "Train-Case"
    },
    "options": {
      "minorWords": "Smart Minor Words",
      "minorWordsDescription": "Keep articles and prepositions lowercase",
      "startWithUppercase": "Start with uppercase"
    },
    "quickActions": {
      "copyAsIs": "Copy Result",
      "swapInputOutput": "Swap Input/Output",
      "clearAll": "Clear All"
    }
  },
  "batchCase": {
    "title": "Batch Case Converter",
    "item": "Item",
    "input": "Input Text",
    "output": "Output",
    "caseType": "Case Type",
    "inputPlaceholder": "Enter text to convert",
    "outputPlaceholder": "Converted text will appear here",
    "processAll": "Process All",
    "export": "Export Results",
    "addItem": "Add Another Item"
  }
}
```

Add to `src/i18n/locales/en/metadata.json`:
```json
{
  "tools": {
    "uppercase": {
      "title": "Uppercase Converter - Convert Text to UPPERCASE | Text Case Converter",
      "description": "Convert any text to UPPERCASE letters instantly. Free online tool with support for multiple languages.",
      "keywords": "uppercase, converter, capital letters, all caps, text transformation"
    }
  }
}
```

## Testing & Verification

1. Test all case conversion functions
2. Verify Unicode support (émojis, accented characters)
3. Test batch processing
4. Check real-time preview performance
5. Test with various text lengths
6. Verify language-specific rules

## Success Indicators
- ✅ All case conversions work correctly
- ✅ Unicode characters handled properly
- ✅ Real-time preview responsive
- ✅ Batch processing functional
- ✅ Options work as expected
- ✅ Mobile-optimized interface

## Next Steps
Proceed to Story 4.2: Text Formatting Tools

## Notes
- Consider adding custom delimiter support
- Add case conversion history
- Monitor performance with large texts
- Consider adding regex-based custom patterns