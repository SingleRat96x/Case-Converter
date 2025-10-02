
# Tool Modernization: Implement Modular Metadata, SEO Content, and UI Improvements

For tool page /tools/[sort-words]/ and its Russian counterpart /tools/ru/[TOOL_NAME]/, implement the following standardizations to match the modular approach used in /tools/text-counter/:   

## 1. Metadata Implementation

**Files to modify:**

- src/app/tools/[TOOL_NAME]/page.tsx
- src/app/ru/tools/[TOOL_NAME]/page.tsx
  
**Required changes:**

- Replace static export const metadata with dynamic generateMetadata() function  
- Import and use generateToolMetadata from @/lib/metadata/metadataGenerator  
- Add tool configuration object with name and path properties  
- Add SEOContent component with toolName, enableAds={true}, and adDensity="medium"  

**Implementation pattern:**

```ts
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import { SEOContent } from '@/components/seo/SEOContent';
import type { Metadata } from 'next';

const toolConfig = {
  name: '[TOOL_NAME]',
  path: '/tools/[TOOL_NAME]'  // Use '/ru/tools/[TOOL_NAME]' for Russian
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',  // Use 'ru' for Russian pages
    pathname: toolConfig.path
  });
}

// Add SEOContent component before closing Layout div
<SEOContent
  toolName={toolConfig.name}
  enableAds={true}
  adDensity="medium"
/>
```

## 2. SEO Content Creation

**File to create:**

- src/locales/tools/seo-content/[TOOL_NAME].json

**Required structure:**

- Complete bilingual SEO content with English (en) and Russian (ru) sections  
- Include: title, metaDescription, and sections containing:  
  - intro, features (6 cards), useCases, howToUse, examples, benefits, faqs, relatedTools  
- Follow existing patterns from src/locales/tools/seo-content/text-counter.json  

## 3. Metadata Registry Update

**File to modify:**

- src/lib/metadata/toolMetadata.ts

**Required changes:**

- Add new tool entry to TOOL_METADATA_REGISTRY object  
- Include: title, description, keywords, category, shortDescription, schema, relatedTools  
- Follow existing patterns in the registry  

## 4. Upload Description Removal

**Files to modify:**

- Translation files containing upload descriptions (e.g., src/locales/tools/text-generators.json, src/locales/tools/case-converters.json)

**Required changes:**

- Locate uploadDescription fields for the tool in both English and Russian sections  
- Change from descriptive text to empty string: `"uploadDescription": ""`  

## 5. Analytics Cards Standardization

**File to modify:**

- src/components/tools/[ToolName]Converter.tsx

**Required changes:**

- Ensure analyticsVariant="compact" is set  
- The BaseTextConverter/BaseAnalysisConverter should use showTitle={false} for analytics  
- This provides clean appearance without borders/titles matching text-counter 
- make sure to use proper analytics cards that goes with the data that the tool is showing such as IPAnalytics.tsx, MonthAnalytics.tsx, etc which ever you find within  src/components/tools/shared/...Analytics or create a proper one for the specific making sure its modulair so we can reuse for future tools.

## 6. Mobile Button Layout Optimization

**File to modify:**

- src/components/tools/[ToolName]Converter.tsx

**Required changes:**

- Add mobileLayout="2x2" prop to BaseTextConverter/BaseAnalysisConverter  
- This creates the following mobile layout:  
  - Row 1: Copy + Download buttons  
  - Row 2: Upload + Clear buttons  
- Saves space on mobile devices  

## 7. Component Integration Verification

**Ensure compatibility:**

- If using BaseTextConverter: All props should work as specified  
- If using BaseAnalysisConverter: Verify mobileLayout prop support exists  
- If missing, add `mobileLayout?: 'row' | '2x2'` to component interface and pass to ActionButtons  

## Quality Checklist

- [ ] Browser tab shows proper tool title from metadata registry  
- [ ] No upload description text visible on page  
- [ ] Analytics cards display without borders/titles  
- [ ] Mobile layout shows 2x2 button grid  
- [ ] SEO content appears below tool with proper translations  
- [ ] Both English and Russian pages work identically  

## Reference Implementation

Use /tools/text-counter/, /tools/uppercase/, /tools/lowercase/, /tools/title-case/, /tools/sentence-case/, /tools/alternating-case/, or /tools/bold-text/ as reference for complete implementation patterns.
