import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { LowercaseConverter } from './lowercase-converter';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('lowercase');
  return generatePageMetadata(
    'tool',
    'lowercase',
    tool?.title || 'Lowercase Text Converter',
    tool?.short_description || 'Convert text to lowercase letters'
  );
}

export default async function LowercasePage() {
  const content = await getToolContent('lowercase');
  
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            {content?.title ?? 'Lowercase Converter'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {content?.short_description ?? 'Convert your text to lowercase easily'}
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-12">
          <LowercaseConverter />
        </div>

        <div className="max-w-4xl mx-auto">
          <div 
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: content?.long_description ?? 'Convert your text to lowercase with this simple tool.'
            }} 
          />
        </div>
      </div>
    </main>
  );
} 