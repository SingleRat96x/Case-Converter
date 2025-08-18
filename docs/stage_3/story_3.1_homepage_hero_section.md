# Story 3.1: Homepage Hero Section (Multilingual)

## Story Details
- **Stage**: 3 - Homepage & Category Pages
- **Priority**: High
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Stage 2 Complete

## Objective
Create an engaging, multilingual hero section for the homepage that clearly communicates the value proposition of the text tools website, includes a prominent call-to-action, and showcases popular tools.

## Acceptance Criteria
- [ ] Eye-catching hero headline and subheadline
- [ ] Interactive tool demo/preview
- [ ] Quick access to popular tools
- [ ] Animated background or visual elements
- [ ] Search bar integration
- [ ] Multilingual content support
- [ ] Mobile-optimized design
- [ ] Fast loading performance
- [ ] A/B testing ready structure
- [ ] Accessibility compliant

## Implementation Steps

### 1. Create Hero Section Component

#### Create `src/components/home/hero-section.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Search, Sparkles, Zap, Globe, Shield } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToolCard } from '@/components/ui/tool-card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  featuredTools?: {
    id: string
    title: string
    description: string
    icon: any
    href: string
  }[]
  className?: string
}

export function HeroSection({ featuredTools = [], className }: HeroSectionProps) {
  const t = useTranslations('home.hero')
  const [searchQuery, setSearchQuery] = React.useState('')

  const features = [
    { icon: Zap, label: t('features.fast') },
    { icon: Globe, label: t('features.multilingual') },
    { icon: Shield, label: t('features.secure') },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/tools?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <section className={cn('relative overflow-hidden bg-gradient-to-b from-background to-muted/20', className)}>
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Container className="relative py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {t('badge')}
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              {t('headline.part1')}{' '}
              <span className="text-primary">{t('headline.highlight')}</span>{' '}
              {t('headline.part2')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subheadline')}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-32 text-base shadow-lg group-hover:shadow-xl transition-shadow"
              />
              <Button 
                type="submit" 
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {t('searchButton')}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-3">
              {t('popularSearches')}: 
              {['uppercase', 'base64', 'json'].map((term, i) => (
                <React.Fragment key={term}>
                  {i > 0 && ', '}
                  <Link 
                    href={`/tools?search=${term}`}
                    className="text-primary hover:underline"
                  >
                    {term}
                  </Link>
                </React.Fragment>
              ))}
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 pt-4"
          >
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2">
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Featured Tools Preview */}
        {featuredTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 md:mt-24"
          >
            <h2 className="text-center text-2xl font-semibold mb-8">
              {t('popularTools')}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {featuredTools.slice(0, 3).map((tool) => (
                <ToolCard
                  key={tool.id}
                  {...tool}
                  className="hover:scale-105 transition-transform"
                />
              ))}
            </div>
          </motion.div>
        )}
      </Container>
    </section>
  )
}
```

### 2. Create Interactive Demo Component

#### Create `src/components/home/interactive-demo.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, RefreshCw } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

const demoExamples = {
  uppercase: {
    input: 'hello world',
    output: 'HELLO WORLD',
    transform: (text: string) => text.toUpperCase(),
  },
  lowercase: {
    input: 'HELLO WORLD',
    output: 'hello world',
    transform: (text: string) => text.toLowerCase(),
  },
  titleCase: {
    input: 'hello world from texttools',
    output: 'Hello World From Texttools',
    transform: (text: string) => 
      text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      ),
  },
  base64: {
    input: 'Hello World',
    output: 'SGVsbG8gV29ybGQ=',
    transform: (text: string) => btoa(text),
  },
}

export function InteractiveDemo() {
  const t = useTranslations('home.demo')
  const [activeTab, setActiveTab] = React.useState<keyof typeof demoExamples>('uppercase')
  const [input, setInput] = React.useState(demoExamples.uppercase.input)
  const [output, setOutput] = React.useState(demoExamples.uppercase.output)
  const [isTransforming, setIsTransforming] = React.useState(false)

  const handleTabChange = (value: string) => {
    const tab = value as keyof typeof demoExamples
    setActiveTab(tab)
    setInput(demoExamples[tab].input)
    setOutput(demoExamples[tab].output)
  }

  const handleTransform = () => {
    setIsTransforming(true)
    setTimeout(() => {
      const result = demoExamples[activeTab].transform(input)
      setOutput(result)
      setIsTransforming(false)
    }, 500)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    toast({
      description: t('copied'),
    })
  }

  return (
    <Card className="overflow-hidden border-2 shadow-xl">
      <div className="bg-muted/50 p-4 border-b">
        <h3 className="font-semibold text-center">{t('title')}</h3>
      </div>
      
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="uppercase">{t('tools.uppercase')}</TabsTrigger>
            <TabsTrigger value="lowercase">{t('tools.lowercase')}</TabsTrigger>
            <TabsTrigger value="titleCase">{t('tools.titleCase')}</TabsTrigger>
            <TabsTrigger value="base64">{t('tools.base64')}</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('input')}</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 p-3 rounded-lg border bg-background resize-none"
                placeholder={t('inputPlaceholder')}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('output')}</label>
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.textarea
                    key={output}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    value={output}
                    readOnly
                    className="w-full h-32 p-3 rounded-lg border bg-muted resize-none"
                    placeholder={t('outputPlaceholder')}
                  />
                </AnimatePresence>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleTransform}
              disabled={isTransforming}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isTransforming && 'animate-spin')} />
              {t('transform')}
            </Button>
          </div>
        </Tabs>
      </div>
    </Card>
  )
}
```

### 3. Create Stats Counter Component

#### Create `src/components/home/stats-counter.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'

interface Stat {
  value: number
  label: string
  suffix?: string
}

export function StatsCounter() {
  const t = useTranslations('home.stats')
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })

  const stats: Stat[] = [
    { value: 60, label: t('tools'), suffix: '+' },
    { value: 4, label: t('languages') },
    { value: 100000, label: t('users'), suffix: '+' },
    { value: 99.9, label: t('uptime'), suffix: '%' },
  ]

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div key={stat.label} className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="text-4xl md:text-5xl font-bold text-primary">
              {isInView && (
                <CountUp 
                  end={stat.value} 
                  duration={2} 
                  suffix={stat.suffix}
                />
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              {stat.label}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  )
}

function CountUp({ 
  end, 
  duration = 2, 
  suffix = '' 
}: { 
  end: number
  duration?: number
  suffix?: string 
}) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const increment = end / (duration * 60)
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [end, duration])

  return <>{count.toLocaleString()}{suffix}</>
}
```

### 4. Update Translations

Add to `src/i18n/locales/en/home.json`:
```json
{
  "hero": {
    "badge": "60+ Free Tools Available",
    "headline": {
      "part1": "Transform Your",
      "highlight": "Text",
      "part2": "Instantly"
    },
    "subheadline": "Free online text manipulation tools in multiple languages. No signup required.",
    "searchPlaceholder": "Search for a tool...",
    "searchButton": "Search",
    "popularSearches": "Popular",
    "features": {
      "fast": "Lightning Fast",
      "multilingual": "4 Languages",
      "secure": "100% Secure"
    },
    "popularTools": "Most Popular Tools"
  },
  "demo": {
    "title": "Try It Live",
    "input": "Input",
    "output": "Output",
    "inputPlaceholder": "Type or paste your text here",
    "outputPlaceholder": "Result will appear here",
    "transform": "Transform",
    "copied": "Copied to clipboard!",
    "tools": {
      "uppercase": "UPPERCASE",
      "lowercase": "lowercase",
      "titleCase": "Title Case",
      "base64": "Base64"
    }
  },
  "stats": {
    "tools": "Tools",
    "languages": "Languages",
    "users": "Monthly Users",
    "uptime": "Uptime"
  }
}
```

## Testing & Verification

1. Test hero section responsiveness
2. Verify animations performance
3. Test search functionality
4. Check interactive demo
5. Test with all languages
6. Verify accessibility

## Success Indicators
- ✅ Eye-catching design
- ✅ Clear value proposition
- ✅ Interactive elements work
- ✅ Fast loading
- ✅ Mobile optimized
- ✅ All languages supported
- ✅ Accessible

## Next Steps
Proceed to Story 3.2: Tool Categories Grid

## Notes
- Optimize animations for performance
- Test on low-end devices
- Consider adding video demo
- A/B test different headlines