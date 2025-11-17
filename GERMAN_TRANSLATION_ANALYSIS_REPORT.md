# 🇩🇪 GERMAN (DE) TRANSLATION - COMPREHENSIVE ANALYSIS REPORT

**Generated:** 2025-11-07  
**Status:** Analysis Complete - NO EDITS MADE  
**Analyst:** AI Background Agent

---

## 📊 EXECUTIVE SUMMARY

### Current State
- **Completed:** 9 of 90 entries (10%)
- **Remaining:** 81 entries require German translation (90%)
- **Total Work:** ~75 tool pages + metadata + SEO content + component translations

### What's Already Done ✅
1. **Shared Components & Layout** (100%)
   - Header, Footer, Navigation (desktop & mobile)
   - Language switcher
   - Common UI strings
   
2. **Static Pages** (100%)
   - About Us (`/de/about-us`)
   - Contact Us (`/de/contact-us`)
   - Privacy Policy (`/de/privacy-policy`)
   - Terms of Service (`/de/terms-of-service`)
   - Changelog (`/de/changelog`)
   - RSS Feed (German version)

3. **Core Pages** (100%)
   - Home/Index page (`/de`)
   - All Tools page (`/de/tools`)
   - Not Found page (`/de/404`)

4. **Category Pages** (100% - all 8)
   - Analysis & Counter Tools
   - Code & Data Translation
   - Convert Case Tools
   - Image Tools
   - Misc Tools
   - Random Generators
   - Social Media Text Generators
   - Text Modification & Formatting

5. **Individual Tools** (1 of 75 = 1.3%)
   - Reading Time Estimator ✅ (ONLY ONE COMPLETE)

---

## 🔍 DETAILED BREAKDOWN

### 1. TOOL PAGES - German `/de/tools/` Directory

**Status:** 1 of 75 completed (1.3%)

| Status | Count | Details |
|--------|-------|---------|
| ✅ Completed | 1 | `reading-time-estimator` |
| ❌ Missing | 75 | All other tools |

#### Missing Tool Page Files (75 total):
```
/workspace/src/app/de/tools/
├── ❌ add-line-numbers-to-text/
├── ❌ add-prefix-and-suffix-to-lines/
├── ❌ alternating-case/
├── ❌ ascii-art-generator/
├── ❌ base64-encoder-decoder/
├── ❌ big-text/
├── ❌ binary-code-translator/
├── ❌ bold-text/
├── ❌ bubble-text/
├── ❌ caesar-cipher/
├── ❌ camel-case-converter/
├── ❌ csv-to-json/
├── ❌ cursed-text/
├── ❌ discord-font/
├── ❌ duplicate-line-remover/
├── ❌ extract-emails-from-pdf/
├── ❌ extract-emails-from-text/
├── ❌ extract-numbers/
├── ❌ facebook-font/
├── ❌ hex-to-text/
├── ❌ image-cropper/
├── ❌ image-resizer/
├── ❌ image-to-text/
├── ❌ instagram-fonts/
├── ❌ invisible-text/
├── ❌ italic-text/
├── ❌ jpg-to-png/
├── ❌ jpg-to-webp/
├── ❌ json-formatter/
├── ❌ json-stringify/
├── ❌ kebab-case-converter/
├── ❌ lowercase/
├── ❌ md5-hash/
├── ❌ mirror-text/
├── ❌ morse-code/
├── ❌ nato-phonetic/
├── ❌ number-sorter/
├── ❌ online-notepad/
├── ❌ password-generator/
├── ❌ phonetic-spelling/
├── ❌ pig-latin/
├── ❌ plain-text/
├── ❌ png-to-jpg/
├── ❌ png-to-webp/
├── ❌ random-choice/
├── ❌ random-date/
├── ❌ random-ip/
├── ❌ random-letter/
├── ❌ random-month/
├── ❌ random-number/
├── ✅ reading-time-estimator/ (COMPLETE)
├── ❌ remove-line-breaks/
├── ❌ remove-punctuation/
├── ❌ remove-text-formatting/
├── ❌ repeat-text/
├── ❌ roman-numeral-date/
├── ❌ rot13/
├── ❌ sentence-case/
├── ❌ sentence-counter/
├── ❌ sha1-hash-generator/
├── ❌ slugify-url/
├── ❌ snake-case-converter/
├── ❌ sort-words/
├── ❌ subscript-text/
├── ❌ text-counter/
├── ❌ text-replace/
├── ❌ title-case/
├── ❌ uppercase/
├── ❌ url-converter/
├── ❌ utf8-converter/
├── ❌ utm-builder/
├── ❌ uuid-generator/
├── ❌ webp-to-jpg/
├── ❌ webp-to-png/
└── ❌ word-frequency/
```

**Pattern for each:** Each tool needs a `page.tsx` file following this structure:
```typescript
import { Layout } from '@/components/layout/Layout';
import { ToolComponent } from '@/components/tools/ToolComponent';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'tool-slug',
  path: '/de/tools/tool-slug'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'de',
    pathname: toolConfig.path
  });
}

export default function ToolPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ToolComponent />
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

---

### 2. TOOL METADATA - `src/lib/metadata/toolMetadata.ts`

**Status:** 8 of 90 entries (8.9%)

| Status | Count | Type | Details |
|--------|-------|------|---------|
| ✅ Completed | 8 | Mixed | home, tools, not-found, about-us, contact-us, privacy-policy, terms-of-service, reading-time-estimator |
| ❌ Missing | 82 | Tools | All other individual tools |

#### What's Missing:
Each tool entry in `toolMetadata.ts` needs a `de:` block added to its `i18n` property:

```typescript
{
  slug: 'tool-name',
  pathname: '/tools/tool-name',
  type: 'tool',
  category: 'category-name',
  i18n: {
    en: { title, description, shortDescription },
    ru: { title, description, shortDescription },
    de: { /* ADD THIS */ }
  },
  schema: createAdvancedSchema(...),
  relatedTools: [...]
}
```

**Required Fields per Tool:**
- `title` (string, max 60 chars) - German page title
- `description` (string, max 160 chars) - German meta description
- `shortDescription` (string, max 120 chars) - German short description

**Estimated Work:** 82 tools × 3 fields = **246 German strings**

---

### 3. SEO CONTENT - `src/locales/tools/seo-content/*.json`

**Status:** 9 of 83 files (10.8%)

| Status | Count | Type | Details |
|--------|-------|------|---------|
| ✅ Completed | 8 | Category | All 8 category SEO files |
| ✅ Completed | 1 | Tool | reading-time-estimator.json |
| ❌ Missing | 74 | Tools | All other individual tools |

#### Completed Files (9):
1. ✅ `analysis-counter-tools.json` (category)
2. ✅ `code-data-translation.json` (category)
3. ✅ `convert-case-tools.json` (category)
4. ✅ `image-tools.json` (category)
5. ✅ `misc-tools.json` (category)
6. ✅ `random-generators.json` (category)
7. ✅ `social-media-text-generators.json` (category)
8. ✅ `text-modification-formatting.json` (category)
9. ✅ `reading-time-estimator.json` (tool) ⭐ ONLY TOOL COMPLETE

#### Missing German SEO Content (74 files):
```
❌ add-line-numbers-to-text.json
❌ add-prefix-and-suffix-to-lines.json
❌ alternating-case.json
❌ ascii-art-generator.json
❌ base64-encoder-decoder.json
❌ big-text.json
❌ binary-code-translator.json
❌ bold-text.json
❌ bubble-text.json
❌ caesar-cipher.json
❌ camel-case-converter.json
❌ csv-to-json.json
❌ cursed-text.json
❌ discord-font.json
❌ duplicate-line-remover.json
❌ extract-emails-from-pdf.json
❌ extract-emails-from-text.json
❌ extract-numbers.json
❌ facebook-font.json
❌ hex-to-text.json
❌ image-cropper.json
❌ image-resizer.json
❌ image-to-text.json
❌ instagram-fonts.json
❌ invisible-text.json
❌ italic-text.json
❌ jpg-to-png.json
❌ jpg-to-webp.json
❌ json-formatter.json
❌ json-stringify.json
❌ kebab-case-converter.json
❌ lowercase.json
❌ md5-hash.json
❌ mirror-text.json
❌ morse-code.json
❌ nato-phonetic.json
❌ number-sorter.json
❌ online-notepad.json
❌ password-generator.json
❌ phonetic-spelling.json
❌ pig-latin.json
❌ plain-text.json
❌ png-to-jpg.json
❌ png-to-webp.json
❌ random-choice.json
❌ random-date.json
❌ random-ip.json
❌ random-letter.json
❌ random-month.json
❌ random-number.json
❌ remove-line-breaks.json
❌ remove-punctuation.json
❌ remove-text-formatting.json
❌ repeat-text.json
❌ roman-numeral-date.json
❌ rot13.json
❌ sentence-case.json
❌ sentence-counter.json
❌ sha1-hash-generator.json
❌ slugify-url.json
❌ snake-case-converter.json
❌ sort-words.json
❌ subscript-text.json
❌ text-counter.json
❌ text-replace.json
❌ title-case.json
❌ uppercase.json
❌ url-converter.json
❌ utf8-converter.json
❌ utm-builder.json
❌ uuid-generator.json
❌ webp-to-jpg.json
❌ webp-to-png.json
❌ word-frequency.json
```

**Structure Required:** Each file needs a complete `"de": { }` section with:
- `title` - Page title
- `metaDescription` - Meta description
- `sections.intro` - Introduction (title + content)
- `sections.features` - Features list (typically 4-6 items)
- `sections.useCases` - Use cases (typically 4-6 items)
- `sections.howToUse` - How to use steps (typically 3 steps)
- `sections.examples` - Examples (typically 3-4 examples)
- `sections.benefits` - Benefits (title + content + bullet list)
- `sections.faqs` - FAQs (typically 4-5 Q&A pairs)
- `sections.relatedTools` - Related tools (typically 3-4 tools)

**Estimated Work:** 74 files × ~80-100 lines each = **5,920 - 7,400 lines of German SEO content**

---

### 4. COMPONENT TRANSLATIONS - `src/locales/tools/*.json`

**Status:** 3 of 10 files (30%)

| File | Lines | Status | Tools Using It |
|------|-------|--------|----------------|
| ✅ `case-converters.json` | 157 | HAS DE | Main converter component (index page) |
| ❌ `code-data.json` | 1,607 | MISSING DE | Base64, UUID, JSON tools, etc. |
| ❌ `image-tools.json` | 1,466 | MISSING DE | Image cropper, resizer, converters, OCR |
| ❌ `miscellaneous.json` | 1,414 | MISSING DE | Password gen, notepad, UTM builder |
| ✅ `misc-tools.json` | 271 | HAS DE | Reading time estimator, number sorter |
| ✅ `other-tools.json` | 322 | HAS DE | Tool listing on index page |
| ❌ `pdf-tools.json` | 89 | MISSING DE | PDF email extractor |
| ❌ `random-generators.json` | 625 | MISSING DE | Random number, date, IP, choice, etc. |
| ❌ `text-generators.json` | 1,035 | MISSING DE | ASCII art, social media fonts, text styles |
| ❌ `text-modifiers.json` | 719 | MISSING DE | Text counter, replace, line ops, case tools |

**Missing Files (7):** Each needs complete German translation block

#### Breakdown by File:

**1. `code-data.json` (MISSING DE)**
- **Tools affected:** 
  - base64-encoder-decoder
  - csv-to-json
  - hex-to-text
  - json-formatter
  - json-stringify
  - uuid-generator
- **Estimated:** ~200-250 German keys needed

**2. `image-tools.json` (MISSING DE)**
- **Tools affected:**
  - image-cropper
  - image-resizer
  - image-to-text
  - jpg-to-png
  - jpg-to-webp
  - png-to-jpg
  - png-to-webp
  - webp-to-jpg
  - webp-to-png
- **Estimated:** ~180-220 German keys needed

**3. `miscellaneous.json` (MISSING DE)**
- **Tools affected:**
  - online-notepad
  - password-generator
  - utm-builder
- **Estimated:** ~150-180 German keys needed

**4. `pdf-tools.json` (MISSING DE)**
- **Tools affected:**
  - extract-emails-from-pdf
- **Estimated:** ~15-20 German keys needed

**5. `random-generators.json` (MISSING DE)**
- **Tools affected:**
  - random-choice
  - random-date
  - random-ip
  - random-letter
  - random-month
  - random-number
- **Estimated:** ~80-100 German keys needed

**6. `text-generators.json` (MISSING DE)**
- **Tools affected:**
  - ascii-art-generator
  - big-text
  - bold-text
  - bubble-text
  - cursed-text
  - discord-font
  - facebook-font
  - instagram-fonts
  - invisible-text
  - italic-text
  - mirror-text
  - plain-text
  - subscript-text
- **Estimated:** ~130-160 German keys needed

**7. `text-modifiers.json` (MISSING DE)**
- **Tools affected:**
  - add-line-numbers-to-text
  - add-prefix-and-suffix-to-lines
  - duplicate-line-remover
  - extract-emails-from-text
  - extract-numbers
  - remove-line-breaks
  - remove-punctuation
  - remove-text-formatting
  - repeat-text
  - sort-words
  - text-counter
  - text-replace
  - alternating-case
  - camel-case-converter
  - kebab-case-converter
  - lowercase
  - sentence-case
  - snake-case-converter
  - title-case
  - uppercase
- **Estimated:** ~220-280 German keys needed

**Total Estimated Component Translation Keys:** ~975-1,210 German strings

---

### 5. SPECIALIZED TOOL TRANSLATIONS

Some tools have additional translation requirements beyond the standard structure:

#### Tools with Complex UI States:
- **ASCII Art Generator** - Font selection, alignment options
- **Image Tools** - Cropping presets, dimension controls, quality settings
- **Password Generator** - Strength indicators, character set options
- **Online Notepad** - Save/load dialogs, keyboard shortcuts
- **CSV to JSON** - Delimiter options, formatting settings
- **JSON Formatter** - Indentation levels, sort options

#### Tools with Hardcoded Presets:
- **Random Generators** - Month names, day names (may be localized via i18n already)
- **Case Converters** - Examples text (already localized)
- **Text Styles** - Font preview text

---

## 📋 IMPLEMENTATION ROADMAP

### PHASE 1: Foundation Setup (IF SCALING APPROACH)
**Goal:** Create automation/templates for mass implementation

**Option A: Manual Tool-by-Tool** (Recommended for quality)
- Pros: High translation quality, context-aware
- Cons: Time-intensive (75 tools)
- Timeline: ~2-3 tools per hour = 25-38 hours

**Option B: Batch Template Approach** (Faster but lower quality)
- Pros: Can complete quickly with scripts
- Cons: May produce generic translations, requires review
- Timeline: Could complete in 5-10 hours with post-review

---

### PHASE 2: Component Translations (Priority 1)
**Why First:** These affect tool functionality across the board

**Recommended Order:**
1. ✅ **DONE:** `case-converters.json`
2. ✅ **DONE:** `misc-tools.json`
3. ✅ **DONE:** `other-tools.json`
4. ❌ **TODO:** `text-modifiers.json` (affects 20 tools)
5. ❌ **TODO:** `text-generators.json` (affects 13 tools)
6. ❌ **TODO:** `code-data.json` (affects 6 tools)
7. ❌ **TODO:** `image-tools.json` (affects 9 tools)
8. ❌ **TODO:** `random-generators.json` (affects 6 tools)
9. ❌ **TODO:** `miscellaneous.json` (affects 3 tools)
10. ❌ **TODO:** `pdf-tools.json` (affects 1 tool)

**Estimated Time:** 
- Manual translation: ~10-15 hours
- With AI assistance: ~5-8 hours
- With batch scripting + review: ~3-5 hours

---

### PHASE 3: High-Priority Tools (Priority 2)
**Selection Criteria:** Most commonly used tools

**Recommended Tool Priority List (Top 20):**
1. ❌ text-counter
2. ❌ json-formatter
3. ❌ password-generator
4. ❌ base64-encoder-decoder
5. ❌ uuid-generator
6. ❌ md5-hash
7. ❌ sha1-hash-generator
8. ❌ url-converter
9. ❌ uppercase
10. ❌ lowercase
11. ❌ title-case
12. ❌ sentence-case
13. ❌ camel-case-converter
14. ❌ snake-case-converter
15. ❌ kebab-case-converter
16. ❌ random-number
17. ❌ random-password (via password-generator)
18. ❌ word-frequency
19. ❌ csv-to-json
20. ❌ online-notepad

**Per Tool Requirements:**
- Add German metadata block (3 fields)
- Add German SEO content (~80-100 lines)
- Create `/de/tools/{tool-slug}/page.tsx` file

**Estimated Time per Tool:** 20-30 minutes
**Total for Top 20:** 6-10 hours

---

### PHASE 4: Remaining Tools (Priority 3)
**Remaining:** 55 tools after top 20

**Batch Processing Approach:**
1. Group by category/similarity
2. Use templates from Phase 3
3. Bulk generate metadata
4. Bulk generate SEO content
5. Bulk generate page files
6. Review and adjust for quality

**Categories:**
- **Text Style Tools** (11): bold, italic, bubble, mirror, cursed, etc.
- **Case Converters** (remaining 3): alternating-case, etc.
- **Image Converters** (9): jpg-to-png, png-to-webp, etc.
- **Random Generators** (remaining 5): random-date, random-choice, etc.
- **Text Operations** (12): remove-line-breaks, duplicate-line-remover, etc.
- **Encoding/Decoding** (8): hex-to-text, binary-code-translator, etc.
- **Specialized** (7): phonetic-spelling, pig-latin, nato-phonetic, etc.

**Estimated Time:** 15-20 hours with batching + review

---

### PHASE 5: Quality Assurance (Priority 4)

**Testing Checklist per Tool:**
- [ ] German page loads at `/de/tools/{tool-slug}`
- [ ] No translation keys showing (all text in German)
- [ ] Tool functionality works correctly
- [ ] SEO content renders properly
- [ ] Related tools links use `/de/tools/` prefix
- [ ] Metadata correct in browser tab
- [ ] No TypeScript errors
- [ ] Build succeeds

**Bulk Testing:**
- Run build: `npm run build`
- Check for 206 → 281 pages (75 new German tool pages)
- Verify sitemap includes all `/de/tools/` URLs
- Test language switching from each page
- Check mobile navigation

**Estimated Time:** 8-12 hours

---

## 📊 EFFORT ESTIMATION

### Summary by Phase

| Phase | Component | Status | Estimated Time |
|-------|-----------|--------|----------------|
| ✅ Phase 0 | Shared/Layout | COMPLETE | 0 hours |
| ✅ Phase 0 | Static Pages | COMPLETE | 0 hours |
| ✅ Phase 0 | Category Pages | COMPLETE | 0 hours |
| ✅ Phase 0 | 1 Tool (reading-time) | COMPLETE | 0 hours |
| ❌ Phase 2 | Component Translations (7 files) | TODO | 5-8 hours |
| ❌ Phase 3 | High-Priority Tools (20) | TODO | 6-10 hours |
| ❌ Phase 4 | Remaining Tools (55) | TODO | 15-20 hours |
| ❌ Phase 5 | QA & Testing | TODO | 8-12 hours |

**Total Remaining Work:** 34-50 hours

### Parallel Processing Opportunities

If multiple team members / AI agents work simultaneously:
- **Team of 2:** 17-25 hours
- **Team of 3:** 11-17 hours
- **Team of 5:** 7-10 hours

---

## 🎯 RECOMMENDED IMPLEMENTATION STRATEGY

### Option 1: FULL AUTOMATION (Fastest, Needs Review)
1. Create translation generation script
2. Batch generate all metadata (1 hour)
3. Batch generate all SEO content using templates (2 hours)
4. Batch create all page files (30 min)
5. Batch add component translations (2 hours)
6. Review and fix issues (10-15 hours)
7. QA testing (8-12 hours)

**Total Time:** 23-32 hours
**Risk:** May produce generic/incorrect translations

### Option 2: SEMI-AUTOMATED (Balanced)
1. Manually complete component translations (5-8 hours)
2. Create templates from first 5 tools manually (2 hours)
3. Semi-automate remaining 70 tools with review (12-15 hours)
4. QA testing (8-12 hours)

**Total Time:** 27-37 hours
**Risk:** Moderate - good balance of speed and quality

### Option 3: FULLY MANUAL (Highest Quality)
1. Complete component translations (10-15 hours)
2. Do top 20 tools one by one (6-10 hours)
3. Do remaining 55 tools in batches (18-24 hours)
4. QA testing (8-12 hours)

**Total Time:** 42-61 hours
**Risk:** Low - highest translation quality

---

## 🚨 CRITICAL NOTES

### Translation Quality Requirements
- **Natural German phrasing** - not literal word-by-word translation
- **Technical accuracy** - preserve meaning of technical terms
- **Formal "Sie" form** - professional tone throughout
- **Proper German capitalization** - all nouns capitalized
- **Consistent terminology** - same terms across all tools

### Common Pitfalls to Avoid
1. **Hardcoded English strings** - All text must come from translation files
2. **Missing `/de/` prefixes** - All internal links must include locale
3. **Incorrect href in related tools** - Must use `/de/tools/` not `/tools/`
4. **Mixed locales in components** - Components must detect and respect current locale
5. **Incomplete SEO sections** - Each tool needs ALL 10 sections
6. **Missing metadata fields** - All 3 fields required (title, description, shortDescription)

### Build Verification
After completion, verify:
- Build generates exactly 281 pages (206 current + 75 new German tools)
- No TypeScript errors
- No ESLint errors (except pre-existing warnings)
- All `/de/tools/` URLs work
- Sitemap includes all German tool URLs
- No 404s when navigating between pages

---

## 📁 FILE REFERENCE SUMMARY

### Files That Need Updates (81 locations)

**1. Tool Page Files** (75 new files)
- Location: `/workspace/src/app/de/tools/{tool-slug}/page.tsx`
- Action: Create from template

**2. Tool Metadata** (82 additions)
- Location: `/workspace/src/lib/metadata/toolMetadata.ts`
- Action: Add `de:` block to each tool's `i18n` property

**3. SEO Content** (74 new sections)
- Location: `/workspace/src/locales/tools/seo-content/{tool-slug}.json`
- Action: Add `"de": { ... }` section to each file

**4. Component Translations** (7 new sections)
- Location: `/workspace/src/locales/tools/{file}.json`
- Files: code-data, image-tools, miscellaneous, pdf-tools, random-generators, text-generators, text-modifiers
- Action: Add `"de": { ... }` section to each file

### Files Already Complete (8)
✅ `/workspace/src/lib/metadata/toolMetadata.ts` - 8 non-tool entries
✅ `/workspace/src/locales/shared/common.json`
✅ `/workspace/src/locales/shared/navigation.json`
✅ `/workspace/src/locales/legal.json`
✅ `/workspace/src/locales/pages/changelog.json`
✅ `/workspace/src/locales/tools/case-converters.json`
✅ `/workspace/src/locales/tools/misc-tools.json`
✅ `/workspace/src/locales/tools/other-tools.json`
✅ All 8 category SEO content files
✅ `reading-time-estimator.json` SEO content
✅ All DE static page files
✅ All DE category page files

---

## 🎬 NEXT STEPS

### Immediate Actions (Choose One Approach)

**If Going Tool-by-Tool:**
1. Pick next tool from high-priority list (suggest: `text-counter`)
2. Add metadata to `toolMetadata.ts`
3. Add SEO content to corresponding JSON
4. Ensure component translations exist in relevant `tools/*.json`
5. Create `/de/tools/{slug}/page.tsx` file
6. Test and verify

**If Going Batch Approach:**
1. Complete all 7 component translation files first
2. Create automation script for page generation
3. Generate all metadata blocks at once
4. Generate all SEO content with template
5. Create all page files with template
6. Run bulk QA process

---

## 📈 PROGRESS TRACKING

**Current Status:**
```
German Translation Progress: [██░░░░░░░░░░░░░░░░░░] 10%

Completed: 9/90
Remaining: 81/90
```

**Completion Criteria:**
- [ ] All 75 tool pages created in `/de/tools/`
- [ ] All 82 tool metadata entries have German
- [ ] All 74 SEO content files have German sections
- [ ] All 7 component translation files have German
- [ ] Build generates 281 pages successfully
- [ ] All German tool pages display without errors
- [ ] QA testing complete with no critical issues

---

**END OF REPORT**

*This report was generated through comprehensive code analysis without making any modifications. All information is factual based on current file states as of 2025-11-07.*
