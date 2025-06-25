import { getAllTools } from '@/lib/tools';
import { TOOL_CATEGORIES } from '@/lib/tools';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all tools
  const tools = await getAllTools();

  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://case-converter.vercel.app';

  // Static pages
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }
  ];

  // Category pages - using the actual categories from your codebase
  const categories = [
    'Convert Case',
    'Text Modification/Formatting',
    'Code & Data Translation',
    'Image Tools',
    'Random Generators',
    'Misc. Tools'
  ];

  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Tool pages - include all tools regardless of visibility
  const toolPages = tools.map(tool => ({
    url: `${baseUrl}/tools/${tool.id}`,
    lastModified: new Date(tool.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Combine all pages
  return [...staticPages, ...categoryPages, ...toolPages];
} 