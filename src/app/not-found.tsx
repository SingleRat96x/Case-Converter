// Server component (no client hooks)

import { Layout } from '@/components/layout/Layout';
import NotFoundText from '@/components/not-found/NotFoundText';
import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';

export default function NotFound() {
  return (
    <Layout>
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <NotFoundText />
        </div>
      </div>
    </Layout>
  );
}


export async function generateMetadata(): Promise<Metadata> {
  // Use noindex for 404
  const pathname = '/not-found';
  const metadata = await generateToolMetadata('not-found', { locale: 'en', pathname });
  return { ...metadata, robots: 'noindex, nofollow' };
}

