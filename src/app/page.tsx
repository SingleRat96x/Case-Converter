import { Layout } from '@/components/layout/Layout';
import { TextCaseConverter } from '@/components/tools/TextCaseConverter';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';
import SiteStructuredData from '@/components/seo/SiteStructuredData';
import dynamic from 'next/dynamic';

// Lazy load non-critical components
const OtherTools = dynamic(() => import('@/components/sections/OtherTools').then(mod => ({ default: mod.OtherTools })), {
  loading: () => (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Loading tools...</span>
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
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
  return generateToolMetadata('home', { locale: 'en', pathname: '/' });
}
