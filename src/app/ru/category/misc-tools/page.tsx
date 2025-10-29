import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with Russian hrefs and descriptions
const miscTools = [
  {
    id: 'online-notepad',
    title: 'Онлайн Блокнот',
    description: 'Простой и эффективный веб-блокнот для быстрого создания заметок и редактирования текста',
    icon: '📝',
    href: '/ru/tools/online-notepad'
  },
  {
    id: 'ascii-art-generator',
    title: 'Генератор ASCII Арт', 
    description: 'Создавайте потрясающее ASCII искусство из текста с множественными стилями шрифтов и опциями настройки',
    icon: '🎨',
    href: '/ru/tools/ascii-art-generator'
  },
  {
    id: 'nato-phonetic',
    title: 'Фонетический Алфавит НАТО',
    description: 'Конвертируйте текст в фонетический алфавит НАТО для четкой радио и телефонной связи',
    icon: '📻',
    href: '/ru/tools/nato-phonetic'
  },
  {
    id: 'phonetic-spelling',
    title: 'Генератор Фонетического Написания',
    description: 'Генерируйте фонетические написания для помощи с произношением и ясностью коммуникации',
    icon: '🗣️',
    href: '/ru/tools/phonetic-spelling'
  },
  {
    id: 'pig-latin',
    title: 'Переводчик Поросячьей Латыни',
    description: 'Конвертируйте текст в и из поросячьей латыни для забавной игры слов и образовательных целей',
    icon: '🐷',
    href: '/ru/tools/pig-latin'
  },
  {
    id: 'roman-numeral-date',
    title: 'Конвертер Дат в Римские Цифры',
    description: 'Конвертируйте современные даты в формат римских цифр для исторического и декоративного использования',
    icon: '🏛️',
    href: '/ru/tools/roman-numeral-date'
  },
  {
    id: 'number-sorter',
    title: 'Инструмент Сортировки Чисел',
    description: 'Сортируйте списки чисел в возрастающем или убывающем порядке с расширенными опциями',
    icon: '🔢',
    href: '/ru/tools/number-sorter'
  },
  {
    id: 'md5-hash',
    title: 'Генератор MD5 Хэш',
    description: 'Генерируйте MD5 хэши для проверки целостности данных и приложений безопасности',
    icon: '🔐',
    href: '/ru/tools/md5-hash'
  },
  {
    id: 'utm-builder',
    title: 'Конструктор UTM Параметров',
    description: 'Создавайте UTM параметры для маркетинговых кампаний и эффективно отслеживайте источники трафика',
    icon: '📈',
    href: '/ru/tools/utm-builder'
  },
  {
    id: 'extract-emails-from-pdf',
    title: 'Извлечение Email из PDF',
    description: 'Загружайте PDF файлы и извлекайте email адреса с расширенными возможностями фильтрации и проверки',
    icon: '📄',
    href: '/ru/tools/extract-emails-from-pdf'
  }
];

// Generate metadata using the modular system for Russian locale
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('misc-tools', {
    locale: 'ru',
    pathname: '/ru/category/misc-tools'
  });
}

export default function MiscToolsCategory() {
  return (
    <CategoryPage
      categorySlug="misc-tools"
      tools={miscTools}
      breadcrumbs={[
        { label: 'Главная', href: '/ru' },
        { label: 'Все Инструменты', href: '/ru/tools' },
        { label: 'Разные Инструменты' }
      ]}
    />
  );
}