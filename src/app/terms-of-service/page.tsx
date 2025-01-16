import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await supabase
    .from('static_pages')
    .select('title, short_description')
    .eq('slug', 'terms-of-service')
    .single();

  return generatePageMetadata(
    'static',
    'terms-of-service',
    page?.title || 'Terms of Service',
    page?.short_description || 'Our terms of service and usage conditions'
  );
}

export default async function TermsOfServicePage() {
  const { data: page } = await supabase
    .from('static_pages')
    .select('content')
    .eq('slug', 'terms-of-service')
    .single();

  return (
    <main className="container mx-auto px-4 py-8">
      <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
      </article>
    </main>
  );
} 