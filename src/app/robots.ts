import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
    'https://case-converter-v3.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/tools/',
        '/category/',
        '/about-us',
        '/contact-us',
        '/privacy-policy',
        '/terms-of-service',
      ],
      disallow: ['/admin/', '/api/', '/_next/', '/*?*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
