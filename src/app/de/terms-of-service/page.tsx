import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import { TermsOfServiceContent } from '@/components/pages/TermsOfServiceContent';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata('terms-of-service', { locale: 'de', pathname: '/de/terms-of-service' });
}

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
