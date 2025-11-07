import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category
const tools = [
  { id: "base64-encoder-decoder", title: "Base64 Encoder/Decoder", description: "Kodieren und dekodieren Sie Base64-Daten", icon: "🔐", href: "/de/tools/base64-encoder-decoder" },
  { id: "binary-code-translator", title: "Binärcode-Übersetzer", description: "Konvertieren Sie Text in Binärcode", icon: "01", href: "/de/tools/binary-code-translator" },
  { id: "hex-to-text", title: "Hex zu Text", description: "Konvertieren Sie hexadezimale Werte in Text", icon: "#️⃣", href: "/de/tools/hex-to-text" },
  { id: "morse-code", title: "Morse-Code", description: "Übersetzen Sie Text in Morse-Code", icon: "📟", href: "/de/tools/morse-code" },
  { id: "caesar-cipher", title: "Caesar-Verschlüsselung", description: "Verschlüsseln Sie Text mit Caesar-Cipher", icon: "🔒", href: "/de/tools/caesar-cipher" },
  { id: "rot13", title: "ROT13", description: "Kodieren Sie Text mit ROT13", icon: "🔄", href: "/de/tools/rot13" },
  { id: "csv-to-json", title: "CSV zu JSON", description: "Konvertieren Sie CSV zu JSON", icon: "📊", href: "/de/tools/csv-to-json" },
  { id: "json-stringify", title: "JSON Stringify", description: "Konvertieren Sie JSON-Objekte in Strings", icon: "{ }", href: "/de/tools/json-stringify" },
  { id: "json-formatter", title: "JSON-Formatierer", description: "Formatieren und validieren Sie JSON", icon: "✨", href: "/de/tools/json-formatter" },
  { id: "url-converter", title: "URL-Konverter", description: "Kodieren und dekodieren Sie URLs", icon: "🔗", href: "/de/tools/url-converter" },
  { id: "utf8-converter", title: "UTF-8-Konverter", description: "Konvertieren Sie Zeichenkodierungen", icon: "🌐", href: "/de/tools/utf8-converter" },
  { id: "slugify-url", title: "URL Slugify", description: "Erstellen Sie SEO-freundliche URL-Slugs", icon: "🔗", href: "/de/tools/slugify-url" }
];

export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('code-data-translation', {
    locale: 'de',
    pathname: '/de/category/code-data-translation'
  });
}

export default function CategoryPageDE() {
  return (
    <CategoryPage
      categorySlug="code-data-translation"
      tools={tools}
    />
  );
}
