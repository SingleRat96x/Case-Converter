import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with proper icons and descriptions
const socialMediaTextGenerators = [
  {
    id: 'instagram-fonts',
    title: 'Instagram Font Generator',
    description: 'Create stunning stylized fonts perfect for Instagram posts, stories, bios, and captions with copy-paste functionality',
    icon: '📷',
    href: '/tools/instagram-fonts'
  },
  {
    id: 'facebook-font',
    title: 'Facebook Font Generator',
    description: 'Generate eye-catching text styles for Facebook posts, comments, and profile descriptions with instant copy-paste',
    icon: '📘',
    href: '/tools/facebook-font'
  },
  {
    id: 'discord-font',
    title: 'Discord Font Generator',
    description: 'Create unique text formatting for Discord messages, usernames, and server content with special characters',
    icon: '🎮',
    href: '/tools/discord-font'
  }
];

// Generate metadata using the modular system
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('social-media-text-generators', {
    locale: 'en',
    pathname: '/category/social-media-text-generators'
  });
}

export default function SocialMediaTextGeneratorsCategory() {
  return (
    <CategoryPage
      categorySlug="social-media-text-generators"
      tools={socialMediaTextGenerators}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'All Tools', href: '/tools' },
        { label: 'Social Media Text Generators' }
      ]}
    />
  );
}