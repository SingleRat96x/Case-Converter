import type { Metadata } from 'next';
import { getToolContent } from '@/lib/tools';
import { SubscriptTextConverter } from './subscript-text-converter';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('subscript-text');
  return generatePageMetadata(
    'tool',
    'subscript-text',
    tool?.title || 'Subscript Text Generator',
    tool?.short_description || 'Convert text to subscript format'
  );
}

export default SubscriptTextConverter;

// ... rest of the file ... 