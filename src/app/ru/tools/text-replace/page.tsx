import { Layout } from '@/components/layout/Layout';
import { TextReplace } from '@/components/tools/TextReplace';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'text-replace',
  path: '/ru/tools/text-replace'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'ru',
    pathname: toolConfig.path
  });
}

export default function TextReplacePage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <TextReplace />
          <SEOContent
            toolName={toolConfig.name}
           
           
          />
        </div>
      </div>
    </Layout>
  );
}