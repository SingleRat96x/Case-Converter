import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { SubscriptTextConverter } from './subscript-text-converter';
import { generatePageMetadata } from '@/lib/metadata';
import AdScript from '@/components/ads/AdScript';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('subscript-text');
  return generatePageMetadata(
    'tool',
    'subscript-text',
    tool?.title || 'Subscript Text Generator',
    tool?.short_description || 'Convert text to subscript format'
  );
}

export default async function SubscriptTextPage() {
  const tool = await getToolContent('subscript-text');

  if (!tool) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-8 py-8">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3">
          {tool.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {tool.short_description}
        </p>
        <AdScript />
      </div>

      <div className="max-w-6xl mx-auto mb-12">
        <SubscriptTextConverter />
      </div>

      <AdScript />

      <div className="max-w-4xl mx-auto">
        <div
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: tool.long_description }}
        />
      </div>
    </main>
  );
}

// ... rest of the file ... 