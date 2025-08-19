# Story 4.4: Text Generator Tools

## Story Details
- **Stage**: 4 - Core Text Tools Implementation
- **Priority**: Medium
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 4.3 (Encoding/Decoding Tools)

## Objective
Implement various text generation tools including Lorem Ipsum generator, random password generator, UUID generator, and other useful text generation utilities. These tools should provide customizable options and generate high-quality output.

## Acceptance Criteria
- [ ] Lorem Ipsum generator with customizable length
- [ ] Random password generator with complexity options
- [ ] UUID/GUID generator (v1, v4)
- [ ] Random string generator
- [ ] Random number generator
- [ ] Dummy data generator (names, emails, addresses)
- [ ] SQL insert statement generator
- [ ] JSON data generator
- [ ] Markdown table generator
- [ ] Random word generator
- [ ] Copy protection for generated content

## Implementation Steps

### 1. Create Text Generator Utilities

#### Create `src/lib/generators/text-generators.ts`
```typescript
/**
 * Text generation utilities
 */

import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'

// Lorem Ipsum base text
const LOREM_IPSUM_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

const LOREM_WORDS = LOREM_IPSUM_TEXT.toLowerCase().replace(/[.,]/g, '').split(' ')

export const generators = {
  // Lorem Ipsum Generator
  loremIpsum: {
    generateWords: (count: number): string => {
      const words: string[] = []
      for (let i = 0; i < count; i++) {
        words.push(LOREM_WORDS[i % LOREM_WORDS.length])
      }
      return words.join(' ')
    },

    generateParagraphs: (count: number, wordsPerParagraph = 50): string => {
      const paragraphs: string[] = []
      for (let i = 0; i < count; i++) {
        const words = generators.loremIpsum.generateWords(wordsPerParagraph)
        const sentence = words.charAt(0).toUpperCase() + words.slice(1) + '.'
        paragraphs.push(sentence)
      }
      return paragraphs.join('\n\n')
    },

    generateSentences: (count: number, wordsPerSentence = 10): string => {
      const sentences: string[] = []
      for (let i = 0; i < count; i++) {
        const words = generators.loremIpsum.generateWords(wordsPerSentence)
        const sentence = words.charAt(0).toUpperCase() + words.slice(1) + '.'
        sentences.push(sentence)
      }
      return sentences.join(' ')
    },
  },

  // Password Generator
  password: {
    generate: (options: {
      length: number
      uppercase?: boolean
      lowercase?: boolean
      numbers?: boolean
      symbols?: boolean
      excludeSimilar?: boolean
      excludeAmbiguous?: boolean
    }): string => {
      const { 
        length, 
        uppercase = true, 
        lowercase = true, 
        numbers = true, 
        symbols = false,
        excludeSimilar = false,
        excludeAmbiguous = false,
      } = options

      let charset = ''
      
      if (lowercase) {
        charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
      }
      if (uppercase) {
        charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      }
      if (numbers) {
        charset += excludeSimilar ? '23456789' : '0123456789'
      }
      if (symbols) {
        charset += excludeAmbiguous ? '!#$%&*+-=?@^_' : '!#$%&()*+,-./:;<=>?@[]^_`{|}~'
      }

      if (!charset) {
        throw new Error('At least one character type must be selected')
      }

      let password = ''
      const array = new Uint32Array(length)
      crypto.getRandomValues(array)
      
      for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length]
      }

      return password
    },

    generateMultiple: (count: number, options: any): string[] => {
      const passwords: string[] = []
      for (let i = 0; i < count; i++) {
        passwords.push(generators.password.generate(options))
      }
      return passwords
    },

    checkStrength: (password: string): {
      score: number
      feedback: string[]
    } => {
      let score = 0
      const feedback: string[] = []

      if (password.length >= 8) score++
      if (password.length >= 12) score++
      if (password.length >= 16) score++
      
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[^a-zA-Z0-9]/.test(password)) score++

      if (score < 3) feedback.push('Password is weak')
      else if (score < 5) feedback.push('Password is moderate')
      else feedback.push('Password is strong')

      if (password.length < 8) feedback.push('Use at least 8 characters')
      if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters')
      if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters')
      if (!/[0-9]/.test(password)) feedback.push('Add numbers')
      if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters')

      return { score: Math.min(score, 5), feedback }
    },
  },

  // UUID Generator
  uuid: {
    v1: (): string => uuidv1(),
    v4: (): string => uuidv4(),
    
    generateMultiple: (count: number, version: 'v1' | 'v4' = 'v4'): string[] => {
      const uuids: string[] = []
      const generator = version === 'v1' ? uuidv1 : uuidv4
      
      for (let i = 0; i < count; i++) {
        uuids.push(generator())
      }
      return uuids
    },
    
    nil: (): string => '00000000-0000-0000-0000-000000000000',
    
    validate: (uuid: string): boolean => {
      const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      return regex.test(uuid)
    },
  },

  // Random String Generator
  randomString: {
    generate: (length: number, charset?: string): string => {
      const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      const chars = charset || defaultCharset
      
      let result = ''
      const array = new Uint32Array(length)
      crypto.getRandomValues(array)
      
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length]
      }
      
      return result
    },
    
    alphanumeric: (length: number): string => {
      return generators.randomString.generate(
        length, 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      )
    },
    
    alphabetic: (length: number): string => {
      return generators.randomString.generate(
        length,
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      )
    },
    
    numeric: (length: number): string => {
      return generators.randomString.generate(length, '0123456789')
    },
    
    hex: (length: number): string => {
      return generators.randomString.generate(length, '0123456789abcdef')
    },
  },

  // Random Number Generator
  randomNumber: {
    integer: (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min
    },
    
    float: (min: number, max: number, decimals = 2): number => {
      const num = Math.random() * (max - min) + min
      return parseFloat(num.toFixed(decimals))
    },
    
    generateMultiple: (
      count: number, 
      min: number, 
      max: number, 
      type: 'integer' | 'float' = 'integer'
    ): number[] => {
      const numbers: number[] = []
      for (let i = 0; i < count; i++) {
        numbers.push(
          type === 'integer' 
            ? generators.randomNumber.integer(min, max)
            : generators.randomNumber.float(min, max)
        )
      }
      return numbers
    },
  },

  // Dummy Data Generator
  dummyData: {
    firstNames: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Robert', 'Sophia'],
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
    domains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'],
    streets: ['Main St', 'Oak Ave', 'Elm St', 'Park Rd', 'First Ave', 'Second St', 'Maple Dr', 'Cedar Ln'],
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
    
    name: function(): string {
      const first = this.firstNames[Math.floor(Math.random() * this.firstNames.length)]
      const last = this.lastNames[Math.floor(Math.random() * this.lastNames.length)]
      return `${first} ${last}`
    },
    
    email: function(): string {
      const first = this.firstNames[Math.floor(Math.random() * this.firstNames.length)].toLowerCase()
      const last = this.lastNames[Math.floor(Math.random() * this.lastNames.length)].toLowerCase()
      const domain = this.domains[Math.floor(Math.random() * this.domains.length)]
      const num = Math.floor(Math.random() * 99)
      return `${first}.${last}${num}@${domain}`
    },
    
    phone: (): string => {
      const area = generators.randomNumber.integer(200, 999)
      const prefix = generators.randomNumber.integer(200, 999)
      const line = generators.randomNumber.integer(1000, 9999)
      return `(${area}) ${prefix}-${line}`
    },
    
    address: function(): string {
      const num = generators.randomNumber.integer(100, 9999)
      const street = this.streets[Math.floor(Math.random() * this.streets.length)]
      const city = this.cities[Math.floor(Math.random() * this.cities.length)]
      const state = 'NY' // Simplified
      const zip = generators.randomNumber.integer(10000, 99999)
      return `${num} ${street}, ${city}, ${state} ${zip}`
    },
    
    generateMultiple: function(type: 'name' | 'email' | 'phone' | 'address', count: number): string[] {
      const data: string[] = []
      for (let i = 0; i < count; i++) {
        data.push(this[type]())
      }
      return data
    },
  },

  // JSON Generator
  json: {
    generateObject: (fields: { name: string; type: string; options?: any }[]): any => {
      const obj: any = {}
      
      fields.forEach(field => {
        switch (field.type) {
          case 'string':
            obj[field.name] = generators.loremIpsum.generateWords(3)
            break
          case 'number':
            obj[field.name] = generators.randomNumber.integer(
              field.options?.min || 0,
              field.options?.max || 100
            )
            break
          case 'boolean':
            obj[field.name] = Math.random() > 0.5
            break
          case 'date':
            obj[field.name] = new Date().toISOString()
            break
          case 'uuid':
            obj[field.name] = generators.uuid.v4()
            break
          case 'email':
            obj[field.name] = generators.dummyData.email()
            break
          case 'name':
            obj[field.name] = generators.dummyData.name()
            break
          default:
            obj[field.name] = null
        }
      })
      
      return obj
    },
    
    generateArray: (
      count: number, 
      fields: { name: string; type: string; options?: any }[]
    ): any[] => {
      const array: any[] = []
      for (let i = 0; i < count; i++) {
        array.push(generators.json.generateObject(fields))
      }
      return array
    },
  },

  // SQL Generator
  sql: {
    generateInsert: (
      tableName: string,
      data: any[],
      columns?: string[]
    ): string => {
      if (!data.length) return ''
      
      const cols = columns || Object.keys(data[0])
      const values = data.map(row => {
        const vals = cols.map(col => {
          const val = row[col]
          if (val === null || val === undefined) return 'NULL'
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
          if (typeof val === 'boolean') return val ? '1' : '0'
          if (val instanceof Date) return `'${val.toISOString()}'`
          return val.toString()
        })
        return `(${vals.join(', ')})`
      })
      
      return `INSERT INTO ${tableName} (${cols.join(', ')}) VALUES\n${values.join(',\n')};`
    },
  },

  // Markdown Table Generator
  markdown: {
    generateTable: (
      headers: string[],
      rows: string[][],
      alignment?: ('left' | 'center' | 'right')[]
    ): string => {
      const align = alignment || headers.map(() => 'left')
      
      // Header
      let table = `| ${headers.join(' | ')} |\n`
      
      // Separator
      table += '|'
      align.forEach(a => {
        switch (a) {
          case 'left':
            table += ' :--- |'
            break
          case 'center':
            table += ' :---: |'
            break
          case 'right':
            table += ' ---: |'
            break
        }
      })
      table += '\n'
      
      // Rows
      rows.forEach(row => {
        table += `| ${row.join(' | ')} |\n`
      })
      
      return table
    },
  },
}
```

### 2. Create Generator Components

#### Create `src/components/tools/generators/lorem-ipsum-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { FileText } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { ToolOutput } from '@/components/tools/tool-output'
import { ToolOptions } from '@/components/tools/tool-options'
import { useToolContext } from '@/contexts/tool-context'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { generators } from '@/lib/generators/text-generators'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'lorem-ipsum',
  name: 'Lorem Ipsum Generator',
  description: 'Generate Lorem Ipsum placeholder text',
  category: ToolCategory.GENERATORS,
  icon: FileText,
  keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', 'text'],
  component: null,
}

export function LoremIpsumTool() {
  const t = useTranslations('tools.loremIpsum')
  const { output, setOutput } = useToolContext()
  
  const [options, setOptions] = React.useState({
    type: 'paragraphs' as 'words' | 'sentences' | 'paragraphs',
    count: 3,
    startWithLorem: true,
  })

  const generate = React.useCallback(() => {
    let result = ''
    
    switch (options.type) {
      case 'words':
        result = generators.loremIpsum.generateWords(options.count)
        break
      case 'sentences':
        result = generators.loremIpsum.generateSentences(options.count)
        break
      case 'paragraphs':
        result = generators.loremIpsum.generateParagraphs(options.count)
        break
    }
    
    if (options.startWithLorem && result) {
      result = 'Lorem ipsum ' + result.substring(result.indexOf(' ') + 1)
    }
    
    setOutput(result)
  }, [options, setOutput])

  React.useEffect(() => {
    generate()
  }, []) // Generate on mount

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-end">
            <Button onClick={generate}>
              {t('generate')}
            </Button>
          </div>
          
          <ToolOutput
            value={output}
            placeholder={t('outputPlaceholder')}
            rows={12}
          />
        </div>
        
        <div className="lg:col-span-1">
          <ToolOptions title={t('options')}>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>{t('generateType')}</Label>
                <RadioGroup 
                  value={options.type} 
                  onValueChange={(value) => 
                    setOptions({ ...options, type: value as any })
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="words" id="words" />
                      <Label htmlFor="words">{t('words')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sentences" id="sentences" />
                      <Label htmlFor="sentences">{t('sentences')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paragraphs" id="paragraphs" />
                      <Label htmlFor="paragraphs">{t('paragraphs')}</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="count">{t('count')}</Label>
                <Input
                  id="count"
                  type="number"
                  value={options.count}
                  onChange={(e) => 
                    setOptions({ ...options, count: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                  max={100}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="start-lorem">
                  {t('startWithLorem')}
                </Label>
                <Switch
                  id="start-lorem"
                  checked={options.startWithLorem}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, startWithLorem: checked })
                  }
                />
              </div>
            </div>
          </ToolOptions>
        </div>
      </div>
    </ToolLayout>
  )
}
```

#### Create `src/components/tools/generators/password-generator-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Key, RefreshCw } from 'lucide-react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CopyButton } from '@/components/ui/copy-button'
import { generators } from '@/lib/generators/text-generators'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'password-generator',
  name: 'Password Generator',
  description: 'Generate secure random passwords',
  category: ToolCategory.GENERATORS,
  icon: Key,
  keywords: ['password', 'secure', 'random', 'generator'],
  component: null,
}

export function PasswordGeneratorTool() {
  const t = useTranslations('tools.passwordGenerator')
  const [passwords, setPasswords] = React.useState<string[]>([])
  const [count, setCount] = React.useState(1)
  
  const [options, setOptions] = React.useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeSimilar: false,
    excludeAmbiguous: false,
  })

  const generate = React.useCallback(() => {
    try {
      const newPasswords = generators.password.generateMultiple(count, options)
      setPasswords(newPasswords)
    } catch (error) {
      // Handle error (at least one option must be selected)
      setPasswords([])
    }
  }, [count, options])

  React.useEffect(() => {
    generate()
  }, []) // Generate on mount

  const getPasswordStrength = (password: string) => {
    const { score, feedback } = generators.password.checkStrength(password)
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['red', 'orange', 'yellow', 'blue', 'green']
    
    return {
      label: strengthLabels[Math.min(score - 1, 4)],
      color: strengthColors[Math.min(score - 1, 4)],
      score: score * 20,
      feedback,
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('title')}</h2>
          <Button onClick={generate} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('generate')}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {passwords.map((password, index) => {
              const strength = getPasswordStrength(password)
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {t('password')} {passwords.length > 1 && `#${index + 1}`}
                      </CardTitle>
                      <CopyButton text={password} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="font-mono text-lg bg-muted p-3 rounded break-all">
                      {password}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('strength')}</span>
                        <span className={`font-medium text-${strength.color}-600`}>
                          {strength.label}
                        </span>
                      </div>
                      <Progress value={strength.score} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('options')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t('length')}</Label>
                    <span className="text-sm font-medium">{options.length}</span>
                  </div>
                  <Slider
                    value={[options.length]}
                    onValueChange={([value]) => 
                      setOptions({ ...options, length: value })
                    }
                    min={4}
                    max={64}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="uppercase">{t('uppercase')}</Label>
                    <Switch
                      id="uppercase"
                      checked={options.uppercase}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, uppercase: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowercase">{t('lowercase')}</Label>
                    <Switch
                      id="lowercase"
                      checked={options.lowercase}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, lowercase: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="numbers">{t('numbers')}</Label>
                    <Switch
                      id="numbers"
                      checked={options.numbers}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, numbers: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="symbols">{t('symbols')}</Label>
                    <Switch
                      id="symbols"
                      checked={options.symbols}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, symbols: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exclude-similar">
                      {t('excludeSimilar')}
                    </Label>
                    <Switch
                      id="exclude-similar"
                      checked={options.excludeSimilar}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, excludeSimilar: checked })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('excludeSimilarHelp')}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exclude-ambiguous">
                      {t('excludeAmbiguous')}
                    </Label>
                    <Switch
                      id="exclude-ambiguous"
                      checked={options.excludeAmbiguous}
                      onCheckedChange={(checked) =>
                        setOptions({ ...options, excludeAmbiguous: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t">
                  <Label htmlFor="count">{t('numberOfPasswords')}</Label>
                  <Input
                    id="count"
                    type="number"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    min={1}
                    max={10}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
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
  "loremIpsum": {
    "generate": "Generate",
    "outputPlaceholder": "Generated Lorem Ipsum text will appear here",
    "options": "Options",
    "generateType": "Generate",
    "words": "Words",
    "sentences": "Sentences",
    "paragraphs": "Paragraphs",
    "count": "How many?",
    "startWithLorem": "Start with 'Lorem ipsum'"
  },
  "passwordGenerator": {
    "title": "Password Generator",
    "generate": "Generate New",
    "password": "Password",
    "strength": "Strength",
    "options": "Options",
    "length": "Length",
    "uppercase": "Uppercase (A-Z)",
    "lowercase": "Lowercase (a-z)",
    "numbers": "Numbers (0-9)",
    "symbols": "Symbols (!@#$%)",
    "excludeSimilar": "Exclude Similar",
    "excludeSimilarHelp": "Excludes: i, l, 1, L, o, 0, O",
    "excludeAmbiguous": "Exclude Ambiguous",
    "numberOfPasswords": "Number of Passwords"
  }
}
```

## Testing & Verification

1. Test all generators with various options
2. Verify randomness quality
3. Test password strength checker
4. Check UUID validity
5. Test with edge cases (min/max values)

## Success Indicators
- ✅ All generators produce valid output
- ✅ Secure random generation
- ✅ Customizable options work
- ✅ Real-time generation
- ✅ Copy functionality works

## Next Steps
Proceed to Story 4.5: Text Statistics & Analysis Tools

## Notes
- Consider adding more dummy data types
- Add CSV/TSV export for generated data
- Consider adding custom Lorem Ipsum text
- Add password history (local storage)