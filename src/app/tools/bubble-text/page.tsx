import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { BubbleTextConverter } from './bubble-text-converter';
import { generatePageMetadata } from '@/lib/metadata';
import { themeClasses, cn } from '@/lib/theme-config';
import AdScript from '@/components/ads/AdScript';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('bubble-text');
  return generatePageMetadata(
    'tool',
    'bubble-text',
    tool?.title || 'Bubble Text Generator',
    tool?.short_description || 'Convert text to bubble style font'
  );
}

export default async function BubbleTextPage() {
  const tool = await getToolContent('bubble-text');
  
  if (!tool) {
    return <BubbleTextConverter />;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className={cn(themeClasses.container.xl, 'px-8 py-8')}>
        {/* Header section */}
        <div className={cn(themeClasses.container.md, 'mb-12')}>
          <h1 className={cn(themeClasses.heading.h1, 'mb-4')}>
            {tool.title}
          </h1>
          <p className={themeClasses.description}>
            {tool.short_description}
          </p>
          <AdScript />
        </div>

        {/* Tool section */}
        <div className={cn(themeClasses.container.lg, 'mb-12')}>
          <BubbleTextConverter />
        </div>

        <AdScript />

        {/* Description section */}
        <div className={themeClasses.container.md}>
          <div 
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: tool.long_description }} 
          />
        </div>
      </div>
    </main>
  );
} 