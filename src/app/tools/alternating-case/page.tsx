import type { Metadata } from 'next';
import { AlternatingCaseConverter } from './alternating-case-converter';
import { getToolContent } from '@/lib/tools';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('alternating-case');
  if (!tool) {
    return {
      title: 'aLtErNaTiNg cAsE Converter',
      description: 'Convert your text to alternating case online.'
    };
  }

  return {
    title: tool.title,
    description: tool.short_description,
  };
}

export default async function AlternatingCasePage() {
  const tool = await getToolContent('alternating-case');
  
  if (!tool) {
    return <AlternatingCaseConverter />;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Gradient header section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-10">
        <div className="container text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{tool.title}</h1>
          <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
            {tool.short_description || 'Convert your text to alternating case online.'}
          </p>
        </div>
      </div>

      {/* Tool section */}
      <div className="container py-8 space-y-8">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <AlternatingCaseConverter />
        </div>

        {/* Description section */}
        {tool.long_description && (
          <div 
            className="max-w-[700px] mx-auto prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: tool.long_description }}
          />
        )}
      </div>
    </main>
  );
} 