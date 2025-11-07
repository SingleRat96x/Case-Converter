import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category
const tools = [
  { id: "random-number", title: "Zufallszahlen", description: "Generieren Sie Zufallszahlen", icon: "🎲", href: "/de/tools/random-number" },
  { id: "random-letter", title: "Zufallsbuchstaben", description: "Generieren Sie Zufallsbuchstaben", icon: "🔤", href: "/de/tools/random-letter" },
  { id: "random-date", title: "Zufallsdatum", description: "Generieren Sie Zufallsdaten", icon: "📅", href: "/de/tools/random-date" },
  { id: "random-month", title: "Zufallsmonat", description: "Generieren Sie Zufallsmonate", icon: "🗓️", href: "/de/tools/random-month" },
  { id: "random-ip", title: "Zufalls-IP", description: "Generieren Sie Zufalls-IP-Adressen", icon: "🌐", href: "/de/tools/random-ip" },
  { id: "random-choice", title: "Zufallsauswahl", description: "Zufällige Auswahl aus Listen", icon: "🎯", href: "/de/tools/random-choice" },
  { id: "password-generator", title: "Passwort-Generator", description: "Sichere Passwörter generieren", icon: "🔑", href: "/de/tools/password-generator" },
  { id: "uuid-generator", title: "UUID-Generator", description: "Generieren Sie eindeutige UUIDs", icon: "🆔", href: "/de/tools/uuid-generator" }
];

export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('random-generators', {
    locale: 'de',
    pathname: '/de/category/random-generators'
  });
}

export default function CategoryPageDE() {
  return (
    <CategoryPage
      categorySlug="random-generators"
      tools={tools}
    />
  );
}
