# Story 2.1: Language Switcher Component

## Story Details
- **Stage**: 2 - Core Features & Shared Components
- **Priority**: Critical
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Stage 1 Complete (Foundation & Infrastructure)

## Objective
Create a fully functional language switcher component that allows users to change the interface language while preserving the current page and tool state. The component should be accessible, mobile-friendly, and provide visual feedback for the current language.

## Acceptance Criteria
- [ ] Language switcher displays current language with flag icon
- [ ] Dropdown shows all 4 languages with native names
- [ ] Switching language preserves current page/tool
- [ ] URL updates correctly based on language selection
- [ ] Language preference saved to localStorage
- [ ] Mobile-optimized design
- [ ] Keyboard accessible (arrow keys, enter, escape)
- [ ] Loading state during language switch
- [ ] Smooth transitions and animations

## Implementation Steps

### 1. Create Language Flag Icons

#### Create `src/components/icons/flags.tsx`
```typescript
import React from 'react'

interface FlagProps {
  className?: string
  width?: number
  height?: number
}

export const FlagUS: React.FC<FlagProps> = ({ className, width = 20, height = 15 }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 20 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="15" fill="#B22234"/>
    <path d="M0 1.15385H20M0 3.46154H20M0 5.76923H20M0 8.07692H20M0 10.3846H20M0 12.6923H20" stroke="white" strokeWidth="1.15385"/>
    <rect width="8" height="8.07692" fill="#3C3B6E"/>
    <g clipPath="url(#clip0)">
      <path d="M1.33333 1.34615L1.86667 2.48077L3.06667 2.51923L2.2 3.26923L2.53333 4.40385L1.33333 3.65385L0.133333 4.40385L0.466667 3.26923L-0.4 2.51923L0.8 2.48077L1.33333 1.34615Z" fill="white"/>
      {/* Add more stars - simplified for brevity */}
    </g>
  </svg>
)

export const FlagFR: React.FC<FlagProps> = ({ className, width = 20, height = 15 }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 20 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="6.67" height="15" fill="#002395"/>
    <rect x="6.67" width="6.66" height="15" fill="white"/>
    <rect x="13.33" width="6.67" height="15" fill="#ED2939"/>
  </svg>
)

export const FlagRU: React.FC<FlagProps> = ({ className, width = 20, height = 15 }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 20 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="5" fill="white"/>
    <rect y="5" width="20" height="5" fill="#0039A6"/>
    <rect y="10" width="20" height="5" fill="#D52B1E"/>
  </svg>
)

export const FlagIT: React.FC<FlagProps> = ({ className, width = 20, height = 15 }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 20 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="6.67" height="15" fill="#009246"/>
    <rect x="6.67" width="6.66" height="15" fill="white"/>
    <rect x="13.33" width="6.67" height="15" fill="#CE2B37"/>
  </svg>
)

// Export map for easy access
export const flags = {
  en: FlagUS,
  fr: FlagFR,
  ru: FlagRU,
  it: FlagIT,
} as const
```

### 2. Update Language Configuration

#### Update `src/i18n/config.ts`
```typescript
import { FlagUS, FlagFR, FlagRU, FlagIT } from '@/components/icons/flags'

export const locales = ['en', 'fr', 'ru', 'it'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ru: 'Русский',
  it: 'Italiano',
}

export const localeCodes: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ru: 'ru-RU',
  it: 'it-IT',
}

// Native language names for better UX
export const localeNativeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ru: 'Русский',
  it: 'Italiano',
}

// Language direction (for future RTL support)
export const localeDirection: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  fr: 'ltr',
  ru: 'ltr',
  it: 'ltr',
}

// Flag components
export const localeFlags = {
  en: FlagUS,
  fr: FlagFR,
  ru: FlagRU,
  it: FlagIT,
} as const

// Language metadata for SEO
export const localeMetadata: Record<Locale, { name: string; region: string }> = {
  en: { name: 'English', region: 'United States' },
  fr: { name: 'French', region: 'France' },
  ru: { name: 'Russian', region: 'Russia' },
  it: { name: 'Italian', region: 'Italy' },
}
```

### 3. Create Language Switcher Hook

#### Create `src/hooks/use-language.ts`
```typescript
'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { locales, type Locale } from '@/i18n/config'

const LANGUAGE_COOKIE_NAME = 'preferred-language'

export function useLanguage() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const changeLanguage = (newLocale: Locale) => {
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_COOKIE_NAME, newLocale)
    }

    startTransition(() => {
      // Get the current pathname without locale
      let pathWithoutLocale = pathname
      
      // Remove current locale if present
      const currentLocalePattern = new RegExp(`^/(${locales.join('|')})(/|$)`)
      if (currentLocalePattern.test(pathname)) {
        pathWithoutLocale = pathname.replace(currentLocalePattern, '$2') || '/'
      }
      
      // Build new path
      const newPath = newLocale === 'en' 
        ? pathWithoutLocale 
        : `/${newLocale}${pathWithoutLocale}`
      
      router.push(newPath)
    })
  }

  const getLanguagePath = (targetLocale: Locale) => {
    let pathWithoutLocale = pathname
    
    // Remove current locale if present
    const currentLocalePattern = new RegExp(`^/(${locales.join('|')})(/|$)`)
    if (currentLocalePattern.test(pathname)) {
      pathWithoutLocale = pathname.replace(currentLocalePattern, '$2') || '/'
    }
    
    return targetLocale === 'en' 
      ? pathWithoutLocale 
      : `/${targetLocale}${pathWithoutLocale}`
  }

  return {
    locale,
    changeLanguage,
    getLanguagePath,
    isPending,
  }
}
```

### 4. Create Enhanced Language Switcher Component

#### Update `src/components/layout/language-switcher.tsx`
```typescript
'use client'

import * as React from 'react'
import { ChevronDown, Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/hooks/use-language'
import { 
  locales, 
  localeNativeNames, 
  localeFlags,
  type Locale 
} from '@/i18n/config'

interface LanguageSwitcherProps {
  align?: 'start' | 'center' | 'end'
  showFlag?: boolean
  showName?: boolean
  className?: string
}

export function LanguageSwitcher({ 
  align = 'end',
  showFlag = true,
  showName = true,
  className 
}: LanguageSwitcherProps) {
  const { locale, changeLanguage, isPending } = useLanguage()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Skeleton className="h-9 w-[100px]" />
    )
  }

  const CurrentFlag = localeFlags[locale]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            'gap-2 font-medium',
            isPending && 'opacity-70 cursor-wait',
            className
          )}
          disabled={isPending}
        >
          {showFlag && (
            <div className="relative">
              <CurrentFlag className="h-4 w-5" />
              {isPending && (
                <div className="absolute inset-0 bg-background/50 animate-pulse" />
              )}
            </div>
          )}
          {!showFlag && <Globe className="h-4 w-4" />}
          {showName && (
            <>
              <span className="hidden sm:inline-block">
                {localeNativeNames[locale]}
              </span>
              <span className="sm:hidden">
                {locale.toUpperCase()}
              </span>
            </>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        className="w-[180px]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {locales.map((lng) => {
          const Flag = localeFlags[lng]
          const isActive = lng === locale
          
          return (
            <DropdownMenuItem
              key={lng}
              onClick={() => changeLanguage(lng)}
              className={cn(
                'gap-3 cursor-pointer',
                isActive && 'bg-accent',
                isPending && 'opacity-50 cursor-wait'
              )}
              disabled={isPending}
            >
              <Flag className="h-4 w-5 shrink-0" />
              <span className="flex-1">{localeNativeNames[lng]}</span>
              {isActive && (
                <Check className="h-4 w-4 shrink-0 opacity-60" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 5. Create Mobile Language Switcher

#### Create `src/components/layout/mobile-language-switcher.tsx`
```typescript
'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'
import { 
  locales, 
  localeNativeNames, 
  localeFlags,
  type Locale 
} from '@/i18n/config'

export function MobileLanguageSwitcher() {
  const { locale, changeLanguage, isPending } = useLanguage()

  return (
    <div className="space-y-1 p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Select Language
      </h3>
      <div className="grid gap-2">
        {locales.map((lng) => {
          const Flag = localeFlags[lng]
          const isActive = lng === locale
          
          return (
            <Button
              key={lng}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => changeLanguage(lng)}
              disabled={isPending}
              className={cn(
                'justify-start gap-3 h-auto py-3',
                isPending && 'opacity-50 cursor-wait'
              )}
            >
              <Flag className="h-4 w-5 shrink-0" />
              <span className="flex-1 text-left">
                {localeNativeNames[lng]}
              </span>
              {isActive && (
                <Check className="h-4 w-4 shrink-0 opacity-60" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
```

### 6. Create Language Detection Component

#### Create `src/components/layout/language-detector.tsx`
```typescript
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { locales, localeNativeNames, type Locale } from '@/i18n/config'

const DETECTION_DISMISSED_KEY = 'language-detection-dismissed'
const DETECTION_COOLDOWN = 30 * 24 * 60 * 60 * 1000 // 30 days

export function LanguageDetector() {
  const router = useRouter()
  const currentLocale = useLocale() as Locale
  const [detectedLocale, setDetectedLocale] = React.useState<Locale | null>(null)
  const [showDialog, setShowDialog] = React.useState(false)

  React.useEffect(() => {
    // Check if user has dismissed detection recently
    const dismissed = localStorage.getItem(DETECTION_DISMISSED_KEY)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      if (Date.now() - dismissedTime < DETECTION_COOLDOWN) {
        return
      }
    }

    // Detect browser language
    const browserLang = navigator.language.toLowerCase()
    let detected: Locale | null = null

    // Check for exact match
    if (browserLang.startsWith('en')) detected = 'en'
    else if (browserLang.startsWith('fr')) detected = 'fr'
    else if (browserLang.startsWith('ru')) detected = 'ru'
    else if (browserLang.startsWith('it')) detected = 'it'

    // If detected language differs from current, show dialog
    if (detected && detected !== currentLocale) {
      setDetectedLocale(detected)
      setShowDialog(true)
    }
  }, [currentLocale])

  const handleAccept = () => {
    if (detectedLocale) {
      const newPath = detectedLocale === 'en' ? '/' : `/${detectedLocale}`
      router.push(newPath)
    }
    setShowDialog(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DETECTION_DISMISSED_KEY, Date.now().toString())
    setShowDialog(false)
  }

  if (!showDialog || !detectedLocale) return null

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Language Preference Detected</AlertDialogTitle>
          <AlertDialogDescription>
            We detected that your browser is set to {localeNativeNames[detectedLocale]}.
            Would you like to switch to this language?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>
            Keep {localeNativeNames[currentLocale]}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept}>
            Switch to {localeNativeNames[detectedLocale]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### 7. Create Inline Language Toggle (for tool interfaces)

#### Create `src/components/shared/inline-language-toggle.tsx`
```typescript
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useLanguage } from '@/hooks/use-language'
import { locales, type Locale } from '@/i18n/config'

interface InlineLanguageToggleProps {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function InlineLanguageToggle({ 
  className,
  size = 'default' 
}: InlineLanguageToggleProps) {
  const { locale, changeLanguage, isPending } = useLanguage()

  return (
    <ToggleGroup
      type="single"
      value={locale}
      onValueChange={(value) => value && changeLanguage(value as Locale)}
      className={cn('inline-flex', className)}
      disabled={isPending}
    >
      {locales.map((lng) => (
        <ToggleGroupItem
          key={lng}
          value={lng}
          size={size}
          className={cn(
            'font-medium uppercase',
            isPending && 'opacity-50 cursor-wait'
          )}
        >
          {lng}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
```

### 8. Update Mobile Navigation with Language Switcher

#### Update `src/components/layout/mobile-nav.tsx`
```typescript
// Add to the mobile navigation component after the navigation links

import { MobileLanguageSwitcher } from './mobile-language-switcher'
import { Separator } from '@/components/ui/separator'

// Inside the Sheet content, after navigation items:
<Separator className="my-4" />
<MobileLanguageSwitcher />
```

### 9. Add Language Detection to Root Layout

#### Update `src/app/[locale]/layout.tsx`
```typescript
// Add the LanguageDetector component inside the providers

import { LanguageDetector } from '@/components/layout/language-detector'

// Inside the layout, after children:
<LanguageDetector />
```

### 10. Create Storybook Story (optional)

#### Create `src/components/layout/language-switcher.stories.tsx`
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { LanguageSwitcher } from './language-switcher'

const meta = {
  title: 'Layout/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
  },
} satisfies Meta<typeof LanguageSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    showFlag: true,
    showName: true,
  },
}

export const FlagOnly: Story = {
  args: {
    showFlag: true,
    showName: false,
  },
}

export const NameOnly: Story = {
  args: {
    showFlag: false,
    showName: true,
  },
}

export const Compact: Story = {
  args: {
    showFlag: false,
    showName: false,
  },
}
```

## Testing & Verification

### 1. Test Language Switching
```bash
npm run dev

# Test each language:
# - Click language switcher
# - Select each language
# - Verify URL changes correctly
# - Verify page content updates
# - Check loading state appears
```

### 2. Test URL Preservation
- Navigate to `/tools/uppercase`
- Switch to French
- Should redirect to `/fr/tools/uppercase`
- Switch back to English
- Should redirect to `/tools/uppercase`

### 3. Test Mobile Experience
- Open site on mobile or responsive view
- Open mobile menu
- Test language switcher in mobile menu
- Verify touch interactions work

### 4. Test Keyboard Navigation
- Tab to language switcher
- Press Enter to open
- Use arrow keys to navigate
- Press Enter to select
- Press Escape to close

### 5. Test Language Detection
- Clear localStorage
- Set browser language to French
- Visit site
- Should see language detection dialog
- Test both accept and dismiss options

### 6. Test Persistence
- Change language to Italian
- Refresh page
- Language preference should persist
- Clear localStorage
- Should revert to default (English)

## Success Indicators
- ✅ Language switcher displays current language clearly
- ✅ All 4 languages selectable with native names
- ✅ URL structure maintained correctly
- ✅ Loading state prevents multiple clicks
- ✅ Mobile-optimized interface
- ✅ Keyboard accessible
- ✅ Language detection works (once per month)
- ✅ Smooth transitions
- ✅ Language preference persists
- ✅ Works on all pages and tools

## Common Issues & Solutions

### Issue: Page flickers during language switch
**Solution**: Use React transitions and show loading state

### Issue: URLs not updating correctly
**Solution**: Check locale removal regex pattern

### Issue: Language not persisting
**Solution**: Verify localStorage is accessible

### Issue: Mobile dropdown not closing
**Solution**: Add onCloseAutoFocus handler

## Next Steps
Once this story is complete, proceed to Story 2.2: Tool Layout Template

## Notes for AI Implementation
- Test with all 4 languages thoroughly
- Ensure flag SVGs are optimized
- Check accessibility with screen readers
- Verify transitions are smooth
- Test on both desktop and mobile
- Consider adding language names in their native script
- Monitor performance during language switches