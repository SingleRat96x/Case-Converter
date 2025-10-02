import { Layout } from '@/components/layout/Layout';
import { UrlEncoderDecoder } from '@/components/tools/UrlEncoderDecoder';
import { SEOContent } from '@/components/seo/SEOContent';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

const toolConfig = {
  name: 'url-converter',
  path: '/tools/url-converter'
};

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata(toolConfig.name, {
    locale: 'en',
    pathname: toolConfig.path
  });
}

export default function UrlConverterPage() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <UrlEncoderDecoder />
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