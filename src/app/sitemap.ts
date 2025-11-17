import type { MetadataRoute } from 'next';
import { getAllMetadataEntries } from '@/lib/metadata/toolMetadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://textcaseconverter.net';
  const now = new Date().toISOString();

  const entries = getAllMetadataEntries();
  const urls: MetadataRoute.Sitemap = [];

  for (const e of entries) {
    urls.push({ url: `${base}${e.pathname}`, changeFrequency: 'weekly', lastModified: now, priority: e.type === 'category' ? 0.7 : 0.6 });
    // RU locale path
    urls.push({ url: `${base}/ru${e.pathname === '/' ? '' : e.pathname}`, changeFrequency: 'weekly', lastModified: now, priority: e.type === 'category' ? 0.7 : 0.6 });
    // DE locale path
    urls.push({ url: `${base}/de${e.pathname === '/' ? '' : e.pathname}`, changeFrequency: 'weekly', lastModified: now, priority: e.type === 'category' ? 0.7 : 0.6 });
  }

  // Add home pages
  urls.push({ url: `${base}/`, changeFrequency: 'weekly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/ru`, changeFrequency: 'weekly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/de`, changeFrequency: 'weekly', lastModified: now, priority: 0.8 });

  // Add static company/legal pages explicitly
  const staticPaths = [
    '/about-us',
    '/contact-us',
    '/privacy-policy',
    '/terms-of-service'
  ];
  for (const p of staticPaths) {
    urls.push({ url: `${base}${p}`, changeFrequency: 'monthly', lastModified: now, priority: 0.5 });
    urls.push({ url: `${base}/ru${p}`, changeFrequency: 'monthly', lastModified: now, priority: 0.5 });
    urls.push({ url: `${base}/de${p}`, changeFrequency: 'monthly', lastModified: now, priority: 0.5 });
  }

  // Add changelog page
  urls.push({ url: `${base}/changelog`, changeFrequency: 'weekly', lastModified: now, priority: 0.6 });
  urls.push({ url: `${base}/ru/changelog`, changeFrequency: 'weekly', lastModified: now, priority: 0.6 });
  urls.push({ url: `${base}/de/changelog`, changeFrequency: 'weekly', lastModified: now, priority: 0.6 });

  // Explicitly add high-priority tools (override default 0.6)
  urls.push({ url: `${base}/tools/add-line-numbers-to-text`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/ru/tools/add-line-numbers-to-text`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/de/tools/add-line-numbers-to-text`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/tools/add-prefix-and-suffix-to-lines`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/ru/tools/add-prefix-and-suffix-to-lines`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/de/tools/add-prefix-and-suffix-to-lines`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/tools/sha1-hash-generator`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/ru/tools/sha1-hash-generator`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });
  urls.push({ url: `${base}/de/tools/sha1-hash-generator`, changeFrequency: 'monthly', lastModified: now, priority: 0.8 });

  return urls;
}

