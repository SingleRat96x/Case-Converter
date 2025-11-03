# Reading Time Estimator Tool - Development Roadmap

## Executive Summary

This roadmap outlines the complete development plan for integrating a new **Reading Time Estimator** tool (`/tools/reading-time-estimator`) into the TextCaseConverter.net platform. The tool will feature multi-input tabs (Text, Word Count, JSON), customizable reading speed options, and a professional results display component.

**Status:** ✅ READY FOR IMPLEMENTATION  
**Estimated Tool Count After Implementation:** 72 tools (currently 71)  
**New Category:** Analysis & Counter Tools (already exists)  
**Locales:** English (en), Russian (ru)

---

## Part A: Codebase Analysis - Reusable Components

### 1. **Page Wrapper & Layout Pattern** ✅ IDENTIFIED
- **Source:** `/src/app/tools/remove-punctuation/page.tsx`
- **Pattern:**
  ```tsx
  - Layout component wrapper
  - Tool component (main functionality)
  - SEOContent component (bottom content block)
  - generateToolMetadata for SEO
  ```
- **Will Reuse:** This exact structure for the new page

### 2. **BaseTextConverter Component** ✅ IDENTIFIED
- **Location:** `/src/components/shared/BaseTextConverter.tsx`
- **Features:**
  - Text input/output panels
  - Action buttons (Copy, Clear, Download, Upload)
  - File upload handling
  - Mobile responsive layouts (row, 2x2)
  - Feedback messages
  - Custom label support
- **Will Reuse:** As the foundation for the UI

### 3. **Input Mode Selection Pattern** ✅ IDENTIFIED
- **Source:** `/src/components/tools/CamelCaseConverter.tsx` (lines 203-234)
- **Pattern:** Select dropdown with icons for switching input types (text/json/csv)
- **Note:** No dedicated "InputTabs" component exists - uses Select component instead
- **Will Adapt:** Create a similar Select-based input switcher for Text/Word Count/JSON modes

### 4. **Options Accordion Pattern** ✅ IDENTIFIED
- **Source:** Multiple tools (RemovePunctuationConverter, CamelCaseConverter)
- **Components:**
  - `Accordion` and `AccordionItem` from `/src/components/ui/accordion`
  - `Switch` toggles for boolean options
  - `Input` fields for custom values
  - Responsive behavior (auto-open on desktop, collapsed on mobile)
- **Will Reuse:** For Reading Speed Options section

### 5. **UI Components Available** ✅ VERIFIED
- Button (`/src/components/ui/button`)
- Input (`/src/components/ui/input`)
- Label (`/src/components/ui/label`)
- Switch (`/src/components/ui/switch`)
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Accordion, AccordionItem
- Icons from `lucide-react`

### 6. **Translation System** ✅ ANALYZED
- **Hook:** `useToolTranslations` from `/src/lib/i18n/hooks`
- **Returns:** `{ common, tool }` translation objects
- **Files:**
  - Tool-specific: `/src/locales/tools/[category].json`
  - Navigation: `/src/locales/shared/navigation.json`
  - SEO Content: `/src/locales/tools/seo-content/[tool-name].json`

### 7. **Ad Placement Pattern** ✅ IDENTIFIED
- **Source:** `SEOContent` component
- **Props:** `enableAds={true}`, `adDensity="medium"`
- **Location:** After tool, before footer

---

## Part B: SEO Content JSON Schema Analysis

### SEO Content Structure ✅ CONFIRMED
**Location:** `/src/locales/tools/seo-content/`

**Schema (from text-counter.json and remove-punctuation.json):**
```json
{
  "en": {
    "title": "HTML Title (50-60 chars)",
    "metaDescription": "Meta description (150-160 chars)",
    "sections": {
      "intro": {
        "title": "Page H1",
        "content": "Intro paragraph"
      },
      "features": {
        "title": "Section heading",
        "items": [
          { "title": "Feature name", "description": "Feature description" }
        ]
      },
      "useCases": {
        "title": "Use cases heading",
        "description": "Optional intro",
        "items": [
          { "title": "Use case", "description": "Description" }
        ]
      },
      "howToUse": {
        "title": "How to heading",
        "description": "Optional intro",
        "steps": [
          {
            "step": 1,
            "title": "Step title",
            "description": "Step description"
          }
        ]
      },
      "examples": {
        "title": "Examples heading",
        "description": "Optional intro",
        "items": [
          {
            "title": "Example name",
            "input": "Input text",
            "output": "Output result"
          }
        ]
      },
      "benefits": {
        "title": "Benefits heading",
        "content": "Optional intro",
        "items": ["Benefit 1", "Benefit 2"]
      },
      "faqs": [
        {
          "question": "Question text?",
          "answer": "Answer text"
        }
      ],
      "relatedTools": {
        "title": "Related tools heading",
        "items": [
          {
            "name": "Tool name",
            "description": "Tool description",
            "href": "/tools/tool-slug"
          }
        ]
      }
    }
  },
  "ru": { /* Same structure */ }
}
```

**Required for Reading Time Estimator:**
- Create `/src/locales/tools/seo-content/reading-time-estimator.json`
- Include both `en` and `ru` translations
- Follow schema exactly as shown above

---

## Part C: Redirect Strategy

### Implementation Location ✅ CONFIRMED
**File:** `/workspace/next.config.ts`

**Pattern (from existing redirects, lines 5-89):**
```typescript
async redirects() {
  return [
    // English redirects
    {
      source: '/tools/[alternate-slug]',
      destination: '/tools/reading-time-estimator',
      permanent: true,
    },
    // Russian redirects
    {
      source: '/ru/tools/[alternate-slug]',
      destination: '/ru/tools/reading-time-estimator',
      permanent: true,
    }
  ];
}
```

**Required Redirects (301):**
1. `/tools/read-time-estimator` → `/tools/reading-time-estimator`
2. `/tools/reading-time-calculator` → `/tools/reading-time-estimator`
3. `/tools/read-time-calculator` → `/tools/reading-time-estimator`
4. `/tools/estimate-reading-time` → `/tools/reading-time-estimator`
5. (+ Russian equivalents for each)

Total: **8 redirect rules** (4 English + 4 Russian)

---

## Part D: Category Integration

### "Analysis & Counter Tools" Category ✅ ALREADY EXISTS

**Location:** `/workspace/src/app/category/analysis-counter-tools/page.tsx`

**Current Tools in Category (4 tools):**
1. Text Counter (`/tools/text-counter`)
2. Word Frequency Analyzer (`/tools/word-frequency`)
3. Sentence Counter (`/tools/sentence-counter`)
4. Extract Numbers from Text (`/tools/extract-numbers`)

**Required Action:**
- Add Reading Time Estimator as the **5th tool** in this category array

---

## Deliverable: Complete File-by-File Implementation Plan

---

## 1. NEW FILES TO CREATE

### 1.1 Main Tool Component
**File:** `/workspace/src/components/tools/ReadingTimeEstimator.tsx`
- **Purpose:** Main tool UI component
- **Features:**
  - Input mode selector (Text / Word Count / JSON)
  - Text input area (for Text mode)
  - Numeric input (for Word Count mode)
  - JSON textarea + key selector (for JSON mode)
  - Reading speed options component (inline or separate)
  - Primary CTA: "Estimate reading time"
  - Secondary CTA: "Copy result"
  - Results display component
  - Helper text
- **Dependencies:**
  - BaseTextConverter (wrapper)
  - useToolTranslations hook
  - UI components (Button, Input, Select, Switch, Accordion)
  - Custom reading speed component (inline or separate)
  - Custom results display component (inline or separate)

### 1.2 Reading Speed Options Component (Optional Separate File)
**File:** `/workspace/src/components/tools/ReadingSpeedOptions.tsx` (or inline in main component)
- **Purpose:** Modular component for WPM selection
- **Features:**
  - Preset radio buttons:
    - Average reading – 200 wpm
    - Fast reading – 250 wpm
    - Slow/technical – 150 wpm
    - Out-loud – 120 wpm
  - Custom WPM numeric input
  - State management for selected preset and custom value

### 1.3 Results Display Component (Optional Separate File)
**File:** `/workspace/src/components/tools/ReadingTimeResults.tsx` (or inline in main component)
- **Purpose:** Stats block for reading time output
- **Features:**
  - Estimated reading time (e.g., "3 min 24 sec")
  - Approximate word count (for Text/JSON modes)
  - Reading time range (e.g., "3–4 minutes")
  - Out-loud option (contextual, e.g., "Out loud: about 5 minutes")
  - Styled as a card/stats block (not a textarea)

### 1.4 Utility Functions
**File:** `/workspace/src/lib/readingTimeUtils.ts`
- **Purpose:** Core calculation logic
- **Functions:**
  - `calculateReadingTime(wordCount: number, wpm: number): { minutes: number; seconds: number }`
  - `estimateReadingRange(wordCount: number, wpm: number): { min: number; max: number }`
  - `extractWordCountFromText(text: string): number`
  - `extractWordCountFromJSON(json: string, keys: string[]): number`
  - `formatReadingTime(minutes: number, seconds: number): string`

### 1.5 Page Component (English)
**File:** `/workspace/src/app/tools/reading-time-estimator/page.tsx`
- **Purpose:** Main tool page for English locale
- **Pattern:** Follow `/src/app/tools/remove-punctuation/page.tsx`
- **Contents:**
  ```tsx
  import { Layout } from '@/components/layout/Layout';
  import { ReadingTimeEstimator } from '@/components/tools/ReadingTimeEstimator';
  import { SEOContent } from '@/components/seo/SEOContent';
  import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
  import type { Metadata } from 'next';

  const toolConfig = {
    name: 'reading-time-estimator',
    path: '/tools/reading-time-estimator'
  };

  export async function generateMetadata(): Promise<Metadata> {
    return generateToolMetadata(toolConfig.name, {
      locale: 'en',
      pathname: toolConfig.path
    });
  }

  export default function ReadingTimeEstimatorPage() {
    return (
      <Layout>
        <div className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ReadingTimeEstimator />
            <SEOContent
              toolName={toolConfig.name}
              enableAds={true}
              adDensity="medium"
            />
          </div>
        </div>
      </Layout>
    );
  }
  ```

### 1.6 Page Component (Russian)
**File:** `/workspace/src/app/ru/tools/reading-time-estimator/page.tsx`
- **Purpose:** Main tool page for Russian locale
- **Contents:** Same structure as English, with `locale: 'ru'` and path `/ru/tools/reading-time-estimator`

### 1.7 Tool Translations (English)
**File:** `/workspace/src/locales/tools/misc-tools.json` (or create new file)
- **Purpose:** Add English tool UI strings
- **Section:** `readingTimeEstimator`
- **Required Keys:**
  ```json
  "readingTimeEstimator": {
    "title": "Reading Time Estimator",
    "description": "Free read time calculator for text, word count, and JSON payloads.",
    "inputModeText": "Text",
    "inputModeWordCount": "Word Count",
    "inputModeJSON": "JSON",
    "inputPlaceholder": "Paste your article, blog post, or text here...",
    "wordCountLabel": "Total word count",
    "jsonPlaceholder": "Paste your JSON data here...",
    "jsonKeysLabel": "Key(s) to include",
    "jsonKeysPlaceholder": "[\"content\", \"body\"] or \"Auto-detect\"",
    "helperText": "Paste your text, enter a word count, or drop in JSON. Pick a reading speed and get an instant reading time estimate.",
    "speedLabel": "Reading speed (words per minute)",
    "speedAverage": "Average reading – 200 wpm (articles, blog posts)",
    "speedFast": "Fast reading – 250 wpm",
    "speedSlow": "Slow/technical reading – 150 wpm (technical documentation)",
    "speedOutLoud": "Out-loud reading – 120 wpm (presentations, speeches)",
    "speedCustom": "Custom WPM",
    "estimateButton": "Estimate reading time",
    "copyResultButton": "Copy result",
    "resultCopied": "Result copied to clipboard!",
    "resultsTitle": "Reading Time Estimate",
    "resultsReadingTime": "Estimated reading time",
    "resultsWordCount": "Approximate word count",
    "resultsRange": "Reading time range",
    "resultsOutLoud": "Out loud",
    "downloadFileName": "reading-time-estimate.txt"
  }
  ```

### 1.8 Tool Translations (Russian)
**File:** `/workspace/src/locales/tools/misc-tools.json` (or same file as above)
- **Purpose:** Add Russian tool UI strings
- **Section:** `readingTimeEstimator` (under `ru` locale)
- **Required Keys:** All keys from 1.7, translated to Russian

### 1.9 SEO Content JSON
**File:** `/workspace/src/locales/tools/seo-content/reading-time-estimator.json`
- **Purpose:** SEO content block for bottom of page
- **Structure:** Follow schema from Part B
- **English Content:**
  ```json
  {
    "en": {
      "title": "Reading Time Estimator – Free Read Time Calculator for Text & JSON",
      "metaDescription": "Paste text, enter a word count, or provide JSON and instantly get an estimated reading time. Choose words-per-minute for normal, fast, or out-loud reading and see minutes, seconds, and reading time for articles, emails, and books.",
      "sections": {
        "intro": {
          "title": "Reading Time Estimator",
          "content": "Calculate how long it takes to read your text, article, or document with our free reading time estimator. Whether you're a content creator planning blog posts, a speaker timing presentations, or a publisher estimating book reading times, our tool provides instant, accurate estimates based on average reading speeds."
        },
        "features": { /* ... 6-9 feature items ... */ },
        "useCases": { /* ... 6-8 use case items ... */ },
        "howToUse": {
          "steps": [
            { "step": 1, "title": "Choose Input Mode", "description": "..." },
            { "step": 2, "title": "Select Reading Speed", "description": "..." },
            { "step": 3, "title": "Get Instant Estimate", "description": "..." },
            { "step": 4, "title": "Copy or Share Results", "description": "..." }
          ]
        },
        "examples": { /* ... 4-5 examples ... */ },
        "benefits": { /* ... 5-7 benefit items ... */ },
        "faqs": [ /* ... 5-7 FAQ items ... */ ],
        "relatedTools": {
          "items": [
            { "name": "Text Counter", "href": "/tools/text-counter", "description": "..." },
            { "name": "Word Frequency Analyzer", "href": "/tools/word-frequency", "description": "..." },
            { "name": "Sentence Counter", "href": "/tools/sentence-counter", "description": "..." }
          ]
        }
      }
    },
    "ru": { /* Same structure, Russian translations */ }
  }
  ```

### 1.10 Metadata Configuration
**File:** `/workspace/src/lib/metadata/toolMetadata.ts`
- **Purpose:** Add metadata entry for the new tool
- **Location:** Add to `overrides` array (after line 107)
- **Content:**
  ```typescript
  {
    slug: 'reading-time-estimator',
    pathname: '/tools/reading-time-estimator',
    type: 'tool',
    category: 'analysis-counter',
    i18n: {
      en: {
        title: 'Reading Time Estimator – Free Read Time Calculator for Text & JSON',
        description: 'Paste text, enter a word count, or provide JSON and instantly get an estimated reading time. Choose words-per-minute for normal, fast, or out-loud reading and see minutes, seconds, and reading time for articles, emails, and books.',
        shortDescription: 'Calculate reading time for text, word count, or JSON data.',
      },
      ru: {
        title: 'Калькулятор Времени Чтения — Бесплатный Оценщик для Текста и JSON',
        description: 'Вставьте текст, введите количество слов или предоставьте JSON и мгновенно получите оценку времени чтения. Выберите слов-в-минуту для обычного, быстрого или чтения вслух и посмотрите минуты, секунды и время чтения для статей, писем и книг.',
        shortDescription: 'Рассчитайте время чтения для текста, количества слов или JSON.',
      },
    },
    schema: createAdvancedSchema(
      'reading-time-estimator',
      ['Text input', 'Word count', 'JSON parsing', 'Multiple reading speeds', 'Range estimates'],
      'Text or JSON Input',
      'Reading Time Estimate',
      4.7,
      820
    ),
    relatedTools: ['text-counter', 'word-frequency', 'sentence-counter']
  }
  ```

---

## 2. EXISTING FILES TO MODIFY

### 2.1 Category Page (Add New Tool to List)
**File:** `/workspace/src/app/category/analysis-counter-tools/page.tsx`
- **Modification:** Add to `analysisCounterTools` array (after line 34):
  ```typescript
  {
    id: 'reading-time-estimator',
    title: 'Reading Time Estimator',
    description: 'Estimate reading time for text, articles, and JSON data with customizable reading speeds',
    icon: '⏱️', // or '📖' or '⌚'
    href: '/tools/reading-time-estimator'
  }
  ```

### 2.2 Next.js Redirects Configuration
**File:** `/workspace/next.config.ts`
- **Modification:** Add to `redirects()` function (after line 87, before closing bracket):
  ```typescript
  // Reading Time Estimator redirects (English)
  {
    source: '/tools/read-time-estimator',
    destination: '/tools/reading-time-estimator',
    permanent: true,
  },
  {
    source: '/tools/reading-time-calculator',
    destination: '/tools/reading-time-estimator',
    permanent: true,
  },
  {
    source: '/tools/read-time-calculator',
    destination: '/tools/reading-time-estimator',
    permanent: true,
  },
  {
    source: '/tools/estimate-reading-time',
    destination: '/tools/reading-time-estimator',
    permanent: true,
  },
  // Reading Time Estimator redirects (Russian)
  {
    source: '/ru/tools/read-time-estimator',
    destination: '/ru/tools/reading-time-estimator',
    permanent: true,
  },
  {
    source: '/ru/tools/reading-time-calculator',
    destination: '/ru/tools/reading-time-estimator',
    permanent: true,
  },
  {
    source: '/ru/tools/read-time-calculator',
    destination: '/ru/tools/reading-time-estimator',
    permanent: true,
  },
  {
    source: '/ru/tools/estimate-reading-time',
    destination: '/ru/tools/reading-time-estimator',
    permanent: true,
  },
  ```

### 2.3 Desktop Navigation (Header)
**File:** `/workspace/src/components/layout/Header.tsx`
- **Modification:** Add to `analysis-counter-tools` category items (after line 61):
  ```typescript
  { titleKey: 'navigation.readingTimeEstimator', href: '/tools/reading-time-estimator' },
  ```

### 2.4 Mobile Navigation
**File:** `/workspace/src/components/ui/mobile-navigation.tsx` (if exists)
- **Action:** Verify if separate mobile nav file exists
- **Modification:** Add same entry as 2.3 if applicable
- **Note:** May inherit from Header.tsx automatically

### 2.5 Footer Navigation
**File:** `/workspace/src/components/layout/Footer.tsx`
- **Modification:** Add to `analysisCounterTools` array (after line 65):
  ```typescript
  {
    title: t('navigation.readingTimeEstimator'),
    href: currentLocale === 'en' ? '/tools/reading-time-estimator' : '/ru/tools/reading-time-estimator'
  }
  ```

### 2.6 Navigation Translations (Shared)
**File:** `/workspace/src/locales/shared/navigation.json`
- **Modification:** Add under `en.navigation` (after line 74):
  ```json
  "readingTimeEstimator": "Reading Time Estimator",
  ```
- **Modification:** Add under `ru.navigation`:
  ```json
  "readingTimeEstimator": "Калькулятор Времени Чтения",
  ```

### 2.7 Sitemap (Auto-Generated)
**File:** `/workspace/src/app/sitemap.ts`
- **Note:** Sitemap uses `getAllMetadataEntries()` from toolMetadata.ts
- **Action:** No direct modification needed - will auto-update when toolMetadata.ts is updated
- **Verification:** After adding to toolMetadata.ts, sitemap will include:
  - `/tools/reading-time-estimator`
  - `/ru/tools/reading-time-estimator`

### 2.8 Tool Count Updates
**Action Required:** Search and update tool count from **71 to 72** in the following locations:

#### 2.8.1 Home Page / Landing Page
**Files to Check:**
- `/workspace/src/app/page.tsx`
- `/workspace/src/components/sections/OtherTools.tsx`
- Any components displaying "X tools available"

#### 2.8.2 Footer Component
**File:** `/workspace/src/components/layout/Footer.tsx`
- **Search for:** Any hardcoded tool count display
- **Pattern to look for:** `71 tools`, `toolsAvailable`, `professionalTools`

#### 2.8.3 Navigation/Header
**File:** `/workspace/src/components/layout/Header.tsx`
- **Search for:** Any tool count badges or labels

#### 2.8.4 Category Pages
**Files:**
- `/workspace/src/app/category/*/page.tsx` (all category pages)
- Check if any display total site tool count

#### 2.8.5 Translations Files
**Files to update if tool count is translatable:**
- `/workspace/src/locales/shared/navigation.json` - Update any `toolsAvailable` strings
- `/workspace/src/locales/pages/*.json` - Update any hardcoded counts

**Search Commands to Run:**
```bash
# Find all references to tool count
grep -r "71" src/
grep -r "tools available" src/ -i
grep -r "toolsAvailable" src/
grep -r "professionalTools" src/
grep -r "totalTools" src/
```

---

## 3. IMPLEMENTATION CHECKLIST

### Phase 1: Core Components & Utilities ⬜
- [ ] Create `/src/lib/readingTimeUtils.ts` with calculation functions
- [ ] Create `/src/components/tools/ReadingTimeEstimator.tsx` (main component)
- [ ] Test reading time calculations locally

### Phase 2: UI Components (Optional Modular) ⬜
- [ ] Decide: Inline or separate ReadingSpeedOptions component
- [ ] Decide: Inline or separate ReadingTimeResults component
- [ ] Implement chosen approach
- [ ] Test UI interactions and state management

### Phase 3: Page Setup ⬜
- [ ] Create `/src/app/tools/reading-time-estimator/page.tsx` (English)
- [ ] Create `/src/app/ru/tools/reading-time-estimator/page.tsx` (Russian)
- [ ] Test page rendering and metadata

### Phase 4: Translations ⬜
- [ ] Add tool UI strings to `/src/locales/tools/misc-tools.json` (en + ru)
- [ ] Add navigation string to `/src/locales/shared/navigation.json` (en + ru)
- [ ] Create `/src/locales/tools/seo-content/reading-time-estimator.json` (en + ru)
- [ ] Verify all strings render correctly

### Phase 5: Metadata & SEO ⬜
- [ ] Add entry to `/src/lib/metadata/toolMetadata.ts`
- [ ] Test metadata generation (`generateToolMetadata()`)
- [ ] Verify canonical URLs and hreflang tags
- [ ] Test OpenGraph and Twitter Card previews

### Phase 6: Navigation Integration ⬜
- [ ] Update `/src/components/layout/Header.tsx` (desktop nav)
- [ ] Update `/src/components/layout/Footer.tsx`
- [ ] Update `/src/locales/shared/navigation.json` (done in Phase 4)
- [ ] Test all navigation menus (desktop, mobile, footer)

### Phase 7: Category Integration ⬜
- [ ] Update `/src/app/category/analysis-counter-tools/page.tsx`
- [ ] Test category page display
- [ ] Verify tool appears in correct category

### Phase 8: Redirects ⬜
- [ ] Add 8 redirect rules to `/workspace/next.config.ts`
- [ ] Test all redirect URLs:
  - `/tools/read-time-estimator` → 301 → `/tools/reading-time-estimator`
  - `/tools/reading-time-calculator` → 301 → `/tools/reading-time-estimator`
  - `/tools/read-time-calculator` → 301 → `/tools/reading-time-estimator`
  - `/tools/estimate-reading-time` → 301 → `/tools/reading-time-estimator`
  - (+ 4 Russian equivalents)

### Phase 9: Tool Count Updates ⬜
- [ ] Search codebase for hardcoded "71" references
- [ ] Update tool count to "72" in all locations:
  - [ ] Home page / landing sections
  - [ ] Footer
  - [ ] Navigation/header
  - [ ] Category pages (if applicable)
  - [ ] Translation files (if applicable)
- [ ] Run search commands to verify all updated

### Phase 10: Testing & QA ⬜
- [ ] Test all 3 input modes (Text, Word Count, JSON)
- [ ] Test all reading speed presets + custom WPM
- [ ] Test JSON key extraction (manual and auto-detect)
- [ ] Test copy result functionality
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test dark mode compatibility
- [ ] Verify SEO content renders correctly
- [ ] Verify ads placement (if enabled)
- [ ] Test file upload (if implemented)
- [ ] Test keyboard shortcuts (if implemented)
- [ ] Run linter and fix any errors
- [ ] Test both English and Russian locales

### Phase 11: Sitemap & Final Verification ⬜
- [ ] Verify sitemap includes new tool URLs
- [ ] Test sitemap generation (`/sitemap.xml`)
- [ ] Submit to Google Search Console (optional)
- [ ] Verify all internal links work correctly

---

## 4. TECHNICAL SPECIFICATIONS

### 4.1 Reading Speed Presets
| Preset | WPM | Use Case |
|--------|-----|----------|
| Average reading | 200 | Articles, blog posts |
| Fast reading | 250 | Skimming, experienced readers |
| Slow/technical | 150 | Technical documentation, study material |
| Out-loud reading | 120 | Presentations, speeches, podcasts |
| Custom | User input | Any custom scenario |

### 4.2 Calculation Formulas
```typescript
// Base reading time
readingTimeMinutes = wordCount / wordsPerMinute

// Format as mm:ss
minutes = Math.floor(readingTimeMinutes)
seconds = Math.round((readingTimeMinutes - minutes) * 60)

// Range estimate (±15%)
minMinutes = Math.floor(wordCount / (wpm * 1.15))
maxMinutes = Math.ceil(wordCount / (wpm * 0.85))

// Out-loud time (if not already selected)
outLoudMinutes = Math.ceil(wordCount / 120)
```

### 4.3 Word Count Extraction

#### Text Mode
- Split by whitespace and filter empty strings
- Count words using Unicode-aware regex: `/[\p{L}\p{N}]+/gu`

#### JSON Mode
- Parse JSON
- If keys provided: Extract values from specified keys only
- If "Auto-detect": Search for common content keys (`content`, `body`, `text`, `description`, `message`)
- Recursively extract text from all string values
- Concatenate and count words

### 4.4 Results Display Format
```typescript
interface ReadingTimeResults {
  estimatedTime: string;        // "3 min 24 sec"
  wordCount?: number;            // 742 (only for Text/JSON modes)
  range: string;                 // "3–4 minutes"
  outLoudTime?: string;          // "Out loud: about 5 minutes"
  copyableString: string;        // "Estimated reading time: 3 min 24 sec (742 words)"
}
```

---

## 5. STYLING & DESIGN STANDARDS

### 5.1 Must Follow
- **No inline CSS** - Use Tailwind utility classes
- **Responsive breakpoints:** sm, md, lg, xl
- **Dark mode:** Ensure all components work with dark theme
- **Consistent spacing:** Follow existing component patterns (p-3, p-6, gap-2, gap-4, etc.)
- **Typography:** Use existing font classes (text-sm, text-base, text-lg, font-medium, font-semibold)
- **Colors:** Use theme color variables (text-foreground, text-muted-foreground, bg-card, border, etc.)
- **Icons:** Use lucide-react (Clock, BookOpen, Timer, FileText, FileJson, etc.)

### 5.2 Component Structure
```tsx
// Results Display Example
<div className="bg-card rounded-lg p-6 border hover:shadow-md transition-shadow">
  <h3 className="text-lg font-semibold mb-4">Reading Time Estimate</h3>
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">Estimated reading time:</span>
      <span className="text-xl font-bold text-primary">3 min 24 sec</span>
    </div>
    {/* More stats... */}
  </div>
</div>
```

---

## 6. ACCEPTANCE CRITERIA

### 6.1 Functional Requirements ✅
- [ ] Tool accepts text input, word count input, and JSON input
- [ ] Reading speed can be selected from presets or custom value
- [ ] Results display shows time in mm:ss format
- [ ] Results show word count (except in Word Count mode)
- [ ] Results show time range estimate
- [ ] Results show out-loud time option (contextually)
- [ ] Copy result button copies formatted summary string
- [ ] All inputs and calculations work correctly

### 6.2 Integration Requirements ✅
- [ ] Tool appears in "Analysis & Counter Tools" category
- [ ] Tool appears in desktop navigation
- [ ] Tool appears in mobile navigation
- [ ] Tool appears in footer
- [ ] All redirects work (4 English + 4 Russian)
- [ ] Tool count updated to 72 everywhere
- [ ] Sitemap includes new URLs

### 6.3 SEO Requirements ✅
- [ ] HTML title matches spec: "Reading Time Estimator – Free Read Time Calculator for Text & JSON"
- [ ] Meta description matches spec (150-160 chars)
- [ ] Canonical URL is `/tools/reading-time-estimator`
- [ ] Hreflang tags include both en and ru
- [ ] SEO content block displays at bottom
- [ ] OpenGraph and Twitter Card metadata present

### 6.4 Localization Requirements ✅
- [ ] All UI strings are translated (en + ru)
- [ ] Both /tools/ and /ru/tools/ pages work
- [ ] SEO content exists for both locales
- [ ] Navigation labels translated
- [ ] Metadata translated

### 6.5 Quality Requirements ✅
- [ ] No hardcoded text (all i18n)
- [ ] No inline CSS
- [ ] No console errors or warnings
- [ ] No linter errors
- [ ] Responsive on all screen sizes
- [ ] Dark mode compatible
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Performance: Tool loads and responds quickly

---

## 7. POST-IMPLEMENTATION TASKS

### 7.1 Monitoring
- [ ] Monitor Google Search Console for new URL indexing
- [ ] Check for 404 errors on redirect URLs
- [ ] Monitor user engagement with analytics

### 7.2 Documentation
- [ ] Update internal tool inventory
- [ ] Update any external API documentation (if applicable)
- [ ] Add to release notes / changelog

### 7.3 Marketing (Optional)
- [ ] Announce new tool on social media
- [ ] Add to newsletter
- [ ] Update homepage featured tools (if applicable)

---

## 8. ESTIMATED EFFORT

| Phase | Estimated Time |
|-------|----------------|
| Core Components & Utils | 2-3 hours |
| UI Components | 2-3 hours |
| Page Setup | 1 hour |
| Translations | 2-3 hours |
| Metadata & SEO | 1 hour |
| Navigation Integration | 1 hour |
| Category Integration | 15 minutes |
| Redirects | 15 minutes |
| Tool Count Updates | 30 minutes |
| Testing & QA | 2-3 hours |
| Sitemap & Final Verification | 30 minutes |
| **TOTAL** | **13-18 hours** |

---

## 9. DEPENDENCIES & PREREQUISITES

### 9.1 Required Before Starting
- [x] Category "Analysis & Counter Tools" exists
- [x] BaseTextConverter component available
- [x] UI component library complete (Button, Input, Select, etc.)
- [x] Translation system functional
- [x] Metadata generation system in place
- [x] SEO content system functional

### 9.2 No Dependencies
- No external APIs required
- No new npm packages needed
- No database changes required
- No backend/server changes required

---

## 10. RISK ASSESSMENT

| Risk | Impact | Mitigation |
|------|--------|------------|
| Translation quality (Russian) | Medium | Have native speaker review |
| SEO content quality | Medium | Use provided schema strictly |
| Input mode switching bugs | Medium | Thorough testing of all 3 modes |
| JSON parsing edge cases | Low | Validate JSON before parsing |
| Tool count inconsistencies | Low | Use search commands to find all references |
| Redirect conflicts | Low | Test all redirect URLs manually |

---

## 11. NOTES & RECOMMENDATIONS

### 11.1 Component Architecture Decision
**Question:** Should ReadingSpeedOptions and ReadingTimeResults be separate components or inline?

**Recommendation:** **Start inline in main component**
- **Reasoning:**
  - Tool is relatively simple and self-contained
  - No reuse planned for other tools
  - Easier to maintain state management
  - Follows pattern of RemovePunctuationConverter (options inline)
- **Refactor later:** If complexity grows or reuse is needed, extract to separate files

### 11.2 JSON Key Detection Strategy
**Recommendation:** Implement both manual and auto-detect modes
- **Manual:** User enters keys as array: `["content", "body"]`
- **Auto-detect:** Search for common keys in order:
  1. `content`, `text`, `body`, `description`, `message`
  2. Extract all string values if no common keys found
- **Validation:** Show warning if JSON is valid but no text found

### 11.3 Testing Priority
**High Priority:**
1. All 3 input modes work correctly
2. All reading speed presets calculate correctly
3. Results display formats properly
4. Both locales render without errors

**Medium Priority:**
5. Redirects work
6. Navigation links work
7. SEO content displays

**Low Priority:**
8. Dark mode styling
9. Mobile responsive tweaks
10. Analytics tracking

---

## SUMMARY

**Status:** ✅ **READY FOR IMPLEMENTATION**

This roadmap provides a complete, step-by-step plan for implementing the Reading Time Estimator tool. All required components have been identified, all integration points have been mapped, and the implementation path is clear.

**Next Steps:**
1. Review and approve this roadmap
2. Begin Phase 1: Core Components & Utilities
3. Follow checklist sequentially through Phase 11
4. Conduct thorough testing
5. Deploy to production

**Key Success Factors:**
- Follow existing patterns (BaseTextConverter, RemovePunctuationConverter)
- Adhere to i18n system (no hardcoded strings)
- Match SEO content schema exactly
- Test all 3 input modes thoroughly
- Update tool count everywhere (71 → 72)

**Questions or clarifications needed before proceeding?** Please review and provide feedback.
