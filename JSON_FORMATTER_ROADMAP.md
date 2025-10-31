# JSON Formatter & Validator - Development Roadmap

## Executive Summary
This document provides a comprehensive pre-development analysis and implementation roadmap for the new `/tools/json-formatter` tool page. This is a **significantly more complex** tool requiring proper code editor components, advanced validation, and state management.

---

## Part A: Component Recommendation & Technical Architecture

### 1. **Recommended JSON Editor/Viewer Components**

After analyzing the requirements and existing codebase, I recommend a **dual-component approach**:

#### **Primary Recommendation: CodeMirror 6 + react-json-view**

**For Input/Output Panels: `@uiw/react-codemirror` (CodeMirror 6 wrapper)**
- **Why CodeMirror 6:**
  - ✅ Modern, lightweight (~200KB gzipped vs Monaco's ~3MB)
  - ✅ Excellent JSON syntax highlighting with `@codemirror/lang-json`
  - ✅ Built-in linting/validation with line/column errors
  - ✅ Handles large files efficiently (5-10MB)
  - ✅ Mobile-responsive
  - ✅ Customizable themes (light/dark mode support)
  - ✅ Search functionality built-in
  - ✅ Active maintenance and React 19 compatible
  - ✅ NPM: `npm install @uiw/react-codemirror @codemirror/lang-json`

**For Tree View Toggle: `react-json-view-lite`**
- **Why react-json-view-lite:**
  - ✅ Lightweight collapsible/expandable JSON tree
  - ✅ Path breadcrumbs support
  - ✅ Copy-to-clipboard for nodes
  - ✅ Search within tree
  - ✅ Better performance than `react-json-view` (legacy)
  - ✅ NPM: `npm install react-json-view-lite`

**Alternative (Not Recommended):**
- **Monaco Editor**: Too heavy (3MB+), overkill for this use case
- **react-json-view (legacy)**: Deprecated, performance issues with large files

### 2. **Component Architecture**

```
JsonFormatterTool (Main Container)
├── JsonEditorPanel (Input - CodeMirror)
│   ├── Syntax highlighting
│   ├── Validation errors display
│   ├── File drop zone
│   └── Line/column indicators
├── JsonEditorPanel (Output - CodeMirror)
│   ├── Formatted output
│   ├── Toggle: Code View / Tree View
│   ├── Search functionality
│   └── Path breadcrumbs (tree mode)
├── ToolOptionsBar (Controls)
│   ├── Format & Validate CTA
│   ├── Minify button
│   ├── Copy/Download buttons
│   └── Helper text
└── JsonFormatterOptions (Accordion)
    ├── Indent size selector
    ├── Checkboxes (unescape, NDJSON, sort keys)
    └── State persistence logic
```

---

## Part B: Category Confirmation

### **Category: "Code & Data Translation" ✅ CONFIRMED**

**Status:** This category already exists at `/category/code-data-translation/`

**Current Tools in Category (11 tools):**
1. Base64 Encoder/Decoder
2. Binary Code Translator
3. Hex to Text Converter
4. Morse Code Translator
5. Caesar Cipher Encoder
6. ROT13 Encoder/Decoder
7. CSV to JSON Converter
8. JSON Stringify Tool (existing)
9. UTF-8 Converter
10. URL Encoder/Decoder
11. URL Slug Generator

**After Implementation:** 12 tools (adding JSON Formatter & Validator)

---

## Part C: SEO Content Schema Analysis

### **Current Schema Structure (Analyzed from existing tools)**

The existing SEO content JSON schema supports:
```json
{
  "en": {
    "title": "...",
    "metaDescription": "...",
    "sections": {
      "intro": { "title": "...", "content": "..." },
      "features": { "title": "...", "items": [{ "title": "...", "description": "..." }] },
      "useCases": { "title": "...", "description": "...", "items": [{ "title": "...", "description": "..." }] },
      "howToUse": { "title": "...", "description": "...", "steps": [{ "step": 1, "title": "...", "description": "..." }] },
      "examples": { "title": "...", "description": "...", "items": [{ "title": "...", "input": "...", "output": "..." }] },
      "benefits": { "title": "...", "content": "...", "items": ["...", "..."] },
      "faqs": [{ "question": "...", "answer": "..." }],
      "relatedTools": { "title": "...", "items": [{ "name": "...", "href": "...", "description": "..." }] }
    }
  },
  "ru": { /* same structure */ }
}
```

**✅ Conclusion:** The existing schema **fully supports** all required sections. No schema modifications needed.

**Compatibility:** The new JSON formatter content will use the exact same structure as existing tools.

---

## Part D: 301 Redirect Implementation Strategy

### **Recommended Approach: `next.config.ts` redirects array**

**Why This Approach:**
- ✅ Native Next.js feature
- ✅ Handles 301 (permanent) redirects correctly
- ✅ SEO-friendly (passes link equity)
- ✅ No external dependencies
- ✅ Cached at build time (fast)
- ✅ Easy to maintain

**Required Redirects (9 aliases):**

| Source Path | Destination | Type |
|------------|-------------|------|
| `/tools/json-viewer` | `/tools/json-formatter` | 301 |
| `/tools/json-beautifier` | `/tools/json-formatter` | 301 |
| `/tools/json-prettify` | `/tools/json-formatter` | 301 |
| `/tools/json-validator` | `/tools/json-formatter` | 301 |
| `/tools/online-json-formatter` | `/tools/json-formatter` | 301 |
| `/tools/json-formatter-online` | `/tools/json-formatter` | 301 |
| `/tools/json-formatter-and-viewer` | `/tools/json-formatter` | 301 |
| `/tools/json-formatter-and-validator` | `/tools/json-formatter` | 301 |
| `/ru/tools/json-viewer` (+ 7 more RU variants) | `/ru/tools/json-formatter` | 301 |

**Implementation Location:** Add `async redirects()` function to `next.config.ts`

---

## Part E: URL State Persistence Strategy

### **Query Parameter Mapping**

| UI Option | Query Param | Values | Default |
|-----------|-------------|--------|---------|
| Indent Size | `indent` | `2`, `4`, `8`, `custom` | `2` |
| Custom Indent Value | `customIndent` | `1-16` | - |
| Unescape Strings | `unescape` | `1`, `0` | `0` |
| NDJSON Mode | `ndjson` | `1`, `0` | `0` |
| Sort Keys | `sort` | `1`, `0` | `0` |
| View Mode | `view` | `code`, `tree` | `code` |

**Example Shareable URL:**
```
/tools/json-formatter?indent=4&sort=1&unescape=1&view=tree
```

**Implementation:**
- Use Next.js `useSearchParams()` and `useRouter()`
- Update URL on option change (debounced)
- Read params on mount to restore state
- Preserve params when switching locales

---

## Part F: New Files to Create

### **Core Tool Components**
1. **`/src/components/tools/JsonFormatterTool.tsx`** (Main container, 400-500 lines)
2. **`/src/components/shared/JsonEditorPanel.tsx`** (CodeMirror wrapper, 200-300 lines)
3. **`/src/components/shared/JsonTreeView.tsx`** (Tree view wrapper, 150-200 lines)
4. **`/src/lib/jsonFormatterUtils.ts`** (Validation, formatting, NDJSON logic, 300-400 lines)

### **Page Files**
5. **`/src/app/tools/json-formatter/page.tsx`** (EN entry point)
6. **`/src/app/ru/tools/json-formatter/page.tsx`** (RU entry point)

### **Translation Files**
7. **`/src/locales/tools/code-data.json`** (UPDATE existing file, add `jsonFormatter` section)
8. **`/src/locales/tools/seo-content/json-formatter.json`** (NEW, comprehensive SEO content)

### **Supporting Files**
9. **`/src/hooks/useJsonFormatter.ts`** (Custom hook for state management, 200-250 lines)
10. **`/src/hooks/useUrlState.ts`** (Generic hook for URL param persistence, 100-150 lines)

---

## Part G: Existing Files to Modify

### **Navigation & Links**
1. **`/src/components/layout/Header.tsx`**
   - Add "JSON Formatter & Validator" to "Code & Data Translation" submenu
   
2. **`/src/components/layout/Footer.tsx`**
   - Add tool link to "Code & Data Translation" section

3. **`/src/locales/shared/navigation.json`**
   - Add EN: `"jsonFormatter": "JSON Formatter & Validator"`
   - Add RU: `"jsonFormatter": "JSON Форматировщик и Валидатор"`

### **Category Pages**
4. **`/src/app/category/code-data-translation/page.tsx`**
   - Add new tool to `codeDataTranslationTools` array (position after `json-stringify`)
   
5. **`/src/app/ru/category/code-data-translation/page.tsx`**
   - Add Russian version

### **All Tools Pages**
6. **`/src/app/tools/page.tsx`**
   - Add tool to "Code & Data Translation" section
   - Update tool count from 11 to 12
   
7. **`/src/app/ru/tools/page.tsx`**
   - Add Russian version

### **Metadata & SEO**
8. **`/src/lib/metadata/toolMetadata.ts`**
   - Add `ToolMetadataConfig` entry for `json-formatter`
   - Add to `TOOL_SLUGS` array
   - Update category count: `code-data-translation: 12` (was 11)

9. **`/src/app/sitemap.ts`**
   - Auto-generated, will include new route after build

### **Configuration**
10. **`/next.config.ts`**
    - Add `async redirects()` function with 16 redirect rules (8 EN + 8 RU)

11. **`/package.json`**
    - Add dependencies:
      - `@uiw/react-codemirror: ^4.23.13`
      - `@codemirror/lang-json: ^6.0.1`
      - `@codemirror/lint: ^6.8.4`
      - `react-json-view-lite: ^1.5.0`

---

## Part H: Implementation Plan (Phase Breakdown)

### **Phase 1: Setup & Dependencies (1 hour)**
- [ ] Install npm packages (`@uiw/react-codemirror`, `@codemirror/lang-json`, `react-json-view-lite`)
- [ ] Create file structure (all new files listed in Part F)
- [ ] Set up basic component scaffolding

### **Phase 2: Core JSON Utils & Validation (2 hours)**
- [ ] Create `/src/lib/jsonFormatterUtils.ts`
  - [ ] JSON parser with line/column error reporting
  - [ ] Formatting logic (indent, minify, sort keys)
  - [ ] NDJSON mode handler
  - [ ] Unescape logic
  - [ ] Large file streaming/preview (5-10MB limit)
- [ ] Write unit tests for utils

### **Phase 3: Editor Components (3 hours)**
- [ ] Create `JsonEditorPanel.tsx` (CodeMirror wrapper)
  - [ ] Syntax highlighting theme
  - [ ] Validation error UI
  - [ ] File drop zone integration
  - [ ] Search functionality
- [ ] Create `JsonTreeView.tsx` (tree view toggle)
  - [ ] Collapsible nodes
  - [ ] Path breadcrumbs
  - [ ] Copy node functionality

### **Phase 4: Main Tool Component (3 hours)**
- [ ] Create `JsonFormatterTool.tsx`
  - [ ] Two-panel layout (input/output)
  - [ ] Options bar (CTA buttons)
  - [ ] Options accordion
  - [ ] View mode toggle (code/tree)
  - [ ] State management integration

### **Phase 5: State Management & URL Persistence (2 hours)**
- [ ] Create `useJsonFormatter.ts` hook
  - [ ] Input/output state
  - [ ] Options state
  - [ ] Validation state
  - [ ] Conversion logic orchestration
- [ ] Create `useUrlState.ts` hook
  - [ ] Read query params on mount
  - [ ] Update URL on option change (debounced)
  - [ ] Preserve params on locale switch

### **Phase 6: Pages & i18n (2 hours)**
- [ ] Create EN/RU page files
- [ ] Update `/src/locales/tools/code-data.json`
  - [ ] Add `jsonFormatter` section (70-80 keys)
  - [ ] EN translations
  - [ ] RU translations
- [ ] Create `/src/locales/tools/seo-content/json-formatter.json`
  - [ ] EN SEO content (all sections)
  - [ ] RU SEO content (all sections)

### **Phase 7: Navigation & Category Integration (1 hour)**
- [ ] Update Header.tsx (add nav link)
- [ ] Update Footer.tsx (add footer link)
- [ ] Update navigation.json (EN/RU keys)
- [ ] Update category pages (EN/RU)
- [ ] Update all tools pages (EN/RU)

### **Phase 8: Metadata & Redirects (1 hour)**
- [ ] Update `toolMetadata.ts` (add config entry)
- [ ] Update `next.config.ts` (add 16 redirects)
- [ ] Verify tool count updates

### **Phase 9: Testing & Build (2 hours)**
- [ ] Test all features:
  - [ ] JSON formatting (2/4/8 spaces, custom)
  - [ ] Minify
  - [ ] Sort keys
  - [ ] Unescape strings
  - [ ] NDJSON mode
  - [ ] Validation errors (line/column)
  - [ ] Tree view toggle
  - [ ] File upload (.json, .txt)
  - [ ] Copy/Download
  - [ ] URL state persistence
  - [ ] Large file handling (5-10MB)
- [ ] Test redirects (all 16 aliases)
- [ ] Test EN/RU localization
- [ ] Run linter: `npm run lint`
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Build: `npm run build`
- [ ] Verify sitemap includes new route

### **Phase 10: Documentation & Handoff (30 min)**
- [ ] Delete roadmap file
- [ ] Document any custom patterns used
- [ ] Note any deviations from plan

**Total Estimated Time:** 17.5 hours

---

## Part I: Key Technical Challenges & Mitigations

### **Challenge 1: Large File Performance (5-10MB JSON)**
**Mitigation:**
- Use streaming parser for initial validation
- Implement virtual scrolling in tree view
- Show preview message for files > 5MB
- Lazy-load tree nodes (collapse all by default)

### **Challenge 2: NDJSON Mode Complexity**
**Mitigation:**
- Split by `\n`, trim each line
- Validate each line independently
- Show aggregate validation report
- Format/display each line separately

### **Challenge 3: Accurate Line/Column Error Reporting**
**Mitigation:**
- Use native `JSON.parse()` error handling
- Parse error message to extract line/column
- Highlight error line in CodeMirror
- Show inline error message

### **Challenge 4: URL State Synchronization**
**Mitigation:**
- Debounce URL updates (500ms)
- Use `router.replace()` (not `push`) to avoid history spam
- Validate params on mount (fallback to defaults)
- Preserve params when changing locales

### **Challenge 5: Tree View + Code View State Sync**
**Mitigation:**
- Share single source of truth (parsed JSON object)
- Convert to string only for display
- Toggle just swaps component rendering
- Preserve scroll position when toggling

---

## Part J: SEO & Performance Considerations

### **SEO Optimizations**
- ✅ 301 redirects for all aliases (8 per locale)
- ✅ Canonical URL: `/tools/json-formatter`
- ✅ Comprehensive meta descriptions (155-160 chars)
- ✅ Schema.org markup (WebApplication type)
- ✅ Related tools section for internal linking
- ✅ Localized URLs (`/ru/tools/json-formatter`)
- ✅ Hreflang tags (auto-generated)

### **Performance Targets**
- First Load JS: < 220 kB (current average: ~200 kB)
- Time to Interactive: < 2s
- Large file (5MB) validation: < 3s
- Tree view render (10k nodes): < 1s

### **Accessibility**
- ARIA labels for all interactive elements
- Keyboard navigation (Tab, Enter, Esc)
- Screen reader announcements for validation errors
- Focus management in modals/dialogs
- Color contrast compliance (WCAG AA)

---

## Part K: Reusable Components from Existing Codebase

### **Layout & Wrappers**
- ✅ `Layout` component (header/footer/nav)
- ✅ `SEOContent` component (bottom SEO block)
- ✅ `CategoryPage` component (category page structure)

### **UI Primitives**
- ✅ `Button` (CTAs)
- ✅ `Switch` (toggles)
- ✅ `Accordion` / `AccordionItem` (options panel)
- ✅ `Select` (indent size dropdown)
- ✅ `Input` (custom indent value)
- ✅ `Label` (form labels)

### **Hooks & Utilities**
- ✅ `useToolTranslations()` (i18n)
- ✅ `downloadTextAsFile()` (download logic)
- ✅ `generateToolMetadata()` (metadata generation)

### **Analytics Components**
- ❌ **Not reusable** - Need custom `JsonFormatterAnalytics` for output stats

---

## Part L: Dependencies Summary

### **New NPM Packages (4 packages)**
```json
{
  "@uiw/react-codemirror": "^4.23.13",
  "@codemirror/lang-json": "^6.0.1",
  "@codemirror/lint": "^6.8.4",
  "react-json-view-lite": "^1.5.0"
}
```

**Bundle Size Impact:** ~250 KB (gzipped)

---

## Part M: Success Criteria

### **Functional Requirements**
- [ ] All 9 aliases redirect to canonical URL (301)
- [ ] JSON validation with line/column errors
- [ ] Format with 2/4/8 spaces or custom indent
- [ ] Minify output (compact)
- [ ] Sort keys alphabetically
- [ ] Unescape JSON strings (`\\n` → `\n`)
- [ ] NDJSON mode (line-by-line validation)
- [ ] Tree view toggle (collapsible nodes)
- [ ] Path breadcrumbs in tree view
- [ ] File upload (.json, .txt)
- [ ] Copy to clipboard
- [ ] Download formatted JSON
- [ ] URL state persistence (shareable links)
- [ ] Handles 5-10MB files
- [ ] EN/RU full localization

### **Technical Requirements**
- [ ] Build succeeds with no errors
- [ ] Linter passes
- [ ] TypeScript type check passes
- [ ] All 175+ pages still generate
- [ ] Redirects work (test in production build)
- [ ] Tool count updated everywhere
- [ ] Sitemap includes new route
- [ ] Metadata complete (EN/RU)

---

## Part N: Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| CodeMirror bundle size too large | Medium | Low | Tree-shake unused features, lazy load tree view |
| Large file crashes browser | High | Medium | Implement 10MB hard limit, show preview mode |
| NDJSON parsing too slow | Medium | Medium | Process in chunks, show progress indicator |
| URL param bloat | Low | Medium | Use short param names, compress with base64 if needed |
| Redirect loops | High | Low | Test thoroughly, use absolute paths |

---

## Part O: Post-Implementation Verification Checklist

### **Before Deployment**
- [ ] All unit tests pass
- [ ] Manual testing complete (all features)
- [ ] Redirects tested in production build (`npm run build && npm start`)
- [ ] Mobile responsive (test on iPhone, Android)
- [ ] Dark mode works
- [ ] Accessibility audit (Lighthouse)
- [ ] SEO audit (meta tags, schema, sitemap)
- [ ] Performance audit (Lighthouse, Core Web Vitals)

### **After Deployment**
- [ ] Verify 301 redirects in browser network tab
- [ ] Check Google Search Console for redirect registration
- [ ] Monitor error logs for JSON parsing failures
- [ ] Monitor analytics for traffic to new tool
- [ ] Check Core Web Vitals impact

---

## Part P: Open Questions for Review

1. **Custom Indent Range:** Should custom indent be limited to 1-16 spaces, or allow tabs?
2. **File Size Limit:** Confirm 10MB hard limit, or implement streaming for larger files?
3. **Tree View Default:** Should tree view default to collapsed or expanded for root level?
4. **Error Handling:** Should invalid JSON show empty output or keep previous valid output?
5. **Download Format:** Should download preserve original filename or use generic "formatted.json"?

---

## Part Q: Next Steps

**AWAITING APPROVAL** before proceeding with implementation.

Once approved, I will:
1. Install dependencies (`npm install`)
2. Create all new files per Part F
3. Implement phases 1-10 sequentially
4. Provide progress updates at each phase completion
5. Request review before final build

**Estimated Completion Time:** 2-3 days (based on 17.5 hours of focused development)

---

## Appendix: Example SEO Content Structure

```json
{
  "en": {
    "title": "JSON Formatter & Validator – Free Online JSON Viewer",
    "metaDescription": "Paste or upload JSON/TXT and instantly format, validate, and color-preview it. Choose indent size, collapse/expand nodes, minify, unescape strings, and download the result.",
    "sections": {
      "intro": {
        "title": "Online JSON Formatter & Validator",
        "content": "Format, validate, and explore JSON in seconds. Paste raw JSON—or drop a .json or .txt file—and we'll pretty-print it with syntax highlighting. Toggle indent size, collapse levels, minify for production, or unescape strings for readability. Everything happens locally in your browser."
      },
      "features": { /* 8-10 features */ },
      "useCases": { /* 8-10 use cases */ },
      "howToUse": { /* 5-6 steps */ },
      "examples": { /* 6-8 examples */ },
      "benefits": { /* 10-12 bullet points */ },
      "faqs": [ /* 10-12 Q&A pairs */ ],
      "relatedTools": { /* 4-6 related tools */ }
    }
  }
}
```

---

**END OF ROADMAP**
