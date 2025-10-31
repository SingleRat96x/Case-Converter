import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with Russian hrefs and descriptions
const textModificationTools = [
  {
    id: 'bold-text',
    title: 'Генератор Жирного Текста',
    description: 'Конвертируйте текст в жирные Unicode символы, которые работают везде',
    icon: '𝐁',
    href: '/ru/tools/bold-text'
  },
  {
    id: 'italic-text',
    title: 'Генератор Курсивного Текста', 
    description: 'Преобразуйте текст в курсивный Unicode формат для выделения',
    icon: '𝘐',
    href: '/ru/tools/italic-text'
  },
  {
    id: 'subscript-text',
    title: 'Генератор Подстрочного Текста',
    description: 'Создавайте подстрочный текст для математических и научных обозначений',
    icon: 'X₂',
    href: '/ru/tools/subscript-text'
  },
  {
    id: 'big-text',
    title: 'Генератор Большого Текста',
    description: 'Генерируйте большой, привлекающий внимание текст для заголовков и названий',
    icon: '🔤',
    href: '/ru/tools/big-text'
  },
  {
    id: 'bubble-text',
    title: 'Генератор Пузырькового Текста',
    description: 'Создавайте декоративный пузырьковый текст для постов в социальных сетях',
    icon: '🫧',
    href: '/ru/tools/bubble-text'
  },
  {
    id: 'cursed-text',
    title: 'Генератор Проклятого Текста',
    description: 'Генерируйте глючный, искаженный текст со специальными Unicode символами',
    icon: '👾',
    href: '/ru/tools/cursed-text'
  },
  {
    id: 'mirror-text',
    title: 'Генератор Зеркального Текста',
    description: 'Переворачивайте и отражайте текст горизонтально для творческих эффектов',
    icon: '🪞',
    href: '/ru/tools/mirror-text'
  },
  {
    id: 'invisible-text',
    title: 'Генератор Невидимого Текста',
    description: 'Создавайте невидимые символы для интервалов и форматирования',
    icon: '👻',
    href: '/ru/tools/invisible-text'
  },
  {
    id: 'repeat-text',
    title: 'Повторитель Текста',
    description: 'Повторяйте текст несколько раз с пользовательскими разделителями',
    icon: '🔁',
    href: '/ru/tools/repeat-text'
  },
  {
    id: 'text-replace',
    title: 'Найти и Заменить Текст',
    description: 'Расширенная замена текста с чувствительностью к регистру и сопоставлением шаблонов',
    icon: '🔍',
    href: '/ru/tools/text-replace'
  },
  {
    id: 'remove-line-breaks',
    title: 'Удалить Переводы Строк',
    description: 'Убирайте переводы строк и нежелательные пробелы из текста',
    icon: '📏',
    href: '/ru/tools/remove-line-breaks'
  },
  {
    id: 'remove-text-formatting',
    title: 'Удалить Форматирование Текста',
    description: 'Конвертируйте форматированный текст в простой текст, удаляя все стили',
    icon: '🧹',
    href: '/ru/tools/remove-text-formatting'
  },
  {
    id: 'duplicate-line-remover',
    title: 'Удалить Дублирующиеся Строки',
    description: 'Устраняйте дублирующиеся строки и очищайте текстовый контент',
    icon: '🗑️',
    href: '/ru/tools/duplicate-line-remover'
  },
  {
    id: 'sort-words',
    title: 'Сортировщик Слов',
    description: 'Сортируйте слова по алфавиту или численно с пользовательскими опциями',
    icon: '📊',
    href: '/ru/tools/sort-words'
  },
  {
    id: 'plain-text',
    title: 'Конвертировать в Простой Текст',
    description: 'Убирайте все форматирование и конвертируйте текст в простой формат',
    icon: '📄',
    href: '/ru/tools/plain-text'
  },
  {
    id: 'extract-emails-from-text',
    title: 'Извлечение Email из Текста',
    description: 'Извлекайте и проверяйте email адреса из любого текста с расширенной фильтрацией',
    icon: '📧',
    href: '/ru/tools/extract-emails-from-text'
  },
  {
    id: 'remove-punctuation',
    title: 'Удалить Пунктуацию',
    description: 'Убирайте знаки пунктуации сохраняя слова и пользовательские символы',
    icon: '🧼',
    href: '/ru/tools/remove-punctuation'
  }
];

// Generate metadata using the modular system for Russian locale
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('text-modification-formatting', {
    locale: 'ru',
    pathname: '/ru/category/text-modification-formatting'
  });
}

export default function TextModificationFormattingCategory() {
  return (
    <CategoryPage
      categorySlug="text-modification-formatting"
      tools={textModificationTools}
      breadcrumbs={[
        { label: 'Главная', href: '/ru' },
        { label: 'Все Инструменты', href: '/ru/tools' },
        { label: 'Изменение и Форматирование Текста' }
      ]}
    />
  );
}