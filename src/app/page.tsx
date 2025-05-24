import type { Metadata } from 'next';
import { JSDOM } from 'jsdom';
import DOMPurifyFactory from 'dompurify';
import { CaseChangerTool } from '@/components/tools/CaseChangerTool';
import { ToolBlock } from '@/components/ToolBlock';
import { getAllTools } from '@/lib/tools';
import { getPageContent } from '@/lib/page-content';
import { generatePageMetadata } from '@/lib/metadata';

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
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{pageContent?.title || 'Text Case Converter'}</h1>
        <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
          {pageContent?.short_description || 'Transform your text into any case: UPPERCASE, lowercase, Title Case, Sentence case, or aLtErNaTiNg case. Plus, get instant character, word, sentence, and line counts.'}
        </p>
      </div>

      <CaseChangerTool />

      <div className="max-w-[700px] mx-auto space-y-6 text-muted-foreground">
        <div 
          className="prose dark:prose-invert" 
          dangerouslySetInnerHTML={{ __html: sanitizedLongDescription || fallbackContent }} 
        />
      </div>

      <section className="pt-8 border-t">
        <h2 className="text-2xl font-semibold text-center mb-8">More Text Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
