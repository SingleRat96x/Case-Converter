# Story 4.2: Text Formatting Tools

## Story Details
- **Stage**: 4 - Core Text Tools Implementation
- **Priority**: High
- **Estimated Hours**: 4-5 hours
- **Dependencies**: Story 4.1 (Case Converter Tools)

## Objective
Implement comprehensive text formatting tools that allow users to manipulate text structure, spacing, and appearance. These tools should handle various text formatting needs including removing spaces, adding line breaks, text alignment, and more.

## Acceptance Criteria
- [ ] Remove extra spaces tool
- [ ] Add/Remove line breaks
- [ ] Text alignment (left, right, center, justify)
- [ ] Add prefix/suffix to lines
- [ ] Remove duplicate lines
- [ ] Sort lines (A-Z, Z-A, by length)
- [ ] Reverse text/lines
- [ ] Text wrapper (word wrap at X characters)
- [ ] Find and replace with regex support
- [ ] Text trimmer (leading/trailing spaces)
- [ ] Tab to spaces converter
- [ ] Number lines tool

## Implementation Steps

### 1. Create Text Formatting Utilities

#### Create `src/lib/text-format/formatters.ts`
```typescript
/**
 * Core text formatting functions
 */

export const textFormatters = {
  // Remove extra spaces (multiple spaces to single space)
  removeExtraSpaces: (text: string): string => {
    return text
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/^\s+|\s+$/g, '') // Trim leading/trailing spaces
  },

  // Remove all spaces
  removeAllSpaces: (text: string): string => {
    return text.replace(/\s+/g, '')
  },

  // Remove line breaks
  removeLineBreaks: (text: string, replacement = ' '): string => {
    return text.replace(/\r?\n/g, replacement)
  },

  // Add line breaks after periods
  addLineBreaksAfterPeriods: (text: string): string => {
    return text.replace(/\.\s*/g, '.\n')
  },

  // Add line breaks at specific interval
  addLineBreaksAtInterval: (text: string, interval: number): string => {
    const regex = new RegExp(`.{1,${interval}}`, 'g')
    return text.match(regex)?.join('\n') || text
  },

  // Remove duplicate lines
  removeDuplicateLines: (text: string, caseSensitive = true): string => {
    const lines = text.split('\n')
    const seen = new Set<string>()
    
    return lines.filter(line => {
      const key = caseSensitive ? line : line.toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    }).join('\n')
  },

  // Remove empty lines
  removeEmptyLines: (text: string): string => {
    return text.split('\n')
      .filter(line => line.trim() !== '')
      .join('\n')
  },

  // Sort lines
  sortLines: (
    text: string, 
    order: 'asc' | 'desc' = 'asc',
    sortBy: 'alphabetical' | 'length' | 'numeric' = 'alphabetical'
  ): string => {
    const lines = text.split('\n')
    
    lines.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'alphabetical':
          comparison = a.localeCompare(b)
          break
        case 'length':
          comparison = a.length - b.length
          break
        case 'numeric':
          const numA = parseFloat(a) || 0
          const numB = parseFloat(b) || 0
          comparison = numA - numB
          break
      }
      
      return order === 'asc' ? comparison : -comparison
    })
    
    return lines.join('\n')
  },

  // Reverse text
  reverseText: (text: string): string => {
    return text.split('').reverse().join('')
  },

  // Reverse lines
  reverseLines: (text: string): string => {
    return text.split('\n').reverse().join('\n')
  },

  // Add prefix to each line
  addPrefix: (text: string, prefix: string): string => {
    return text.split('\n').map(line => prefix + line).join('\n')
  },

  // Add suffix to each line
  addSuffix: (text: string, suffix: string): string => {
    return text.split('\n').map(line => line + suffix).join('\n')
  },

  // Wrap text at specified length
  wrapText: (text: string, maxLength: number, breakWord = false): string => {
    if (breakWord) {
      // Hard wrap - break words if necessary
      const regex = new RegExp(`.{1,${maxLength}}`, 'g')
      return text.match(regex)?.join('\n') || text
    } else {
      // Soft wrap - preserve words
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = ''
      
      for (const word of words) {
        if ((currentLine + ' ' + word).trim().length <= maxLength) {
          currentLine = (currentLine + ' ' + word).trim()
        } else {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        }
      }
      
      if (currentLine) lines.push(currentLine)
      return lines.join('\n')
    }
  },

  // Trim whitespace
  trimWhitespace: (
    text: string, 
    options: {
      leading?: boolean
      trailing?: boolean
      lines?: boolean
    } = {}
  ): string => {
    let result = text
    
    if (options.lines) {
      result = result.split('\n').map(line => {
        let trimmed = line
        if (options.leading !== false) trimmed = trimmed.trimStart()
        if (options.trailing !== false) trimmed = trimmed.trimEnd()
        return trimmed
      }).join('\n')
    } else {
      if (options.leading !== false) result = result.trimStart()
      if (options.trailing !== false) result = result.trimEnd()
    }
    
    return result
  },

  // Convert tabs to spaces
  tabsToSpaces: (text: string, spacesPerTab = 4): string => {
    const spaces = ' '.repeat(spacesPerTab)
    return text.replace(/\t/g, spaces)
  },

  // Convert spaces to tabs
  spacesToTabs: (text: string, spacesPerTab = 4): string => {
    const spaces = ' '.repeat(spacesPerTab)
    return text.replace(new RegExp(spaces, 'g'), '\t')
  },

  // Number lines
  numberLines: (
    text: string, 
    options: {
      startFrom?: number
      separator?: string
      padZeros?: boolean
    } = {}
  ): string => {
    const lines = text.split('\n')
    const startFrom = options.startFrom || 1
    const separator = options.separator || '. '
    const maxNumber = startFrom + lines.length - 1
    const padLength = options.padZeros ? maxNumber.toString().length : 0
    
    return lines.map((line, index) => {
      const lineNumber = (startFrom + index).toString()
      const paddedNumber = options.padZeros 
        ? lineNumber.padStart(padLength, '0')
        : lineNumber
      return paddedNumber + separator + line
    }).join('\n')
  },

  // Text alignment
  alignText: (
    text: string, 
    alignment: 'left' | 'right' | 'center',
    width: number
  ): string => {
    return text.split('\n').map(line => {
      const trimmed = line.trim()
      const padding = width - trimmed.length
      
      if (padding <= 0) return trimmed
      
      switch (alignment) {
        case 'left':
          return trimmed + ' '.repeat(padding)
        case 'right':
          return ' '.repeat(padding) + trimmed
        case 'center':
          const leftPad = Math.floor(padding / 2)
          const rightPad = padding - leftPad
          return ' '.repeat(leftPad) + trimmed + ' '.repeat(rightPad)
        default:
          return trimmed
      }
    }).join('\n')
  },

  // Find and replace with regex support
  findAndReplace: (
    text: string,
    find: string,
    replace: string,
    options: {
      caseSensitive?: boolean
      wholeWord?: boolean
      useRegex?: boolean
      global?: boolean
    } = {}
  ): string => {
    if (options.useRegex) {
      const flags = [
        options.global !== false ? 'g' : '',
        !options.caseSensitive ? 'i' : ''
      ].join('')
      
      try {
        const regex = new RegExp(find, flags)
        return text.replace(regex, replace)
      } catch (e) {
        // Invalid regex, return original text
        return text
      }
    } else {
      let pattern = find
      
      // Escape special regex characters
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      
      // Add word boundaries if whole word matching
      if (options.wholeWord) {
        pattern = `\\b${pattern}\\b`
      }
      
      const flags = [
        options.global !== false ? 'g' : '',
        !options.caseSensitive ? 'i' : ''
      ].join('')
      
      const regex = new RegExp(pattern, flags)
      return text.replace(regex, replace)
    }
  },

  // Extract text between delimiters
  extractBetween: (
    text: string,
    startDelimiter: string,
    endDelimiter: string,
    includeDelimiters = false
  ): string[] => {
    const results: string[] = []
    const regex = new RegExp(
      `${escapeRegex(startDelimiter)}(.*?)${escapeRegex(endDelimiter)}`,
      'gs'
    )
    
    let match
    while ((match = regex.exec(text)) !== null) {
      if (includeDelimiters) {
        results.push(match[0])
      } else {
        results.push(match[1])
      }
    }
    
    return results
  },
}

// Helper function to escape regex special characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Batch formatting
export function batchFormat(
  texts: string[],
  formatter: keyof typeof textFormatters,
  ...args: any[]
): string[] {
  return texts.map(text => (textFormatters[formatter] as any)(text, ...args))
}
```

### 2. Create Text Formatting Components

#### Create `src/components/tools/text-format/remove-spaces-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Space } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { ToolInput } from '@/components/tools/tool-input'
import { ToolOutput } from '@/components/tools/tool-output'
import { ToolOptions } from '@/components/tools/tool-options'
import { useToolContext } from '@/contexts/tool-context'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { textFormatters } from '@/lib/text-format/formatters'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'remove-spaces',
  name: 'Remove Spaces',
  description: 'Remove extra spaces, all spaces, or trim whitespace from text',
  category: ToolCategory.TEXT_FORMAT,
  icon: Space,
  keywords: ['spaces', 'whitespace', 'trim', 'clean'],
  component: null,
}

export function RemoveSpacesTool() {
  const t = useTranslations('tools.removeSpaces')
  const { input, output, setInput, setOutput } = useToolContext()
  const [mode, setMode] = React.useState<'extra' | 'all' | 'trim'>('extra')

  React.useEffect(() => {
    if (!input) {
      setOutput('')
      return
    }

    let result = input
    
    switch (mode) {
      case 'extra':
        result = textFormatters.removeExtraSpaces(input)
        break
      case 'all':
        result = textFormatters.removeAllSpaces(input)
        break
      case 'trim':
        result = textFormatters.trimWhitespace(input, {
          leading: true,
          trailing: true,
          lines: true,
        })
        break
    }
    
    setOutput(result)
  }, [input, mode, setOutput])

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder={t('inputPlaceholder')}
          />
          
          <ToolOutput
            value={output}
            placeholder={t('outputPlaceholder')}
          />
        </div>
        
        <div className="lg:col-span-1">
          <ToolOptions title={t('options')}>
            <RadioGroup value={mode} onValueChange={setMode as any}>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="extra" id="extra" />
                  <div className="grid gap-0.5 leading-none">
                    <Label htmlFor="extra">{t('modes.extra.label')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('modes.extra.description')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <div className="grid gap-0.5 leading-none">
                    <Label htmlFor="all">{t('modes.all.label')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('modes.all.description')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="trim" id="trim" />
                  <div className="grid gap-0.5 leading-none">
                    <Label htmlFor="trim">{t('modes.trim.label')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('modes.trim.description')}
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </ToolOptions>
        </div>
      </div>
    </ToolLayout>
  )
}
```

#### Create `src/components/tools/text-format/sort-lines-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { ArrowUpDown } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { ToolInput } from '@/components/tools/tool-input'
import { ToolOutput } from '@/components/tools/tool-output'
import { ToolOptions } from '@/components/tools/tool-options'
import { useToolContext } from '@/contexts/tool-context'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { textFormatters } from '@/lib/text-format/formatters'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'sort-lines',
  name: 'Sort Lines',
  description: 'Sort lines alphabetically, by length, or numerically',
  category: ToolCategory.TEXT_FORMAT,
  icon: ArrowUpDown,
  keywords: ['sort', 'order', 'arrange', 'alphabetical'],
  component: null,
}

export function SortLinesTool() {
  const t = useTranslations('tools.sortLines')
  const { input, output, setInput, setOutput } = useToolContext()
  
  const [options, setOptions] = React.useState({
    sortBy: 'alphabetical' as 'alphabetical' | 'length' | 'numeric',
    order: 'asc' as 'asc' | 'desc',
    removeDuplicates: false,
    removeEmpty: false,
  })

  React.useEffect(() => {
    if (!input) {
      setOutput('')
      return
    }

    let result = input
    
    // Remove empty lines if requested
    if (options.removeEmpty) {
      result = textFormatters.removeEmptyLines(result)
    }
    
    // Remove duplicates if requested
    if (options.removeDuplicates) {
      result = textFormatters.removeDuplicateLines(result)
    }
    
    // Sort lines
    result = textFormatters.sortLines(result, options.order, options.sortBy)
    
    setOutput(result)
  }, [input, options, setOutput])

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder={t('inputPlaceholder')}
            rows={10}
          />
          
          <ToolOutput
            value={output}
            placeholder={t('outputPlaceholder')}
            rows={10}
          />
        </div>
        
        <div className="lg:col-span-1">
          <ToolOptions title={t('options')}>
            <div className="space-y-6">
              {/* Sort By */}
              <div className="space-y-3">
                <Label>{t('sortBy')}</Label>
                <RadioGroup 
                  value={options.sortBy} 
                  onValueChange={(value) => 
                    setOptions({ ...options, sortBy: value as any })
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="alphabetical" id="alphabetical" />
                      <Label htmlFor="alphabetical">{t('sortTypes.alphabetical')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="length" id="length" />
                      <Label htmlFor="length">{t('sortTypes.length')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="numeric" id="numeric" />
                      <Label htmlFor="numeric">{t('sortTypes.numeric')}</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Sort Order */}
              <div className="space-y-3">
                <Label>{t('sortOrder')}</Label>
                <RadioGroup 
                  value={options.order} 
                  onValueChange={(value) => 
                    setOptions({ ...options, order: value as any })
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="asc" id="asc" />
                      <Label htmlFor="asc">{t('orders.ascending')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="desc" id="desc" />
                      <Label htmlFor="desc">{t('orders.descending')}</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="remove-duplicates">
                    {t('removeDuplicates')}
                  </Label>
                  <Switch
                    id="remove-duplicates"
                    checked={options.removeDuplicates}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, removeDuplicates: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="remove-empty">
                    {t('removeEmpty')}
                  </Label>
                  <Switch
                    id="remove-empty"
                    checked={options.removeEmpty}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, removeEmpty: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </ToolOptions>
        </div>
      </div>
    </ToolLayout>
  )
}
```

#### Create `src/components/tools/text-format/find-replace-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { ToolInput } from '@/components/tools/tool-input'
import { ToolOutput } from '@/components/tools/tool-output'
import { ToolOptions } from '@/components/tools/tool-options'
import { useToolContext } from '@/contexts/tool-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { textFormatters } from '@/lib/text-format/formatters'
import { ToolCategory } from '@/types/tool'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

const tool = {
  id: 'find-replace',
  name: 'Find and Replace',
  description: 'Find and replace text with support for regular expressions',
  category: ToolCategory.TEXT_FORMAT,
  icon: Search,
  keywords: ['find', 'replace', 'search', 'regex', 'substitute'],
  component: null,
}

export function FindReplaceTool() {
  const t = useTranslations('tools.findReplace')
  const { input, output, setInput, setOutput } = useToolContext()
  
  const [findText, setFindText] = React.useState('')
  const [replaceText, setReplaceText] = React.useState('')
  const [regexError, setRegexError] = React.useState('')
  
  const [options, setOptions] = React.useState({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    global: true,
  })

  React.useEffect(() => {
    if (!input || !findText) {
      setOutput(input)
      setRegexError('')
      return
    }

    try {
      const result = textFormatters.findAndReplace(
        input,
        findText,
        replaceText,
        options
      )
      setOutput(result)
      setRegexError('')
      
      // Count replacements
      if (options.useRegex) {
        try {
          const flags = [
            options.global ? 'g' : '',
            !options.caseSensitive ? 'i' : ''
          ].join('')
          const regex = new RegExp(findText, flags)
          const matches = input.match(regex)
          // Could show match count in UI
        } catch (e) {
          setRegexError(t('invalidRegex'))
        }
      }
    } catch (error) {
      setOutput(input)
      setRegexError(error instanceof Error ? error.message : t('invalidRegex'))
    }
  }, [input, findText, replaceText, options, setOutput, t])

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder={t('inputPlaceholder')}
            rows={10}
          />
          
          <ToolOutput
            value={output}
            placeholder={t('outputPlaceholder')}
            rows={10}
          />
        </div>
        
        <div className="lg:col-span-1">
          <ToolOptions title={t('options')}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="find">{t('findLabel')}</Label>
                <Input
                  id="find"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder={t('findPlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="replace">{t('replaceLabel')}</Label>
                <Input
                  id="replace"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder={t('replacePlaceholder')}
                />
              </div>
              
              {regexError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{regexError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="case-sensitive">
                    {t('caseSensitive')}
                  </Label>
                  <Switch
                    id="case-sensitive"
                    checked={options.caseSensitive}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, caseSensitive: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="whole-word">
                    {t('wholeWord')}
                  </Label>
                  <Switch
                    id="whole-word"
                    checked={options.wholeWord}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, wholeWord: checked })
                    }
                    disabled={options.useRegex}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="use-regex">
                    {t('useRegex')}
                  </Label>
                  <Switch
                    id="use-regex"
                    checked={options.useRegex}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, useRegex: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="global">
                    {t('replaceAll')}
                  </Label>
                  <Switch
                    id="global"
                    checked={options.global}
                    onCheckedChange={(checked) =>
                      setOptions({ ...options, global: checked })
                    }
                  />
                </div>
              </div>
              
              {options.useRegex && (
                <Alert>
                  <AlertDescription className="text-xs">
                    {t('regexHelp')}
                  </AlertDescription>
                </Alert>
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
  "removeSpaces": {
    "inputPlaceholder": "Enter text with spaces to remove",
    "outputPlaceholder": "Text with spaces removed will appear here",
    "options": "Space Removal Options",
    "modes": {
      "extra": {
        "label": "Remove Extra Spaces",
        "description": "Convert multiple spaces to single space"
      },
      "all": {
        "label": "Remove All Spaces",
        "description": "Remove all spaces from text"
      },
      "trim": {
        "label": "Trim Whitespace",
        "description": "Remove leading and trailing spaces from each line"
      }
    }
  },
  "sortLines": {
    "inputPlaceholder": "Enter lines of text to sort",
    "outputPlaceholder": "Sorted lines will appear here",
    "options": "Sort Options",
    "sortBy": "Sort by",
    "sortTypes": {
      "alphabetical": "Alphabetical",
      "length": "Line Length",
      "numeric": "Numeric Value"
    },
    "sortOrder": "Sort Order",
    "orders": {
      "ascending": "Ascending (A-Z, 0-9)",
      "descending": "Descending (Z-A, 9-0)"
    },
    "removeDuplicates": "Remove Duplicate Lines",
    "removeEmpty": "Remove Empty Lines"
  },
  "findReplace": {
    "inputPlaceholder": "Enter text to search and replace",
    "outputPlaceholder": "Text with replacements will appear here",
    "options": "Find & Replace Options",
    "findLabel": "Find",
    "findPlaceholder": "Text to find",
    "replaceLabel": "Replace with",
    "replacePlaceholder": "Replacement text",
    "caseSensitive": "Case Sensitive",
    "wholeWord": "Whole Word Only",
    "useRegex": "Use Regular Expression",
    "replaceAll": "Replace All Occurrences",
    "invalidRegex": "Invalid regular expression",
    "regexHelp": "You can use regex patterns like \\d+ for numbers, \\w+ for words, etc."
  }
}
```

## Testing & Verification

1. Test all formatting functions
2. Verify regex find/replace
3. Test with large texts
4. Check edge cases (empty input, special characters)
5. Verify performance with long texts

## Success Indicators
- ✅ All formatters work correctly
- ✅ Regex support functional
- ✅ Real-time preview responsive
- ✅ Error handling for invalid regex
- ✅ Options work as expected

## Next Steps
Proceed to Story 4.3: Encoding/Decoding Tools

## Notes
- Consider adding preset formatting templates
- Add undo/redo functionality
- Monitor performance with regex operations
- Consider adding batch operations