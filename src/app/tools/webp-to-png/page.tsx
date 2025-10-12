import { Layout } from '@/components/layout/Layout';
import { WebPToPNGConverter } from '@/components/tools/image-tools/WebPToPNGConverter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'webp-to-png',
  path: '/tools/webp-to-png'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function WebPToPNGPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <WebPToPNGConverter />
          <SEOContent
            toolName={toolConfig.name}
           
           
          />
        </div>
      </div>
    </Layout>
  );
}


