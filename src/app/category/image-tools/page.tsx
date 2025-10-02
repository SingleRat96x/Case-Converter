import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with proper icons and descriptions
const imageTools = [
  {
    id: 'image-cropper',
    title: 'Image Cropper',
    description: 'Crop images with precision using custom aspect ratios and selection tools',
    icon: '✂️',
    href: '/tools/image-cropper'
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer', 
    description: 'Resize images to specific dimensions while maintaining quality and aspect ratio',
    icon: '📏',
    href: '/tools/image-resizer'
  },
  {
    id: 'image-to-text',
    title: 'Image to Text OCR',
    description: 'Extract text from images using advanced optical character recognition',
    icon: '📄',
    href: '/tools/image-to-text'
  },
  {
    id: 'jpg-to-png',
    title: 'JPG to PNG Converter',
    description: 'Convert JPG images to PNG format with transparency support',
    icon: '🔄',
    href: '/tools/jpg-to-png'
  },
  {
    id: 'png-to-jpg',
    title: 'PNG to JPG Converter',
    description: 'Convert PNG images to JPG format with customizable quality settings',
    icon: '🔄',
    href: '/tools/png-to-jpg'
  },
  {
    id: 'webp-to-jpg',
    title: 'WebP to JPG Converter',
    description: 'Convert modern WebP images to widely compatible JPG format',
    icon: '🔄',
    href: '/tools/webp-to-jpg'
  },
  {
    id: 'webp-to-png',
    title: 'WebP to PNG Converter',
    description: 'Convert WebP images to PNG format while preserving transparency',
    icon: '🔄',
    href: '/tools/webp-to-png'
  },
  {
    id: 'jpg-to-webp',
    title: 'JPG to WebP Converter',
    description: 'Convert JPG images to modern WebP format for better compression',
    icon: '🔄',
    href: '/tools/jpg-to-webp'
  },
  {
    id: 'png-to-webp',
    title: 'PNG to WebP Converter',
    description: 'Convert PNG images to WebP format with superior compression and quality',
    icon: '🔄',
    href: '/tools/png-to-webp'
  }
];

// Generate metadata using the modular system
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('image-tools', {
    locale: 'en',
    pathname: '/category/image-tools'
  });
}

export default function ImageToolsCategory() {
  return (
    <CategoryPage
      categorySlug="image-tools"
      tools={imageTools}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'All Tools', href: '/tools' },
        { label: 'Image Tools' }
      ]}
    />
  );
}