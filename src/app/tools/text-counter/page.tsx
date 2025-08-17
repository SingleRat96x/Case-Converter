import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { TextCounter } from './text-counter';
import { generatePageMetadata } from '@/lib/metadata';
import { themeClasses, cn } from '@/lib/theme-config';
import AdScript from '@/components/ads/AdScript';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('text-counter');
  return generatePageMetadata(
    'tool',
    'text-counter',
    tool?.title || 'Text Counter',
    tool?.short_description || 'Count characters, words, and lines in your text'
  );
}

export default async function TextCounterPage() {
  const content = await getToolContent('text-counter');
  
  return (
    <main className="min-h-screen bg-background">
      <div className={cn(themeClasses.container.xl, 'px-8 py-8')}>
        <div className={cn(themeClasses.container.md, 'mb-12')}>
          <h1 className={cn(themeClasses.heading.h1, 'mb-4')}>
            {content?.title ?? 'Text Counter'}
          </h1>
          <p className={themeClasses.description}>
            {content?.short_description ?? 'Count characters, words, and lines in your text'}
          </p>
          <AdScript />
        </div>

        <div className={cn(themeClasses.container.lg, 'mb-12')}>
          <TextCounter />
        </div>

        <AdScript />

        <div className={themeClasses.container.md}>
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