import { getToolContent } from '@/lib/tools';
import type { Metadata } from 'next';
import { JSDOM } from 'jsdom';
import DOMPurifyFactory from 'dompurify';
import { Suspense } from 'react';
import { getToolComponent, isToolRegistered } from '../lib/tool-registry';
import AdSpace from '../components/AdSpace';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{
    toolId: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { toolId } = await params;
  const tool = await getToolContent(toolId);
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: tool.title,
    description: tool.short_description,
  };
}

// Loading component for tool components
function ToolLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-full h-[300px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-full h-[300px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default async function ToolPage({ params }: Props) {
  const { toolId } = await params;
  const tool = await getToolContent(toolId);

  if (!tool) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-4xl font-bold">Tool Not Found</h1>
      </div>
    );
  }

  // Check if tool is registered in our dynamic system
  if (!isToolRegistered(toolId)) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-4xl font-bold">Tool Component Not Available</h1>
        <p className="text-lg text-muted-foreground mt-4">
          This tool is being migrated to the new system. Please check back soon.
        </p>
      </div>
    );
  }

  // Sanitize the HTML content to prevent XSS attacks
  let sanitizedLongDescription = '';
  if (tool && tool.long_description) {
    // Create a JSDOM window. DOMPurify needs this to run in Node.js.
    // Important: Pass an empty string to JSDOM constructor, not undefined.
    const window = new JSDOM('').window;
    const DOMPurify = DOMPurifyFactory(window as any); // Type assertion for window

    // Sanitize the HTML content
    // You can configure DOMPurify further here if needed (e.g., ALLOWED_TAGS, ALLOWED_ATTR)
    sanitizedLongDescription = DOMPurify.sanitize(tool.long_description);
  }

  // Get the dynamic tool component
  const ToolComponent = getToolComponent(toolId);

  return (
    <div className="container px-4 py-8 space-y-8">
      {/* Header section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {tool.title}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto">
          {tool.short_description}
        </p>
      </div>

      {/* Content container with consistent max-width */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Ad Space */}
        <AdSpace position="top" />

        {/* Tool Component with Suspense */}
        {ToolComponent && (
          <Suspense fallback={<ToolLoading />}>
            <ToolComponent />
          </Suspense>
        )}

        {/* Middle Ad Space */}
        <AdSpace position="middle" />

        {/* Tool Description */}
        {sanitizedLongDescription && (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedLongDescription }}
          />
        )}

        {/* Bottom Ad Space */}
        <AdSpace position="bottom" />
      </div>
    </div>
  );
}
