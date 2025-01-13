import { getToolContent } from '@/lib/tools';
import type { Metadata } from 'next';
import { UppercaseConverter } from '../uppercase/uppercase-converter';
import { LowercaseConverter } from '../lowercase/lowercase-converter';
import { TitleCaseConverter } from '../title-case/title-case-converter';
import { SentenceCaseConverter } from '../sentence-case/sentence-case-converter';
import { AlternatingCaseConverter } from '../alternating-case/alternating-case-converter';
import { TextCounter } from '../text-counter/text-counter';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: {
    toolId: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await getToolContent(params.toolId);
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: tool.title,
    description: tool.short_description,
  };
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolContent(params.toolId);
  
  if (!tool) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-4xl font-bold">Tool Not Found</h1>
      </div>
    );
  }

  // Render the appropriate tool component based on the ID
  const renderToolComponent = () => {
    switch (params.toolId) {
      case 'uppercase':
        return <UppercaseConverter />;
      case 'lowercase':
        return <LowercaseConverter />;
      case 'title-case':
        return <TitleCaseConverter />;
      case 'sentence-case':
        return <SentenceCaseConverter />;
      case 'alternating-case':
        return <AlternatingCaseConverter />;
      case 'text-counter':
        return <TextCounter />;
      default:
        return null;
    }
  };

  const toolComponent = renderToolComponent();

  return (
    <div className="container px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{tool.title}</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-[700px] mx-auto px-4">
          {tool.short_description}
        </p>
      </div>

      {/* Always render the tool component if it exists */}
      {toolComponent}

      {/* Always render the long description from database */}
      <div className="max-w-[700px] mx-auto px-4 prose dark:prose-invert" 
        dangerouslySetInnerHTML={{ __html: tool.long_description }} 
      />
    </div>
  );
} 