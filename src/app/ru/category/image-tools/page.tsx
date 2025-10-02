import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with Russian hrefs and descriptions
const imageTools = [
  {
    id: 'image-cropper',
    title: 'Обрезчик Изображений',
    description: 'Обрезайте изображения с точностью, используя пользовательские соотношения сторон и инструменты выделения',
    icon: '✂️',
    href: '/ru/tools/image-cropper'
  },
  {
    id: 'image-resizer',
    title: 'Изменение Размера Изображений', 
    description: 'Изменяйте размер изображений до определенных размеров, сохраняя качество и соотношение сторон',
    icon: '📏',
    href: '/ru/tools/image-resizer'
  },
  {
    id: 'image-to-text',
    title: 'Извлечение Текста из Изображений OCR',
    description: 'Извлекайте текст из изображений с использованием передового оптического распознавания символов',
    icon: '📄',
    href: '/ru/tools/image-to-text'
  },
  {
    id: 'jpg-to-png',
    title: 'Конвертер JPG в PNG',
    description: 'Конвертируйте JPG изображения в PNG формат с поддержкой прозрачности',
    icon: '🔄',
    href: '/ru/tools/jpg-to-png'
  },
  {
    id: 'png-to-jpg',
    title: 'Конвертер PNG в JPG',
    description: 'Конвертируйте PNG изображения в JPG формат с настраиваемыми настройками качества',
    icon: '🔄',
    href: '/ru/tools/png-to-jpg'
  },
  {
    id: 'webp-to-jpg',
    title: 'Конвертер WebP в JPG',
    description: 'Конвертируйте современные WebP изображения в широко совместимый JPG формат',
    icon: '🔄',
    href: '/ru/tools/webp-to-jpg'
  },
  {
    id: 'webp-to-png',
    title: 'Конвертер WebP в PNG',
    description: 'Конвертируйте WebP изображения в PNG формат, сохраняя прозрачность',
    icon: '🔄',
    href: '/ru/tools/webp-to-png'
  },
  {
    id: 'jpg-to-webp',
    title: 'Конвертер JPG в WebP',
    description: 'Конвертируйте JPG изображения в современный WebP формат для лучшего сжатия',
    icon: '🔄',
    href: '/ru/tools/jpg-to-webp'
  },
  {
    id: 'png-to-webp',
    title: 'Конвертер PNG в WebP',
    description: 'Конвертируйте PNG изображения в WebP формат с превосходным сжатием и качеством',
    icon: '🔄',
    href: '/ru/tools/png-to-webp'
  }
];

// Generate metadata using the modular system for Russian locale
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('image-tools', {
    locale: 'ru',
    pathname: '/ru/category/image-tools'
  });
}

export default function ImageToolsCategory() {
  return (
    <CategoryPage
      categorySlug="image-tools"
      tools={imageTools}
      breadcrumbs={[
        { label: 'Главная', href: '/ru' },
        { label: 'Все Инструменты', href: '/ru/tools' },
        { label: 'Инструменты Изображений' }
      ]}
    />
  );
}