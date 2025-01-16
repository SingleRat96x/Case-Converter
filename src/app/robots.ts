import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Get the base URL from environment variable or construct it from the request
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/*?*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
} 