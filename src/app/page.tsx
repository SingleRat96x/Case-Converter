import { CaseChangerTool } from '@/components/tools/CaseChangerTool';
import { ToolBlock } from '@/components/ToolBlock';
import { getAllTools } from '@/lib/tools';

// No caching or dynamic settings
export default async function Home({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Force fresh data by using the timestamp in the URL
  const timestamp = searchParams.t || Date.now();
  const tools = await getAllTools(timestamp as string | number);
  
  console.log('All tools:', tools.map(t => ({ id: t.id, show_in_index: t.show_in_index })));
  console.log('Filtered tools:', tools
    .filter(tool => tool.id !== 'case-converter' && tool.show_in_index)
    .map(t => t.id)
  );

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Text Case Converter</h1>
        <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
          Transform your text into any case: UPPERCASE, lowercase, Title Case, Sentence case, or aLtErNaTiNg case. Plus, get instant character, word, sentence, and line counts.
        </p>
      </div>

      <CaseChangerTool />

      <div className="max-w-[700px] mx-auto space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-2">About Our Case Converter</h2>
          <p>
            Our free online case converter tool helps you transform text between different cases instantly. Whether you need to make your text all uppercase for emphasis, lowercase for a casual tone, or title case for headings, we&apos;ve got you covered.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Convert to UPPERCASE, lowercase, Title Case, Sentence case, and aLtErNaTiNg case</li>
            <li>Real-time character, word, sentence, and line counting</li>
            <li>Clean and intuitive interface</li>
            <li>Works offline - no need to save or upload your text</li>
            <li>Free to use with no limitations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-2">How to Use</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Paste or type your text in the text area above</li>
            <li>Click on any of the case conversion buttons to transform your text</li>
            <li>View the character, word, sentence, and line counts updated in real-time</li>
            <li>Copy your transformed text and use it anywhere you need</li>
          </ol>
        </section>
      </div>

      <section className="pt-8 border-t">
        <h2 className="text-2xl font-semibold text-center mb-8">More Text Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools
            .filter(tool => {
              const shouldShow = tool.id !== 'case-converter' && tool.show_in_index;
              console.log(`Tool ${tool.id}: show_in_index=${tool.show_in_index}, shouldShow=${shouldShow}`);
              return shouldShow;
            })
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
