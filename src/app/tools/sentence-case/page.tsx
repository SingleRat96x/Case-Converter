import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { SentenceCaseConverter } from './sentence-case-converter';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('sentence-case');
  return generatePageMetadata(
    'tool',
    'sentence-case',
    tool?.title || 'Sentence Case Converter',
    tool?.short_description || 'Convert text to Sentence case format'
  );
}

export default async function SentenceCasePage() {
  const content = await getToolContent('sentence-case');
  
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header section with more left padding */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            {content?.title || 'Sentence Case Converter'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {content?.short_description || 'Convert your text to sentence case online'}
          </p>
        </div>

        {/* Tool section with wider width */}
        <div className="max-w-6xl mx-auto mb-12">
          <SentenceCaseConverter />
        </div>

        {/* Description section with more left padding */}
        <div className="max-w-4xl mx-auto">
          <div className="prose dark:prose-invert">
            {content?.long_description ? (
              <div dangerouslySetInnerHTML={{ __html: content.long_description }} />
            ) : (
              <p>Convert your text to sentence case with this online tool.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 