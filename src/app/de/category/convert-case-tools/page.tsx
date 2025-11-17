import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category
const tools = [
  { id: "uppercase", title: "GROSSBUCHSTABEN", description: "Konvertieren Sie Text in GROSSBUCHSTABEN", icon: "🔠", href: "/de/tools/uppercase" },
  { id: "lowercase", title: "kleinbuchstaben", description: "Konvertieren Sie Text in kleinbuchstaben", icon: "🔡", href: "/de/tools/lowercase" },
  { id: "title-case", title: "Titel-Fall", description: "Konvertieren Sie Text in Titel-Fall", icon: "📰", href: "/de/tools/title-case" },
  { id: "sentence-case", title: "Satzfall", description: "Konvertieren Sie Text in Satzfall", icon: "📝", href: "/de/tools/sentence-case" },
  { id: "alternating-case", title: "AbWeChSlUnGsfall", description: "Erstellen Sie abwechselnden Fall-Text", icon: "🔄", href: "/de/tools/alternating-case" },
  { id: "camel-case-converter", title: "camelCase", description: "Konvertieren Sie Text in camelCase", icon: "🐫", href: "/de/tools/camel-case-converter" },
  { id: "snake-case-converter", title: "snake_case", description: "Konvertieren Sie Text in snake_case", icon: "🐍", href: "/de/tools/snake-case-converter" },
  { id: "kebab-case-converter", title: "kebab-case", description: "Konvertieren Sie Text in kebab-case", icon: "🔗", href: "/de/tools/kebab-case-converter" }
];

export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('convert-case-tools', {
    locale: 'de',
    pathname: '/de/category/convert-case-tools'
  });
}

export default function CategoryPageDE() {
  return (
    <CategoryPage
      categorySlug="convert-case-tools"
      tools={tools}
    />
  );
}
