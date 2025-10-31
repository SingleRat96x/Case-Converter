# Kebab Case Converter - Comprehensive Development Roadmap

## Executive Summary
This document outlines the complete development plan for implementing `/tools/kebab-case-converter` as a modular, fully-internationalized tool within the existing Convert Case Tools category.

---

## Part A: Codebase Analysis - Reusable Components

### 1. **Fully Reusable Components** (No Modification Required)

#### Core Components:
- **`BaseTextConverter.tsx`** (`/src/components/shared/`)
  - Handles the entire input/output layout
  - Manages file upload, copy, clear, and download operations
  - Supports custom labels (will be used for Target Case selector)
  - Already supports `customInputLabel` and `customOutputLabel` props
  
- **`TextAnalytics.tsx`** (`/src/components/shared/`)
  - Displays character/word/line counts
  - Can be optionally shown/hidden via props

- **`TextInput.tsx` & `TextOutput.tsx`** (`/src/components/shared/`)
  - Text area components with proper styling
  
- **`ActionButtons.tsx`** (`/src/components/shared/`)
  - Copy, Clear, Download, Upload buttons
  
- **`FeedbackMessage.tsx`** (`/src/components/shared/`)
  - Success/error message display

- **UI Components** (`/src/components/ui/`)
  - `Button`, `Input`, `Label`, `Switch`, `Select`, `Accordion`
  - All fully reusable for options UI

#### Utility Functions:
- **`downloadTextAsFile()`** from `/src/lib/utils.ts`
  - Context-aware download logic for TXT/JSON/CSV
  - Can be reused directly

- **`copyToClipboard()`** from `/src/lib/utils.ts`
  - Clipboard copy functionality

- **`validateTextFile()`** from `/src/lib/utils.ts`
  - File validation for uploads

### 2. **Partially Reusable Components** (Need Adaptation)

#### From CamelCaseConverter.tsx:
**Input Type Selector Pattern** (lines 202-234):
```typescript
const customInputLabel = (
  <Select value={inputType} onValueChange={handleTabChange}>
    <SelectContent>
      <SelectItem value="text">Text / Identifiers</SelectItem>
      <SelectItem value="json">JSON</SelectItem>
      <SelectItem value="csv">CSV Headers</SelectItem>
    </SelectContent>
  </Select>
);
```
✅ **Reuse Strategy**: Copy pattern, adapt for kebab-case context

**Output Style Selector Pattern** (lines 236-262):
```typescript
const customOutputLabel = (
  <Select value={caseStyle} onValueChange={setCaseStyle}>
    // Options here
  </Select>
);
```
✅ **Reuse Strategy**: Adapt for kebab-case | camelCase | snake_case target options

**JSON Validation Logic**:
- From `camelCaseUtils.ts`: `validateAndParseJson()` function
- ✅ **Reuse Strategy**: Import and use directly

**Conversion Options UI Pattern**:
- Accordion-based options layout from CamelCaseConverter
- Switch components for boolean options
- Input fields for advanced options (JSONPath exclusions)
- ✅ **Reuse Strategy**: Copy structure, adapt options for kebab-case

---

## Part B: New Files to Create

### 1. **Core Logic File**
📄 **`/src/lib/kebabCaseUtils.ts`**

**Purpose**: All kebab case conversion logic

**Required Exports**:
```typescript
export type TargetCase = 'kebab-case' | 'camelCase' | 'snake_case';
export type SourceFormat = 'auto' | 'camelCase' | 'snake_case' | 'kebab-case' | 'PascalCase' | 'Title Case';

export interface KebabCaseOptions {
  targetCase: TargetCase;
  sourceFormat: SourceFormat;
  preserveAcronyms: boolean;
  treatDigitsAsBoundaries: boolean;
  lowercaseOutput: boolean; // Default true
  convertKeysOnly?: boolean; // For JSON
  deepTransform?: boolean; // For nested JSON
  excludePaths?: string[]; // JSONPath exclusions
  prettyPrint?: boolean; // JSON formatting
}

// Core conversion functions
export function convertTextToKebabCase(text: string, options: KebabCaseOptions): string;
export function convertToTarget(text: string, target: TargetCase, options: KebabCaseOptions): string;
export function convertJsonKeys(obj: unknown, options: KebabCaseOptions): unknown;
export function convertCsvHeaders(csv: string, options: KebabCaseOptions): string;
export function validateAndParseJson(text: string): { success: boolean; data?: any; error?: {message: string; line?: number; column?: number} };
export function shouldUseWorker(text: string): boolean;

// Conversion helpers (internal)
function camelToKebab(text: string, options: KebabCaseOptions): string;
function snakeToKebab(text: string, options: KebabCaseOptions): string;
function pascalToKebab(text: string, options: KebabCaseOptions): string;
function titleToKebab(text: string, options: KebabCaseOptions): string;
function kebabToCamel(text: string, options: KebabCaseOptions): string;
function kebabToSnake(text: string, options: KebabCaseOptions): string;
function detectSourceFormat(text: string): SourceFormat;
```

**Implementation Notes**:
- Reuse validation logic from `camelCaseUtils.ts` and `snakeCaseUtils.ts`
- Implement bidirectional conversion (kebab ↔ camel ↔ snake)
- Handle edge cases: numbers, acronyms, special characters
- Deep object transformation for JSON

---

### 2. **React Component**
📄 **`/src/components/tools/KebabCaseConverter.tsx`**

**Structure** (Based on CamelCaseConverter.tsx pattern):
```typescript
export function KebabCaseConverter() {
  // State management
  const [text, setText] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [inputType, setInputType] = useState<'text' | 'json' | 'csv'>('text');
  const [targetCase, setTargetCase] = useState<TargetCase>('kebab-case');
  const [sourceFormat, setSourceFormat] = useState<SourceFormat>('auto');
  // ... other options state
  
  // NEW: Shortcut button handlers
  const handleShortcutCamelToKebab = () => {
    setSourceFormat('camelCase');
    setTargetCase('kebab-case');
    if (text) handleConvert();
  };
  
  // Custom input label with Input Type selector
  const customInputLabel = (/* Reuse pattern from camel-case */);
  
  // Custom output label with Target Case selector (NEW)
  const customOutputLabel = (
    <Select value={targetCase} onValueChange={setTargetCase}>
      <SelectItem value="kebab-case">kebab-case</SelectItem>
      <SelectItem value="camelCase">camelCase</SelectItem>
      <SelectItem value="snake_case">snake_case</SelectItem>
    </Select>
  );
  
  // Options accordion (NEW: Different options for kebab-case)
  // Shortcut buttons component (NEW)
  // Convert button with dynamic text based on targetCase
  
  return (
    <BaseTextConverter {...props}>
      {/* Validation errors */}
      {/* Shortcut Buttons */}
      {/* Primary CTA with dynamic text */}
      {/* Helper text */}
      {/* Options Accordion */}
    </BaseTextConverter>
  );
}
```

**Key Differences from CamelCase**:
1. **Target Case Selector** instead of Case Style (camelCase vs PascalCase)
2. **Shortcut Buttons** (Camel→Kebab, Snake→Kebab, etc.)
3. **File Upload Integration** (Reuse file input pattern from BaseTextConverter)
4. **Dynamic CTA Button**: "Convert to [targetCase]"
5. Different conversion options (treat digits as boundaries, etc.)

---

### 3. **NEW: Shortcut Buttons Component** (Optional Modular)
📄 **`/src/components/tools/CaseConversionShortcuts.tsx`**

**Purpose**: Reusable shortcut button component

```typescript
interface ShortcutButton {
  label: string;
  icon?: ReactNode;
  from: SourceFormat;
  to: TargetCase;
  onClick: () => void;
}

interface CaseConversionShortcutsProps {
  shortcuts: ShortcutButton[];
  className?: string;
}

export function CaseConversionShortcuts({ shortcuts, className }: CaseConversionShortcutsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {shortcuts.map((shortcut, idx) => (
        <Button key={idx} variant="outline" size="sm" onClick={shortcut.onClick}>
          {shortcut.icon}
          {shortcut.label}
        </Button>
      ))}
    </div>
  );
}
```

---

### 4. **Page Files**

#### English Page:
📄 **`/src/app/tools/kebab-case-converter/page.tsx`**
```typescript
import { Layout } from '@/components/layout/Layout';
import { KebabCaseConverter } from '@/components/tools/KebabCaseConverter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'kebab-case-converter',
  path: '/tools/kebab-case-converter'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function KebabCaseConverterPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <KebabCaseConverter />
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

#### Russian Page:
📄 **`/src/app/ru/tools/kebab-case-converter/page.tsx`**
*(Same structure, locale: 'ru', pathname: '/ru/tools/kebab-case-converter')*

---

### 5. **SEO Content JSON**

📄 **`/src/locales/tools/seo-content/kebab-case-converter.json`**

**Structure** (Based on camel-case-converter.json):
```json
{
  "en": {
    "title": "Kebab Case Converter – Convert camelCase/snake_case ↔ kebab-case (Text & JSON)",
    "metaDescription": "Free online kebab case converter for text and JSON keys. Convert camelCase, snake_case, and kebab-case in both directions. Paste text or JSON, choose target case, export.",
    "sections": {
      "intro": {
        "title": "Free Online Kebab Case Converter",
        "content": "Convert between kebab-case, camelCase, and snake_case instantly..."
      },
      "features": {
        "title": "Advanced Kebab Case Conversion Features",
        "items": [
          {
            "title": "Bidirectional Conversion",
            "description": "Convert between kebab-case, camelCase, and snake_case in any direction"
          },
          {
            "title": "Multiple Input Types",
            "description": "Convert plain text identifiers, JSON with nested keys, or CSV headers"
          },
          {
            "title": "Shortcut Buttons",
            "description": "Quick conversion shortcuts for common transformations"
          },
          {
            "title": "Deep JSON Processing",
            "description": "Recursively convert all keys in nested objects and arrays"
          },
          {
            "title": "Acronym Preservation",
            "description": "Intelligently handle acronyms in identifiers"
          },
          {
            "title": "Digit Boundary Detection",
            "description": "Treat numbers as word boundaries for proper kebab-case formatting"
          },
          {
            "title": "File Upload Support",
            "description": "Upload .txt or .json files to populate input instantly"
          },
          {
            "title": "JSONPath Exclusions",
            "description": "Exclude specific JSON paths from conversion using JSONPath notation"
          }
        ]
      },
      "useCases": {
        "title": "Common Use Cases for Kebab Case Conversion",
        "description": "Kebab case conversion is essential for URL slugs, CSS class names, HTML attributes, and file naming conventions.",
        "items": [
          { "title": "URL Slugs", "description": "Convert page titles to SEO-friendly kebab-case URLs" },
          { "title": "CSS Class Names", "description": "Transform component names into BEM or utility class naming" },
          { "title": "HTML Attributes", "description": "Convert data attributes to kebab-case format" },
          { "title": "File Naming", "description": "Generate consistent kebab-case file names" },
          { "title": "API Endpoints", "description": "Convert endpoint names to RESTful kebab-case format" },
          { "title": "Configuration Keys", "description": "Transform config property names between formats" },
          { "title": "Git Branch Names", "description": "Generate kebab-case branch names from feature descriptions" },
          { "title": "Package Names", "description": "Convert module names to NPM-compatible kebab-case" }
        ]
      },
      "howToUse": {
        "title": "How to Convert to Kebab Case",
        "description": "Follow these steps to convert your text, identifiers, or JSON to kebab-case format.",
        "steps": [
          {
            "step": 1,
            "title": "Choose Input Type",
            "description": "Select Text/Identifiers, JSON, or CSV Headers based on your data format."
          },
          {
            "step": 2,
            "title": "Select Target Case",
            "description": "Choose your desired output format: kebab-case, camelCase, or snake_case."
          },
          {
            "step": 3,
            "title": "Paste or Upload Data",
            "description": "Paste text directly or upload a .txt/.json file. The tool validates JSON automatically."
          },
          {
            "step": 4,
            "title": "Configure Options (Optional)",
            "description": "Toggle options like acronym preservation, digit boundaries, and JSON-specific settings."
          },
          {
            "step": 5,
            "title": "Convert & Download",
            "description": "Click 'Convert to [target]' or use keyboard shortcut. Copy result or download as file."
          }
        ]
      },
      "examples": {
        "title": "Kebab Case Conversion Examples",
        "description": "See how different naming conventions convert to and from kebab-case.",
        "items": [
          { 
            "title": "camelCase → kebab-case",
            "input": "userName\napiEndpointUrl\nmaxFileSize",
            "output": "user-name\napi-endpoint-url\nmax-file-size"
          },
          { 
            "title": "snake_case → kebab-case",
            "input": "user_profile\napi_response_time\nmax_retry_count",
            "output": "user-profile\napi-response-time\nmax-retry-count"
          },
          { 
            "title": "JSON keys → kebab-case",
            "input": "{\n  \"userProfile\": {\n    \"firstName\": \"John\",\n    \"lastName\": \"Doe\"\n  }\n}",
            "output": "{\n  \"user-profile\": {\n    \"first-name\": \"John\",\n    \"last-name\": \"Doe\"\n  }\n}"
          },
          { 
            "title": "kebab-case → camelCase",
            "input": "user-name\napi-endpoint\nmax-file-size",
            "output": "userName\napiEndpoint\nmaxFileSize"
          },
          { 
            "title": "Title Case → kebab-case",
            "input": "User Profile Settings\nAPI Response Handler\nMax File Size Limit",
            "output": "user-profile-settings\napi-response-handler\nmax-file-size-limit"
          }
        ]
      },
      "benefits": {
        "title": "Why Use Our Kebab Case Converter",
        "items": [
          "Bidirectional conversion between all major naming conventions (kebab, camel, snake)",
          "Advanced JSON processing with deep nested object support and path exclusions",
          "Intelligent acronym preservation and digit boundary detection",
          "File upload support for batch processing of .txt and .json files",
          "Shortcut buttons for common conversion patterns",
          "CSV header conversion for data file preparation",
          "Real-time validation with detailed error messages for JSON",
          "Context-aware downloads with proper file extensions",
          "Completely free, browser-based processing, no server uploads",
          "Mobile-optimized interface with keyboard shortcuts for desktop users"
        ]
      },
      "faqs": {
        "title": "Frequently Asked Questions",
        "items": [
          {
            "question": "What is kebab-case and when should I use it?",
            "answer": "Kebab-case (also called dash-case or hyphen-case) uses hyphens to separate words in lowercase, like 'user-profile-settings'. It's commonly used for URL slugs, CSS class names, HTML data attributes, file names, and API endpoints. It's particularly popular in web development because hyphens are URL-safe and CSS-compatible."
          },
          {
            "question": "Can I convert from kebab-case to other formats?",
            "answer": "Yes! The tool supports bidirectional conversion. You can convert from kebab-case to camelCase, PascalCase, or snake_case. Simply select your desired target format from the dropdown menu."
          },
          {
            "question": "How does it handle numbers in identifiers?",
            "answer": "Enable 'Treat digits as word boundaries' option to properly handle numbers. For example, 'API2Response' becomes 'api-2-response' instead of 'api2-response'. This is useful for version numbers and numbered identifiers."
          },
          {
            "question": "Does it work with nested JSON objects?",
            "answer": "Yes. The tool recursively converts all keys in nested objects and arrays while preserving your data values. You can also enable 'Deep transform' for even more thorough processing."
          },
          {
            "question": "Can I exclude certain JSON paths from conversion?",
            "answer": "Yes. Use the 'Exclude paths' option with JSONPath notation. For example, '$.config.urls,$.meta.*' will skip conversion for those specific paths while converting everything else."
          },
          {
            "question": "What are the shortcut buttons for?",
            "answer": "Shortcut buttons provide quick one-click conversions for common patterns like 'Camel → Kebab' or 'Snake → Kebab'. They automatically set the source format and target case, then convert your input immediately."
          },
          {
            "question": "How do I upload a file?",
            "answer": "Click the 'Upload' button or drag and drop a .txt or .json file into the input area. The tool supports files up to 10MB. Your file content will populate the input field and be ready for conversion."
          },
          {
            "question": "Is my data sent to a server?",
            "answer": "No. All conversion happens locally in your browser using JavaScript. Your data never leaves your device, ensuring complete privacy and security."
          },
          {
            "question": "Can I process CSV files?",
            "answer": "Yes. Switch to the 'CSV Headers' tab to convert the first row of your CSV file. This is useful for normalizing column names when importing/exporting data."
          },
          {
            "question": "What file formats can I download?",
            "answer": "The tool automatically sets the correct file extension: .txt for text mode, .json for JSON mode, and .csv for CSV mode. All downloads include your converted content."
          }
        ]
      },
      "relatedTools": {
        "title": "Related Case Conversion Tools",
        "items": [
          {
            "name": "Camel Case Converter",
            "href": "/tools/camel-case-converter",
            "description": "Convert to camelCase or PascalCase for JavaScript development"
          },
          {
            "name": "Snake Case Converter",
            "href": "/tools/snake-case-converter",
            "description": "Convert to snake_case or UPPER_SNAKE_CASE for Python and databases"
          },
          {
            "name": "UPPERCASE Converter",
            "href": "/tools/uppercase",
            "description": "Convert all text to UPPERCASE format"
          },
          {
            "name": "lowercase Converter",
            "href": "/tools/lowercase",
            "description": "Transform text to all lowercase"
          },
          {
            "name": "Title Case Converter",
            "href": "/tools/title-case",
            "description": "Convert to proper Title Case for headlines"
          }
        ]
      }
    }
  },
  "ru": {
    "title": "Конвертер Kebab Case – Конвертация camelCase/snake_case ↔ kebab-case",
    "metaDescription": "Бесплатный онлайн конвертер kebab case для текста и ключей JSON. Конвертируйте camelCase, snake_case и kebab-case в обоих направлениях. Вставьте текст или JSON, выберите целевой регистр.",
    "sections": {
      // Full Russian translation following same structure...
    }
  }
}
```

---

## Part C: Files to Modify

### 1. **Translation Files**

#### 📝 **`/src/locales/tools/text-generators.json`**
**Location to add**: After `"snakeCase"` section

```json
{
  "en": {
    "kebabCase": {
      "title": "Kebab Case Converter (Text & JSON Keys)",
      "description": "Convert between kebab-case, camelCase, and snake_case. Works with text, JSON, and CSV.",
      "outputLabel": "Output",
      "inputPlaceholder": "Paste text, JSON, or CSV here...",
      "convertButton": "Convert to {targetCase}",
      "helperText": "Choose input type and target case, paste your data, then convert.",
      "optionsTitle": "Conversion Options",
      
      "targetCaseLabel": "Target Case",
      "targetKebab": "kebab-case",
      "targetCamel": "camelCase",
      "targetSnake": "snake_case",
      
      "sourceFormatLabel": "Source Format",
      "sourceAuto": "Auto-detect",
      "sourceCamel": "camelCase",
      "sourceSnake": "snake_case",
      "sourceKebab": "kebab-case",
      "sourcePascal": "PascalCase",
      "sourceTitle": "Title Case",
      
      "shortcutsTitle": "Quick Conversions",
      "shortcutCamelToKebab": "Camel → Kebab",
      "shortcutSnakeToKebab": "Snake → Kebab",
      "shortcutKebabToCamel": "Kebab → Camel",
      "shortcutKebabToSnake": "Kebab → Snake",
      
      "generalOptions": "General Options",
      "preserveAcronyms": "Preserve acronyms (e.g., API, URL)",
      "preserveAcronymsHint": "Keep consecutive uppercase letters together",
      "treatDigitsAsBoundaries": "Treat digits as word boundaries",
      "treatDigitsAsBoundariesHint": "Separate numbers with hyphens (e.g., api-2-response)",
      "lowercaseOutput": "Lowercase output",
      "lowercaseOutputHint": "All output in lowercase (standard kebab-case)",
      
      "jsonOptions": "JSON Options",
      "convertKeysOnly": "Convert keys only (preserve values)",
      "deepTransform": "Deep transform nested objects",
      "prettyPrint": "Pretty print JSON output",
      "excludePaths": "Exclude JSONPath patterns",
      "excludePathsHint": "Comma-separated, e.g., $.config.urls,$.meta.*",
      
      "processing": "Processing...",
      "converted": "Converted!",
      "error": "Error",
      "errorInvalidInput": "Invalid input",
      "errorConversion": "Conversion failed"
    }
  },
  "ru": {
    "kebabCase": {
      "title": "Конвертер Kebab Case (Текст и Ключи JSON)",
      "description": "Конвертируйте между kebab-case, camelCase и snake_case. Работает с текстом, JSON и CSV.",
      // ... full Russian translations
    }
  }
}
```

#### 📝 **`/src/locales/shared/navigation.json`**
**Add after `"snakeCaseConverter"`**:

```json
{
  "en": {
    "navigation": {
      "kebabCaseConverter": "Kebab Case Converter"
    }
  },
  "ru": {
    "navigation": {
      "kebabCaseConverter": "Конвертер Kebab Case"
    }
  }
}
```

---

### 2. **Navigation & Layout Files**

#### 📝 **`/src/components/layout/Header.tsx`**
**Modification**: Add to `convert-case-tools` category items array

```typescript
{
  titleKey: 'navigation.kebabCaseConverter',
  href: '/tools/kebab-case-converter'
}
```
**Line location**: After `snakeCaseConverter` entry in the `convert-case-tools` items array

---

#### 📝 **`/src/components/layout/Footer.tsx`**
**Modification**: Add to `convertCaseTools` array

```typescript
{
  title: t('navigation.kebabCaseConverter'),
  href: currentLocale === 'en' ? '/tools/kebab-case-converter' : '/ru/tools/kebab-case-converter'
}
```

---

### 3. **Metadata Registry**

#### 📝 **`/src/lib/metadata/toolMetadata.ts`**

**Modifications**:

1. **Add to TOOL_SLUGS array** (line ~1599):
```typescript
const TOOL_SLUGS: string[] = [
  // ... existing tools ...
  'kebab-case-converter', // ADD THIS
  // ... rest of tools
];
```

2. **Add tool metadata entry** (add after 'snake-case-converter' entry around line 1595):
```typescript
{
  slug: 'kebab-case-converter',
  pathname: '/tools/kebab-case-converter',
  type: 'tool',
  category: 'convert-case-tools',
  i18n: {
    en: {
      title: 'Kebab Case Converter – Convert camelCase/snake_case ↔ kebab-case (Text & JSON)',
      description: 'Free online kebab case converter for text and JSON keys. Convert camelCase, snake_case, and kebab-case in both directions. Paste text or JSON, choose target case, export instantly.',
      shortDescription: 'Convert between kebab-case, camelCase, and snake_case with JSON support.',
    },
    ru: {
      title: 'Конвертер Kebab Case – Конвертация camelCase/snake_case ↔ kebab-case',
      description: 'Бесплатный онлайн конвертер kebab case для текста и ключей JSON. Конвертируйте camelCase, snake_case и kebab-case в обоих направлениях. Вставьте текст или JSON, выберите целевой регистр.',
      shortDescription: 'Конвертация между kebab-case, camelCase и snake_case с поддержкой JSON.',
    }
  },
  schema: createAdvancedSchema(
    'kebab-case-converter',
    [
      'Bidirectional case conversion',
      'JSON key transformation', 
      'Nested object support',
      'CSV header conversion',
      'Shortcut buttons',
      'File upload support',
      'Acronym preservation',
      'Digit boundary detection'
    ],
    'Text/JSON/CSV Input',
    'kebab-case/camelCase/snake_case Output',
    4.7,
    743
  ),
  relatedTools: ['camel-case-converter', 'snake-case-converter', 'slugify-url', 'lowercase', 'uppercase']
},
```

3. **Update convert-case-tools category count** (line ~652):
```typescript
schema: createCategorySchema('convert-case-tools', 8, 'Convert Case Tools') // Change 7 to 8
```

---

### 4. **All Tools Page**

#### 📝 **`/src/app/tools/page.tsx`**
**Modification**: Add to `convert-case-tools` tools array

```typescript
{ 
  id: 'kebab-case-converter', 
  titleKey: 'navigation.kebabCaseConverter', 
  href: '/tools/kebab-case-converter', 
  icon: '🔗' 
},
```

**Note**: This will make the category show 8 tools, with a "See All" card showing +3 tools

---

#### 📝 **`/src/app/ru/tools/page.tsx`**
**Modification**: Same as English version but with `/ru/` prefix

```typescript
{ 
  id: 'kebab-case-converter', 
  titleKey: 'navigation.kebabCaseConverter', 
  href: '/ru/tools/kebab-case-converter', 
  icon: '🔗' 
},
```

---

### 5. **Category Pages** (Already Exist - Need Update)

#### 📝 **`/src/app/category/convert-case-tools/page.tsx`**
**Modification**: Add tool to `convertCaseTools` array

```typescript
{
  id: 'kebab-case-converter',
  title: 'Kebab Case Converter',
  description: 'Convert between kebab-case, camelCase, and snake_case - perfect for URLs, CSS, and file names',
  icon: '🔗',
  href: '/tools/kebab-case-converter'
}
```

---

#### 📝 **`/src/app/ru/category/convert-case-tools/page.tsx`**
**Modification**: Add tool to `convertCaseTools` array (Russian version)

```typescript
{
  id: 'kebab-case-converter',
  title: 'Конвертер Kebab Case',
  description: 'Конвертируйте между kebab-case, camelCase и snake_case - идеально для URL, CSS и имён файлов',
  icon: '🔗',
  href: '/ru/tools/kebab-case-converter'
}
```

---

### 6. **Sitemap** (Auto-Generated - Verify)

#### 📝 **`/src/app/sitemap.ts`**
**Note**: This file likely auto-generates based on routes. Verify that `/tools/kebab-case-converter` and `/ru/tools/kebab-case-converter` appear in the generated sitemap after build.

If manual entries are needed, add:
```typescript
{
  url: 'https://textcaseconverter.net/tools/kebab-case-converter',
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.8,
},
{
  url: 'https://textcaseconverter.net/ru/tools/kebab-case-converter',
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.8,
}
```

---

## Part D: Implementation Plan & Sequence

### Phase 1: Core Logic (Day 1)
1. Create `/src/lib/kebabCaseUtils.ts`
2. Implement all conversion functions
3. Test with unit tests (if test framework exists)

### Phase 2: Component Development (Day 2)
1. Create `/src/components/tools/KebabCaseConverter.tsx`
2. Implement state management
3. Build custom selectors (input type, target case)
4. Add shortcut buttons component
5. Integrate with BaseTextConverter

### Phase 3: Page Setup (Day 2-3)
1. Create English page: `/src/app/tools/kebab-case-converter/page.tsx`
2. Create Russian page: `/src/app/ru/tools/kebab-case-converter/page.tsx`
3. Test routing and metadata generation

### Phase 4: Translation (Day 3)
1. Add all strings to `/src/locales/tools/text-generators.json`
2. Add navigation key to `/src/locales/shared/navigation.json`
3. Create SEO content: `/src/locales/tools/seo-content/kebab-case-converter.json`

### Phase 5: Integration (Day 3-4)
1. Update Header navigation
2. Update Footer links
3. Update category pages (EN + RU)
4. Update `/tools/` page (EN + RU)
5. Update `toolMetadata.ts`

### Phase 6: Testing & QA (Day 4)
1. Test all conversion modes
2. Test JSON validation and transformation
3. Test file upload
4. Test shortcut buttons
5. Test responsive design
6. Verify i18n strings (EN + RU)
7. Test SEO content rendering
8. Verify metadata and Open Graph tags

### Phase 7: Build & Deploy (Day 4-5)
1. Run `npm run build`
2. Fix any TypeScript errors
3. Run `npm run lint`
4. Verify sitemap generation
5. Test production build locally
6. Deploy to production

---

## Part E: Key Architectural Decisions

### 1. **Reuse vs. New Components**
- ✅ **Reuse**: BaseTextConverter, all UI components, file upload logic
- 🆕 **New**: kebabCaseUtils.ts, KebabCaseConverter.tsx, shortcut buttons (optional modular)

### 2. **State Management Pattern**
Following the established pattern in CamelCaseConverter and SnakeCaseConverter:
- Local state with useState
- useMemo for options object
- useCallback for handlers
- No Redux/Context needed

### 3. **Conversion Logic Design**
**Bidirectional Approach**:
```
kebab-case ←→ camelCase ←→ snake_case
     ↓           ↓             ↓
All three formats can convert to each other
```

**Auto-detection Strategy**:
- Detect hyphens → kebab-case
- Detect underscores → snake_case
- Detect mixed case → camelCase/PascalCase
- No separators → Title Case or single word

### 4. **File Upload Strategy**
- Reuse BaseTextConverter's built-in file upload
- No need for separate PdfUploader component
- Support .txt and .json files
- Validate file size (reuse existing validation)

### 5. **Shortcut Buttons**
**Two Implementation Options**:

**Option A: Inline** (Simpler, faster to implement)
- Define shortcut handlers directly in KebabCaseConverter
- Render buttons inline in the component

**Option B: Modular Component** (More reusable)
- Create `/src/components/tools/CaseConversionShortcuts.tsx`
- Pass array of shortcut configs
- Can be reused in future case converters

**Recommendation**: Start with Option A, refactor to Option B if needed for other tools

---

## Part F: File Structure Summary

### New Files (6):
```
src/
├── lib/
│   └── kebabCaseUtils.ts                     ✨ NEW
├── components/
│   └── tools/
│       └── KebabCaseConverter.tsx            ✨ NEW
├── app/
│   ├── tools/
│   │   └── kebab-case-converter/
│   │       └── page.tsx                      ✨ NEW
│   └── ru/
│       └── tools/
│           └── kebab-case-converter/
│               └── page.tsx                  ✨ NEW
└── locales/
    └── tools/
        └── seo-content/
            └── kebab-case-converter.json     ✨ NEW
```

### Modified Files (10):
```
src/
├── locales/
│   ├── tools/
│   │   └── text-generators.json              📝 MODIFY
│   └── shared/
│       └── navigation.json                    📝 MODIFY
├── components/
│   └── layout/
│       ├── Header.tsx                         📝 MODIFY
│       └── Footer.tsx                         📝 MODIFY
├── lib/
│   └── metadata/
│       └── toolMetadata.ts                    📝 MODIFY
├── app/
│   ├── tools/
│   │   └── page.tsx                           📝 MODIFY
│   ├── ru/
│   │   └── tools/
│   │       └── page.tsx                       📝 MODIFY
│   ├── category/
│   │   └── convert-case-tools/
│   │       └── page.tsx                       📝 MODIFY
│   └── ru/
│       └── category/
│           └── convert-case-tools/
│               └── page.tsx                   📝 MODIFY
└── app/
    └── sitemap.ts                             📝 VERIFY
```

---

## Part G: Tool Count Updates

### Current Counts:
- **Convert Case Tools**: 7 tools
- **Total Tools**: 73 tools

### After Implementation:
- **Convert Case Tools**: 8 tools ✅
- **Total Tools**: 74 tools ✅

### Components to Update:
1. ✅ `/tools/` page (EN) - Already shows total dynamically
2. ✅ `/ru/tools/` page (RU) - Already shows total dynamically
3. ✅ `toolMetadata.ts` - Update category schema count (line 652)
4. ✅ Category pages - Add new tool card

**Note**: The AllToolsPage component calculates totals dynamically, so no hardcoded counts to update there.

---

## Part H: Testing Checklist

### Functionality Tests:
- [ ] Text → kebab-case conversion
- [ ] Text → camelCase conversion
- [ ] Text → snake_case conversion
- [ ] JSON key transformation (flat object)
- [ ] JSON key transformation (nested object)
- [ ] JSON key transformation (arrays)
- [ ] CSV header conversion
- [ ] File upload (.txt)
- [ ] File upload (.json)
- [ ] JSONPath exclusions
- [ ] Acronym preservation toggle
- [ ] Digit boundary detection toggle
- [ ] Lowercase output toggle
- [ ] Pretty print JSON toggle
- [ ] All shortcut buttons
- [ ] Copy to clipboard
- [ ] Download as .txt
- [ ] Download as .json
- [ ] Download as .csv
- [ ] Clear functionality

### UI/UX Tests:
- [ ] Mobile responsive layout
- [ ] Desktop layout (2x2 grid)
- [ ] Input type selector works
- [ ] Target case selector works
- [ ] Options accordion expands/collapses
- [ ] Validation errors display properly
- [ ] Success/error states for CTA button
- [ ] Loading state during processing
- [ ] Helper text displays
- [ ] Status messages for screen readers

### Integration Tests:
- [ ] Tool appears in Header navigation (EN + RU)
- [ ] Tool appears in Footer (EN + RU)
- [ ] Tool appears in category page (EN + RU)
- [ ] Tool appears in /tools/ page (EN + RU)
- [ ] Tool count updated correctly
- [ ] SEO content renders below tool
- [ ] Metadata title/description correct
- [ ] Open Graph tags present
- [ ] Canonical URL correct
- [ ] Hreflang tags present (EN ↔ RU)

### i18n Tests:
- [ ] All English strings display correctly
- [ ] All Russian strings display correctly
- [ ] Language switching works
- [ ] SEO content in correct language
- [ ] Breadcrumbs in correct language

### Build Tests:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Build completes successfully
- [ ] Sitemap includes new routes
- [ ] No console errors in browser
- [ ] Lighthouse score > 90

---

## Part I: Risk Assessment & Mitigation

### Potential Risks:

1. **Complex Conversion Logic**
   - **Risk**: Edge cases in bidirectional conversion
   - **Mitigation**: Comprehensive unit tests, reuse proven patterns from existing converters

2. **Performance with Large JSON**
   - **Risk**: Browser freeze with very large files
   - **Mitigation**: Web Worker implementation (already planned in existing converters)

3. **i18n Completeness**
   - **Risk**: Missing translations
   - **Mitigation**: Systematic checklist, review both language files

4. **Shortcut Button Complexity**
   - **Risk**: Too many options confuse users
   - **Mitigation**: Start with 4 most common shortcuts, add more based on feedback

5. **Integration Conflicts**
   - **Risk**: Breaking existing tools during modification
   - **Mitigation**: Test thoroughly after each modification, use version control

---

## Part J: Success Criteria

### Must Have (MVP):
- ✅ All conversion modes working (kebab ↔ camel ↔ snake)
- ✅ JSON and CSV support
- ✅ Full i18n (EN + RU)
- ✅ Integrated into category and navigation
- ✅ SEO content and metadata
- ✅ Build passes without errors

### Should Have:
- ✅ Shortcut buttons
- ✅ File upload
- ✅ Acronym preservation
- ✅ JSONPath exclusions
- ✅ Responsive design

### Nice to Have (Future):
- ⏭️ Web Worker for large files
- ⏭️ Batch conversion mode
- ⏭️ Conversion history
- ⏭️ Custom shortcut configuration

---

## Part K: Timeline Estimate

**Total Estimated Time**: 3-5 days

| Phase | Task | Time Estimate |
|-------|------|---------------|
| 1 | Core Logic Implementation | 8 hours |
| 2 | Component Development | 8 hours |
| 3 | Page Setup | 2 hours |
| 4 | Translation | 4 hours |
| 5 | Integration | 4 hours |
| 6 | Testing & QA | 6 hours |
| 7 | Build & Deploy | 2 hours |
| **Total** | | **34 hours** |

---

## Conclusion

This roadmap provides a comprehensive, step-by-step plan for implementing the Kebab Case Converter tool. The approach prioritizes:

1. **Modularity**: Reusing existing components wherever possible
2. **Consistency**: Following established patterns from CamelCaseConverter and SnakeCaseConverter
3. **Completeness**: Full i18n, SEO, and metadata support
4. **Quality**: Comprehensive testing checklist
5. **Maintainability**: Clear file organization and documentation

**Ready for Implementation Approval** ✅

---

*Last Updated: 2025-10-31*
*Document Version: 1.0*
