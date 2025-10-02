import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with Russian hrefs and descriptions
const analysisCounterTools = [
  {
    id: 'text-counter',
    title: 'Счетчик Текста',
    description: 'Комплексный счетчик символов, слов и строк с детальной статистикой и анализом форматирования',
    icon: '📊',
    href: '/ru/tools/text-counter'
  },
  {
    id: 'word-frequency',
    title: 'Анализатор Частоты Слов',
    description: 'Продвинутый инструмент анализа частоты слов для выявления паттернов, повторений и плотности ключевых слов',
    icon: '📈',
    href: '/ru/tools/word-frequency'
  },
  {
    id: 'sentence-counter',
    title: 'Счетчик Предложений',
    description: 'Профессиональный инструмент подсчета предложений с анализом структуры и метриками читаемости',
    icon: '📝',
    href: '/ru/tools/sentence-counter'
  }
];

// Generate metadata using the modular system for Russian locale
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('analysis-counter-tools', {
    locale: 'ru',
    pathname: '/ru/category/analysis-counter-tools'
  });
}

export default function AnalysisCounterToolsCategory() {
  return (
    <CategoryPage
      categorySlug="analysis-counter-tools"
      tools={analysisCounterTools}
      breadcrumbs={[
        { label: 'Главная', href: '/ru' },
        { label: 'Все Инструменты', href: '/ru/tools' },
        { label: 'Инструменты Анализа и Подсчета Текста' }
      ]}
    />
  );
}