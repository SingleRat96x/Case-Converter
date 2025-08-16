import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { JSDOM } from 'jsdom';
import DOMPurifyFactory from 'dompurify';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const { data: page } = await supabase
    .from('static_pages')
    .select('title, short_description')
    .eq('slug', 'contact-us')
    .single();

  return generatePageMetadata(
    'static',
    'contact-us',
    page?.title || 'Contact Us',
    page?.short_description || 'Get in touch with us for any questions or feedback'
  );
}

export default async function ContactUsPage() {
  const { data: page } = await supabase
    .from('static_pages')
    .select('content')
    .eq('slug', 'contact-us')
    .single();

  // Sanitize the HTML content to prevent XSS attacks
  let sanitizedContent = '';
  if (page && page.content) {
    // Create a JSDOM window. DOMPurify needs this to run in Node.js.
    const window = new JSDOM('').window; 
    const DOMPurify = DOMPurifyFactory(window as any);
    sanitizedContent = DOMPurify.sanitize(page.content);
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto dark:prose-invert">
        {sanitizedContent && (
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        )}
      </article>
    </main>
  );
} 