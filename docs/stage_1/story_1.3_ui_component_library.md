# Story 1.3: UI Component Library Setup (shadcn/ui + Tailwind)

## Story Details
- **Stage**: 1 - Foundation & Infrastructure
- **Priority**: Critical
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 1.1 (Project Setup), Story 1.2 (i18n Configuration)

## Objective
Set up a comprehensive UI component library using shadcn/ui components with Tailwind CSS. Create a consistent design system with reusable components that support both light and dark themes, and work seamlessly with our i18n setup.

## Acceptance Criteria
- [ ] shadcn/ui components installed and configured
- [ ] Core UI components created (Button, Input, Card, etc.)
- [ ] Custom theme colors configured
- [ ] Components support dark/light mode
- [ ] Components are accessible (ARIA labels, keyboard navigation)
- [ ] Consistent spacing and typography system
- [ ] Components work with all language variations

## Implementation Steps

### 1. Install Core shadcn/ui Components

```bash
# Install essential shadcn/ui components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
```

### 2. Create Custom Theme Configuration

#### Update `src/app/globals.css` with custom theme
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --ring: 221.2 83.2% 53.3%;
    
    --radius: 0.5rem;
    
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    
    --primary: 217.9 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    
    --ring: 217.9 91.2% 59.8%;
    
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .step {
    counter-increment: step;
  }
  
  .step:before {
    @apply absolute w-9 h-9 bg-muted rounded-full font-mono font-medium text-center text-base inline-flex items-center justify-center -indent-px border-4 border-background;
    @apply ml-[-50px] mt-[-4px];
    content: counter(step);
  }
}

/* Custom scrollbar */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-default {
    scrollbar-color: hsl(var(--muted-foreground)) transparent;
    scrollbar-width: thin;
  }
  
  .scrollbar-default::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .scrollbar-default::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-default::-webkit-scrollbar-thumb {
    @apply bg-muted-foreground/20 rounded-full;
  }
  
  .scrollbar-default::-webkit-scrollbar-thumb:hover {
    @apply bg-muted-foreground/30;
  }
}

/* Focus styles */
@layer base {
  :focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }
}

/* Animation utilities */
@layer utilities {
  .animate-in {
    animation: animateIn 0.3s ease-in-out;
  }
  
  .animate-out {
    animation: animateOut 0.3s ease-in-out;
  }
  
  @keyframes animateIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes animateOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(10px);
    }
  }
}
```

### 3. Create Extended Button Component

#### Create `src/components/ui/button-extended.tsx`
```typescript
import * as React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonExtendedProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

const ButtonExtended = React.forwardRef<HTMLButtonElement, ButtonExtendedProps>(
  ({ className, children, loading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </Button>
    )
  }
)
ButtonExtended.displayName = 'ButtonExtended'

export { ButtonExtended }
```

### 4. Create Custom Card Component for Tools

#### Create `src/components/ui/tool-card.tsx`
```typescript
import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface ToolCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  icon?: LucideIcon
  category?: string
  href?: string
  badge?: string
  disabled?: boolean
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  category,
  href,
  badge,
  disabled = false,
  className,
  ...props
}: ToolCardProps) {
  const Comp = href && !disabled ? 'a' : 'div'
  
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all hover:shadow-lg',
        href && !disabled && 'cursor-pointer hover:scale-[1.02]',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <Comp href={href} className="block">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                {category && (
                  <p className="text-xs text-muted-foreground mt-1">{category}</p>
                )}
              </div>
            </div>
            {badge && (
              <Badge variant="secondary" className="ml-2">
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Comp>
    </Card>
  )
}
```

### 5. Create Container Component

#### Create `src/components/ui/container.tsx`
```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const containerSizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
}

export function Container({
  size = 'lg',
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        className
      )}
      {...props}
    />
  )
}
```

### 6. Create Copy Button Component

#### Create `src/components/ui/copy-button.tsx`
```typescript
'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  text: string
  onCopy?: () => void
}

export function CopyButton({
  text,
  onCopy,
  className,
  variant = 'outline',
  size = 'sm',
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const t = useTranslations('common.common')

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopy?.()
      
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }, [text, onCopy])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn('transition-all', className)}
      {...props}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          {t('copied')}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {t('copy')}
        </>
      )}
    </Button>
  )
}
```

### 7. Create Text Counter Component

#### Create `src/components/ui/text-counter.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export interface TextCounterProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
}

export function TextCounter({ text, className, ...props }: TextCounterProps) {
  const t = useTranslations('common.common')
  
  const stats = React.useMemo(() => {
    const characters = text.length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const lines = text.trim() ? text.trim().split('\n').length : 0
    
    return { characters, words, lines }
  }, [text])
  
  return (
    <div
      className={cn(
        'flex flex-wrap gap-4 text-sm text-muted-foreground',
        className
      )}
      {...props}
    >
      <div>
        <span className="font-medium">{stats.characters}</span> {t('characters')}
      </div>
      <div>
        <span className="font-medium">{stats.words}</span> {t('words')}
      </div>
      <div>
        <span className="font-medium">{stats.lines}</span> {t('lines')}
      </div>
    </div>
  )
}
```

### 8. Create Loading States

#### Create `src/components/ui/loading.tsx`
```typescript
import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const loadingSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function Loading({
  size = 'md',
  text,
  className,
  ...props
}: LoadingProps) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin', loadingSizes[size])} />
      {text && <span className="ml-2">{text}</span>}
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loading size="lg" />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading size="lg" />
    </div>
  )
}
```

### 9. Create Empty State Component

#### Create `src/components/ui/empty-state.tsx`
```typescript
import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

### 10. Create Section Component

#### Create `src/components/ui/section.tsx`
```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  container?: boolean
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Section({
  container = true,
  containerSize = 'lg',
  className,
  children,
  ...props
}: SectionProps) {
  const containerSizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    full: 'max-w-full',
  }
  
  return (
    <section
      className={cn('py-8 md:py-12 lg:py-16', className)}
      {...props}
    >
      {container ? (
        <div
          className={cn(
            'mx-auto w-full px-4 sm:px-6 lg:px-8',
            containerSizes[containerSize]
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  )
}
```

### 11. Create Typography Components

#### Create `src/components/ui/typography.tsx`
```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

export function H1({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className
      )}
      {...props}
    />
  )
}

export function H2({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        className
      )}
      {...props}
    />
  )
}

export function H3({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  )
}

export function H4({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  )
}

export function P({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
      {...props}
    />
  )
}

export function Lead({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xl text-muted-foreground', className)}
      {...props}
    />
  )
}

export function Large({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-lg font-semibold', className)} {...props} />
  )
}

export function Small({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <small
      className={cn('text-sm font-medium leading-none', className)}
      {...props}
    />
  )
}

export function Muted({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
```

### 12. Create Component Export Index

#### Create `src/components/ui/index.ts`
```typescript
// Re-export all UI components for easy importing
export * from './button'
export * from './button-extended'
export * from './card'
export * from './container'
export * from './copy-button'
export * from './dialog'
export * from './dropdown-menu'
export * from './empty-state'
export * from './input'
export * from './label'
export * from './loading'
export * from './section'
export * from './select'
export * from './separator'
export * from './skeleton'
export * from './switch'
export * from './tabs'
export * from './text-counter'
export * from './textarea'
export * from './toast'
export * from './tool-card'
export * from './tooltip'
export * from './typography'
```

## Testing & Verification

### 1. Create Component Showcase Page

#### Create `src/app/[locale]/components/page.tsx`
```typescript
'use client'

import * as React from 'react'
import {
  Button,
  ButtonExtended,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  CopyButton,
  EmptyState,
  H1,
  H2,
  H3,
  Input,
  Label,
  Lead,
  Loading,
  Section,
  Separator,
  TextCounter,
  Textarea,
  ToolCard,
} from '@/components/ui'
import { FileText, Palette, Type } from 'lucide-react'

export default function ComponentsPage() {
  const [text, setText] = React.useState('Hello, World!')
  const [loading, setLoading] = React.useState(false)

  return (
    <Container className="py-8">
      <H1>Component Library</H1>
      <Lead className="mt-4">
        All UI components used in the Text Tools application
      </Lead>

      <Separator className="my-8" />

      <Section container={false}>
        <H2>Buttons</H2>
        <div className="flex flex-wrap gap-4 mt-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <ButtonExtended loading loadingText="Processing...">
            Loading Button
          </ButtonExtended>
        </div>
      </Section>

      <Section container={false}>
        <H2>Tool Cards</H2>
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <ToolCard
            title="Uppercase Converter"
            description="Convert text to UPPERCASE"
            icon={Type}
            category="Text Case"
            href="/tools/uppercase"
          />
          <ToolCard
            title="Color Picker"
            description="Pick and convert colors"
            icon={Palette}
            category="Developer Tools"
            badge="New"
          />
          <ToolCard
            title="Coming Soon"
            description="This tool is under development"
            icon={FileText}
            disabled
          />
        </div>
      </Section>

      <Section container={false}>
        <H2>Form Elements</H2>
        <div className="max-w-md space-y-4 mt-4">
          <div>
            <Label htmlFor="input">Input Field</Label>
            <Input
              id="input"
              placeholder="Enter some text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="textarea">Textarea</Label>
            <Textarea
              id="textarea"
              placeholder="Enter multiple lines..."
              rows={4}
            />
          </div>
        </div>
      </Section>

      <Section container={false}>
        <H2>Utilities</H2>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Text Counter</CardTitle>
            <CardDescription>
              Shows character, word, and line count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TextCounter text={text} />
            <div className="mt-4">
              <CopyButton text={text} />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section container={false}>
        <H2>Loading States</H2>
        <div className="flex gap-8 items-center mt-4">
          <Loading size="sm" />
          <Loading size="md" />
          <Loading size="lg" text="Loading..." />
        </div>
      </Section>

      <Section container={false}>
        <H2>Empty State</H2>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <EmptyState
              icon={FileText}
              title="No tools found"
              description="Try adjusting your search or filters"
              action={{
                label: 'Clear filters',
                onClick: () => console.log('Clear filters'),
              }}
            />
          </CardContent>
        </Card>
      </Section>
    </Container>
  )
}
```

### 2. Test Theme Switching

Create a temporary theme toggle to test dark/light modes:

```typescript
// Add to your test page or layout
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

## Success Indicators
- ✅ All components render correctly
- ✅ Dark/light theme switching works
- ✅ Components are responsive
- ✅ Accessibility features work (keyboard navigation, ARIA labels)
- ✅ Components integrate with i18n translations
- ✅ Consistent styling across all components
- ✅ Loading states and animations work smoothly

## Common Issues & Solutions

### Issue: Component styles not applying
**Solution**: Ensure globals.css is imported in layout and Tailwind is configured correctly

### Issue: Dark mode not working
**Solution**: Check that theme provider is set up correctly in the next story

### Issue: Translations not working in components
**Solution**: Ensure components that need translations use the useTranslations hook

## Next Steps
Once this story is complete, proceed to Story 1.4: Base Layout & Navigation Structure

## Notes for AI Implementation
- Install components one by one to catch any errors
- Test each component thoroughly before moving to the next
- Ensure all components follow accessibility best practices
- Keep consistent naming conventions
- All interactive components should have proper focus states
- Test on both light and dark themes