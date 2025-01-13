import { getToolContent } from '@/lib/tools';
import { Metadata } from 'next';

type Props = {
  params: { toolId: string }
  children: React.ReactNode
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const tool = await getToolContent(params.toolId);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool could not be found.'
    };
  }

  return {
    title: tool.title,
    description: tool.short_description,
  };
}

export default function ToolLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="w-full max-w-screen-2xl mx-auto">
        {children}
      </div>
    </div>
  );
} 