import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category
const tools = [
  { id: "bold-text", title: "Fettschrift", description: "Fette Unicode-Zeichen", icon: "𝐁", href: "/de/tools/bold-text" },
  { id: "italic-text", title: "Kursivtext", description: "Kursive Unicode-Zeichen", icon: "𝘐", href: "/de/tools/italic-text" },
  { id: "subscript-text", title: "Tiefgestellt", description: "Tiefgestellte Zeichen", icon: "X₂", href: "/de/tools/subscript-text" },
  { id: "superscript-text", title: "Hochgestellt", description: "Hochgestellte Zeichen", icon: "X²", href: "/de/tools/superscript-text" },
  { id: "strikethrough-text", title: "Durchgestrichen", description: "Durchgestrichener Text", icon: "S̶", href: "/de/tools/strikethrough-text" },
  { id: "underline-text", title: "Unterstrichen", description: "Unterstrichener Text", icon: "U̲", href: "/de/tools/underline-text" },
  { id: "big-text", title: "Großer Text", description: "Großer, fetter Text", icon: "🔤", href: "/de/tools/big-text" },
  { id: "small-caps", title: "Kleine Kapitälchen", description: "Kleine Kapitälchen", icon: "ᴀʙᴄ", href: "/de/tools/small-caps" },
  { id: "bubble-text", title: "Blasentext", description: "Blasenförmiger Text", icon: "🫧", href: "/de/tools/bubble-text" },
  { id: "cursed-text", title: "Verfluchter Text", description: "Gruseliger Text-Effekt", icon: "👾", href: "/de/tools/cursed-text" },
  { id: "mirror-text", title: "Spiegeltext", description: "Gespiegelter Text", icon: "🪞", href: "/de/tools/mirror-text" },
  { id: "upside-down-text", title: "Kopfüber-Text", description: "Auf-dem-Kopf-Text", icon: "🙃", href: "/de/tools/upside-down-text" },
  { id: "invisible-text", title: "Unsichtbarer Text", description: "Unsichtbare Zeichen", icon: "👻", href: "/de/tools/invisible-text" },
  { id: "wide-text", title: "Breiter Text", description: "Vollbreiten-Zeichen", icon: "全角", href: "/de/tools/wide-text" },
  { id: "repeat-text", title: "Text Wiederholen", description: "Wiederholen Sie Text", icon: "🔁", href: "/de/tools/repeat-text" },
  { id: "text-replace", title: "Text Ersetzen", description: "Finden und ersetzen", icon: "🔄", href: "/de/tools/text-replace" },
  { id: "reverse-text", title: "Text Umkehren", description: "Kehren Sie Text um", icon: "◀️", href: "/de/tools/reverse-text" },
  { id: "remove-line-breaks", title: "Zeilenumbrüche Entfernen", description: "Entfernen Sie Zeilenumbrüche", icon: "📄", href: "/de/tools/remove-line-breaks" },
  { id: "remove-text-formatting", title: "Formatierung Entfernen", description: "Entfernen Sie alle Formatierung", icon: "🧹", href: "/de/tools/remove-text-formatting" },
  { id: "duplicate-line-remover", title: "Doppelte Zeilen Entfernen", description: "Entfernen Sie Duplikate", icon: "🔍", href: "/de/tools/duplicate-line-remover" },
  { id: "sort-lines", title: "Zeilen Sortieren", description: "Sortieren Sie Zeilen", icon: "↕️", href: "/de/tools/sort-lines" },
  { id: "sort-words", title: "Wörter Sortieren", description: "Sortieren Sie Wörter", icon: "📊", href: "/de/tools/sort-words" },
  { id: "plain-text", title: "Nur Text", description: "Konvertieren Sie zu reinem Text", icon: "📃", href: "/de/tools/plain-text" },
  { id: "remove-punctuation", title: "Satzzeichen Entfernen", description: "Entfernen Sie Satzzeichen", icon: "🧼", href: "/de/tools/remove-punctuation" },
  { id: "extract-emails-from-text", title: "E-Mails Extrahieren", description: "Extrahieren Sie E-Mails aus Text", icon: "📧", href: "/de/tools/extract-emails-from-text" },
  { id: "extract-emails-from-pdf", title: "E-Mails aus PDF", description: "Extrahieren Sie E-Mails aus PDF", icon: "📄", href: "/de/tools/extract-emails-from-pdf" },
  { id: "add-line-numbers-to-text", title: "Zeilennummern Hinzufügen", description: "Fügen Sie Zeilennummern hinzu", icon: "🔢", href: "/de/tools/add-line-numbers-to-text" },
  { id: "add-prefix-and-suffix-to-lines", title: "Präfix/Suffix Hinzufügen", description: "Fügen Sie Präfix und Suffix hinzu", icon: "🔗", href: "/de/tools/add-prefix-and-suffix-to-lines" }
];

export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('text-modification-formatting', {
    locale: 'de',
    pathname: '/de/category/text-modification-formatting'
  });
}

export default function CategoryPageDE() {
  return (
    <CategoryPage
      categorySlug="text-modification-formatting"
      tools={tools}
    />
  );
}
