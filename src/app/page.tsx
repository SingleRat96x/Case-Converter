import type { Metadata } from 'next';
import { JSDOM } from 'jsdom';
import DOMPurifyFactory from 'dompurify';
import { CaseChangerTool } from '@/components/tools/CaseChangerTool';
import { ToolBlock } from '@/components/ToolBlock';
import { getAllTools } from '@/lib/tools';
import { getPageContent } from '@/lib/page-content';
import { generatePageMetadata } from '@/lib/metadata';
import { themeClasses, cn } from '@/lib/theme-config';
import AdScript from '@/components/ads/AdScript';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContent('index');
  return generatePageMetadata(
    'index',
    'index',
    pageContent?.title || 'Text Case Converter',
    pageContent?.short_description || 'Transform your text into any case: UPPERCASE, lowercase, Title Case, Sentence case, or aLtErNaTiNg case.'
  );
}

export default async function Home({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const timestamp = searchParams.t || Date.now();
  const tools = await getAllTools(timestamp as string | number);
  const pageContent = await getPageContent('index');
  
  // Sanitize the HTML content to prevent XSS attacks
  let sanitizedLongDescription = '';
  if (pageContent && pageContent.long_description) {
    // Create a JSDOM window. DOMPurify needs this to run in Node.js.
    const window = new JSDOM('').window; 
    const DOMPurify = DOMPurifyFactory(window as any);
    sanitizedLongDescription = DOMPurify.sanitize(pageContent.long_description);
  }

  // Fallback content if no sanitized content exists
  const fallbackContent = `
    <section>
      <h2>About Our Case Converter</h2>
      <p>Our free online case converter tool helps you transform text between different cases instantly. Whether you need to make your text all uppercase for emphasis, lowercase for a casual tone, or title case for headings, we've got you covered.</p>
    </section>

    <section>
      <h2>Features</h2>
      <ul>
        <li>Convert to UPPERCASE, lowercase, Title Case, Sentence case, and aLtErNaTiNg case</li>
        <li>Real-time character, word, sentence, and line counting</li>
        <li>Clean and intuitive interface</li>
        <li>Works offline - no need to save or upload your text</li>
        <li>Free to use with no limitations</li>
      </ul>
    </section>

    <section>
      <h2>How to Use</h2>
      <ol>
        <li>Paste or type your text in the text area above</li>
        <li>Click on any of the case conversion buttons to transform your text</li>
        <li>View the character, word, sentence, and line counts updated in real-time</li>
        <li>Copy your transformed text and use it anywhere you need</li>
      </ol>
    </section>
  `;

  return (
    <div className={cn(themeClasses.container.xl, 'py-8 md:py-12', themeClasses.section.spacing.xl)}>
      {/* Hero */}
      <div className="text-center space-y-4 md:space-y-6">
        <h1 className={cn(themeClasses.heading.h1, 'text-4xl md:text-5xl tracking-tight')}>
          {pageContent?.title || 'Text Case Converter'}
        </h1>
        <p className={cn(themeClasses.description, 'text-base sm:text-lg md:text-xl max-w-[720px] mx-auto px-4')}>
          {pageContent?.short_description || 'Transform your text into any case: UPPERCASE, lowercase, Title Case, Sentence case, or aLtErNaTiNg case. Plus, get instant character, word, sentence, and line counts.'}
        </p>
      </div>

      {/* Ad #1: Below hero with reserved height to reduce CLS */}
      <div className="mx-auto max-w-[1000px] min-h-[280px] md:min-h-[250px]">
        <AdScript />
      </div>

      {/* Tool + Right Rail (desktop) */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
        <div className="lg:col-span-2">
          <CaseChangerTool />
        </div>
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="sticky top-24">
            {/* Ad #2: Right rail on desktop, flows below tool on mobile */}
            <div className="min-h-[280px] md:min-h-[250px]">
              <AdScript />
            </div>
          </div>
        </div>
      </div>

      {/* Long description (CMS or fallback) */}
      <div className="max-w-[720px] mx-auto px-4">
        <div 
          className="prose dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground" 
          dangerouslySetInnerHTML={{ __html: sanitizedLongDescription || fallbackContent }} 
        />
      </div>

      {/* Ad #3: Mid-content ad with reserved height */}
      <div className="mx-auto max-w-[1000px] min-h-[280px] md:min-h-[250px]">
        <AdScript />
      </div>

      {/* More Text Tools */}
      <section className={cn('pt-8 md:pt-12', themeClasses.divider)}>
        <h2 className={cn(themeClasses.heading.h2, 'text-center mb-6 md:mb-8')}>More Text Tools</h2>
        <div className={cn(themeClasses.grid.base, themeClasses.grid.cols[3], themeClasses.grid.gaps.md)}>
          {tools
            .filter(tool => tool.show_in_index)
            .map(tool => (
              <ToolBlock
                key={tool.id}
                title={tool.title}
                description={tool.short_description}
                href={`/tools/${tool.id}`}
              />
            ))}
        </div>
      </section>
    </div>
  );
}
