# TASK 0 - Codebase Reconnaissance Report

## Overview
This report documents the findings from analyzing the existing codebase to understand patterns, components, and structure needed to implement the punctuation removal tool. The goal is to identify exactly what to reuse and how to wire it together.

## 1. Page Route Structure & Data-Fetch Pattern

### Route File Pattern
- **Location**: `src/app/tools/[tool-name]/page.tsx`
- **Example**: `src/app/tools/big-text/page.tsx`
- **Russian Route**: `src/app/ru/tools/[tool-name]/page.tsx`

### Standard Page Structure
```tsx
import { [ToolComponent] } from '@/components/tools/[ToolComponent]';
import { Layout } from '@/components/layout/Layout';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';

const toolConfig = {
  name: 'tool-name',
  path: '/tools/tool-name'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
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

## 2. Shared Layout Components

### Main Layout Wrapper
- **Component**: `src/components/layout/Layout.tsx`
- **Structure**: Header → Main Content → FooterAd → Footer
- **Usage**: Wraps all tool pages consistently

### BaseTextConverter Component
- **Path**: `src/components/shared/BaseTextConverter.tsx`
- **Purpose**: Primary wrapper for text transformation tools
- **Key Features**:
  - Dual textarea layout (input/output)
  - Built-in action buttons (copy, clear, download, upload)
  - File upload support with validation
  - Feedback messages and loading states
  - Text analytics integration
  - Mobile-responsive layout options

### Key Props for BaseTextConverter
```tsx
interface BaseTextConverterProps {
  title: string;
  description: string;
  inputLabel: string;
  outputLabel: string;
  inputPlaceholder: string;
  copyText: string;
  clearText: string;
  downloadText: string;
  uploadText: string;
  downloadFileName: string;
  children?: ReactNode; // For options panels
  showAnalytics?: boolean;
  analyticsVariant?: 'default' | 'compact';
  useMonoFont?: boolean;
  onTextChange: (text: string) => void;
  text: string;
  convertedText: string;
  onConvertedTextUpdate: (text: string) => void;
  mobileLayout?: 'row' | '2x2';
}
```

## 3. Text Input/Output Components

### Core Components
- **TextInput**: `src/components/shared/TextInput.tsx`
- **TextOutput**: `src/components/shared/TextOutput.tsx`
- **ActionButtons**: `src/components/shared/ActionButtons.tsx`
- **FeedbackMessage**: `src/components/shared/FeedbackMessage.tsx`

### Utility Functions
- **Path**: `src/lib/utils.ts`
- **Key Functions**:
  - `copyToClipboard(text: string): Promise<boolean>`
  - `downloadTextAsFile(text: string, filename: string)`
  - `validateTextFile(file: File): boolean`

## 4. Options Panel Components

### Reusable Options Components
- **ToolOptionsAccordion**: `src/components/shared/ToolOptionsAccordion.tsx`
- **Switch**: `src/components/ui/switch.tsx`
- **Button**: `src/components/ui/button.tsx`
- **Accordion/AccordionItem**: `src/components/ui/accordion.tsx`

### Pattern from RemoveTextFormatting
```tsx
// Options with icons and switches
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
  {optionsList.map(({ key, label, icon: Icon }) => (
    <div 
      key={key}
      className="group flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 cursor-pointer"
      onClick={() => handleOptionChange(key)}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <label className="text-sm font-medium cursor-pointer text-foreground leading-tight">
          {label}
        </label>
      </div>
      <Switch
        checked={options[key]}
        onCheckedChange={() => handleOptionChange(key)}
      />
    </div>
  ))}
</div>
```

## 5. Ads Components & Placement API

### Ad Components Location
- **Path**: `src/components/ads/AdPlacements.tsx`
- **Available Components**:
  - `ToolHeaderAd` - Below title/description (slot: "4917772104")
  - `FooterAd` - Before footer (slot: "9659974650")
  - `SEOContentAd` - Within SEO content (configurable slots)

### Ad Placement Pattern
```tsx
// In BaseTextConverter
<ToolHeaderAd /> // Automatically placed below title

// In Layout
<FooterAd className="container mx-auto px-4 sm:px-6 lg:px-8" />

// In SEOContent
<SEOContentAd slot="4917772104" className="my-12" />
<SEOContentAd slot="9659974650" className="my-12" />
```

## 6. i18n Pattern & File Locations

### Translation Hook Usage
```tsx
import { useToolTranslations } from '@/lib/i18n/hooks';

export function ToolComponent() {
  const { common, tool } = useToolTranslations('tools/text-modifiers');
  
  return (
    <BaseTextConverter
      title={tool('removePunctuation.title')}
      description={tool('removePunctuation.description')}
      inputLabel={common('labels.inputText')}
      copyText={common('buttons.copy')}
      // ...
    />
  );
}
```

### File Locations
- **Main translations**: `src/locales/tools/text-modifiers.json`
- **Common strings**: `src/locales/shared/common.json`
- **Navigation**: `src/locales/shared/navigation.json`

### Translation Structure
```json
{
  "en": {
    "removePunctuation": {
      "title": "Remove Punctuation from Text",
      "description": "Clean, copy-ready text—instantly strip commas, periods, quotes, dashes, and symbols.",
      "outputLabel": "Text Without Punctuation",
      "options": {
        "keepApostrophes": "Keep apostrophes in contractions",
        "keepHyphens": "Keep hyphens/underscores",
        "keepEmailUrl": "Keep email/URL punctuation",
        "keepNumbers": "Keep numbers",
        "keepLineBreaks": "Keep line breaks",
        "customKeepList": "Custom keep list"
      }
    }
  },
  "ru": {
    // Russian translations...
  }
}
```

## 7. SEO Meta Helper & JSON Schema

### Metadata Generation
- **Path**: `src/lib/metadata/metadataGenerator.ts`
- **Usage**: `generateToolMetadata(toolName, { locale, pathname })`

### SEO Content Hook
- **Path**: `src/hooks/useSEOContent.ts`
- **Usage**: `useSEOContent(toolName)`

### Exact JSON SEO Schema
**Location**: `src/locales/tools/seo-content/[tool-name].json`

**Required Structure**:
```json
{
  "en": {
    "title": "Tool Title - SEO Description",
    "metaDescription": "Meta description for search engines",
    "sections": {
      "intro": {
        "title": "Introduction Title",
        "content": "Introduction content paragraph"
      },
      "features": {
        "title": "Features Section Title",
        "items": [
          {
            "title": "Feature Name",
            "description": "Feature description"
          }
        ]
      },
      "howToUse": {
        "title": "How to Use Title",
        "description": "How to use description",
        "steps": [
          {
            "step": 1,
            "title": "Step Title",
            "description": "Step description"
          }
        ]
      },
      "examples": {
        "title": "Examples Title",
        "description": "Examples description",
        "items": [
          {
            "title": "Example Name",
            "input": "Example input text",
            "output": "Example output text"
          }
        ]
      },
      "useCases": {
        "title": "Use Cases Title",
        "description": "Use cases description",
        "items": [
          {
            "title": "Use Case Name",
            "description": "Use case description"
          }
        ]
      },
      "benefits": {
        "title": "Benefits Title",
        "content": "Benefits content",
        "items": [
          "Benefit 1",
          "Benefit 2"
        ]
      },
      "faqs": [
        {
          "question": "Question text?",
          "answer": "Answer text"
        }
      ],
      "relatedTools": {
        "title": "Related Tools Title",
        "items": [
          {
            "name": "Tool Name",
            "description": "Tool description",
            "href": "/tools/tool-slug"
          }
        ]
      }
    }
  },
  "ru": {
    // Same structure in Russian
  }
}
```

## 8. Telemetry/Analytics Hooks & Events

### Analytics Pattern
**Note**: No explicit telemetry hooks found in the codebase. Analytics appear to be handled through:
1. **Google Analytics** - Likely configured at the app level
2. **Built-in browser events** - Copy, download actions
3. **Component-level tracking** - Through standard web analytics

### Standard Events to Track
Based on existing patterns:
- `tool_opened` - When tool page loads
- `transform_run` - When transformation is executed
- `copy_result` - When result is copied
- `download_result` - When result is downloaded
- `option_toggled` - When options are changed
- `input_pasted` - When text is pasted
- `file_uploaded` - When file is uploaded

### Implementation Pattern
```tsx
// Track events through standard browser APIs or analytics service
const handleCopy = async () => {
  const success = await copyToClipboard(convertedText);
  if (success) {
    // Analytics would be tracked here
    // gtag('event', 'copy_result', { tool: 'remove-punctuation' });
  }
};
```

## 9. Category Registration & Navigation

### Category Configuration
- **Location**: `src/app/tools/page.tsx` and `src/app/ru/tools/page.tsx`
- **Category**: `text-modification-formatting`
- **Category ID**: Matches existing tools like `remove-line-breaks`, `remove-text-formatting`

### Navigation Registration
Tools are registered in the category arrays within the tools page:

```tsx
{
  id: 'text-modification-formatting',
  slug: 'text-modification-formatting',
  titleKey: 'navigation.textModificationFormatting',
  icon: <Type className="h-6 w-6" />,
  tools: [
    // Add new tool here:
    { 
      id: 'remove-punctuation', 
      titleKey: 'navigation.removePunctuation', 
      href: '/tools/remove-punctuation', 
      icon: '🔤' 
    },
    // ... existing tools
  ]
}
```

### Navigation Translation Keys
Add to `src/locales/shared/navigation.json`:
```json
{
  "en": {
    "removePunctuation": "Remove Punctuation"
  },
  "ru": {
    "removePunctuation": "Удалить Пунктуацию"
  }
}
```

## 10. Sitemap & URL Structure

### Automatic Inclusion
- **Sitemap**: `src/app/sitemap.ts`
- **Pattern**: Tools are automatically discovered from the navigation structure
- **URLs**: 
  - English: `/tools/remove-punctuation`
  - Russian: `/ru/tools/remove-punctuation`

### Redirect Configuration
Add 301 redirects in the routing configuration:
- `/tools/remove-text-punctuation` → `/tools/remove-punctuation`
- `/tools/punctuation-remover` → `/tools/remove-punctuation`
- `/tools/strip-punctuation` → `/tools/remove-punctuation`

## 11. Gaps & Risks Identified

### Low Risk
1. **Component Reuse**: All necessary components exist and are well-documented
2. **i18n Structure**: Clear pattern established, just need to add translations
3. **SEO Schema**: Well-defined structure with multiple examples

### Medium Risk
1. **Analytics Implementation**: No explicit telemetry hooks found - may need to implement or use existing analytics service
2. **Unicode Handling**: Need to ensure proper Unicode punctuation detection beyond basic ASCII

### Recommendations
1. **Follow PlainTextConverter Pattern**: Most similar existing tool with options panel
2. **Use text-modifiers Namespace**: For i18n translations
3. **Implement Custom Analytics**: If needed, follow the event patterns identified
4. **Test Unicode Thoroughly**: Ensure all Unicode punctuation categories are handled

## 12. Implementation Priority

### Phase 1: Core Implementation
1. Create route files (`page.tsx`)
2. Implement `RemovePunctuationTool.tsx` component
3. Create punctuation removal logic (`lib/removePunctuation.ts`)
4. Add i18n translations

### Phase 2: Integration
1. Add SEO JSON content files
2. Register in navigation/category
3. Add related tools links
4. Implement analytics events

### Phase 3: Polish
1. Add unit tests
2. Performance optimization
3. Accessibility improvements
4. Mobile optimization verification

This reconnaissance provides a complete blueprint for implementing the punctuation removal tool while maintaining consistency with existing patterns and architecture.