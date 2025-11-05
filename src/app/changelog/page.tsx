import type { Metadata } from 'next';
import { ChangelogContent } from '@/components/pages/ChangelogContent';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Product Changelog - Text Case Converter',
  description: 'Stay up-to-date with the latest changes, new tools, and improvements to our platform. Track new features, bug fixes, and enhancements.',
  openGraph: {
    title: 'Product Changelog - Text Case Converter',
    description: 'Stay up-to-date with the latest changes, new tools, and improvements to our platform.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product Changelog - Text Case Converter',
    description: 'Stay up-to-date with the latest changes, new tools, and improvements.',
  },
};

export default function ChangelogPage() {
  return <ChangelogContent />;
}
