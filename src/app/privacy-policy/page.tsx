import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await supabase
    .from('static_pages')
    .select('title, short_description')
    .eq('slug', 'privacy-policy')
    .single();

  return generatePageMetadata(
    'static',
    'privacy-policy',
    page?.title || 'Privacy Policy',
    page?.short_description || 'Our privacy policy and data protection practices'
  );
}

export default async function PrivacyPolicyPage() {
  const { data: page } = await supabase
    .from('static_pages')
    .select('content')
    .eq('slug', 'privacy-policy')
    .single();

  return (
    <main className="container mx-auto px-4 py-8">
      <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: page?.content || '' }} />
      </article>
    </main>
  );
} 