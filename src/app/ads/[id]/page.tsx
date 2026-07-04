import { Metadata, ResolvingMetadata } from 'next';
import AdDetailClient from './AdDetailClient';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/ads/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch ad');
    const responseData = await res.json();
    const ad = responseData.data;

    const previousImages = (await parent).openGraph?.images || [];
    const adImages = ad?.image_urls?.length > 0 ? ad.image_urls : [];

    return {
      title: `${ad.title || 'إعلان'} | إعلاني`,
      description: ad.description || 'تفاصيل الإعلان على منصة إعلاني',
      openGraph: {
        title: `${ad.title || 'إعلان'} | إعلاني`,
        description: ad.description || 'تفاصيل الإعلان على منصة إعلاني',
        images: [...adImages, ...previousImages],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${ad.title || 'إعلان'} | إعلاني`,
        description: ad.description || 'تفاصيل الإعلان على منصة إعلاني',
        images: adImages.length > 0 ? [adImages[0]] : [],
      }
    };
  } catch (error) {
    return {
      title: 'إعلان | إعلاني',
      description: 'منصة إعلاني للإعلانات المبوبة',
    };
  }
}

export default function Page({ params }: Props) {
  return <AdDetailClient />;
}
