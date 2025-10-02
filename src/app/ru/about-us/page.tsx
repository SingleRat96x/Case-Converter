import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import { AboutUsContent } from '@/components/pages/AboutUsContent';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata('about-us', { locale: 'ru', pathname: '/ru/about-us' });
}

export default function AboutUsPageRU() {
  return <AboutUsContent />;
}

