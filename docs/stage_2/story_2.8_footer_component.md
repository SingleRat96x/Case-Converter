# Story 2.8: Footer Component with Language Support

## Story Details
- **Stage**: 2 - Core Features & Shared Components
- **Priority**: Low
- **Estimated Hours**: 2 hours
- **Dependencies**: Story 2.7 (Breadcrumb Navigation)

## Objective
Create a comprehensive footer component with multilingual support, featuring links to tools, legal pages, social media, and a newsletter subscription.

## Acceptance Criteria
- [ ] Multi-column layout with tool categories
- [ ] Legal and policy links
- [ ] Social media links
- [ ] Newsletter subscription form
- [ ] Language selector integration
- [ ] Mobile-responsive design
- [ ] Dark/light theme support
- [ ] Copyright information
- [ ] Back to top button

## Implementation Steps

### 1. Create Enhanced Footer Component

#### Update `src/components/layout/footer.tsx`
```typescript
'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Github, Twitter, Linkedin, Mail, ArrowUp, Heart } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Logo } from './logo'
import { LanguageSwitcher } from './language-switcher'
import { toast } from '@/components/ui/use-toast'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

export function Footer() {
  const t = useTranslations('common')
  const locale = useLocale()
  const [email, setEmail] = React.useState('')
  const [isSubscribing, setIsSubscribing] = React.useState(false)

  const currentYear = new Date().getFullYear()

  const localizeHref = (href: string) => {
    if (href.startsWith('http') || locale === 'en') return href
    return `/${locale}${href}`
  }

  const footerSections: FooterSection[] = [
    {
      title: t('footer.tools'),
      links: [
        { label: t('footer.popularTools'), href: '/tools?filter=popular' },
        { label: t('footer.newTools'), href: '/tools?filter=new' },
        { label: t('footer.allTools'), href: '/tools' },
        { label: t('footer.categories'), href: '/categories' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), href: '/about' },
        { label: t('footer.blog'), href: '/blog' },
        { label: t('footer.contact'), href: '/contact' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.cookies'), href: '/cookies' },
      ],
    },
  ]

  const socialLinks = [
    { icon: Github, href: 'https://github.com/texttools', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/texttools', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/texttools', label: 'LinkedIn' },
  ]

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        variant: 'destructive',
        description: t('footer.emailRequired'),
      })
      return
    }

    setIsSubscribing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        description: t('footer.subscribeSuccess'),
      })
      setEmail('')
    } catch (error) {
      toast({
        variant: 'destructive',
        description: t('footer.subscribeError'),
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t bg-muted/30">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2 space-y-4">
              <Logo showText />
              <p className="text-sm text-muted-foreground max-w-xs">
                {t('footer.description')}
              </p>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t('footer.newsletter')}</h3>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={t('footer.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubscribing}
                    className="max-w-[240px]"
                  />
                  <Button type="submit" disabled={isSubscribing}>
                    {isSubscribing ? '...' : t('footer.subscribe')}
                  </Button>
                </form>
              </div>

              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {footerSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="font-semibold text-sm">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={localizeHref(link.href)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} TextTools. {t('footer.rights')}</p>
            <span className="hidden md:inline">•</span>
            <p className="flex items-center gap-1">
              {t('footer.madeWith')} <Heart className="h-3 w-3 fill-current text-red-500" />
            </p>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher showFlag={false} showName={false} />
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollToTop}
              className="rounded-full"
              aria-label={t('footer.backToTop')}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Container>
    </footer>
  )
}
```

### 2. Create Newsletter Component

#### Create `src/components/layout/newsletter-form.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

interface NewsletterFormProps {
  variant?: 'default' | 'inline' | 'card'
  className?: string
}

export function NewsletterForm({ variant = 'default', className }: NewsletterFormProps) {
  const t = useTranslations('common')
  const [email, setEmail] = React.useState('')
  const [isSubscribing, setIsSubscribing] = React.useState(false)
  const [isSubscribed, setIsSubscribed] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) return

    setIsSubscribing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsSubscribed(true)
      toast({
        description: t('footer.subscribeSuccess'),
      })
      
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail('')
      }, 5000)
    } catch (error) {
      toast({
        variant: 'destructive',
        description: t('footer.subscribeError'),
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  if (variant === 'card') {
    return (
      <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('footer.newsletterTitle')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('footer.newsletterDescription')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder={t('footer.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubscribing || isSubscribed}
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubscribing || isSubscribed}
          >
            {isSubscribed ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('footer.subscribed')}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {isSubscribing ? t('footer.subscribing') : t('footer.subscribe')}
              </>
            )}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <Input
        type="email"
        placeholder={t('footer.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubscribing || isSubscribed}
        className="flex-1"
      />
      <Button type="submit" disabled={isSubscribing || isSubscribed}>
        {isSubscribed ? <CheckCircle className="h-4 w-4" /> : isSubscribing ? '...' : t('footer.subscribe')}
      </Button>
    </form>
  )
}
```

### 3. Update Translations

Add to `src/i18n/locales/en/common.json`:
```json
{
  "footer": {
    "tools": "Tools",
    "popularTools": "Popular Tools",
    "newTools": "New Tools",
    "allTools": "All Tools",
    "categories": "Categories",
    "company": "Company",
    "about": "About Us",
    "blog": "Blog",
    "contact": "Contact",
    "legal": "Legal",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
    "cookies": "Cookie Policy",
    "description": "Free online text manipulation and conversion tools.",
    "newsletter": "Newsletter",
    "newsletterTitle": "Stay Updated",
    "newsletterDescription": "Get the latest tools and updates.",
    "emailPlaceholder": "Enter your email",
    "emailRequired": "Please enter your email",
    "subscribe": "Subscribe",
    "subscribing": "Subscribing...",
    "subscribed": "Subscribed!",
    "subscribeSuccess": "Successfully subscribed!",
    "subscribeError": "Failed to subscribe.",
    "rights": "All rights reserved",
    "madeWith": "Made with",
    "backToTop": "Back to top"
  }
}
```

## Testing & Verification

1. Test responsive layout
2. Verify newsletter form
3. Test language switching
4. Check theme support
5. Test back to top

## Success Indicators
- ✅ Multi-column responsive layout
- ✅ Newsletter subscription works
- ✅ Links properly localized
- ✅ Social media links functional
- ✅ Back to top smooth scroll
- ✅ Theme support complete

## Next Steps
Stage 2 is complete! Proceed to Stage 3.

## Notes
- Test newsletter with actual API
- Ensure GDPR compliance
- Add analytics tracking
- Test with screen readers