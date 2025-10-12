import { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import { Layout } from '@/components/layout/Layout';
import { SHAHashGenerator } from '@/components/tools/SHAHashGenerator';
import { OtherTools } from '@/components/sections/OtherTools';
import SiteStructuredData from '@/components/seo/SiteStructuredData';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata('sha256-hash-generator', { 
    locale: 'ru', 
    pathname: '/ru/tools/sha256-hash-generator' 
  });
}

export default function SHAHashGeneratorPageRU() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SiteStructuredData />
          <SHAHashGenerator />
        </div>
      </div>
      <OtherTools currentTool="sha256-hash-generator" />
    </Layout>
  );
}