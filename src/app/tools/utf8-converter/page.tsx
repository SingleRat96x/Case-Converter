import { Layout } from '@/components/layout/Layout';
import { Utf8Converter } from '@/components/tools/Utf8Converter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'utf8-converter',
  path: '/tools/utf8-converter'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function Utf8ConverterPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Utf8Converter />
          <SEOContent 
            toolName={toolConfig.name} 
            
            
          />
        </div>
      </div>
    </Layout>
  );
}