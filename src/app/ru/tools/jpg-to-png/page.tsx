import { Layout } from '@/components/layout/Layout';
import { JPGToPNGConverter } from '@/components/tools/image-tools/JPGToPNGConverter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'jpg-to-png',
  path: '/ru/tools/jpg-to-png'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'ru',
    pathname: toolConfig.path
  });
}

export default function JPGToPNGConverterPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <JPGToPNGConverter />
          <SEOContent
            toolName={toolConfig.name}
           
           
          />
        </div>
      </div>
    </Layout>
  );
}