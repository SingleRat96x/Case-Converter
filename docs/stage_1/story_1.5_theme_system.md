# Story 1.5: Theme System (Dark/Light Mode)

## Story Details
- **Stage**: 1 - Foundation & Infrastructure
- **Priority**: High
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Stories 1.1-1.4 (Project Setup through Layout)

## Objective
Implement a comprehensive theme system with dark and light modes using next-themes. Ensure all components, pages, and tools properly support theme switching with smooth transitions and persistent user preferences.

## Acceptance Criteria
- [ ] Dark and light themes fully implemented
- [ ] Theme preference persists across sessions
- [ ] System theme detection works
- [ ] No flash of incorrect theme on page load
- [ ] Smooth transitions between themes
- [ ] All UI components support both themes
- [ ] Theme toggle accessible from header
- [ ] Custom theme colors properly applied

## Implementation Steps

### 1. Install and Configure next-themes

```bash
# Already installed in Story 1.1, but verify:
npm list next-themes
```

### 2. Create Theme Provider Wrapper

#### Create `src/providers/theme-provider.tsx`
```typescript
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### 3. Update Theme Configuration

#### Update `src/app/globals.css` with refined theme colors
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light Theme */
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    
    --ring: 221.2 83.2% 53.3%;
    
    --radius: 0.5rem;
    
    /* Chart colors */
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    
    /* Custom properties */
    --gradient-from: 221.2 83.2% 53.3%;
    --gradient-to: 181.2 83.2% 53.3%;
  }

  .dark {
    /* Dark Theme */
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    
    --ring: 221.2 83.2% 53.3%;
    
    /* Custom properties */
    --gradient-from: 221.2 83.2% 53.3%;
    --gradient-to: 181.2 83.2% 53.3%;
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
  
  /* Smooth color transitions for theme switching */
  body,
  .theme-transition * {
    @apply transition-colors duration-300;
  }
  
  /* Disable transitions during theme switch to prevent flash */
  .no-transition * {
    @apply !transition-none;
  }
}

/* Custom theme utilities */
@layer utilities {
  /* Gradient text */
  .gradient-text {
    @apply bg-gradient-to-r from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))] bg-clip-text text-transparent;
  }
  
  /* Gradient background */
  .gradient-bg {
    @apply bg-gradient-to-r from-[hsl(var(--gradient-from))] to-[hsl(var(--gradient-to))];
  }
  
  /* Glass morphism effect */
  .glass {
    @apply bg-background/60 backdrop-blur-md;
  }
  
  /* Subtle shadow for light mode */
  .shadow-soft {
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.1);
  }
  
  /* Glow effect for dark mode */
  .dark .glow {
    box-shadow: 0 0 20px -5px hsl(var(--primary) / 0.3);
  }
}

/* Tool-specific theme styles */
@layer components {
  /* Tool input/output areas */
  .tool-textarea {
    @apply w-full rounded-lg border bg-background p-4 font-mono text-sm;
    @apply focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20;
  }
  
  /* Tool card hover effects */
  .tool-card {
    @apply relative overflow-hidden rounded-lg border bg-card p-6;
    @apply transition-all duration-200 hover:shadow-lg;
    @apply hover:border-primary/50;
  }
  
  .dark .tool-card {
    @apply hover:shadow-primary/10;
  }
  
  /* Code blocks */
  .code-block {
    @apply rounded-lg bg-muted p-4 font-mono text-sm;
    @apply border border-border;
  }
  
  /* Stats display */
  .stats-item {
    @apply rounded-lg bg-muted/50 p-3 text-center;
    @apply border border-border/50;
  }
}

/* Syntax highlighting for code (if needed later) */
@layer components {
  .dark .syntax-comment {
    @apply text-muted-foreground;
  }
  
  .dark .syntax-keyword {
    @apply text-purple-400;
  }
  
  .dark .syntax-string {
    @apply text-green-400;
  }
  
  .dark .syntax-number {
    @apply text-blue-400;
  }
  
  .light .syntax-comment {
    @apply text-gray-600;
  }
  
  .light .syntax-keyword {
    @apply text-purple-600;
  }
  
  .light .syntax-string {
    @apply text-green-600;
  }
  
  .light .syntax-number {
    @apply text-blue-600;
  }
}

/* Loading animations */
@layer utilities {
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      hsl(var(--muted)),
      hsl(var(--muted-foreground) / 0.1),
      hsl(var(--muted))
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
}

/* Custom scrollbar theming */
@layer utilities {
  /* Light theme scrollbar */
  .scrollbar-custom {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
  }
  
  .scrollbar-custom::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  
  .scrollbar-custom::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-custom::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground) / 0.3);
    border-radius: 6px;
    border: 3px solid hsl(var(--background));
  }
  
  .scrollbar-custom::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground) / 0.5);
  }
  
  /* Dark theme adjustments */
  .dark .scrollbar-custom {
    scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
  }
  
  .dark .scrollbar-custom::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground) / 0.2);
  }
  
  .dark .scrollbar-custom::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground) / 0.3);
  }
}
```

### 4. Create Theme Script for Flash Prevention

#### Create `src/lib/theme-script.ts`
```typescript
// This script runs before React hydration to prevent theme flash
export const themeScript = `
  try {
    const theme = localStorage.getItem('theme') || 'system'
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const activeTheme = theme === 'system' ? systemTheme : theme
    
    document.documentElement.classList.toggle('dark', activeTheme === 'dark')
    document.documentElement.style.colorScheme = activeTheme
  } catch (e) {}
`
```

### 5. Update Root Layout with Theme Support

#### Update `src/app/[locale]/layout.tsx`
```typescript
import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { ThemeProvider } from '@/providers/theme-provider'
import { LocaleProvider } from '@/providers/locale-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { locales } from '@/i18n/config'
import { getMessages, getTranslations } from 'next-intl/server'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'
import { themeScript } from '@/lib/theme-script'

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return locales.map((locale) => ({locale}))
}

export async function generateMetadata({
  params: {locale}
}: {
  params: {locale: string}
}) {
  const t = await getTranslations({locale, namespace: 'common.metadata'})
  
  return {
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
  }
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode
  params: {locale: string}
}) {
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased scrollbar-custom')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={locale} messages={messages}>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 6. Enhance Theme Toggle Component

#### Update `src/components/layout/theme-toggle.tsx`
```typescript
'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 7. Create Theme-Aware Components

#### Create `src/components/ui/theme-image.tsx`
```typescript
'use client'

import * as React from 'react'
import Image, { ImageProps } from 'next/image'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface ThemeImageProps extends Omit<ImageProps, 'src'> {
  srcLight: string
  srcDark: string
}

export function ThemeImage({
  srcLight,
  srcDark,
  alt,
  className,
  ...props
}: ThemeImageProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn('animate-pulse bg-muted', className)} />
  }

  const src = resolvedTheme === 'dark' ? srcDark : srcLight

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      {...props}
    />
  )
}
```

### 8. Create Demo Page to Test Themes

#### Create `src/app/[locale]/theme-test/page.tsx`
```typescript
'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  H1,
  H2,
  Lead,
  Section,
  Button,
  Input,
  Label,
  Textarea,
  Badge,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { AlertCircle, Check, Copy, FileText } from 'lucide-react'

export default function ThemeTestPage() {
  const [inputValue, setInputValue] = React.useState('')
  
  return (
    <Container className="py-8">
      <Section container={false}>
        <H1>Theme System Test</H1>
        <Lead className="mt-4">
          Test all components in both light and dark themes
        </Lead>
      </Section>

      <Section container={false}>
        <H2>Colors & Gradients</H2>
        <div className="grid gap-4 mt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="w-24 h-24 rounded-lg bg-primary" />
            <div className="w-24 h-24 rounded-lg bg-secondary" />
            <div className="w-24 h-24 rounded-lg bg-accent" />
            <div className="w-24 h-24 rounded-lg bg-muted" />
            <div className="w-24 h-24 rounded-lg gradient-bg" />
          </div>
          <p className="text-3xl font-bold gradient-text">
            Gradient Text Example
          </p>
        </div>
      </Section>

      <Section container={false}>
        <H2>Cards & Containers</H2>
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>This is a card description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here with proper theme support.</p>
            </CardContent>
          </Card>
          
          <Card className="tool-card">
            <CardHeader>
              <CardTitle>Tool Card Style</CardTitle>
              <Badge>New</Badge>
            </CardHeader>
            <CardContent>
              <p>Hover over this card to see the effect.</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section container={false}>
        <H2>Form Elements</H2>
        <div className="max-w-md space-y-4 mt-6">
          <div>
            <Label htmlFor="test-input">Input Field</Label>
            <Input
              id="test-input"
              placeholder="Type something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="test-textarea">Tool Textarea</Label>
            <Textarea
              id="test-textarea"
              className="tool-textarea"
              placeholder="Paste your text here..."
              rows={6}
            />
          </div>
        </div>
      </Section>

      <Section container={false}>
        <H2>Buttons & Actions</H2>
        <div className="flex flex-wrap gap-4 mt-6">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>
      </Section>

      <Section container={false}>
        <H2>Alerts & Notifications</H2>
        <div className="space-y-4 mt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a default alert with theme support.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a destructive alert variant.
            </AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section container={false}>
        <H2>Tabs Component</H2>
        <Tabs defaultValue="tab1" className="mt-6">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p>Content for tab 1 with proper theme styling.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tab2" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p>Content for tab 2 with proper theme styling.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tab3" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p>Content for tab 3 with proper theme styling.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>

      <Section container={false}>
        <H2>Glass Morphism</H2>
        <div className="relative h-64 rounded-lg bg-gradient-to-br from-primary to-purple-600 mt-6">
          <div className="absolute inset-4 glass rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold">Glass Effect</h3>
            <p className="mt-2">This demonstrates the glass morphism effect.</p>
          </div>
        </div>
      </Section>
    </Container>
  )
}
```

### 9. Create CSS Variables Hook

#### Create `src/hooks/use-css-variable.ts`
```typescript
'use client'

import * as React from 'react'

export function useCSSVariable(name: string) {
  const [value, setValue] = React.useState<string>('')

  React.useEffect(() => {
    const computedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
    
    setValue(computedValue)

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const newValue = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim()
      setValue(newValue)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [name])

  return value
}
```

## Testing & Verification

### 1. Test Theme Switching
```bash
npm run dev

# Navigate to http://localhost:3000/theme-test
# Test all three theme options:
# - Light theme
# - Dark theme  
# - System theme (change OS settings to verify)
```

### 2. Verify No Flash on Reload
- Set theme to dark
- Hard refresh the page (Ctrl+Shift+R)
- Should see no flash of light theme

### 3. Test Theme Persistence
- Change theme to dark
- Close browser
- Reopen and navigate back
- Theme should still be dark

### 4. Test Responsive Theme Elements
- Check all components in both themes
- Verify colors, shadows, and borders adapt
- Test hover states and transitions

### 5. Performance Check
- Theme switching should be instant
- No layout shifts during switch
- Smooth color transitions

## Success Indicators
- ✅ Three theme options work (light/dark/system)
- ✅ No flash of wrong theme on page load
- ✅ Theme preference persists across sessions
- ✅ System theme detection works
- ✅ All components properly themed
- ✅ Smooth transitions between themes
- ✅ Custom theme utilities work (gradients, glass, etc.)
- ✅ Scrollbar matches theme

## Common Issues & Solutions

### Issue: Flash of wrong theme
**Solution**: Ensure theme script is in document head before React loads

### Issue: Theme not persisting
**Solution**: Check localStorage is accessible and not blocked

### Issue: Hydration mismatch errors
**Solution**: Use mounted state check in theme-dependent components

## Next Steps
Once this story is complete, proceed to Story 1.6: SEO & Metadata Infrastructure

## Notes for AI Implementation
- Always use suppressHydrationWarning on html element
- Test with system theme set to both light and dark
- Ensure all color values use CSS variables
- Check contrast ratios for accessibility
- Verify theme works with all language variants