import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { LowercaseConverter } from './lowercase-converter';
import { generatePageMetadata } from '@/lib/metadata';
import { themeClasses, cn } from '@/lib/theme-config';
import AdScript from '@/components/ads/AdScript';

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
      <div className={cn(themeClasses.container.xl, 'px-8 py-8')}>
        {/* Header section */}
        <div className={cn(themeClasses.container.md, 'mb-12')}>
          <h1 className={cn(themeClasses.heading.h1, 'mb-4')}>
            {content?.title ?? 'Lowercase Converter'}
          </h1>
          <p className={themeClasses.description}>
            {content?.short_description ?? 'Convert your text to lowercase easily'}
          </p>
          <AdScript />
        </div>

        {/* Tool section */}
        <div className={cn(themeClasses.container.lg, 'mb-12')}>
          <LowercaseConverter />
        </div>

        <AdScript />

        {/* Description section */}
        <div className={themeClasses.container.md}>
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