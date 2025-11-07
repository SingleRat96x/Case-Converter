import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category
const tools = [
  { id: "image-cropper", title: "Bild-Zuschneidewerkzeug", description: "Schneiden Sie Bilder auf genaue Größen zu", icon: "✂️", href: "/de/tools/image-cropper" },
  { id: "image-resizer", title: "Bildgrößenänderung", description: "Ändern Sie die Bildgröße", icon: "📏", href: "/de/tools/image-resizer" },
  { id: "image-to-text", title: "Bild zu Text (OCR)", description: "Extrahieren Sie Text aus Bildern", icon: "📝", href: "/de/tools/image-to-text" },
  { id: "jpg-to-png", title: "JPG zu PNG", description: "Konvertieren Sie JPEG in PNG", icon: "🔄", href: "/de/tools/jpg-to-png" },
  { id: "jpg-to-webp", title: "JPG zu WebP", description: "Konvertieren Sie JPEG in WebP", icon: "🔄", href: "/de/tools/jpg-to-webp" },
  { id: "png-to-jpg", title: "PNG zu JPG", description: "Konvertieren Sie PNG in JPEG", icon: "🔄", href: "/de/tools/png-to-jpg" },
  { id: "png-to-webp", title: "PNG zu WebP", description: "Konvertieren Sie PNG in WebP", icon: "🔄", href: "/de/tools/png-to-webp" },
  { id: "webp-to-jpg", title: "WebP zu JPG", description: "Konvertieren Sie WebP in JPEG", icon: "🔄", href: "/de/tools/webp-to-jpg" },
  { id: "webp-to-png", title: "WebP zu PNG", description: "Konvertieren Sie WebP in PNG", icon: "🔄", href: "/de/tools/webp-to-png" }
];

export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('image-tools', {
    locale: 'de',
    pathname: '/de/category/image-tools'
  });
}

export default function CategoryPageDE() {
  return (
    <CategoryPage
      categorySlug="image-tools"
      tools={tools}
    />
  );
}
