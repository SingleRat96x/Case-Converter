import { Layout } from '@/components/layout/Layout';
import { TextCaseConverter } from '@/components/tools/TextCaseConverter';
import { OtherTools } from '@/components/sections/OtherTools';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';
import SiteStructuredData from '@/components/seo/SiteStructuredData';

export default function HomeRU() {
  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SiteStructuredData />
          <TextCaseConverter />
        </div>
      </div>
      <OtherTools />
    </Layout>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata('home', { locale: 'ru', pathname: '/ru' });
}
