import { Layout } from '@/components/layout/Layout';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Lazy load heavy OCR component (Tesseract.js is large)
const ImageToTextOCR = dynamic(() => import('@/components/tools/image-tools/ImageToTextOCR').then(mod => ({ default: mod.ImageToTextOCR })), {
  loading: () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="text-center py-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto mt-2" />
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>
    </div>
  ),
  ssr: false,
});

const toolConfig = {
  name: 'image-to-text',
  path: '/tools/image-to-text'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function ImageToTextPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ImageToTextOCR />
          <SEOContent 
            toolName={toolConfig.name} 
            enableAds={true} 
            adDensity="medium" 
          />
        </div>
      </div>
    </Layout>
  );
}