import { Layout } from '@/components/layout/Layout';
import { LowercaseConverter } from '@/components/tools/LowercaseConverter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'lowercase',
  path: '/ru/tools/lowercase'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'ru',
    pathname: toolConfig.path
  });
}

export default function LowercasePageRu() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LowercaseConverter />
          <SEOContent 
            toolName={toolConfig.name} 
            
            
          />
        </div>
      </div>
    </Layout>
  );
}