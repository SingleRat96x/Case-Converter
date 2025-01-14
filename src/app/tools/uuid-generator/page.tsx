import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { UuidGenerator } from './uuid-generator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('uuid-generator');
  
  if (!tool) {
    return {
      title: 'UUID Generator',
      description: 'Generate random UUIDs (Universally Unique Identifiers) in version 4 format. Perfect for database IDs, unique identifiers, or any scenario requiring UUIDs.',
    };
  }

  return {
    title: tool.title,
    description: tool.short_description,
  };
}

export default async function UuidGeneratorPage() {
  const tool = await getToolContent('uuid-generator');

  if (!tool) {
    return null;
  }

  return (
    <main className="max-w-7xl mx-auto px-8 py-8">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3">
          {tool.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {tool.short_description}
        </p>
      </div>

      <div className="max-w-6xl mx-auto mb-12">
        <UuidGenerator />
      </div>

      <div className="max-w-4xl mx-auto">
        <div 
          className="prose dark:prose-invert" 
          dangerouslySetInnerHTML={{ __html: tool.long_description }} 
        />
      </div>
    </main>
  );
} 