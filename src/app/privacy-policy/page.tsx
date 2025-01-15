import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await supabase
    .from('static_pages')
    .select('title')
    .eq('slug', 'privacy-policy')
    .single();

  return {
    title: page?.title || 'Privacy Policy',
  };
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