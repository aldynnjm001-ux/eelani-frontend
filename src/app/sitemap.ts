import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eelani.com'; // Change to actual production URL

  // Fetch all active ads from backend
  try {
    const res = await fetch('http://127.0.0.1:8000/api/ads', { next: { revalidate: 3600 } });
    const data = await res.json();
    
    const ads = data.data?.data || [];

    const adUrls = ads.map((ad: any) => ({
      url: `${baseUrl}/ads/${ad.id}`,
      lastModified: new Date(ad.updated_at || ad.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/post-ad`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      ...adUrls,
    ];
  } catch (error) {
    // Fallback if API fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
