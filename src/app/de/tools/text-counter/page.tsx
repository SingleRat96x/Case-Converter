import { Layout } from '@/components/layout/Layout';
import { TextCounter } from '@/components/tools/TextCounter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'text-counter',
  path: '/de/tools/text-counter'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'de',
    pathname: toolConfig.path
  });
}

export default function TextCounterPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <TextCounter />
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
