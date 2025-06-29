import { getAllTools } from '@/lib/tools';
import { ToolBlock } from '@/components/ToolBlock';
import { TOOL_CATEGORIES } from '@/lib/tools';
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const categoryName = Object.values(TOOL_CATEGORIES).find(
    cat => cat.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.category
  );

  return generatePageMetadata(
    'category',
    params.category,
    categoryName ? `${categoryName} Tools - Text Case Converter` : 'Category Not Found',
    categoryName ? `Browse our collection of ${categoryName.toLowerCase()} tools.` : 'Category not found'
  );
}

export default async function page({
  params,
}: {
  params: { category: string };
}) {
  const tools = await getAllTools();
  const categoryName = Object.values(TOOL_CATEGORIES).find(
    cat => cat.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.category
  );

  if (!categoryName) {
    return (
      <div className="container py-8">
        <h1 className="text-4xl font-bold">Category Not Found</h1>
      </div>
    );
  }

  const categoryTools = tools.filter(tool => tool.category === categoryName);

  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{categoryName}</h1>
        <p className="text-xl text-muted-foreground">
          Browse our collection of {categoryName.toLowerCase()} tools
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryTools.map(tool => (
          <ToolBlock
            key={tool.id}
            title={tool.title}
            description={tool.short_description}
            href={`/tools/${tool.id}`}
          />
        ))}
      </div>
    </div>
  );
} 