import { Layout } from '@/components/layout/Layout';
import { RandomMonthGenerator } from '@/components/tools/RandomMonthGenerator';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'random-month',
  path: '/tools/random-month'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function RandomMonthPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RandomMonthGenerator />
          <SEOContent 
            toolName={toolConfig.name} 
            
            
          />
        </div>
      </div>
    </Layout>
  );
}