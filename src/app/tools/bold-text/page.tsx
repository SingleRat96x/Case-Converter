import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { BoldTextConverter } from './bold-text-converter';
import { generatePageMetadata } from '@/lib/metadata';
import AdScript from '@/components/ads/AdScript';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('bold-text');
  return generatePageMetadata(
    'tool',
    'bold-text',
    tool?.title || 'Bold Text Generator',
    tool?.short_description || 'Create bold text for social media'
  );
}

export default async function BoldTextPage() {
  const tool = await getToolContent('bold-text');
  
  if (!tool) {
    return <BoldTextConverter />;
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
          <AdScript />
        </div>

        {/* Tool section with wider width */}
        <div className="max-w-6xl mx-auto mb-12">
          <BoldTextConverter />
        </div>

        <AdScript />

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