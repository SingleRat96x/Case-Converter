import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with Russian hrefs and descriptions
const convertCaseTools = [
  {
    id: 'uppercase',
    title: 'Конвертер ВЕРХНЕГО РЕГИСТРА',
    description: 'Конвертируйте весь текст в ВЕРХНИЙ РЕГИСТР мгновенно - идеально для заголовков, выделения и стандартизации',
    icon: '🔤',
    href: '/ru/tools/uppercase'
  },
  {
    id: 'lowercase',
    title: 'Конвертер нижнего регистра',
    description: 'Преобразуйте весь текст в нижний регистр - идеально для нормализации текста и создания единообразного вывода',
    icon: '🔡',
    href: '/ru/tools/lowercase'
  },
  {
    id: 'title-case',
    title: 'Конвертер Заглавного Регистра',
    description: 'Преобразуйте текст в правильный Заглавный Регистр с интеллектуальной капитализацией слов для заголовков',
    icon: '📐',
    href: '/ru/tools/title-case'
  },
  {
    id: 'sentence-case',
    title: 'Конвертер Регистра предложения',
    description: 'Преобразуйте текст в правильный регистр предложения с заглавной первой буквой - идеально для естественного форматирования',
    icon: '📝',
    href: '/ru/tools/sentence-case'
  },
  {
    id: 'alternating-case',
    title: 'Конвертер ЧеРеДуЮщЕгОсЯ регистра',
    description: 'Создавайте чередующийся текст для творческих эффектов и социальных сетей - чередование верхнего и нижнего регистра',
    icon: '🔄',
    href: '/ru/tools/alternating-case'
  },
  {
    id: 'alternating-case',
    title: 'Конвертер ЧеРеДуЮщЕгОсЯ регистра',
    description: 'Создавайте чередующийся текст для творческих эффектов и социальных сетей - чередование верхнего и нижнего регистра',
    icon: '🔄',
    href: '/ru/tools/alternating-case'
  },
  {
    id: 'camel-case-converter',
    title: 'Конвертер CamelCase',
    description: 'Преобразуйте текст и ключи JSON в camelCase или PascalCase - необходимо для JavaScript и программирования',
    icon: '🐫',
    href: '/ru/tools/camel-case-converter'
  },
  {
    id: 'snake-case-converter',
    title: 'Конвертер Snake Case',
    description: 'Преобразуйте текст в snake_case или UPPER_SNAKE_CASE - идеально для Python, баз данных и констант',
    icon: '🐍',
    href: '/ru/tools/snake-case-converter'
  }
];

// Generate metadata using the modular system for Russian locale
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('convert-case-tools', {
    locale: 'ru',
    pathname: '/ru/category/convert-case-tools'
  });
}

export default function ConvertCaseToolsCategory() {
  return (
    <CategoryPage
      categorySlug="convert-case-tools"
      tools={convertCaseTools}
      breadcrumbs={[
        { label: 'Главная', href: '/ru' },
        { label: 'Все Инструменты', href: '/ru/tools' },
        { label: 'Инструменты Конвертации Регистра' }
      ]}
    />
  );
}
