import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://eelani.com'; // Change to actual production URL

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profile/', '/dashboard/', '/messages/', '/transactions/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
