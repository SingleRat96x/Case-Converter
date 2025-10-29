import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with proper icons and descriptions
const miscTools = [
  {
    id: 'online-notepad',
    title: 'Online Notepad',
    description: 'Simple and efficient web-based notepad for quick note-taking and text editing',
    icon: '📝',
    href: '/tools/online-notepad'
  },
  {
    id: 'ascii-art-generator',
    title: 'ASCII Art Generator', 
    description: 'Create stunning ASCII art from text with multiple font styles and customization options',
    icon: '🎨',
    href: '/tools/ascii-art-generator'
  },
  {
    id: 'nato-phonetic',
    title: 'NATO Phonetic Alphabet',
    description: 'Convert text to NATO phonetic alphabet for clear radio and telephone communication',
    icon: '📻',
    href: '/tools/nato-phonetic'
  },
  {
    id: 'phonetic-spelling',
    title: 'Phonetic Spelling Generator',
    description: 'Generate phonetic spellings to help with pronunciation and communication clarity',
    icon: '🗣️',
    href: '/tools/phonetic-spelling'
  },
  {
    id: 'pig-latin',
    title: 'Pig Latin Translator',
    description: 'Convert text to and from Pig Latin for fun wordplay and educational purposes',
    icon: '🐷',
    href: '/tools/pig-latin'
  },
  {
    id: 'roman-numeral-date',
    title: 'Roman Numeral Date Converter',
    description: 'Convert modern dates to Roman numeral format for historical and decorative use',
    icon: '🏛️',
    href: '/tools/roman-numeral-date'
  },
  {
    id: 'number-sorter',
    title: 'Number Sorting Tool',
    description: 'Sort lists of numbers in ascending or descending order with advanced options',
    icon: '🔢',
    href: '/tools/number-sorter'
  },
  {
    id: 'md5-hash',
    title: 'MD5 Hash Generator',
    description: 'Generate MD5 hashes for data integrity verification and security applications',
    icon: '🔐',
    href: '/tools/md5-hash'
  },
  {
    id: 'utm-builder',
    title: 'UTM Parameter Builder',
    description: 'Build UTM parameters for marketing campaigns and track traffic sources effectively',
    icon: '📈',
    href: '/tools/utm-builder'
  },
  {
    id: 'extract-emails-from-pdf',
    title: 'Extract Emails from PDF',
    description: 'Upload PDF files and extract email addresses with advanced filtering and validation',
    icon: '📄',
    href: '/tools/extract-emails-from-pdf'
  }
];

// Generate metadata using the modular system
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('misc-tools', {
    locale: 'en',
    pathname: '/category/misc-tools'
  });
}

export default function MiscToolsCategory() {
  return (
    <CategoryPage
      categorySlug="misc-tools"
      tools={miscTools}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'All Tools', href: '/tools' },
        { label: 'Miscellaneous Tools' }
      ]}
    />
  );
}