import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category
const tools = [
  { id: "text-counter", title: "Textzähler", description: "Umfassender Zeichen-, Wort- und Zeilenzähler mit detaillierten Statistiken", icon: "📊", href: "/de/tools/text-counter" },
  { id: "word-frequency", title: "Wortfrequenz-Analysator", description: "Erweitertes Wortfrequenz-Analysetool zur Identifizierung von Mustern", icon: "📈", href: "/de/tools/word-frequency" },
  { id: "sentence-counter", title: "Satzzähler", description: "Professionelles Satzzählwerkzeug mit Strukturanalyse", icon: "📝", href: "/de/tools/sentence-counter" },
  { id: "extract-numbers", title: "Zahlen Extrahieren", description: "Extrahieren Sie alle Zahlen aus Text", icon: "🔢", href: "/de/tools/extract-numbers" },
  { id: "reading-time-estimator", title: "Lesezeit-Schätzer", description: "Schätzen Sie die Lesezeit für Text und Artikel", icon: "⏱️", href: "/de/tools/reading-time-estimator" }
];

export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('analysis-counter-tools', {
    locale: 'de',
    pathname: '/de/category/analysis-counter-tools'
  });
}

export default function CategoryPageDE() {
  return (
    <CategoryPage
      categorySlug="analysis-counter-tools"
      tools={tools}
    />
  );
}
