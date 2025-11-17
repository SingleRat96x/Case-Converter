import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category
const tools = [
  { id: "instagram-fonts", title: "Instagram-Schriftarten", description: "Stilisierte Schriftarten für Instagram", icon: "📸", href: "/de/tools/instagram-fonts" },
  { id: "facebook-font", title: "Facebook-Schriftarten", description: "Einzigartige Schriftarten für Facebook", icon: "👤", href: "/de/tools/facebook-font" },
  { id: "discord-font", title: "Discord-Schriftarten", description: "Formatierte Schriftarten für Discord", icon: "💬", href: "/de/tools/discord-font" }
];

export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('social-media-text-generators', {
    locale: 'de',
    pathname: '/de/category/social-media-text-generators'
  });
}

export default function CategoryPageDE() {
  return (
    <CategoryPage
      categorySlug="social-media-text-generators"
      tools={tools}
    />
  );
}
