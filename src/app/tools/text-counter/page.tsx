import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { TextCounter } from './text-counter';
import { generatePageMetadata } from '@/lib/metadata';

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
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            {content?.title ?? 'Text Counter'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {content?.short_description ?? 'Count characters, words, and lines in your text'}
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <TextCounter />
        </div>

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