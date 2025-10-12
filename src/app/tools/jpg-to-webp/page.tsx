import { Layout } from '@/components/layout/Layout';
import { JPGToWebPConverter } from '@/components/tools/image-tools/JPGToWebPConverter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'jpg-to-webp',
  path: '/tools/jpg-to-webp'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function JPGToWebPPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <JPGToWebPConverter />
          <SEOContent
            toolName={toolConfig.name}
           
           
          />
        </div>
      </div>
    </Layout>
  );
}


