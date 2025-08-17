import type { Metadata } from 'next';
import { AlternatingCaseConverter } from './alternating-case-converter';
import { getToolContent } from '@/lib/tools';
import { generatePageMetadata } from '@/lib/metadata';
import { themeClasses, cn } from '@/lib/theme-config';
import AdScript from '@/components/ads/AdScript';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('alternating-case');
  return generatePageMetadata(
    'tool',
    'alternating-case',
    tool?.title || 'Alternating Case Converter',
    tool?.short_description || 'Convert text to aLtErNaTiNg case format'
  );
}

export default async function AlternatingCasePage() {
  const tool = await getToolContent('alternating-case');
  
  if (!tool) {
    return <AlternatingCaseConverter />;
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
            {tool.short_description || 'Convert your text to alternating case online.'}
          </p>
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8899111851490905"
                     crossorigin="anonymous"></script>
                <!-- Text Case -->
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-8899111851490905"
                     data-ad-slot="1588643719"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
              `,
            }}
          />
        </div>

        {/* Tool section */}
        <div className={cn(themeClasses.container.lg, 'mb-12')}>
          <AlternatingCaseConverter />
        </div>

        <AdScript />

        {/* Description section */}
        <div className={themeClasses.container.md}>
          {tool.long_description && (
            <div 
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: tool.long_description }}
            />
          )}
        </div>
      </div>
    </main>
  );
} 