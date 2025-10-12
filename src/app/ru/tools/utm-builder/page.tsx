import { Layout } from '@/components/layout/Layout';
import { UTMParameterBuilder } from '@/components/tools/UTMParameterBuilder';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'utm-builder',
  path: '/ru/tools/utm-builder'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'ru',
    pathname: toolConfig.path
  });
}

export default function UTMBuilderPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <UTMParameterBuilder />
          <SEOContent 
            toolName={toolConfig.name} 
            
            
          />
        </div>
      </div>
    </Layout>
  );
}