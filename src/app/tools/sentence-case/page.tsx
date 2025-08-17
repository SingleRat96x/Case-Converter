import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { SentenceCaseConverter } from './sentence-case-converter';
import { generatePageMetadata } from '@/lib/metadata';
import { themeClasses, cn } from '@/lib/theme-config';
import AdScript from '@/components/ads/AdScript';

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
      <div className={cn(themeClasses.container.xl, 'px-8 py-8')}>
        {/* Header section */}
        <div className={cn(themeClasses.container.md, 'mb-12')}>
          <h1 className={cn(themeClasses.heading.h1, 'mb-4')}>
            {content?.title || 'Sentence Case Converter'}
          </h1>
          <p className={themeClasses.description}>
            {content?.short_description || 'Convert your text to sentence case online'}
          </p>
          <AdScript />
        </div>

        {/* Tool section */}
        <div className={cn(themeClasses.container.lg, 'mb-12')}>
          <SentenceCaseConverter />
        </div>

        <AdScript />

        {/* Description section */}
        <div className={themeClasses.container.md}>
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