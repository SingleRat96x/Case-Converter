import type { Metadata } from "next";
import { JpgToWebpConverter } from "./jpg-to-webp-converter";
import { getToolContent } from "@/lib/tools";
import { generatePageMetadata } from "@/lib/metadata";
import AdScript from '@/components/ads/AdScript';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('jpg-to-webp');
  return generatePageMetadata(
    'tool',
    'jpg-to-webp',
    tool?.title || 'JPG to WebP Converter',
    tool?.short_description || 'Convert JPG images to WebP format'
  );
}

export default async function JpgToWebpPage() {
  const tool = await getToolContent('jpg-to-webp');

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
        <JpgToWebpConverter />
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