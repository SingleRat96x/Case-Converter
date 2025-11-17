import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import { PrivacyPolicyContent } from '@/components/pages/PrivacyPolicyContent';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata('privacy-policy', { locale: 'de', pathname: '/de/privacy-policy' });
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
