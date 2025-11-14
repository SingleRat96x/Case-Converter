import { Layout } from '@/components/layout/Layout';
import { WebPToJPGConverter } from '@/components/tools/image-tools/WebPToJPGConverter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'webp-to-jpg',
  path: '/de/tools/webp-to-jpg'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'de',
    pathname: toolConfig.path
  });
}

export default function WebPToJPGPageDE() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <WebPToJPGConverter />
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

