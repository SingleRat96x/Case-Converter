# CTA Component Implementation Examples

This document provides ready-to-implement code examples for the three primary CTA components recommended in the analysis.

---

## 1. StickyCTABar Component

### File: `/src/components/shared/StickyCTABar.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { X, Bookmark, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCommonTranslations } from '@/lib/i18n/hooks';

interface StickyCTABarProps {
  /**
   * Unique identifier for this tool (for localStorage tracking)
   */
  toolSlug: string;
  
  /**
   * Show after user generates/processes something
   */
  triggerAfterAction?: boolean;
  
  /**
   * Auto-dismiss after X milliseconds (0 = never)
   */
  autoDismissMs?: number;
  
  /**
   * Custom CTA links (optional)
   */
  customLinks?: {
    bookmark?: { label: string; href: string };
    share?: { label: string; onClick: () => void };
    explore?: { label: string; href: string };
  };
}

export function StickyCTABar({
  toolSlug,
  triggerAfterAction = true,
  autoDismissMs = 0,
  customLinks,
}: StickyCTABarProps) {
  const { tSync } = useCommonTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user has dismissed this CTA before
  useEffect(() => {
    const dismissedKey = `cta-dismissed-${toolSlug}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';
    
    if (wasDismissed) {
      setIsDismissed(true);
    }
  }, [toolSlug]);

  // Auto-dismiss timer
  useEffect(() => {
    if (isVisible && autoDismissMs > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissMs);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoDismissMs]);

  // Trigger visibility (call this from parent after user action)
  const show = () => {
    if (!isDismissed) {
      setIsVisible(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    const dismissedKey = `cta-dismissed-${toolSlug}`;
    localStorage.setItem(dismissedKey, 'true');
    setIsDismissed(true);
  };

  const handleBookmark = () => {
    // Try native bookmark API if available
    if (typeof window !== 'undefined' && 'addToFavorites' in window) {
      try {
        // @ts-ignore - IE/Edge specific API
        window.external.AddFavorite(window.location.href, document.title);
      } catch (e) {
        // Fallback: just show alert
        alert(tSync('cta.bookmarkInstructions') || 'Press Ctrl+D (Cmd+D on Mac) to bookmark this page');
      }
    } else {
      alert(tSync('cta.bookmarkInstructions') || 'Press Ctrl+D (Cmd+D on Mac) to bookmark this page');
    }
    
    // Track event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        cta_type: 'sticky_bar',
        cta_action: 'bookmark',
        tool_slug: toolSlug,
      });
    }
  };

  const handleShare = async () => {
    if (customLinks?.share?.onClick) {
      customLinks.share.onClick();
      return;
    }

    // Try native share API
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: tSync('cta.shareText') || 'Check out this free tool!',
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      alert(tSync('cta.linkCopied') || 'Link copied to clipboard!');
    }
    
    // Track event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        cta_type: 'sticky_bar',
        cta_action: 'share',
        tool_slug: toolSlug,
      });
    }
  };

  const handleExplore = () => {
    // Track event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        cta_type: 'sticky_bar',
        cta_action: 'explore',
        tool_slug: toolSlug,
      });
    }
  };

  // Expose show method via ref or custom event
  useEffect(() => {
    // Listen for custom event to trigger CTA
    const handleTrigger = () => show();
    window.addEventListener(`show-cta-${toolSlug}`, handleTrigger);
    
    return () => {
      window.removeEventListener(`show-cta-${toolSlug}`, handleTrigger);
    };
  }, [toolSlug, isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block fixed top-20 left-0 right-0 z-40 animate-slide-down">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-primary/80 dark:from-primary dark:dark:to-primary/90 text-primary-foreground rounded-lg shadow-lg p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={handleBookmark}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Bookmark className="h-5 w-5" />
                <span className="font-medium text-sm">
                  {customLinks?.bookmark?.label || tSync('cta.bookmark') || 'Bookmark this tool'}
                </span>
              </button>
              
              <div className="h-5 w-px bg-primary-foreground/30" />
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Share2 className="h-5 w-5" />
                <span className="font-medium text-sm">
                  {customLinks?.share?.label || tSync('cta.share') || 'Share with team'}
                </span>
              </button>
              
              <div className="h-5 w-px bg-primary-foreground/30" />
              
              <Link
                href={customLinks?.explore?.href || '/tools'}
                onClick={handleExplore}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Sparkles className="h-5 w-5" />
                <span className="font-medium text-sm">
                  {customLinks?.explore?.label || tSync('cta.exploreMore') || 'Explore more tools'}
                </span>
              </Link>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-primary-foreground/20 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile version - bottom sticky */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg p-3 flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={handleBookmark}
            className="flex flex-col items-center gap-1 flex-1 min-h-[44px] justify-center hover:opacity-80 transition-opacity"
          >
            <Bookmark className="h-5 w-5" />
            <span className="text-xs font-medium">
              {tSync('cta.bookmarkShort') || 'Bookmark'}
            </span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 flex-1 min-h-[44px] justify-center hover:opacity-80 transition-opacity"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-xs font-medium">
              {tSync('cta.shareShort') || 'Share'}
            </span>
          </button>
          
          <Link
            href={customLinks?.explore?.href || '/tools'}
            onClick={handleExplore}
            className="flex flex-col items-center gap-1 flex-1 min-h-[44px] justify-center hover:opacity-80 transition-opacity"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-medium">
              {tSync('cta.moreShort') || 'More'}
            </span>
          </Link>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-2 hover:bg-primary-foreground/20 rounded transition-colors ml-2"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}

// Utility function to trigger CTA from parent components
export function triggerStickyCTA(toolSlug: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`show-cta-${toolSlug}`));
  }
}
```

### Usage Example:

```tsx
// In your tool component (e.g., PasswordGenerator.tsx)
import { triggerStickyCTA } from '@/components/shared/StickyCTABar';

const handleGenerate = () => {
  // ... your generation logic ...
  
  // Trigger CTA after first generation
  setTimeout(() => {
    triggerStickyCTA('password-generator');
  }, 2000); // Show 2 seconds after generation
};

// In your page component (e.g., page.tsx)
import { StickyCTABar } from '@/components/shared/StickyCTABar';

export default function PasswordGeneratorPage() {
  return (
    <Layout>
      <StickyCTABar toolSlug="password-generator" />
      <PasswordGenerator />
      <SEOContent toolName="password-generator" />
    </Layout>
  );
}
```

---

## 2. MidContentCTA Component

### File: `/src/components/seo/MidContentCTA.tsx`

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useCommonTranslations } from '@/lib/i18n/hooks';

interface RelatedTool {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface MidContentCTAProps {
  /**
   * Main headline text
   */
  headline?: string;
  
  /**
   * Subheadline or description
   */
  subheadline?: string;
  
  /**
   * Array of related tools to suggest
   */
  relatedTools: RelatedTool[];
  
  /**
   * Tool slug for analytics tracking
   */
  toolSlug: string;
  
  /**
   * Locale for URL construction
   */
  locale?: 'en' | 'ru';
}

export function MidContentCTA({
  headline,
  subheadline,
  relatedTools,
  toolSlug,
  locale = 'en',
}: MidContentCTAProps) {
  const { tSync } = useCommonTranslations();

  const handleToolClick = (relatedSlug: string) => {
    // Track event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        cta_type: 'mid_content',
        cta_action: 'related_tool',
        source_tool: toolSlug,
        destination_tool: relatedSlug,
      });
    }
  };

  const constructToolUrl = (slug: string) => {
    const base = locale === 'ru' ? '/ru/tools' : '/tools';
    return `${base}/${slug}`;
  };

  return (
    <div className="my-16">
      <div className="bg-gradient-to-br from-muted/50 to-muted/30 border-l-4 border-primary rounded-lg p-8 md:p-10">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {headline || tSync('cta.midContent.headline') || 'Task completed!'}
            </h3>
            {subheadline && (
              <p className="text-muted-foreground">
                {subheadline}
              </p>
            )}
          </div>
        </div>

        {/* Related Tools Grid */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {tSync('cta.midContent.relatedTools') || 'Explore Related Tools'}
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTools.map((tool, index) => (
              <Link
                key={index}
                href={constructToolUrl(tool.slug)}
                onClick={() => handleToolClick(tool.slug)}
                className="group bg-card border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all hover:scale-102"
              >
                <div className="flex items-start gap-3">
                  {tool.icon && (
                    <span className="text-2xl" aria-hidden="true">
                      {tool.icon}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 truncate">
                      {tool.name}
                    </h5>
                    {tool.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="mt-6 text-center">
          <Link
            href={locale === 'ru' ? '/ru/tools' : '/tools'}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
          >
            {tSync('cta.midContent.viewAll') || 'View all tools'}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Usage in SEOContent Component:

```tsx
// In SEOContent.tsx, add after "Use Cases" section:

import { MidContentCTA } from './MidContentCTA';

// Inside the component:
<section>
  {/* ... Use Cases section ... */}
</section>

{/* Mid-Content CTA */}
<MidContentCTA
  headline={content.sections.midCTA?.headline}
  subheadline={content.sections.midCTA?.subheadline}
  relatedTools={[
    { name: 'Random Letter Generator', slug: 'random-letter', icon: '🔤' },
    { name: 'UUID Generator', slug: 'uuid-generator', icon: '🔑' },
    { name: 'SHA-1 Hash', slug: 'sha1-hash-generator', icon: '🔒' },
  ]}
  toolSlug={toolName}
  locale={currentLocale}
/>

<section>
  {/* ... Related Tools section ... */}
</section>
```

---

## 3. BottomEngagementBanner Component

### File: `/src/components/seo/BottomEngagementBanner.tsx`

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Share2 } from 'lucide-react';
import { useCommonTranslations } from '@/lib/i18n/hooks';

interface BottomEngagementBannerProps {
  /**
   * Tool slug for analytics
   */
  toolSlug: string;
  
  /**
   * Locale for URL construction
   */
  locale?: 'en' | 'ru';
  
  /**
   * Custom headline
   */
  headline?: string;
  
  /**
   * Custom description
   */
  description?: string;
}

export function BottomEngagementBanner({
  toolSlug,
  locale = 'en',
  headline,
  description,
}: BottomEngagementBannerProps) {
  const { tSync } = useCommonTranslations();

  const handleActionClick = (action: string) => {
    // Track event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        cta_type: 'bottom_banner',
        cta_action: action,
        tool_slug: toolSlug,
      });
    }
  };

  const handleShare = async () => {
    handleActionClick('share');
    
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: tSync('cta.shareText') || 'Check out this free tool!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(tSync('cta.linkCopied') || 'Link copied to clipboard!');
    }
  };

  return (
    <div className="mt-20 mb-8">
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 dark:from-accent/10 dark:via-primary/5 dark:to-accent/10 rounded-xl p-8 md:p-12 text-center border">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-3xl font-bold text-foreground mb-4">
          {headline || tSync('cta.bottom.headline') || 'Found This Tool Helpful?'}
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {description || 
            tSync('cta.bottom.description') || 
            'Share it with your team or explore 100+ other free tools for developers, marketers, and content creators.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Explore All Tools */}
          <Link
            href={locale === 'ru' ? '/ru/tools' : '/tools'}
            onClick={() => handleActionClick('explore_all')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Sparkles className="h-5 w-5" />
            {tSync('cta.bottom.exploreAll') || 'Explore All Tools'}
          </Link>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-all hover:scale-105"
          >
            <Share2 className="h-5 w-5" />
            {tSync('cta.bottom.share') || 'Share'}
          </button>
        </div>

        {/* Social Links (Optional) */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-3">
            {tSync('cta.bottom.followUs') || 'Follow us for updates'}
          </p>
          <div className="flex items-center justify-center gap-4">
            {/* Add your social media links here */}
            <a
              href="https://twitter.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleActionClick('social_twitter')}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Follow us on Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            {/* Add more social icons as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Usage in SEOContent Component:

```tsx
// In SEOContent.tsx, add after FAQ section:

import { BottomEngagementBanner } from './BottomEngagementBanner';

// Inside the component, after FAQ section:
<section>
  {/* ... FAQ Section ... */}
</section>

{/* Bottom Engagement Banner */}
<BottomEngagementBanner
  toolSlug={toolName}
  locale={currentLocale}
/>

{/* Space for auto ads at bottom */}
<div className="mt-16"></div>
```

---

## 4. Animation Styles (Add to globals.css)

```css
/* Sticky CTA Animations */
@keyframes slide-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Hover scale effect */
.hover\:scale-102:hover {
  transform: scale(1.02);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

---

## 5. i18n Translation Keys

### Add to `/src/locales/en/common.json`:

```json
{
  "cta": {
    "bookmark": "Bookmark this tool",
    "bookmarkShort": "Bookmark",
    "bookmarkInstructions": "Press Ctrl+D (Cmd+D on Mac) to bookmark this page",
    "share": "Share with team",
    "shareShort": "Share",
    "shareText": "Check out this free tool!",
    "linkCopied": "Link copied to clipboard!",
    "exploreMore": "Explore more tools",
    "moreShort": "More",
    "midContent": {
      "headline": "Task completed!",
      "subheadline": "Explore these related tools to boost your productivity:",
      "relatedTools": "Explore Related Tools",
      "viewAll": "View all tools"
    },
    "bottom": {
      "headline": "Found This Tool Helpful?",
      "description": "Share it with your team or explore 100+ other free tools for developers, marketers, and content creators.",
      "exploreAll": "Explore All Tools",
      "share": "Share",
      "followUs": "Follow us for updates"
    }
  }
}
```

### Add to `/src/locales/ru/common.json`:

```json
{
  "cta": {
    "bookmark": "Добавить в закладки",
    "bookmarkShort": "Закладки",
    "bookmarkInstructions": "Нажмите Ctrl+D (Cmd+D на Mac), чтобы добавить страницу в закладки",
    "share": "Поделиться с командой",
    "shareShort": "Поделиться",
    "shareText": "Посмотрите этот бесплатный инструмент!",
    "linkCopied": "Ссылка скопирована в буфер обмена!",
    "exploreMore": "Изучить больше инструментов",
    "moreShort": "Ещё",
    "midContent": {
      "headline": "Задача выполнена!",
      "subheadline": "Изучите эти связанные инструменты для повышения продуктивности:",
      "relatedTools": "Связанные Инструменты",
      "viewAll": "Посмотреть все инструменты"
    },
    "bottom": {
      "headline": "Этот Инструмент Был Полезен?",
      "description": "Поделитесь им с командой или изучите более 100 бесплатных инструментов для разработчиков, маркетологов и создателей контента.",
      "exploreAll": "Изучить Все Инструменты",
      "share": "Поделиться",
      "followUs": "Подпишитесь на обновления"
    }
  }
}
```

---

## 6. TypeScript Declarations

### Add to `/src/types/global.d.ts` (create if doesn't exist):

```typescript
// Google Analytics gtag types
interface Window {
  gtag?: (
    command: string,
    action: string,
    params?: Record<string, any>
  ) => void;
}
```

---

## 7. Integration Checklist

### Phase 1: Install Sticky CTA
- [ ] Create `StickyCTABar.tsx` component
- [ ] Add i18n keys to `common.json` (EN/RU)
- [ ] Add animation styles to `globals.css`
- [ ] Import in tool page layouts
- [ ] Add `triggerStickyCTA()` call in tool components
- [ ] Test on desktop and mobile
- [ ] Verify localStorage persistence

### Phase 2: Install Mid-Content CTA
- [ ] Create `MidContentCTA.tsx` component
- [ ] Add to `SEOContent.tsx` after Use Cases section
- [ ] Configure related tools in each tool's JSON
- [ ] Test internal link tracking
- [ ] Verify responsive layout

### Phase 3: Install Bottom Banner
- [ ] Create `BottomEngagementBanner.tsx` component
- [ ] Add to `SEOContent.tsx` after FAQ section
- [ ] Add social media links (if applicable)
- [ ] Test share functionality
- [ ] Verify mobile layout

### Phase 4: Analytics & Testing
- [ ] Set up GA4 custom events
- [ ] Create conversion funnels
- [ ] Monitor CTA click rates
- [ ] A/B test different copy
- [ ] Adjust based on data

---

## 8. Performance Considerations

```typescript
// Lazy load CTA components for better initial page load
import dynamic from 'next/dynamic';

const StickyCTABar = dynamic(
  () => import('@/components/shared/StickyCTABar').then(mod => mod.StickyCTABar),
  { ssr: false }
);

const MidContentCTA = dynamic(
  () => import('@/components/seo/MidContentCTA').then(mod => mod.MidContentCTA),
  { ssr: true } // Can be SSR since it's below fold
);
```

---

## 9. A/B Testing Setup

```typescript
// Example A/B test wrapper
'use client';

import { useState, useEffect } from 'react';

export function ABTestCTA({ variantA, variantB, testId }: any) {
  const [variant, setVariant] = useState<'A' | 'B'>('A');

  useEffect(() => {
    // Simple 50/50 split (use a proper A/B testing library in production)
    const storedVariant = localStorage.getItem(`ab-test-${testId}`);
    
    if (storedVariant) {
      setVariant(storedVariant as 'A' | 'B');
    } else {
      const newVariant = Math.random() < 0.5 ? 'A' : 'B';
      setVariant(newVariant);
      localStorage.setItem(`ab-test-${testId}`, newVariant);
      
      // Track variant assignment
      if (window.gtag) {
        window.gtag('event', 'ab_test_assigned', {
          test_id: testId,
          variant: newVariant,
        });
      }
    }
  }, [testId]);

  return variant === 'A' ? variantA : variantB;
}

// Usage:
<ABTestCTA
  testId="sticky-cta-headline"
  variantA={<StickyCTABar headline="Bookmark this tool" />}
  variantB={<StickyCTABar headline="Save for later" />}
/>
```

---

This completes the implementation guide. All components follow your existing code style, use your i18n system, and are fully responsive and accessible.
