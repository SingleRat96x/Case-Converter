import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with proper icons and descriptions
const convertCaseTools = [
  {
    id: 'uppercase',
    title: 'UPPERCASE Converter',
    description: 'Convert all text to UPPERCASE format instantly - perfect for headers, emphasis, and standardization',
    icon: '🔤',
    href: '/tools/uppercase'
  },
  {
    id: 'lowercase',
    title: 'lowercase Converter',
    description: 'Transform all text to lowercase format - ideal for normalizing text and creating consistent output',
    icon: '🔡',
    href: '/tools/lowercase'
  },
  {
    id: 'title-case',
    title: 'Title Case Converter',
    description: 'Convert text to proper Title Case format with intelligent word capitalization for headlines and titles',
    icon: '📐',
    href: '/tools/title-case'
  },
  {
    id: 'sentence-case',
    title: 'Sentence case Converter',
    description: 'Convert text to proper sentence case with first letter capitalized - perfect for natural text formatting',
    icon: '📝',
    href: '/tools/sentence-case'
  },
  {
    id: 'alternating-case',
    title: 'aLtErNaTiNg case Converter',
    description: 'Create alternating case text for creative effects and social media - alternates between upper and lowercase',
    icon: '🔄',
    href: '/tools/alternating-case'
  },
  {
    id: 'camel-case-converter',
    title: 'Camel Case Converter',
    description: 'Convert text and JSON keys to camelCase or PascalCase - essential for JavaScript and programming',
    icon: '🐫',
    href: '/tools/camel-case-converter'
  },
  {
    id: 'kebab-case-converter',
    title: 'Kebab Case Converter',
    description: 'Convert between kebab-case, camelCase, and snake_case - perfect for URLs, CSS, and file names',
    icon: '🔗',
    href: '/tools/kebab-case-converter'
  },
  {
    id: 'snake-case-converter',
    title: 'Snake Case Converter',
    description: 'Transform text to snake_case or UPPER_SNAKE_CASE - perfect for Python, databases, and constants',
    icon: '🐍',
    href: '/tools/snake-case-converter'
  }
];

// Generate metadata using the modular system
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('convert-case-tools', {
    locale: 'en',
    pathname: '/category/convert-case-tools'
  });
}

export default function ConvertCaseToolsCategory() {
  return (
    <CategoryPage
      categorySlug="convert-case-tools"
      tools={convertCaseTools}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'All Tools', href: '/tools' },
        { label: 'Convert Case Tools' }
      ]}
    />
  );
}
