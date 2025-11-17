# 🇩🇪 GERMAN TRANSLATION - QA GUIDE & CHEAT SHEET

**Version:** 1.0  
**Last Updated:** 2025-11-07  
**Purpose:** Step-by-step checklist and structure reference for implementing German translations

---

## 📋 PRE-IMPLEMENTATION CHECKLIST

Before starting work on ANY tool, verify:

- [ ] I have checked the roadmap for the next tool
- [ ] I have identified the correct category
- [ ] I have identified which component translation file(s) the tool uses
- [ ] I have reviewed this QA guide
- [ ] I have asked the user for approval

---

## 🎯 IMPLEMENTATION CHECKLIST (Per Tool)

### ✅ STEP 1: Add Metadata to `toolMetadata.ts`

**File Location:** `/workspace/src/lib/metadata/toolMetadata.ts`

**Find:** The tool's entry by searching for `slug: '{tool-name}'`

**Add:** A `de:` block inside the `i18n` property

**Structure:**
```typescript
i18n: {
  en: {
    title: 'English Title',
    description: 'English description...',
    shortDescription: 'English short...',
  },
  ru: {
    title: 'Russian Title',
    description: 'Russian description...',
    shortDescription: 'Russian short...',
  },
  de: {  // ← ADD THIS
    title: 'German Title (max 60 chars)',
    description: 'German description (max 160 chars)',
    shortDescription: 'German short description (max 120 chars)',
  },
},
```

**Quality Requirements:**
- ✅ `title` length: 10-60 characters
- ✅ `description` length: 50-160 characters
- ✅ `shortDescription` length: 20-120 characters
- ✅ Use formal "Sie" form (professional tone)
- ✅ Capitalize all nouns (German grammar rule)
- ✅ Natural phrasing (not literal word-for-word)
- ✅ Include key features/benefits in description

**Verification:**
```bash
# Count characters (should not exceed limits)
echo "Your German title" | wc -m
```

---

### ✅ STEP 2: Add SEO Content

**File Location:** `/workspace/src/locales/tools/seo-content/{tool-slug}.json`

**Add:** A complete `"de": { }` section after the `"ru"` section

**Required Structure (10 sections):**

```json
{
  "en": { ... },
  "ru": { ... },
  "de": {
    "title": "German Page Title",
    "metaDescription": "German meta description for search engines",
    "sections": {
      "intro": {
        "title": "German Intro Title",
        "content": "German intro paragraph explaining what this tool does..."
      },
      "features": {
        "title": "Key Features Title",
        "items": [
          { 
            "title": "Feature 1 Title", 
            "description": "Feature 1 description..." 
          },
          { 
            "title": "Feature 2 Title", 
            "description": "Feature 2 description..." 
          }
          // Typically 4-6 features
        ]
      },
      "useCases": {
        "title": "Use Cases Title",
        "description": "Brief description of use cases...",
        "items": [
          { 
            "title": "Use Case 1 Title", 
            "description": "Use case 1 description..." 
          }
          // Typically 4-6 use cases
        ]
      },
      "howToUse": {
        "title": "How to Use Title",
        "description": "Brief description...",
        "steps": [
          { 
            "step": 1, 
            "title": "Step 1 Title", 
            "description": "Step 1 instructions..." 
          },
          { 
            "step": 2, 
            "title": "Step 2 Title", 
            "description": "Step 2 instructions..." 
          }
          // Typically 3-4 steps
        ]
      },
      "examples": {
        "title": "Examples Title",
        "description": "Brief description...",
        "items": [
          { 
            "title": "Example 1 Title", 
            "input": "Example input...", 
            "output": "Example output..." 
          }
          // Typically 3-4 examples
        ]
      },
      "benefits": {
        "title": "Benefits Title",
        "content": "Brief overview of benefits...",
        "items": [
          "Benefit point 1",
          "Benefit point 2",
          "Benefit point 3"
          // Typically 7-9 bullet points
        ]
      },
      "faqs": [
        { 
          "question": "German question?", 
          "answer": "German answer..." 
        }
        // Typically 4-5 FAQ pairs
      ],
      "relatedTools": {
        "title": "Related Tools Title",
        "description": "Brief description...",
        "items": [
          { 
            "name": "Tool Name", 
            "description": "Tool description...", 
            "href": "/de/tools/tool-slug"  // ← CRITICAL: Must use /de/ prefix!
          }
          // Typically 3-4 related tools
        ]
      }
    }
  }
}
```

**Critical Rules:**
- ✅ ALL related tool `href` values MUST use `/de/tools/` prefix
- ✅ Match the exact JSON structure of EN/RU sections
- ✅ Same number of items (features, use cases, steps, etc.)
- ✅ Proper JSON syntax (commas, quotes, brackets)
- ✅ No trailing commas before closing braces

**Common Mistakes to Avoid:**
- ❌ Using `/tools/` instead of `/de/tools/` in hrefs
- ❌ Different number of items than EN/RU sections
- ❌ Missing required sections
- ❌ Incorrect JSON structure (missing/extra commas)
- ❌ Literal translations instead of natural German

---

### ✅ STEP 3: Add/Verify Component Translations

**File Location:** `/workspace/src/locales/tools/{component-file}.json`

**Which file to update?** Check the tool's component:

| Category | Component Translation File |
|----------|---------------------------|
| `text-modification` | `text-modifiers.json` OR `text-generators.json` |
| `text-transform` | `case-converters.json` |
| `text-analysis` | `text-modifiers.json` |
| `code-data-tools` | `code-data.json` |
| `image-tool` | `image-tools.json` |
| `random-generator` | `random-generators.json` |
| `security-tool` | `random-generators.json` OR `miscellaneous.json` |
| `social-media` | `text-generators.json` |
| `miscellaneous-utility` | `miscellaneous.json` OR `misc-tools.json` |
| `miscellaneous-tool` | `miscellaneous.json` OR `pdf-tools.json` |

**How to verify which file:** Open the tool component file (`/workspace/src/components/tools/{ToolName}.tsx`) and look for:
```typescript
const { tool } = useToolTranslations('tools/{FILENAME}');
```

**Action Required:**
1. Check if the file already has a `"de": { }` section
2. If **YES**: Verify all keys for this specific tool are translated
3. If **NO**: Add complete `"de": { }` section with all tool translations

**Structure:**
```json
{
  "en": {
    "toolName": {
      "title": "Tool Title",
      "description": "Tool description",
      // ... all other keys
    }
  },
  "ru": {
    "toolName": {
      "title": "Russian Title",
      // ... all other keys
    }
  },
  "de": {  // ← ADD/VERIFY THIS
    "toolName": {
      "title": "German Title",
      "description": "German description",
      // ... ALL keys must match EN/RU structure
    }
  }
}
```

**Critical Rules:**
- ✅ ALL keys from EN section must exist in DE section
- ✅ Key names must match EXACTLY (case-sensitive)
- ✅ Nested structure must match EXACTLY
- ✅ No extra or missing keys

---

### ✅ STEP 4: Create German Page File

**File Location:** `/workspace/src/app/de/tools/{tool-slug}/page.tsx`

**Directory Creation:**
```bash
mkdir -p /workspace/src/app/de/tools/{tool-slug}
```

**File Template:**
```typescript
import { Layout } from '@/components/layout/Layout';
import { ToolComponent } from '@/components/tools/ToolComponent';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: '{tool-slug}',
  path: '/de/tools/{tool-slug}'
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

**Important:**
- ✅ Replace `{tool-slug}` with actual tool slug (e.g., `text-counter`)
- ✅ Replace `ToolComponent` with actual component name (e.g., `TextCounter`)
- ✅ Import path must match exactly: `@/components/tools/{ComponentName}`
- ✅ Locale MUST be `'de'`
- ✅ Path MUST start with `/de/tools/`

---

### ✅ STEP 5: Run Checks

**Command Sequence:**
```bash
# 1. TypeScript Check
cd /workspace && npx tsc --noEmit

# 2. ESLint Check
cd /workspace && npm run lint

# 3. Build Check
cd /workspace && npm run build
```

**Expected Results:**
- ✅ TypeScript: No errors (warnings are OK if pre-existing)
- ✅ ESLint: No new errors (pre-existing warnings OK)
- ✅ Build: Success with page count increased by 1

**What to check in build output:**
```bash
# Look for this line:
✓ Generating static pages (XXX/XXX)

# Page count should increase by 1
# Example: If was 206, should now be 207
```

**If Errors Occur:**
1. Read error message carefully
2. Check file paths are correct
3. Verify JSON syntax (no trailing commas)
4. Verify all imports are correct
5. Check component name matches
6. Fix and re-run checks

---

## 🔍 VERIFICATION CHECKLIST

After completing all 5 steps, verify:

- [ ] Metadata added to `toolMetadata.ts` with all 3 fields
- [ ] SEO content file has complete `de` section with all 10 parts
- [ ] Component translation file has German block (if needed)
- [ ] Page file created in `/de/tools/{slug}/page.tsx`
- [ ] TypeScript check passes (no errors)
- [ ] ESLint check passes (no new errors)
- [ ] Build succeeds and page count increased
- [ ] Roadmap updated (checked off this tool ONLY)

---

## 🌐 GERMAN TRANSLATION QUALITY STANDARDS

### Language Rules
- ✅ Use formal "Sie" form (not "du")
- ✅ Capitalize ALL nouns (German grammar)
- ✅ Use compound nouns correctly (e.g., "Textanalysewerkzeug")
- ✅ Proper umlauts: ä, ö, ü, ß

### Technical Terms to Use
| English | German |
|---------|--------|
| Tool | Werkzeug |
| Text | Text |
| Character | Zeichen |
| Word | Wort |
| Line | Zeile |
| Paragraph | Absatz |
| Counter | Zähler |
| Generator | Generator |
| Converter | Konverter |
| Analyzer | Analysator |
| Upload | Hochladen |
| Download | Herunterladen |
| Copy | Kopieren |
| Clear | Löschen |
| Privacy | Datenschutz |
| Free | Kostenlos |
| Online | Online |
| Instant | Sofort |
| Quick | Schnell |

### Phrasing Guidelines
- ✅ Natural conversational German
- ✅ Active voice preferred
- ✅ Clear and concise
- ✅ Professional but friendly tone
- ✅ Avoid literal word-for-word translations
- ✅ Use German sentence structure

### Examples of Good vs Bad Translation

**BAD (Literal):**
> "This tool helps you to count the words in your text quickly."
> → "Dieses Werkzeug hilft dir, die Wörter in deinem Text schnell zu zählen."

**GOOD (Natural):**
> "This tool helps you count words in your text quickly."
> → "Zählen Sie Wörter in Ihrem Text schnell und einfach."

---

## 🚨 COMMON PITFALLS & HOW TO AVOID

### 1. Hardcoded /tools/ URLs
**Problem:** Related tool links missing `/de/` prefix  
**Solution:** Always use `/de/tools/{slug}` in SEO content

### 2. Mismatched JSON Structure
**Problem:** Different number of features/items than EN/RU  
**Solution:** Count items in EN section, match exactly in DE

### 3. Missing Component Translations
**Problem:** Forgot to check if component file needs German  
**Solution:** Always check component's `useToolTranslations()` call

### 4. Trailing Commas in JSON
**Problem:** Extra comma before closing brace causes parse error  
**Solution:** Use JSON validator or careful manual check

### 5. Wrong Component Import
**Problem:** Tool component name doesn't match import  
**Solution:** Check exact component name in `/components/tools/`

### 6. Informal Language
**Problem:** Using "du" instead of "Sie"  
**Solution:** Always use formal "Sie" throughout

### 7. Character Limit Exceeded
**Problem:** Metadata fields too long  
**Solution:** Check character counts before committing

### 8. Literal Translation
**Problem:** Word-for-word translation sounds unnatural  
**Solution:** Translate meaning/intent, not individual words

---

## 📝 QUICK REFERENCE: File Paths

```
Metadata:
  /workspace/src/lib/metadata/toolMetadata.ts

SEO Content:
  /workspace/src/locales/tools/seo-content/{tool-slug}.json

Component Translations:
  /workspace/src/locales/tools/case-converters.json
  /workspace/src/locales/tools/code-data.json
  /workspace/src/locales/tools/image-tools.json
  /workspace/src/locales/tools/miscellaneous.json
  /workspace/src/locales/tools/misc-tools.json
  /workspace/src/locales/tools/random-generators.json
  /workspace/src/locales/tools/text-generators.json
  /workspace/src/locales/tools/text-modifiers.json
  /workspace/src/locales/tools/pdf-tools.json

Tool Components:
  /workspace/src/components/tools/{ToolName}.tsx

Page Files:
  /workspace/src/app/de/tools/{tool-slug}/page.tsx
```

---

## ✅ FINAL PRE-SUBMISSION CHECKLIST

Before reporting completion to user:

- [ ] All 5 implementation steps completed
- [ ] All checks passed (types, lint, build)
- [ ] No hardcoded English text visible
- [ ] All URLs use `/de/` prefix correctly
- [ ] German translations are natural and professional
- [ ] JSON structure matches EN/RU exactly
- [ ] Roadmap file updated for THIS TOOL ONLY
- [ ] Ready to ask for next tool

---

**Remember:** Quality over speed. Better to take time and do it right than rush and create errors!

---

**END OF QA GUIDE**
