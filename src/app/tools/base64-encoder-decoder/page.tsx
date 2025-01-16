import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { Base64Converter } from './base64-converter';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('base64-encoder-decoder');
  return generatePageMetadata(
    'tool',
    'base64-encoder-decoder',
    tool?.title || 'Base64 Encoder/Decoder',
    tool?.short_description || 'Convert text to and from Base64 encoding'
  );
}

export default async function Base64Page() {
  const tool = await getToolContent('base64-encoder-decoder');

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
      </div>

      <div className="max-w-6xl mx-auto mb-12">
        <Base64Converter />
      </div>

      <div className="max-w-4xl mx-auto">
        <div 
          className="prose dark:prose-invert" 
          dangerouslySetInnerHTML={{ __html: tool.long_description }} 
        />
      </div>
    </main>
  );
} 