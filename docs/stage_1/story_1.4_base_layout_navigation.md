# Story 1.4: Base Layout & Navigation Structure

## Story Details
- **Stage**: 1 - Foundation & Infrastructure
- **Priority**: Critical
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Stories 1.1-1.3 (Project Setup, i18n, UI Components)

## Objective
Create the base layout structure with header navigation, footer, and responsive mobile menu. Implement a consistent layout system that works across all pages with proper language support and SEO-friendly navigation.

## Acceptance Criteria
- [ ] Header with logo and navigation menu
- [ ] Responsive mobile navigation with hamburger menu
- [ ] Footer with links and language information
- [ ] Sticky header on scroll
- [ ] Language switcher integrated in navigation
- [ ] Active link highlighting
- [ ] Breadcrumb navigation system
- [ ] Layout works with all 4 languages

## Implementation Steps

### 1. Create Site Configuration

#### Update `src/config/site.ts`
```typescript
import { Locale } from '@/i18n/config'

export const siteConfig = {
  name: 'TextTools.io',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://texttools.io',
  ogImage: 'https://texttools.io/og.jpg',
  description: 'Free online text manipulation and conversion tools',
  links: {
    github: 'https://github.com/yourusername/texttools',
    twitter: 'https://twitter.com/texttools',
  },
}

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
  label?: string
  description?: string
}

export type NavCategory = {
  title: string
  items: NavItem[]
}

export type MainNavItem = NavItem & {
  items?: NavCategory[]
}

export type SiteConfig = typeof siteConfig

// Navigation structure (will be translated)
export const navigationConfig: MainNavItem[] = [
  {
    title: 'navigation.home',
    href: '/',
  },
  {
    title: 'navigation.tools',
    href: '/tools',
    items: [
      {
        title: 'tools.categories.textCase',
        items: [
          { title: 'tools.uppercase', href: '/tools/uppercase' },
          { title: 'tools.lowercase', href: '/tools/lowercase' },
          { title: 'tools.titleCase', href: '/tools/title-case' },
          { title: 'tools.sentenceCase', href: '/tools/sentence-case' },
          { title: 'tools.alternatingCase', href: '/tools/alternating-case' },
        ],
      },
      {
        title: 'tools.categories.textFormat',
        items: [
          { title: 'tools.removeLineBreaks', href: '/tools/remove-line-breaks' },
          { title: 'tools.textReplace', href: '/tools/text-replace' },
          { title: 'tools.duplicateRemover', href: '/tools/duplicate-line-remover' },
        ],
      },
    ],
  },
  {
    title: 'navigation.categories',
    href: '/categories',
  },
  {
    title: 'navigation.about',
    href: '/about',
  },
  {
    title: 'navigation.contact',
    href: '/contact',
  },
]

export const footerConfig = {
  links: [
    {
      title: 'footer.product',
      items: [
        { title: 'footer.allTools', href: '/tools' },
        { title: 'footer.categories', href: '/categories' },
        { title: 'footer.newTools', href: '/tools?filter=new' },
      ],
    },
    {
      title: 'footer.company',
      items: [
        { title: 'footer.about', href: '/about' },
        { title: 'footer.contact', href: '/contact' },
        { title: 'footer.blog', href: '/blog', disabled: true },
      ],
    },
    {
      title: 'footer.legal',
      items: [
        { title: 'footer.privacy', href: '/privacy' },
        { title: 'footer.terms', href: '/terms' },
        { title: 'footer.cookies', href: '/cookies' },
      ],
    },
  ],
}
```

### 2. Create Logo Component

#### Create `src/components/layout/logo.tsx`
```typescript
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center space-x-2', className)}>
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg">T</span>
        </div>
      </div>
      {showText && (
        <span className="font-bold text-xl">{siteConfig.name}</span>
      )}
    </Link>
  )
}
```

### 3. Create Language Switcher

#### Create `src/components/layout/language-switcher.tsx`
```typescript
'use client'

import * as React from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { locales, localeNames } from '@/i18n/config'

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname if it exists
    let newPath = pathname
    
    // Check if pathname starts with a locale
    const pathLocale = pathname.split('/')[1]
    if (locales.includes(pathLocale as any)) {
      // Remove the locale prefix
      newPath = pathname.slice(pathLocale.length + 1) || '/'
    }
    
    // Add new locale prefix if not English
    if (newLocale !== 'en') {
      newPath = `/${newLocale}${newPath}`
    }
    
    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {localeNames[locale as keyof typeof localeNames]}
          </span>
          <span className="sm:hidden">
            {locale.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={loc === locale ? 'bg-accent' : ''}
          >
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 4. Create Main Navigation

#### Create `src/components/layout/main-nav.tsx`
```typescript
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { navigationConfig } from '@/config/site'
import { LocaleLink } from '@/components/shared/locale-link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

export function MainNav() {
  const pathname = usePathname()
  const t = useTranslations('common')

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {navigationConfig.map((item, index) => {
          if (item.items) {
            return (
              <NavigationMenuItem key={index}>
                <NavigationMenuTrigger>
                  {t(item.title as any)}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {item.items.map((category) => (
                      <li key={category.title} className="space-y-2">
                        <h4 className="text-sm font-medium leading-none">
                          {t(category.title as any)}
                        </h4>
                        <ul className="space-y-1">
                          {category.items.map((subItem) => (
                            <li key={subItem.href}>
                              <NavigationMenuLink asChild>
                                <LocaleLink
                                  href={subItem.href}
                                  className={cn(
                                    'block select-none rounded-md p-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                    pathname === subItem.href && 'bg-accent'
                                  )}
                                >
                                  {t(subItem.title as any)}
                                </LocaleLink>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          }

          return (
            <NavigationMenuItem key={index}>
              <LocaleLink href={item.href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    pathname === item.href && 'bg-accent'
                  )}
                >
                  {t(item.title as any)}
                </NavigationMenuLink>
              </LocaleLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

### 5. Create Mobile Navigation

#### Create `src/components/layout/mobile-nav.tsx`
```typescript
'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { navigationConfig } from '@/config/site'
import { LocaleLink } from '@/components/shared/locale-link'
import { Logo } from './logo'

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const t = useTranslations('common')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="flex flex-col space-y-4 p-6">
          <Logo />
          <nav className="flex flex-col space-y-1">
            {navigationConfig.map((item, index) => {
              if (item.items) {
                return (
                  <div key={index} className="space-y-1">
                    <h4 className="font-medium text-sm px-3 py-2">
                      {t(item.title as any)}
                    </h4>
                    {item.items.map((category) => (
                      <div key={category.title} className="pl-3 space-y-1">
                        <h5 className="text-xs font-medium text-muted-foreground px-3 py-1">
                          {t(category.title as any)}
                        </h5>
                        {category.items.map((subItem) => (
                          <LocaleLink
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground',
                              pathname === subItem.href && 'bg-accent'
                            )}
                          >
                            {t(subItem.title as any)}
                          </LocaleLink>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              }

              return (
                <LocaleLink
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground',
                    pathname === item.href && 'bg-accent font-medium'
                  )}
                >
                  {t(item.title as any)}
                </LocaleLink>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

### 6. Create Header Component

#### Create `src/components/layout/header.tsx`
```typescript
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/container'
import { Logo } from './logo'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        isScrolled && 'shadow-sm',
        className
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <MobileNav />
            <Logo />
            <MainNav />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </header>
  )
}
```

### 7. Create Theme Toggle

#### Create `src/components/layout/theme-toggle.tsx`
```typescript
'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### 8. Create Footer Component

#### Create `src/components/layout/footer.tsx`
```typescript
import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { Separator } from '@/components/ui/separator'
import { LocaleLink } from '@/components/shared/locale-link'
import { Logo } from './logo'
import { siteConfig, footerConfig } from '@/config/site'

export function Footer() {
  const t = useTranslations('common')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <Container>
        <div className="py-10 md:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Logo className="mb-4" />
              <p className="text-sm text-muted-foreground">
                {t('metadata.description')}
              </p>
            </div>
            {footerConfig.links.map((category) => (
              <div key={category.title}>
                <h3 className="font-semibold mb-3">{t(category.title as any)}</h3>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item.href}>
                      <LocaleLink
                        href={item.href}
                        className={cn(
                          'text-sm text-muted-foreground hover:text-foreground transition-colors',
                          item.disabled && 'pointer-events-none opacity-60'
                        )}
                      >
                        {t(item.title as any)}
                      </LocaleLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {siteConfig.name}. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <LocaleLink
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('footer.privacy')}
            </LocaleLink>
            <LocaleLink
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t('footer.terms')}
            </LocaleLink>
          </div>
        </div>
      </Container>
    </footer>
  )
}
```

### 9. Create Breadcrumb Component

#### Create `src/components/layout/breadcrumb.tsx`
```typescript
'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChevronRight, Home } from 'lucide-react'
import { LocaleLink } from '@/components/shared/locale-link'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname()
  const t = useTranslations('common')

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs = React.useMemo(() => {
    if (items) return items

    const paths = pathname.split('/').filter(Boolean)
    const generatedItems: BreadcrumbItem[] = []

    paths.forEach((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/')
      
      // Skip locale prefix
      if (['en', 'fr', 'ru', 'it'].includes(path)) return
      
      // Convert path to title
      const title = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      generatedItems.push({ title, href })
    })

    return generatedItems
  }, [pathname, items])

  if (breadcrumbs.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <LocaleLink
        href="/"
        className="flex items-center text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">{t('navigation.home')}</span>
      </LocaleLink>
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{item.title}</span>
          ) : (
            <LocaleLink
              href={item.href!}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.title}
            </LocaleLink>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
```

### 10. Create Root Layout with All Components

#### Update `src/app/[locale]/layout.tsx`
```typescript
import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { ThemeProvider } from 'next-themes'
import { LocaleProvider } from '@/providers/locale-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { locales } from '@/i18n/config'
import { getMessages, getTranslations } from 'next-intl/server'
import { Toaster } from '@/components/ui/toaster'

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
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://texttools.io',
      siteName: 'TextTools.io',
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
    alternates: {
      canonical: 'https://texttools.io',
      languages: {
        'en': 'https://texttools.io',
        'fr': 'https://texttools.io/fr',
        'ru': 'https://texttools.io/ru',
        'it': 'https://texttools.io/it',
      },
    },
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
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
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

### 11. Update Translation Files

Add the navigation and footer translations to your locale files:

#### Update `src/i18n/locales/en/common.json`
```json
{
  // ... existing translations ...
  "navigation": {
    "home": "Home",
    "tools": "Tools",
    "categories": "Categories",
    "about": "About",
    "contact": "Contact"
  },
  "tools": {
    "uppercase": "Uppercase",
    "lowercase": "Lowercase",
    "titleCase": "Title Case",
    "sentenceCase": "Sentence Case",
    "alternatingCase": "Alternating Case",
    "removeLineBreaks": "Remove Line Breaks",
    "textReplace": "Find & Replace",
    "duplicateRemover": "Remove Duplicates"
  },
  "footer": {
    "product": "Product",
    "company": "Company",
    "legal": "Legal",
    "allTools": "All Tools",
    "categories": "Categories",
    "newTools": "New Tools",
    "about": "About Us",
    "contact": "Contact",
    "blog": "Blog",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "cookies": "Cookie Policy",
    "rights": "All rights reserved"
  }
}
```

## Testing & Verification

### 1. Test Navigation
- Verify all navigation links work correctly
- Test dropdown menus on desktop
- Test mobile menu functionality
- Verify active link highlighting

### 2. Test Language Switching
- Switch between all 4 languages
- Verify URLs update correctly
- Check that navigation items translate

### 3. Test Responsive Design
- Desktop: Full navigation visible
- Tablet: Check breakpoint behavior
- Mobile: Hamburger menu works

### 4. Test Theme Switching
- Toggle between light and dark modes
- Verify all components adapt correctly

### 5. Test Sticky Header
- Scroll down and verify header sticks
- Check shadow appears on scroll

## Success Indicators
- ✅ Header navigation works on all screen sizes
- ✅ Language switcher maintains current page
- ✅ Mobile menu opens/closes properly
- ✅ Footer displays correctly
- ✅ Breadcrumbs generate automatically
- ✅ Theme toggle works
- ✅ All text is translated in 4 languages
- ✅ Active links are highlighted

## Next Steps
Once this story is complete, proceed to Story 1.5: Theme System (Dark/Light Mode)

## Notes for AI Implementation
- Ensure all navigation items use the translation system
- Test thoroughly on mobile devices
- Verify keyboard navigation works
- Check that all interactive elements have proper focus states
- Language switching should preserve the current page
- Use semantic HTML for better accessibility