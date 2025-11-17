import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category
const tools = [
  { id: "online-notepad", title: "Online-Notizblock", description: "Einfacher Online-Texteditor", icon: "📝", href: "/de/tools/online-notepad" },
  { id: "number-sorter", title: "Zahlensortierer", description: "Sortieren Sie Zahlen", icon: "🔢", href: "/de/tools/number-sorter" },
  { id: "ascii-art-generator", title: "ASCII-Kunst-Generator", description: "Erstellen Sie ASCII-Kunst", icon: "🎨", href: "/de/tools/ascii-art-generator" },
  { id: "nato-phonetic", title: "NATO-Phonetik", description: "NATO-phonetische Buchstabierung", icon: "✈️", href: "/de/tools/nato-phonetic" },
  { id: "md5-hash", title: "MD5-Hash", description: "Generieren Sie MD5-Hashes", icon: "#️⃣", href: "/de/tools/md5-hash" },
  { id: "sha1-hash-generator", title: "SHA1-Hash", description: "Erstellen Sie SHA1-Hashes", icon: "🔐", href: "/de/tools/sha1-hash-generator" },
  { id: "phonetic-spelling", title: "Phonetische Rechtschreibung", description: "Phonetische Textkonvertierung", icon: "🔤", href: "/de/tools/phonetic-spelling" },
  { id: "pig-latin", title: "Pig Latin", description: "Übersetzen Sie in Pig Latin", icon: "🐷", href: "/de/tools/pig-latin" },
  { id: "roman-numeral-date", title: "Römische Zahlendatum", description: "Römische Ziffern-Daten", icon: "🏛️", href: "/de/tools/roman-numeral-date" },
  { id: "utm-builder", title: "UTM-Builder", description: "UTM-Parameter erstellen", icon: "🔗", href: "/de/tools/utm-builder" }
];

export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('misc-tools', {
    locale: 'de',
    pathname: '/de/category/misc-tools'
  });
}

export default function CategoryPageDE() {
  return (
    <CategoryPage
      categorySlug="misc-tools"
      tools={tools}
    />
  );
}
