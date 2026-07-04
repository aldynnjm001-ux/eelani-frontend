import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { translateDB } from '@/lib/translations';

interface Ad {
  id: number;
  title: string;
  description: string;
  status: string;
  image_urls?: string[];
  category?: { name: string };
  user?: { name: string };
  expires_at?: string;
  package?: { title: string; is_featured: boolean };
  views_count?: number;
  clicks_count?: number;
  country?: { name_ar: string; name_en: string };
}

export default function AdCard({ ad, lang: oldLang }: { ad: Ad, lang?: 'ar' | 'en' }) {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) setCurrentUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!ad.image_urls || ad.image_urls.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % ad.image_urls!.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [ad.image_urls]);

  const isMyAd = currentUser && ad.user && (currentUser.id === (ad.user as any).id || currentUser.id === (ad as any).user_id);

  return (
    <Link href={`/ads/${ad.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass hover-scale" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%', 
        overflow: 'hidden', 
        position: 'relative',
        background: 'rgba(26,26,53,0.4)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Images Slider */}
        <div style={{ height: '200px', background: '#111', position: 'relative', overflow: 'hidden' }} className="group/slider">
          {ad.image_urls && ad.image_urls.length > 0 ? (
              <img 
                src={ad.image_urls[currentImageIndex]} 
                alt={ad.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }} 
              />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
              📸 لا توجد صورة
            </div>
          )}
          
          {ad.package?.is_featured && (
            <div style={{ position: 'absolute', top: '12px', right: isAr ? '12px' : 'auto', left: !isAr ? '12px' : 'auto', background: 'linear-gradient(135deg,#ff6b35,#ff9a44)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 900, boxShadow: '0 4px 10px rgba(255,107,53,0.3)', zIndex: 10 }}>
              🌟 {isAr ? 'مميز' : 'Featured'}
            </div>
          )}

          {/* Navigation Arrows */}
          {ad.image_urls && ad.image_urls.length > 1 && (
            <>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => prev === 0 ? ad.image_urls!.length - 1 : prev - 1);
                }}
                className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-20 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev + 1) % ad.image_urls!.length);
                }}
                className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity z-20 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>

              {/* Dots Pagination */}
              <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
                  {ad.image_urls.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(i);
                        }}
                        style={{ 
                          width: i === currentImageIndex ? '16px' : '6px', 
                          height: '6px', 
                          borderRadius: '10px', 
                          background: i === currentImageIndex ? '#6c3bff' : 'rgba(255,255,255,0.6)', 
                          transition: 'all 0.3s ease',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }} 
                      />
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#e8e8f0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {ad.title}
          </h3>
          <p style={{ fontSize: '13px', color: '#8888aa', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '12px', flex: 1 }}>
            {ad.description}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#a8a8c0' }}>
              <span>📍</span> {ad.country ? (isAr ? ad.country.name_ar : ad.country.name_en) : (isAr ? 'غير محدد' : 'Unknown')}
            </div>
            <div style={{ background: 'rgba(255,107,53,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#ff6b35' }}>
              <span>👁️</span> {ad.views_count || 0}
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
              <span>🖱️</span> {ad.clicks_count || 0}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(108,59,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: isMyAd ? '1px solid #10b981' : 'none' }}>
                👤
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', color: isMyAd ? '#10b981' : '#e8e8f0', fontWeight: isMyAd ? 800 : 600 }}>
                  {isMyAd ? (isAr ? 'أنت (إعلانك)' : 'You (Your Ad)') : (ad.user?.name || (isAr ? 'غير محدد' : 'Unknown'))}
                  {(ad.user as any)?.is_verified && <span title="بائع موثوق" style={{ fontSize: '14px', marginLeft: '4px' }}>✅</span>}
                </span>
                {!isMyAd && ad.user && (ad.user as any).average_rating !== undefined && (
                  <span style={{ fontSize: '11px', color: '#ffc107', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {(ad.user as any).average_rating > 0 ? (
                      <>
                        <span style={{ fontSize: '12px' }}>★</span>
                        <span style={{ color: '#8888aa' }}>{(ad.user as any).average_rating}</span>
                      </>
                    ) : (
                      <span style={{ color: '#555577', fontSize: '10px' }}>{isAr ? 'جديد' : 'New'}</span>
                    )}
                  </span>
                )}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#6c3bff', fontWeight: 700, background: 'rgba(108,59,255,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
              {ad.category ? translateDB(lang, ad.category.name) : ''}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
