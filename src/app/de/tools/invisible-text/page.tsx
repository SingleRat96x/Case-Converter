import { InvisibleTextGenerator } from '@/components/tools/InvisibleTextGenerator';
import { Layout } from '@/components/layout/Layout';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'invisible-text',
  path: '/de/tools/invisible-text'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'de',
    pathname: toolConfig.path
  });
}

export default function InvisibleTextPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <InvisibleTextGenerator />
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
