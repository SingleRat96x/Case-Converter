import { Layout } from '@/components/layout/Layout';
import { NatoPhoneticConverter } from '@/components/tools/NatoPhoneticConverter';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'nato-phonetic',
  path: '/ru/tools/nato-phonetic'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'ru',
    pathname: toolConfig.path
  });
}

export default function NatoPhoneticPageRu() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <NatoPhoneticConverter />
          <SEOContent 
            toolName={toolConfig.name} 
            
            
          />
        </div>
      </div>
    </Layout>
  );
}