# Story 1.2: i18n Configuration & Language Routing

## Story Details
- **Stage**: 1 - Foundation & Infrastructure
- **Priority**: Critical
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 1.1 (Project Setup)

## Objective
Configure next-intl for internationalization support with English, French, Russian, and Italian languages. Set up proper routing structure that maintains SEO-friendly URLs with English at the root and other languages with prefixes.

## Acceptance Criteria
- [ ] next-intl properly configured with middleware
- [ ] Language routing works: `/tools/uppercase` (EN), `/fr/tools/uppercase` (FR), etc.
- [ ] Language detection based on browser preferences
- [ ] All 4 languages (EN, FR, RU, IT) configured
- [ ] Locale switching preserves current page
- [ ] SEO-friendly URL structure maintained
- [ ] Type-safe translation system

## Implementation Steps

### 1. Create i18n Configuration

#### Create `src/i18n/config.ts`
```typescript
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

// Mapping for URL paths
export const pathnames = {
  '/': '/',
  '/tools': '/tools',
  '/tools/[tool]': '/tools/[tool]',
  '/about': {
    en: '/about',
    fr: '/a-propos',
    ru: '/o-nas',
    it: '/chi-siamo'
  },
  '/contact': {
    en: '/contact',
    fr: '/contact',
    ru: '/kontakt',
    it: '/contatto'
  }
} as const

export type Pathnames = keyof typeof pathnames
```

### 2. Create Middleware for Language Routing

#### Create `src/middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale, pathnames } from '@/i18n/config'

export default createMiddleware({
  // List of all supported locales
  locales,
  
  // Default locale (no prefix)
  defaultLocale,
  
  // Don't prefix the default locale in the URL
  localePrefix: 'as-needed',
  
  // Pathnames configuration
  pathnames,
  
  // Disable automatic locale detection based on headers
  // We'll use browser detection on client-side instead
  localeDetection: true
})

export const config = {
  // Match all pathnames except api, _next, favicon, and static files
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(en|fr|ru|it)/:path*'
  ]
}
```

### 3. Set Up Translation Files Structure

#### Create translation files for each locale:

##### Create `src/i18n/locales/en/common.json`
```json
{
  "metadata": {
    "title": "Free Online Text Tools",
    "description": "Transform, convert, and manipulate text with our free online tools"
  },
  "navigation": {
    "home": "Home",
    "tools": "Tools",
    "categories": "Categories",
    "about": "About",
    "contact": "Contact"
  },
  "common": {
    "input": "Input",
    "output": "Output",
    "copy": "Copy",
    "copied": "Copied!",
    "clear": "Clear",
    "download": "Download",
    "upload": "Upload",
    "convert": "Convert",
    "generate": "Generate",
    "characters": "Characters",
    "words": "Words",
    "lines": "Lines",
    "processing": "Processing...",
    "error": "An error occurred",
    "tryAgain": "Try Again"
  },
  "tools": {
    "textCase": "Text Case Converter",
    "categories": {
      "textCase": "Convert Case",
      "textFormat": "Text Formatting",
      "encoding": "Encoding & Decoding",
      "generators": "Generators",
      "developers": "Developer Tools",
      "images": "Image Tools"
    }
  },
  "footer": {
    "rights": "All rights reserved",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service"
  }
}
```

##### Create `src/i18n/locales/fr/common.json`
```json
{
  "metadata": {
    "title": "Outils de Texte en Ligne Gratuits",
    "description": "Transformez, convertissez et manipulez du texte avec nos outils en ligne gratuits"
  },
  "navigation": {
    "home": "Accueil",
    "tools": "Outils",
    "categories": "Catégories",
    "about": "À propos",
    "contact": "Contact"
  },
  "common": {
    "input": "Entrée",
    "output": "Sortie",
    "copy": "Copier",
    "copied": "Copié!",
    "clear": "Effacer",
    "download": "Télécharger",
    "upload": "Téléverser",
    "convert": "Convertir",
    "generate": "Générer",
    "characters": "Caractères",
    "words": "Mots",
    "lines": "Lignes",
    "processing": "Traitement...",
    "error": "Une erreur s'est produite",
    "tryAgain": "Réessayer"
  },
  "tools": {
    "textCase": "Convertisseur de Casse",
    "categories": {
      "textCase": "Convertir la Casse",
      "textFormat": "Formatage de Texte",
      "encoding": "Encodage et Décodage",
      "generators": "Générateurs",
      "developers": "Outils de Développement",
      "images": "Outils d'Image"
    }
  },
  "footer": {
    "rights": "Tous droits réservés",
    "privacy": "Politique de Confidentialité",
    "terms": "Conditions d'Utilisation"
  }
}
```

##### Create `src/i18n/locales/ru/common.json`
```json
{
  "metadata": {
    "title": "Бесплатные Онлайн Инструменты для Текста",
    "description": "Преобразуйте, конвертируйте и манипулируйте текстом с помощью наших бесплатных онлайн-инструментов"
  },
  "navigation": {
    "home": "Главная",
    "tools": "Инструменты",
    "categories": "Категории",
    "about": "О нас",
    "contact": "Контакты"
  },
  "common": {
    "input": "Ввод",
    "output": "Вывод",
    "copy": "Копировать",
    "copied": "Скопировано!",
    "clear": "Очистить",
    "download": "Скачать",
    "upload": "Загрузить",
    "convert": "Конвертировать",
    "generate": "Генерировать",
    "characters": "Символы",
    "words": "Слова",
    "lines": "Строки",
    "processing": "Обработка...",
    "error": "Произошла ошибка",
    "tryAgain": "Попробовать снова"
  },
  "tools": {
    "textCase": "Конвертер Регистра Текста",
    "categories": {
      "textCase": "Изменить Регистр",
      "textFormat": "Форматирование Текста",
      "encoding": "Кодирование и Декодирование",
      "generators": "Генераторы",
      "developers": "Инструменты Разработчика",
      "images": "Инструменты для Изображений"
    }
  },
  "footer": {
    "rights": "Все права защищены",
    "privacy": "Политика Конфиденциальности",
    "terms": "Условия Использования"
  }
}
```

##### Create `src/i18n/locales/it/common.json`
```json
{
  "metadata": {
    "title": "Strumenti di Testo Online Gratuiti",
    "description": "Trasforma, converti e manipola il testo con i nostri strumenti online gratuiti"
  },
  "navigation": {
    "home": "Home",
    "tools": "Strumenti",
    "categories": "Categorie",
    "about": "Chi Siamo",
    "contact": "Contatti"
  },
  "common": {
    "input": "Input",
    "output": "Output",
    "copy": "Copia",
    "copied": "Copiato!",
    "clear": "Cancella",
    "download": "Scarica",
    "upload": "Carica",
    "convert": "Converti",
    "generate": "Genera",
    "characters": "Caratteri",
    "words": "Parole",
    "lines": "Righe",
    "processing": "Elaborazione...",
    "error": "Si è verificato un errore",
    "tryAgain": "Riprova"
  },
  "tools": {
    "textCase": "Convertitore di Maiuscole/Minuscole",
    "categories": {
      "textCase": "Converti Maiuscole/Minuscole",
      "textFormat": "Formattazione Testo",
      "encoding": "Codifica e Decodifica",
      "generators": "Generatori",
      "developers": "Strumenti per Sviluppatori",
      "images": "Strumenti Immagine"
    }
  },
  "footer": {
    "rights": "Tutti i diritti riservati",
    "privacy": "Informativa sulla Privacy",
    "terms": "Termini di Servizio"
  }
}
```

### 4. Create Translation Loading System

#### Create `src/i18n/request.ts`
```typescript
import {notFound} from 'next/navigation'
import {getRequestConfig} from 'next-intl/server'
import {locales} from './config'

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  return {
    messages: {
      common: (await import(`./locales/${locale}/common.json`)).default,
      // Add more namespaces as needed
    }
  }
})
```

### 5. Configure next-intl with Next.js

#### Update `next.config.js`
```javascript
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
}

module.exports = withNextIntl(nextConfig)
```

### 6. Create Type-Safe Translation Hook

#### Create `src/hooks/use-translations.ts`
```typescript
import {useTranslations as useNextIntlTranslations} from 'next-intl'

// Define the structure of our translations
export type TranslationKeys = {
  common: {
    metadata: {
      title: string
      description: string
    }
    navigation: {
      home: string
      tools: string
      categories: string
      about: string
      contact: string
    }
    common: {
      input: string
      output: string
      copy: string
      copied: string
      clear: string
      download: string
      upload: string
      convert: string
      generate: string
      characters: string
      words: string
      lines: string
      processing: string
      error: string
      tryAgain: string
    }
    tools: {
      textCase: string
      categories: {
        textCase: string
        textFormat: string
        encoding: string
        generators: string
        developers: string
        images: string
      }
    }
    footer: {
      rights: string
      privacy: string
      terms: string
    }
  }
}

export function useTranslations<Namespace extends keyof TranslationKeys>(
  namespace: Namespace
) {
  return useNextIntlTranslations(namespace) as (
    key: keyof TranslationKeys[Namespace]
  ) => string
}
```

### 7. Create Language Provider

#### Create `src/providers/locale-provider.tsx`
```typescript
'use client'

import {NextIntlClientProvider} from 'next-intl'
import {ReactNode} from 'react'

type Props = {
  children: ReactNode
  locale: string
  messages: any
  timeZone?: string
}

export function LocaleProvider({
  children,
  locale,
  messages,
  timeZone = 'Europe/London'
}: Props) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      now={new Date()}
    >
      {children}
    </NextIntlClientProvider>
  )
}
```

### 8. Update App Layout with i18n

#### Update `src/app/[locale]/layout.tsx`
```typescript
import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { LocaleProvider } from '@/providers/locale-provider'
import { locales } from '@/i18n/config'
import { getMessages, getTranslations } from 'next-intl/server'

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
    title: t('title'),
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
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Load messages for the locale
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <LocaleProvider locale={locale} messages={messages}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
```

### 9. Create Link Component for Locale-Aware Navigation

#### Create `src/components/shared/locale-link.tsx`
```typescript
'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ComponentProps } from 'react'

type Props = ComponentProps<typeof Link> & {
  href: string
}

export function LocaleLink({ href, ...props }: Props) {
  const locale = useLocale()
  
  // Don't prefix default locale (English)
  const localizedHref = locale === 'en' ? href : `/${locale}${href}`
  
  return <Link href={localizedHref} {...props} />
}
```

### 10. Create Test Page with Translations

#### Update `src/app/[locale]/page.tsx`
```typescript
import { useTranslations } from 'next-intl'
import { LocaleLink } from '@/components/shared/locale-link'

export default function HomePage() {
  const t = useTranslations('common')
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">{t('metadata.title')}</h1>
      <p className="mt-4 text-muted-foreground">
        {t('metadata.description')}
      </p>
      
      <nav className="mt-8 flex gap-4">
        <LocaleLink href="/" className="text-blue-600 hover:underline">
          {t('navigation.home')}
        </LocaleLink>
        <LocaleLink href="/tools" className="text-blue-600 hover:underline">
          {t('navigation.tools')}
        </LocaleLink>
      </nav>
      
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Test Translations:</h2>
        <ul className="space-y-1">
          <li>{t('common.copy')} → {t('common.copied')}</li>
          <li>{t('common.characters')}: 0</li>
          <li>{t('common.words')}: 0</li>
        </ul>
      </div>
    </div>
  )
}
```

### 11. Create Tools Directory Structure

#### Create `src/app/[locale]/tools/page.tsx`
```typescript
import { useTranslations } from 'next-intl'

export default function ToolsPage() {
  const t = useTranslations('common')
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">{t('navigation.tools')}</h1>
      <p className="mt-4">Tools directory page - to be implemented</p>
    </div>
  )
}
```

#### Create `src/app/[locale]/tools/[tool]/page.tsx`
```typescript
import { notFound } from 'next/navigation'

export default function ToolPage({
  params
}: {
  params: { locale: string; tool: string }
}) {
  // Placeholder - will be implemented in later stories
  if (!params.tool) {
    notFound()
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">Tool: {params.tool}</h1>
      <p className="mt-4">Tool implementation coming soon...</p>
    </div>
  )
}
```

## Testing & Verification

### 1. Test Language Routing
```bash
# Start development server
npm run dev

# Test URLs:
# - http://localhost:3000 (English - no prefix)
# - http://localhost:3000/fr (French)
# - http://localhost:3000/ru (Russian)
# - http://localhost:3000/it (Italian)
# - http://localhost:3000/tools (English tools)
# - http://localhost:3000/fr/tools (French tools)
```

### 2. Verify Translations Load
- Check that page titles and navigation items appear in the correct language
- Verify that switching languages preserves the current page

### 3. Test 404 Handling
- Try accessing invalid locale: http://localhost:3000/es (should 404)
- Try accessing valid pages with wrong locale structure

## Success Indicators
- ✅ All 4 languages accessible via URLs
- ✅ English has no prefix, other languages have prefixes
- ✅ Translations load correctly
- ✅ Navigation maintains locale
- ✅ Invalid locales return 404
- ✅ Browser language detection works
- ✅ Type-safe translation system

## Common Issues & Solutions

### Issue: "Module not found: Can't resolve '@/i18n/request.ts'"
**Solution**: Ensure the file path in next.config.js matches exactly

### Issue: Translations not loading
**Solution**: Check that JSON files are valid and messages are being imported in request.ts

### Issue: Middleware not working
**Solution**: Ensure matcher in middleware.ts config is correct

## Next Steps
Once this story is complete, proceed to Story 1.3: UI Component Library Setup

## Notes for AI Implementation
- Pay careful attention to the routing structure - English should NOT have a prefix
- All translation files must be valid JSON
- The middleware matcher is crucial for proper routing
- Test thoroughly with all 4 languages before marking complete
- Type safety is important - use the custom hooks provided