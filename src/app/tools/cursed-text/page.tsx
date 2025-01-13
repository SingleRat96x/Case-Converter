import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { CursedTextConverter } from './cursed-text-converter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('cursed-text');
  if (!tool) {
    return {
      title: 'Cursed Text Generator',
      description: 'Convert your text into cursed letters'
    };
  }

  return {
    title: tool.title,
    description: tool.short_description,
  };
}

export default async function CursedTextPage() {
  const tool = await getToolContent('cursed-text');
  
  if (!tool) {
    return <CursedTextConverter />;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header section with more left padding */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            {tool.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tool.short_description}
          </p>
        </div>

        {/* Tool section with wider width */}
        <div className="max-w-6xl mx-auto mb-12">
          <CursedTextConverter />
        </div>

        {/* Description section with more left padding */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: tool.long_description }} 
          />
        </div>
      </div>
    </main>
  );
} 