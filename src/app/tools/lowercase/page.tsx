import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { LowercaseConverter } from './lowercase-converter';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getToolContent('lowercase');
  
  return {
    title: content?.title ?? 'Lowercase Converter Tool',
    description: content?.short_description ?? 'Convert text to lowercase easily',
  };
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