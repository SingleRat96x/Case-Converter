import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with proper icons and descriptions
const textModificationTools = [
  {
    id: 'bold-text',
    title: 'Bold Text Generator',
    description: 'Convert text to bold Unicode characters that work everywhere',
    icon: '𝐁',
    href: '/tools/bold-text'
  },
  {
    id: 'italic-text',
    title: 'Italic Text Generator', 
    description: 'Transform text into italic Unicode format for emphasis',
    icon: '𝘐',
    href: '/tools/italic-text'
  },
  {
    id: 'subscript-text',
    title: 'Subscript Text Generator',
    description: 'Create subscript text for mathematical and scientific notation',
    icon: 'X₂',
    href: '/tools/subscript-text'
  },
  {
    id: 'big-text',
    title: 'Big Text Generator',
    description: 'Generate large, attention-grabbing text for headers and titles',
    icon: '🔤',
    href: '/tools/big-text'
  },
  {
    id: 'bubble-text',
    title: 'Bubble Text Generator',
    description: 'Create decorative bubble-style text for social media posts',
    icon: '🫧',
    href: '/tools/bubble-text'
  },
  {
    id: 'cursed-text',
    title: 'Cursed Text Generator',
    description: 'Generate glitchy, distorted text with special Unicode characters',
    icon: '👾',
    href: '/tools/cursed-text'
  },
  {
    id: 'mirror-text',
    title: 'Mirror Text Generator',
    description: 'Flip and reverse text horizontally for creative effects',
    icon: '🪞',
    href: '/tools/mirror-text'
  },
  {
    id: 'invisible-text',
    title: 'Invisible Text Generator',
    description: 'Create invisible characters for spacing and formatting tricks',
    icon: '👻',
    href: '/tools/invisible-text'
  },
  {
    id: 'repeat-text',
    title: 'Text Repeater',
    description: 'Repeat text multiple times with custom separators',
    icon: '🔁',
    href: '/tools/repeat-text'
  },
  {
    id: 'text-replace',
    title: 'Find and Replace Text',
    description: 'Advanced text replacement with case sensitivity and pattern matching',
    icon: '🔍',
    href: '/tools/text-replace'
  },
  {
    id: 'remove-line-breaks',
    title: 'Remove Line Breaks',
    description: 'Strip line breaks and unwanted whitespace from text',
    icon: '📏',
    href: '/tools/remove-line-breaks'
  },
  {
    id: 'remove-text-formatting',
    title: 'Remove Text Formatting',
    description: 'Convert formatted text to plain text, removing all styling',
    icon: '🧹',
    href: '/tools/remove-text-formatting'
  },
  {
    id: 'duplicate-line-remover',
    title: 'Remove Duplicate Lines',
    description: 'Eliminate duplicate lines and clean up text content',
    icon: '🗑️',
    href: '/tools/duplicate-line-remover'
  },
  {
    id: 'sort-words',
    title: 'Word Sorter',
    description: 'Sort words alphabetically or numerically with custom options',
    icon: '📊',
    href: '/tools/sort-words'
  },
  {
    id: 'plain-text',
    title: 'Convert to Plain Text',
    description: 'Strip all formatting and convert text to plain format',
    icon: '📄',
    href: '/tools/plain-text'
  }
];

// Generate metadata using the modular system
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('text-modification-formatting', {
    locale: 'en',
    pathname: '/category/text-modification-formatting'
  });
}

export default function TextModificationFormattingCategory() {
  return (
    <CategoryPage
      categorySlug="text-modification-formatting"
      tools={textModificationTools}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'All Tools', href: '/tools' },
        { label: 'Text Modification & Formatting' }
      ]}
    />
  );
}