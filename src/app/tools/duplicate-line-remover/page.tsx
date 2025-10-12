import { Layout } from '@/components/layout/Layout';
import { DuplicateLineRemover } from '@/components/tools/DuplicateLineRemover';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'duplicate-line-remover',
  path: '/tools/duplicate-line-remover'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function DuplicateLineRemoverPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <DuplicateLineRemover />
          <SEOContent 
            toolName={toolConfig.name} 
            
            
          />
        </div>
      </div>
    </Layout>
  );
}