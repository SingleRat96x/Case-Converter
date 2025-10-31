import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with proper icons and descriptions
const codeDataTranslationTools = [
  {
    id: 'base64-encoder-decoder',
    title: 'Base64 Encoder/Decoder',
    description: 'Encode and decode text and files to/from Base64 format for data transmission',
    icon: '🔐',
    href: '/tools/base64-encoder-decoder'
  },
  {
    id: 'binary-code-translator',
    title: 'Binary Code Translator', 
    description: 'Convert text to binary code and binary to text with ASCII support',
    icon: '💾',
    href: '/tools/binary-code-translator'
  },
  {
    id: 'hex-to-text',
    title: 'Hex to Text Converter',
    description: 'Convert hexadecimal values to text and text to hex format',
    icon: '🔢',
    href: '/tools/hex-to-text'
  },
  {
    id: 'morse-code',
    title: 'Morse Code Translator',
    description: 'Translate text to Morse code and Morse code back to text',
    icon: '📡',
    href: '/tools/morse-code'
  },
  {
    id: 'caesar-cipher',
    title: 'Caesar Cipher Encoder',
    description: 'Encode and decode text using Caesar cipher with custom shift values',
    icon: '🏛️',
    href: '/tools/caesar-cipher'
  },
  {
    id: 'rot13',
    title: 'ROT13 Encoder/Decoder',
    description: 'Apply ROT13 encoding and decoding for simple text obfuscation',
    icon: '🔄',
    href: '/tools/rot13'
  },
  {
    id: 'csv-to-json',
    title: 'CSV to JSON Converter',
    description: 'Convert CSV data to JSON format with custom delimiters and options',
    icon: '📊',
    href: '/tools/csv-to-json'
  },
  {
    id: 'json-stringify',
    title: 'JSON Stringify Tool',
    description: 'Format, minify, and stringify JSON objects with validation',
    icon: '📋',
    href: '/tools/json-stringify'
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter & Validator',
    description: 'Format, validate, and explore JSON with syntax highlighting and tree view',
    icon: '✨',
    href: '/tools/json-formatter'
  },
  {
    id: 'utf8-converter',
    title: 'UTF-8 Converter',
    description: 'Encode and decode UTF-8 text with support for special characters',
    icon: '🌐',
    href: '/tools/utf8-converter'
  },
  {
    id: 'url-converter',
    title: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs for web development and API integration',
    icon: '🔗',
    href: '/tools/url-converter'
  },
  {
    id: 'slugify-url',
    title: 'URL Slug Generator',
    description: 'Generate SEO-friendly URL slugs from text for web content',
    icon: '🎯',
    href: '/tools/slugify-url'
  }
];

// Generate metadata using the modular system
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('code-data-translation', {
    locale: 'en',
    pathname: '/category/code-data-translation'
  });
}

export default function CodeDataTranslationCategory() {
  return (
    <CategoryPage
      categorySlug="code-data-translation"
      tools={codeDataTranslationTools}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'All Tools', href: '/tools' },
        { label: 'Code & Data Translation' }
      ]}
    />
  );
}