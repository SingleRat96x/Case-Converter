import type { Metadata } from 'next';
import { TextCounter } from './text-counter';
import { getToolContent } from '@/lib/tools';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getToolContent('text-counter');
  if (!content) {
    return {
      title: 'Text Counter Tool',
      description: 'Count characters, words, and lines in your text',
    };
  }
  
  return {
    title: content.title,
    description: content.short_description,
  };
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