# Story 2.2: Tool Layout Template

## Story Details
- **Stage**: 2 - Core Features & Shared Components
- **Priority**: Critical
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 2.1 (Language Switcher)

## Objective
Create a reusable tool layout template that provides a consistent structure for all text manipulation tools. This template will include areas for tool title, description, input/output sections, action buttons, and tool-specific options, ensuring a uniform user experience across all tools.

## Acceptance Criteria
- [ ] Responsive layout with input and output areas
- [ ] Tool header with title, description, and breadcrumbs
- [ ] Action buttons area (copy, clear, download, etc.)
- [ ] Options/settings panel for tool-specific controls
- [ ] Character/word/line counter integration
- [ ] Loading states for processing
- [ ] Error handling display
- [ ] Mobile-optimized layout
- [ ] Supports all theme variations
- [ ] SEO-friendly structure

## Implementation Steps

### 1. Create Tool Layout Types

#### Create `src/types/tool.ts`
```typescript
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export interface ToolConfig {
  id: string
  name: string
  description: string
  category: ToolCategory
  icon?: LucideIcon
  keywords: string[]
  component: ReactNode
}

export interface ToolLayoutProps {
  tool: ToolConfig
  children?: ReactNode
}

export interface ToolHeaderProps {
  title: string
  description: string
  icon?: LucideIcon
  category?: string
}

export interface ToolInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  showCounter?: boolean
  isLoading?: boolean
  error?: string
}

export interface ToolOutputProps {
  value: string
  placeholder?: string
  rows?: number
  showCounter?: boolean
  isLoading?: boolean
  actions?: ToolAction[]
}

export interface ToolAction {
  id: string
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  disabled?: boolean
  loading?: boolean
}

export interface ToolOptionsProps {
  children: ReactNode
  title?: string
}

export enum ToolCategory {
  TEXT_CASE = 'text-case',
  TEXT_FORMAT = 'text-format',
  ENCODING = 'encoding',
  GENERATORS = 'generators',
  DEVELOPERS = 'developers',
  IMAGES = 'images',
}

export interface ToolStats {
  characters: number
  words: number
  lines: number
  sentences?: number
}
```

### 2. Create Tool Layout Context

#### Create `src/contexts/tool-context.tsx`
```typescript
'use client'

import * as React from 'react'
import { ToolConfig, ToolStats } from '@/types/tool'

interface ToolContextValue {
  tool: ToolConfig
  input: string
  output: string
  setInput: (value: string) => void
  setOutput: (value: string) => void
  isProcessing: boolean
  setIsProcessing: (value: boolean) => void
  error: string | null
  setError: (value: string | null) => void
  stats: {
    input: ToolStats
    output: ToolStats
  }
}

const ToolContext = React.createContext<ToolContextValue | undefined>(undefined)

export function useToolContext() {
  const context = React.useContext(ToolContext)
  if (!context) {
    throw new Error('useToolContext must be used within a ToolProvider')
  }
  return context
}

interface ToolProviderProps {
  tool: ToolConfig
  children: React.ReactNode
}

export function ToolProvider({ tool, children }: ToolProviderProps) {
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const calculateStats = React.useCallback((text: string): ToolStats => {
    const characters = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const lines = text.trim() ? text.trim().split('\n').length : 0
    const sentences = text.trim() 
      ? text.split(/[.!?]+/).filter(s => s.trim()).length 
      : 0

    return { characters, words, lines, sentences }
  }, [])

  const stats = React.useMemo(() => ({
    input: calculateStats(input),
    output: calculateStats(output),
  }), [input, output, calculateStats])

  const value = React.useMemo(
    () => ({
      tool,
      input,
      output,
      setInput,
      setOutput,
      isProcessing,
      setIsProcessing,
      error,
      setError,
      stats,
    }),
    [tool, input, output, isProcessing, error, stats]
  )

  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>
}
```

### 3. Create Tool Header Component

#### Create `src/components/tools/tool-header.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { H1, Lead } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { cn } from '@/lib/utils'
import { ToolHeaderProps } from '@/types/tool'

export function ToolHeader({
  title,
  description,
  icon: Icon,
  category,
}: ToolHeaderProps) {
  const t = useTranslations('common')

  return (
    <div className="space-y-4">
      <Breadcrumb />
      
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <H1 className="!mt-0">{title}</H1>
              {category && (
                <Badge variant="secondary" className="mt-1">
                  {t(`tools.categories.${category}` as any)}
                </Badge>
              )}
            </div>
            <Lead className="text-muted-foreground">
              {description}
            </Lead>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 4. Create Tool Input Component

#### Create `src/components/tools/tool-input.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TextCounter } from '@/components/ui/text-counter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToolInputProps } from '@/types/tool'

export function ToolInput({
  value,
  onChange,
  placeholder,
  rows = 8,
  maxLength,
  showCounter = true,
  isLoading = false,
  error,
}: ToolInputProps) {
  const t = useTranslations('common.common')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      onChange(text)
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    onChange('')
    textareaRef.current?.focus()
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('input')}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              disabled={isLoading}
            >
              {t('paste')}
            </Button>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('upload')}
              </Button>
            </Label>
            <input
              id="file-upload"
              type="file"
              accept=".txt,.md,.csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                {t('clear')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || t('enterText')}
          rows={rows}
          maxLength={maxLength}
          disabled={isLoading}
          className={cn(
            'min-h-[200px] font-mono text-sm resize-y',
            error && 'border-destructive focus:ring-destructive'
          )}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {showCounter && (
          <TextCounter text={value} />
        )}
      </CardContent>
    </Card>
  )
}
```

### 5. Create Tool Output Component

#### Create `src/components/tools/tool-output.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Textarea } from '@/components/ui/textarea'
import { TextCounter } from '@/components/ui/text-counter'
import { Button } from '@/components/ui/button'
import { ButtonExtended } from '@/components/ui/button-extended'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Download, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToolOutputProps } from '@/types/tool'
import { CopyButton } from '@/components/ui/copy-button'

export function ToolOutput({
  value,
  placeholder,
  rows = 8,
  showCounter = true,
  isLoading = false,
  actions = [],
}: ToolOutputProps) {
  const t = useTranslations('common.common')

  const defaultActions = React.useMemo(() => [
    {
      id: 'copy',
      label: t('copy'),
      icon: Copy,
      onClick: () => navigator.clipboard.writeText(value),
      disabled: !value,
    },
    {
      id: 'download',
      label: t('download'),
      icon: Download,
      onClick: () => {
        const blob = new Blob([value], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'output.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },
      disabled: !value,
      variant: 'outline' as const,
    },
  ], [value, t])

  const combinedActions = [...defaultActions, ...actions]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('output')}</CardTitle>
          <div className="flex gap-2">
            {combinedActions.map((action) => (
              <ButtonExtended
                key={action.id}
                variant={action.variant || 'ghost'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled || isLoading}
                loading={action.loading}
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </ButtonExtended>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={value}
          placeholder={placeholder || t('outputWillAppearHere')}
          rows={rows}
          readOnly
          className={cn(
            'min-h-[200px] font-mono text-sm resize-y',
            'bg-muted/50 cursor-default'
          )}
        />
        {showCounter && value && (
          <TextCounter text={value} />
        )}
      </CardContent>
    </Card>
  )
}
```

### 6. Create Tool Options Panel

#### Create `src/components/tools/tool-options.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ToolOptionsProps } from '@/types/tool'

export function ToolOptions({
  children,
  title,
  className,
}: ToolOptionsProps & { className?: string }) {
  const t = useTranslations('common.common')

  return (
    <Card className={cn('sticky top-24', className)}>
      <CardHeader>
        <CardTitle className="text-base">
          {title || t('options')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
```

### 7. Create Main Tool Layout

#### Create `src/components/tools/tool-layout.tsx`
```typescript
'use client'

import * as React from 'react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { ToolProvider } from '@/contexts/tool-context'
import { ToolHeader } from './tool-header'
import { ToolLayoutProps } from '@/types/tool'
import { cn } from '@/lib/utils'

interface ExtendedToolLayoutProps extends ToolLayoutProps {
  header?: React.ReactNode
  className?: string
}

export function ToolLayout({
  tool,
  header,
  children,
  className,
}: ExtendedToolLayoutProps) {
  return (
    <ToolProvider tool={tool}>
      <div className={cn('min-h-screen bg-background', className)}>
        <Section className="pt-8 pb-4">
          <Container>
            {header || (
              <ToolHeader
                title={tool.name}
                description={tool.description}
                icon={tool.icon}
                category={tool.category}
              />
            )}
          </Container>
        </Section>

        <Section className="py-4">
          <Container>
            {children}
          </Container>
        </Section>
      </div>
    </ToolProvider>
  )
}

// Export sub-components for easy access
ToolLayout.Header = ToolHeader
ToolLayout.Input = ToolInput
ToolLayout.Output = ToolOutput
ToolLayout.Options = ToolOptions
```

### 8. Create Tool Template Layouts

#### Create `src/components/tools/layouts/single-transform-layout.tsx`
```typescript
'use client'

import * as React from 'react'
import { ToolLayout } from '../tool-layout'
import { ToolInput } from '../tool-input'
import { ToolOutput } from '../tool-output'
import { ToolOptions } from '../tool-options'
import { useToolContext } from '@/contexts/tool-context'
import { ToolConfig } from '@/types/tool'

interface SingleTransformLayoutProps {
  tool: ToolConfig
  transform: (input: string, options?: any) => string
  options?: React.ReactNode
  inputProps?: Partial<React.ComponentProps<typeof ToolInput>>
  outputProps?: Partial<React.ComponentProps<typeof ToolOutput>>
}

export function SingleTransformLayout({
  tool,
  transform,
  options,
  inputProps,
  outputProps,
}: SingleTransformLayoutProps) {
  const { input, output, setInput, setOutput, setIsProcessing, setError } = useToolContext()
  const [localOptions, setLocalOptions] = React.useState({})

  React.useEffect(() => {
    const processInput = async () => {
      if (!input) {
        setOutput('')
        return
      }

      setIsProcessing(true)
      setError(null)

      try {
        const result = await transform(input, localOptions)
        setOutput(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Processing failed')
        setOutput('')
      } finally {
        setIsProcessing(false)
      }
    }

    const debounceTimer = setTimeout(processInput, 300)
    return () => clearTimeout(debounceTimer)
  }, [input, localOptions, transform, setOutput, setIsProcessing, setError])

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ToolInput
            value={input}
            onChange={setInput}
            {...inputProps}
          />
          <ToolOutput
            value={output}
            {...outputProps}
          />
        </div>
        
        {options && (
          <div className="lg:col-span-1">
            <ToolOptions>
              {React.cloneElement(options as React.ReactElement, {
                value: localOptions,
                onChange: setLocalOptions,
              })}
            </ToolOptions>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
```

#### Create `src/components/tools/layouts/dual-input-layout.tsx`
```typescript
'use client'

import * as React from 'react'
import { ToolLayout } from '../tool-layout'
import { ToolInput } from '../tool-input'
import { ToolOutput } from '../tool-output'
import { ToolOptions } from '../tool-options'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft } from 'lucide-react'
import { useToolContext } from '@/contexts/tool-context'
import { ToolConfig } from '@/types/tool'

interface DualInputLayoutProps {
  tool: ToolConfig
  inputALabel: string
  inputBLabel: string
  transform: (inputA: string, inputB: string, options?: any) => string
  options?: React.ReactNode
  allowSwap?: boolean
}

export function DualInputLayout({
  tool,
  inputALabel,
  inputBLabel,
  transform,
  options,
  allowSwap = true,
}: DualInputLayoutProps) {
  const { setOutput, setIsProcessing, setError } = useToolContext()
  const [inputA, setInputA] = React.useState('')
  const [inputB, setInputB] = React.useState('')
  const [localOptions, setLocalOptions] = React.useState({})

  const handleSwap = () => {
    const temp = inputA
    setInputA(inputB)
    setInputB(temp)
  }

  React.useEffect(() => {
    const processInputs = async () => {
      if (!inputA && !inputB) {
        setOutput('')
        return
      }

      setIsProcessing(true)
      setError(null)

      try {
        const result = await transform(inputA, inputB, localOptions)
        setOutput(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Processing failed')
        setOutput('')
      } finally {
        setIsProcessing(false)
      }
    }

    const debounceTimer = setTimeout(processInputs, 300)
    return () => clearTimeout(debounceTimer)
  }, [inputA, inputB, localOptions, transform, setOutput, setIsProcessing, setError])

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ToolInput
              value={inputA}
              onChange={setInputA}
              rows={6}
              showCounter={false}
            />
            <div className="relative">
              {allowSwap && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 md:left-0 md:-translate-x-1/2"
                  onClick={handleSwap}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              )}
              <ToolInput
                value={inputB}
                onChange={setInputB}
                rows={6}
                showCounter={false}
              />
            </div>
          </div>
          
          <ToolOutput value={output} />
        </div>
        
        {options && (
          <div className="lg:col-span-1">
            <ToolOptions>
              {React.cloneElement(options as React.ReactElement, {
                value: localOptions,
                onChange: setLocalOptions,
              })}
            </ToolOptions>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
```

### 9. Create Tool Loading States

#### Create `src/components/tools/tool-loading.tsx`
```typescript
import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

export function ToolLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Section className="pt-8 pb-4">
        <Container>
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-96" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="py-4">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Input skeleton */}
              <Skeleton className="h-[300px]" />
              {/* Output skeleton */}
              <Skeleton className="h-[300px]" />
            </div>
            {/* Options skeleton */}
            <div className="lg:col-span-1">
              <Skeleton className="h-[200px]" />
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
```

### 10. Create Example Tool Using the Template

#### Create `src/app/[locale]/tools/example/page.tsx`
```typescript
'use client'

import { Type } from 'lucide-react'
import { SingleTransformLayout } from '@/components/tools/layouts/single-transform-layout'
import { ToolCategory } from '@/types/tool'

const tool = {
  id: 'example',
  name: 'Example Tool',
  description: 'This is an example tool using the tool layout template',
  category: ToolCategory.TEXT_CASE,
  icon: Type,
  keywords: ['example', 'demo', 'template'],
  component: null,
}

function transform(input: string): string {
  // Example transformation - convert to uppercase
  return input.toUpperCase()
}

export default function ExampleToolPage() {
  return (
    <SingleTransformLayout
      tool={tool}
      transform={transform}
      inputProps={{
        placeholder: 'Enter text to transform...',
      }}
      outputProps={{
        placeholder: 'Transformed text will appear here...',
      }}
    />
  )
}
```

## Testing & Verification

### 1. Test Layout Responsiveness
```bash
npm run dev

# Navigate to example tool
# Test on different screen sizes:
# - Desktop: 3-column layout
# - Tablet: 2-column layout
# - Mobile: Single column
```

### 2. Test Input Features
- Type text manually
- Upload a text file
- Paste from clipboard
- Clear input
- Verify character counter updates

### 3. Test Output Features
- Verify output updates as you type
- Test copy button
- Test download button
- Verify counter shows output stats

### 4. Test Loading States
- Add artificial delay to transform function
- Verify loading states appear
- Check that UI is disabled during processing

### 5. Test Error Handling
- Throw error in transform function
- Verify error displays properly
- Check recovery after fixing input

### 6. Test Theme Support
- Switch between light and dark themes
- Verify all components adapt properly
- Check contrast ratios

## Success Indicators
- ✅ Consistent layout across all tools
- ✅ Responsive design works on all devices
- ✅ Input/output areas clearly distinguished
- ✅ All actions accessible and functional
- ✅ Loading states prevent race conditions
- ✅ Error messages helpful and clear
- ✅ Theme support complete
- ✅ SEO-friendly structure
- ✅ Keyboard navigation works
- ✅ Reusable for all tool types

## Common Issues & Solutions

### Issue: Layout shifts during loading
**Solution**: Use skeleton screens with fixed heights

### Issue: Options panel overlaps on mobile
**Solution**: Stack options below input/output on small screens

### Issue: Transform function runs too often
**Solution**: Implement debouncing (already included)

### Issue: Large inputs cause performance issues
**Solution**: Add input length limits and virtualization for display

## Next Steps
Once this story is complete, proceed to Story 2.3: Text Input/Output Components

## Notes for AI Implementation
- Keep the template flexible for different tool types
- Ensure all text is translatable
- Test with real tool implementations
- Consider adding preset examples
- Monitor performance with large inputs
- Add analytics tracking for tool usage