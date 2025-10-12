import { Layout } from '@/components/layout/Layout';
import { RemoveTextFormatting } from '@/components/tools/RemoveTextFormatting';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'remove-text-formatting',
  path: '/ru/tools/remove-text-formatting'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'ru',
    pathname: toolConfig.path
  });
}

export default function RemoveTextFormattingPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RemoveTextFormatting />
          <SEOContent
            toolName={toolConfig.name}
           
           
          />
        </div>
      </div>
    </Layout>
  );
}