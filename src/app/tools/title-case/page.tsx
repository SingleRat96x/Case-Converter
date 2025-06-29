import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { TitleCaseConverter } from './title-case-converter';
import { generatePageMetadata } from '@/lib/metadata';
import AdScript from '@/components/ads/AdScript';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('title-case');
  return generatePageMetadata(
    'tool',
    'title-case',
    tool?.title || 'Title Case Converter',
    tool?.short_description || 'Convert text to Title Case format'
  );
}

export default async function TitleCasePage() {
  const content = await getToolContent('title-case');
  
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header section with more left padding */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            {content?.title ?? 'Title Case Converter'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {content?.short_description ?? 'Convert text to title case format'}
          </p>
          <AdScript />
        </div>

        {/* Tool section with wider width */}
        <div className="max-w-6xl mx-auto mb-12">
          <TitleCaseConverter />
        </div>

        <AdScript />

        {/* Description section with more left padding */}
        <div className="max-w-4xl mx-auto">
          {content?.long_description && (
            <div 
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content.long_description }} 
            />
          )}
        </div>
      </div>
    </main>
  );
} 