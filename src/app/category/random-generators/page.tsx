import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with proper icons and descriptions
const randomGeneratorTools = [
  {
    id: 'random-number',
    title: 'Random Number Generator',
    description: 'Generate random integers, decimals, and numbers within custom ranges',
    icon: '🔢',
    href: '/tools/random-number'
  },
  {
    id: 'random-letter',
    title: 'Random Letter Generator', 
    description: 'Generate random letters, alphabets, and character sequences',
    icon: '🔤',
    href: '/tools/random-letter'
  },
  {
    id: 'random-date',
    title: 'Random Date Generator',
    description: 'Generate random dates within specified ranges and formats',
    icon: '📅',
    href: '/tools/random-date'
  },
  {
    id: 'random-month',
    title: 'Random Month Generator',
    description: 'Generate random months with full names, abbreviations, and numbers',
    icon: '📆',
    href: '/tools/random-month'
  },
  {
    id: 'random-ip',
    title: 'Random IP Generator',
    description: 'Generate random IPv4 and IPv6 addresses for network testing',
    icon: '🌐',
    href: '/tools/random-ip'
  },
  {
    id: 'random-choice',
    title: 'Random Choice Picker',
    description: 'Pick random selections from custom lists for decision making',
    icon: '🎲',
    href: '/tools/random-choice'
  },
  {
    id: 'password-generator',
    title: 'Secure Password Generator',
    description: 'Generate cryptographically secure passwords with custom requirements',
    icon: '🔐',
    href: '/tools/password-generator'
  },
  {
    id: 'uuid-generator',
    title: 'UUID Generator',
    description: 'Generate unique identifiers v1 and v4 for applications and databases',
    icon: '🔑',
    href: '/tools/uuid-generator'
  }
];

// Generate metadata using the modular system
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('random-generators', {
    locale: 'en',
    pathname: '/category/random-generators'
  });
}

export default function RandomGeneratorsCategory() {
  return (
    <CategoryPage
      categorySlug="random-generators"
      tools={randomGeneratorTools}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'All Tools', href: '/tools' },
        { label: 'Random Generators' }
      ]}
    />
  );
}