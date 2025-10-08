import { Layout } from '@/components/layout/Layout';
import { ImageToTextOCR } from '@/components/tools/image-tools/ImageToTextOCR';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const toolConfig = {
  name: 'image-to-text',
  path: '/ru/tools/image-to-text'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'ru',
    pathname: toolConfig.path
  });
}

export default function ImageToTextPageRU() {
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