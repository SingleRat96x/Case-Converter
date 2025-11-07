import type { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import { ContactUsContent } from '@/components/pages/ContactUsContent';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateToolMetadata('contact-us', { locale: 'de', pathname: '/de/contact-us' });
}

export default function ContactUsPage() {
  return <ContactUsContent />;
}
