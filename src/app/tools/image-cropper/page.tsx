import { Layout } from '@/components/layout/Layout';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Lazy load heavy image processing component
const ImageCropper = dynamic(() => import('@/components/tools/image-tools/ImageCropper').then(mod => ({ default: mod.ImageCropper })), {
  loading: () => (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

const toolConfig = {
  name: 'image-cropper',
  path: '/tools/image-cropper'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function ImageCropperPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ImageCropper />
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