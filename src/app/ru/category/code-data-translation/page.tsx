import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with Russian hrefs and descriptions
const codeDataTranslationTools = [
  {
    id: 'base64-encoder-decoder',
    title: 'Base64 Кодировщик/Декодировщик',
    description: 'Кодируйте и декодируйте текст и файлы в/из формата Base64 для передачи данных',
    icon: '🔐',
    href: '/ru/tools/base64-encoder-decoder'
  },
  {
    id: 'binary-code-translator',
    title: 'Переводчик Двоичного Кода', 
    description: 'Конвертируйте текст в двоичный код и двоичный код в текст с поддержкой ASCII',
    icon: '💾',
    href: '/ru/tools/binary-code-translator'
  },
  {
    id: 'hex-to-text',
    title: 'Конвертер Hex в Текст',
    description: 'Конвертируйте шестнадцатеричные значения в текст и текст в hex формат',
    icon: '🔢',
    href: '/ru/tools/hex-to-text'
  },
  {
    id: 'morse-code',
    title: 'Переводчик Азбуки Морзе',
    description: 'Переводите текст в азбуку Морзе и азбуку Морзе обратно в текст',
    icon: '📡',
    href: '/ru/tools/morse-code'
  },
  {
    id: 'caesar-cipher',
    title: 'Кодировщик Шифра Цезаря',
    description: 'Кодируйте и декодируйте текст с использованием шифра Цезаря с пользовательскими значениями сдвига',
    icon: '🏛️',
    href: '/ru/tools/caesar-cipher'
  },
  {
    id: 'rot13',
    title: 'ROT13 Кодировщик/Декодировщик',
    description: 'Применяйте ROT13 кодирование и декодирование для простого скрытия текста',
    icon: '🔄',
    href: '/ru/tools/rot13'
  },
  {
    id: 'csv-to-json',
    title: 'Конвертер CSV в JSON',
    description: 'Конвертируйте CSV данные в JSON формат с пользовательскими разделителями и опциями',
    icon: '📊',
    href: '/ru/tools/csv-to-json'
  },
  {
    id: 'json-stringify',
    title: 'Инструмент JSON Stringify',
    description: 'Форматируйте, минифицируйте и stringify JSON объекты с валидацией',
    icon: '📋',
    href: '/ru/tools/json-stringify'
  },
  {
    id: 'utf8-converter',
    title: 'UTF-8 Конвертер',
    description: 'Кодируйте и декодируйте UTF-8 текст с поддержкой специальных символов',
    icon: '🌐',
    href: '/ru/tools/utf8-converter'
  },
  {
    id: 'url-converter',
    title: 'URL Кодировщик/Декодировщик',
    description: 'Кодируйте и декодируйте URL для веб-разработки и интеграции API',
    icon: '🔗',
    href: '/ru/tools/url-converter'
  },
  {
    id: 'slugify-url',
    title: 'Генератор URL Слагов',
    description: 'Генерируйте SEO-дружественные URL слаги из текста для веб-контента',
    icon: '🎯',
    href: '/ru/tools/slugify-url'
  }
];

// Generate metadata using the modular system for Russian locale
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('code-data-translation', {
    locale: 'ru',
    pathname: '/ru/category/code-data-translation'
  });
}

export default function CodeDataTranslationCategory() {
  return (
    <CategoryPage
      categorySlug="code-data-translation"
      tools={codeDataTranslationTools}
      breadcrumbs={[
        { label: 'Главная', href: '/ru' },
        { label: 'Все Инструменты', href: '/ru/tools' },
        { label: 'Перевод Кода и Данных' }
      ]}
    />
  );
}