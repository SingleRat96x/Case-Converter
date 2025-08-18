# Story 2.7: Breadcrumb Navigation

## Story Details
- **Stage**: 2 - Core Features & Shared Components
- **Priority**: Low
- **Estimated Hours**: 1-2 hours
- **Dependencies**: Story 2.6 (Tool Card Components)

## Objective
Create a breadcrumb navigation component that helps users understand their location within the site hierarchy and provides easy navigation back to parent pages.

## Acceptance Criteria
- [ ] Auto-generate breadcrumbs from URL
- [ ] Support for custom breadcrumb items
- [ ] Multilingual support
- [ ] Schema.org structured data
- [ ] Mobile-responsive design
- [ ] Customizable separators
- [ ] Truncation for long items
- [ ] Home icon option
- [ ] Accessible navigation

## Implementation Steps

### 1. Update Breadcrumb Component

#### Update `src/components/layout/breadcrumb.tsx`
```typescript
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  translationKey?: string
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  separator?: React.ReactNode
  showHome?: boolean
  homeIcon?: boolean
  className?: string
  maxLength?: number
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = true,
  homeIcon = true,
  className,
  maxLength = 25,
}: BreadcrumbProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations()

  const breadcrumbItems = React.useMemo(() => {
    if (items) return items

    const paths = pathname.split('/').filter(Boolean)
    const generatedItems: BreadcrumbItem[] = []

    if (paths[0] === locale && locale !== 'en') {
      paths.shift()
    }

    paths.forEach((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/')
      const translationKey = `breadcrumbs.${path}`
      
      let label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      generatedItems.push({
        label,
        href: locale !== 'en' ? `/${locale}${href}` : href,
        translationKey: t.has(translationKey) ? translationKey : undefined,
      })
    })

    return generatedItems
  }, [pathname, locale, items, t])

  const truncateText = (text: string) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (breadcrumbItems.length === 0 && !showHome) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center gap-2">
        {showHome && (
          <>
            <li>
              <Link
                href={locale !== 'en' ? `/${locale}` : '/'}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {homeIcon ? (
                  <Home className="h-4 w-4" />
                ) : (
                  t('common.navigation.home')
                )}
              </Link>
            </li>
            {breadcrumbItems.length > 0 && (
              <li aria-hidden="true" className="text-muted-foreground">
                {separator}
              </li>
            )}
          </>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          const label = item.translationKey ? t(item.translationKey) : item.label
          const truncatedLabel = truncateText(label)

          return (
            <React.Fragment key={index}>
              <li>
                {isLast || !item.href ? (
                  <span className="text-foreground font-medium">
                    {truncatedLabel}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title={label !== truncatedLabel ? label : undefined}
                  >
                    {truncatedLabel}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="text-muted-foreground">
                  {separator}
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
```

### 2. Create Breadcrumb Schema Component

#### Create `src/components/seo/breadcrumb-schema.tsx`
```typescript
import Script from 'next/script'
import { BreadcrumbItem } from '@/components/layout/breadcrumb'

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
  baseUrl?: string
}

export function BreadcrumbSchema({ 
  items, 
  baseUrl = 'https://texttools.io' 
}: BreadcrumbSchemaProps) {
  const schemaItems = [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@id': baseUrl,
        name: 'Home',
      },
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      item: {
        '@id': item.href ? `${baseUrl}${item.href}` : undefined,
        name: item.label,
      },
    })),
  ]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: schemaItems,
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}
```

### 3. Create Mobile Breadcrumb

#### Create `src/components/layout/mobile-breadcrumb.tsx`
```typescript
'use client'

import * as React from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { BreadcrumbItem } from './breadcrumb'

interface MobileBreadcrumbProps {
  items?: BreadcrumbItem[]
  showBackButton?: boolean
  className?: string
}

export function MobileBreadcrumb({
  items,
  showBackButton = true,
  className,
}: MobileBreadcrumbProps) {
  const router = useRouter()
  
  const parentItem = items && items.length > 1 
    ? items[items.length - 2] 
    : null
  
  const currentItem = items && items.length > 0
    ? items[items.length - 1]
    : null

  if (!currentItem) return null

  return (
    <div className={cn('flex items-center gap-2 md:hidden', className)}>
      {showBackButton && parentItem?.href && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(parentItem.href!)}
          className="gap-1 pl-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {parentItem.label}
        </Button>
      )}
      
      {!showBackButton && currentItem && (
        <span className="text-sm font-medium">
          {currentItem.label}
        </span>
      )}
    </div>
  )
}
```

### 4. Update Translations

Add to `src/i18n/locales/en/common.json`:
```json
{
  "breadcrumbs": {
    "tools": "Tools",
    "categories": "Categories",
    "about": "About",
    "contact": "Contact",
    "uppercase": "Uppercase Converter",
    "lowercase": "Lowercase Converter"
  }
}
```

## Testing & Verification

1. Navigate to different pages
2. Verify breadcrumbs generate correctly
3. Test with multilingual routes
4. Check mobile responsive design
5. Validate schema.org markup

## Success Indicators
- ✅ Auto-generates from URL
- ✅ Multilingual support working
- ✅ Schema.org markup valid
- ✅ Mobile-responsive design
- ✅ Accessible navigation

## Next Steps
Proceed to Story 2.8: Footer Component

## Notes
- Test with various URL structures
- Ensure translations fallback gracefully
- Verify accessibility with screen readers