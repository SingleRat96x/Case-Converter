import { Layout } from '@/components/layout/Layout';
import { AlternatingCaseConverter } from '@/components/tools/AlternatingCaseConverter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'alternating-case',
  path: '/tools/alternating-case'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function AlternatingCasePage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AlternatingCaseConverter />
          <SEOContent 
            toolName="alternating-case" 
            
            
          />
        </div>
      </div>
    </Layout>
  );
}