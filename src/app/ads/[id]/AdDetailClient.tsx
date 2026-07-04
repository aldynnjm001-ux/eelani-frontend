'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { toast } from '@/lib/toast';
import AdCard from '@/components/AdCard';
import { useLanguage } from '@/lib/LanguageContext';
import { translateDB } from '@/lib/translations';

interface Ad {
  id: number; title: string; description: string; status: string; link?: string;
  image_urls?: string[]; video_urls?: string[];
  category?: { name: string }; user?: { id: number; name: string; whatsapp_number?: string; phone_number?: string; profile_picture?: string; created_at?: string };
  package?: { title: string; is_featured: boolean; duration_days: number };
  expires_at?: string; created_at?: string;
}

export default function AdDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ad, setAd] = useState<Ad | null>(null);
  const [relatedAds, setRelatedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [error, setError] = useState('');

  const { t, lang } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setCurrentUser(JSON.parse(stored));

    api.getAd(Number(id)).then(res => {
      setAd(res.data?.data || res.data);
      setLoading(false);
      // Fetch related ads after getting the ad details
      api.getRelatedAds(Number(id)).then(relatedRes => {
        setRelatedAds(relatedRes.data?.data || []);
      }).catch(console.error);
    }).catch(err => {
      setError(err.response?.data?.message || (lang === 'ar' ? 'فشل تحميل الإعلان' : 'Failed to load ad'));
      setLoading(false);
    });
  }, [id, lang]);

  // Carousel animation
  useEffect(() => {
    if (!ad || !ad.image_urls || ad.image_urls.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImg(prev => (prev + 1) % ad.image_urls!.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [ad]);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }} className="ad-detail-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ width: '100%', height: '500px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
              <div className="glass" style={{ padding: '32px' }}>
                <div style={{ width: '60%', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass" style={{ padding: '24px', height: '300px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}} />
      </div>
    );
  }
  
  if (error || !ad) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px', color: '#8888aa' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
        <p style={{ fontSize: '18px' }}>{error}</p>
        <button className="btn-secondary" onClick={() => router.back()} style={{ marginTop: '24px' }}>← {lang === 'ar' ? 'رجوع' : 'Back'}</button>
      </div>
    );
  }

  const isOwner = currentUser?.id === ad.user?.id;

  return (
    <div style={{ padding: '40px 24px 80px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <BackButton />
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '32px', color: '#8888aa', fontSize: '14px' }}>
          <Link href="/" style={{ color: '#8888aa', textDecoration: 'none' }}>{t('nav.home')}</Link>
          <span>›</span>
          <Link href="/ads" style={{ color: '#8888aa', textDecoration: 'none' }}>{t('nav.ads')}</Link>
          <span>›</span>
          <span style={{ color: '#e8e8f0' }}>{ad.title}</span>
        </div>

        <div className="ad-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          {/* Left - Images + Details */}
          <div style={{ width: '100%' }}>
            {/* Main Images Gallery */}
            {ad.image_urls && ad.image_urls.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {ad.image_urls.map((url, i) => (
                  <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: 'rgba(26,26,53,0.6)', position: 'relative' }}>
                    <img src={url} alt={`${ad.title} - صورة ${i+1}`} style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }} />
                    {i === 0 && ad.package?.is_featured && (
                      <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: '#000', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 800 }}>
                        ⭐ إعلان مميز
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', height: '400px', background: 'rgba(26,26,53,0.6)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '80px', opacity: 0.3 }}>📢</div>
              </div>
            )}

            {/* Video */}
            {ad.video_urls && ad.video_urls.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px', color: '#e8e8f0' }}>🎬 فيديو الإعلان</h3>
                <video controls style={{ width: '100%', borderRadius: '12px', background: '#000' }}>
                  <source src={ad.video_urls[0]} />
                </video>
              </div>
            )}

            {/* Seller Card */}
            <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c3bff, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff', fontWeight: 800 }}>
                  {ad.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {ad.user?.name}
                    {(ad.user as any)?.is_verified && <span title="بائع موثوق" style={{ fontSize: '18px', display: 'flex' }}>✅</span>}
                  </h3>
                  <div style={{ color: '#8888aa', fontSize: '14px', marginTop: '4px' }}>
                    {ad.user?.created_at && (lang === 'ar' ? `عضو منذ ${new Date(ad.user.created_at).getFullYear()}` : `Member since ${new Date(ad.user.created_at).getFullYear()}`)}
                  </div>
                </div>
              </div>

              {/* FOMO Indicator */}
              {(ad as any).views_count > 0 && (
                <div style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', animation: 'pulse 1.5s infinite' }}>🔥</span>
                  <span style={{ color: '#ff6b35', fontSize: '14px', fontWeight: 600 }}>
                    {lang === 'ar' ? `هذا الإعلان لفت انتباه ${(ad as any).views_count} أشخاص` : `This ad caught the attention of ${(ad as any).views_count} people`}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass" style={{ padding: '24px', marginTop: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', color: '#e8e8f0' }}>{ad.title}</h2>
              <p style={{ color: '#a8a8c0', lineHeight: 1.8, fontSize: '15px', whiteSpace: 'pre-wrap' }}>{ad.description}</p>
            </div>
          </div>

          {/* Right - Info Card / Owner Stats */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="glass" style={{ padding: '28px' }}>
              {isOwner ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>📊</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#e8e8f0' }}>{lang === 'ar' ? 'إحصائيات إعلانك' : 'Your Ad Stats'}</h2>
                    <p style={{ fontSize: '13px', color: '#8888aa' }}>{lang === 'ar' ? 'نظرة عامة على أداء هذا الإعلان' : 'Overview of ad performance'}</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="glass-light" style={{ padding: '16px', textAlign: 'center', borderRight: '4px solid #6c3bff' }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#8b64ff' }}>{(ad as any).views_count || 0}</div>
                      <div style={{ fontSize: '12px', color: '#8888aa' }}>{lang === 'ar' ? 'عدد المشاهدات' : 'Views'} 👁️</div>
                    </div>
                    
                    <div className="glass-light" style={{ padding: '16px', textAlign: 'center', borderRight: '4px solid #10b981' }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>{(ad as any).clicks_count || 0}</div>
                      <div style={{ fontSize: '12px', color: '#8888aa' }}>{lang === 'ar' ? 'النقرات' : 'Clicks'} 🖱️</div>
                    </div>
                    
                    <div className="glass-light" style={{ padding: '16px', textAlign: 'center', borderRight: '4px solid #f59e0b' }}>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#f59e0b' }}>{ad.status === 'active' ? (lang === 'ar' ? 'نشط ✅' : 'Active ✅') : ad.status === 'pending' ? (lang === 'ar' ? 'بانتظار المراجعة ⏳' : 'Pending ⏳') : (lang === 'ar' ? 'مرفوض ❌' : 'Rejected ❌')}</div>
                      <div style={{ fontSize: '12px', color: '#8888aa' }}>{lang === 'ar' ? 'حالة الإعلان' : 'Ad Status'}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <Link href="/my-ads" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                      {lang === 'ar' ? 'العودة لإعلاناتي' : 'Back to My Ads'}
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Category */}
                  {ad.category && (
                    <div style={{ marginBottom: '20px' }}>
                      <span style={{ background: 'rgba(108,59,255,0.15)', color: '#8b64ff', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                        {translateDB(lang, ad.category.name)}
                      </span>
                    </div>
                  )}

                  <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#e8e8f0', lineHeight: 1.4 }}>{ad.title}</h1>

                  {/* Meta info */}
                  <div style={{ borderTop: '1px solid rgba(108,59,255,0.15)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {ad.user && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>👤</span>
                        <div>
                          <div style={{ fontSize: '12px', color: '#8888aa' }}>{lang === 'ar' ? 'المعلن' : 'Advertiser'}</div>
                          <Link href={`/users/${ad.user.id}`} style={{ fontSize: '15px', fontWeight: 600, color: '#8b64ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {ad.user.name} <span style={{ fontSize: '12px' }}>🔗</span>
                          </Link>
                        </div>
                      </div>
                    )}
                    {ad.package && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>📦</span>
                        <div>
                          <div style={{ fontSize: '12px', color: '#8888aa' }}>{lang === 'ar' ? 'الباقة' : 'Package'}</div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8e8f0' }}>{translateDB(lang, ad.package.title)}</div>
                        </div>
                      </div>
                    )}
                    {ad.expires_at && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>📅</span>
                        <div>
                          <div style={{ fontSize: '12px', color: '#8888aa' }}>{lang === 'ar' ? 'ينتهي في' : 'Expires on'}</div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8e8f0' }}>{new Date(ad.expires_at).toLocaleDateString(lang)}</div>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>👁️</span>
                      <div>
                        <div style={{ fontSize: '12px', color: '#8888aa' }}>{lang === 'ar' ? 'المشاهدات' : 'Views'}</div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#e8e8f0' }}>{(ad as any).views_count || 0} {lang === 'ar' ? 'مشاهدة' : 'views'}</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      onClick={async () => {
                        if (!currentUser) {
                          toast.error(lang === 'ar' ? 'صلاحية مطلوبة' : 'Login Required', lang === 'ar' ? 'يجب تسجيل الدخول للتواصل مع المعلن' : 'You must log in to chat with the advertiser');
                          return;
                        }
                        try {
                          const res = await api.startChat(ad.id, ad.user?.id!);
                          if (res.success) {
                            window.location.href = `/chats/${res.data.conversation_id}`;
                          } else {
                            toast.error(lang === 'ar' ? 'خطأ' : 'Error', res.message || 'فشل بدء المحادثة');
                          }
                        } catch (err) {
                          toast.error(lang === 'ar' ? 'خطأ' : 'Error', 'فشل بدء المحادثة');
                        }
                      }} 
                      className="btn-primary" 
                      style={{ textAlign: 'center', textDecoration: 'none', justifyContent: 'center', cursor: 'pointer', border: 'none', fontFamily: 'inherit', fontSize: '15px' }}
                    >
                      💬 {lang === 'ar' ? 'مراسلة المعلن' : 'Message Advertiser'}
                    </button>
                    
                    {(ad.user as any)?.whatsapp && (
                      <a 
                        href={currentUser ? `https://wa.me/${(ad.user as any).whatsapp}` : '#'} 
                        target={currentUser ? "_blank" : "_self"} 
                        rel="noopener noreferrer" 
                        className="btn-secondary" 
                        onClick={(e) => {
                          if (!currentUser) {
                            e.preventDefault();
                            toast.error('صلاحية مطلوبة', 'يجب تسجيل الدخول أو إنشاء حساب لكي تتمكن من التواصل مع المعلن عبر الواتساب');
                          } else {
                            api.trackAdClick(ad.id);
                          }
                        }}
                        style={{ textAlign: 'center', textDecoration: 'none', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#25D366', color: '#25D366' }}>
                        <span style={{ fontSize: '18px' }}>🟢</span> واتساب
                      </a>
                    )}
                    
                    {(ad.user as any)?.phone && (
                      <a 
                        href={currentUser ? `tel:${(ad.user as any).phone}` : '#'} 
                        className="btn-secondary" 
                        onClick={(e) => {
                          if (!currentUser) {
                            e.preventDefault();
                            toast.error('صلاحية مطلوبة', 'يجب تسجيل الدخول أو إنشاء حساب لكي تتمكن من إظهار رقم الهاتف');
                          } else {
                            api.trackAdClick(ad.id);
                          }
                        }}
                        style={{ textAlign: 'center', textDecoration: 'none', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📞</span> اتصال هاتفي
                      </a>
                    )}

                    {ad.link && (
                      <a href={ad.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
                        🔗 زيارة الرابط
                      </a>
                    )}
                    <Link href="/post-ad" className="btn-accent" style={{ textAlign: 'center', textDecoration: 'none', marginTop: '12px' }}>
                      ➕ انشر إعلانك مثله
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* إعلانات مشابهة */}
        {relatedAds.length > 0 && (
          <div style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>
              <span className="gradient-text">{lang === 'ar' ? 'إعلانات مشابهة قد تهمك' : 'Similar Ads You May Like'}</span>
            </h2>
            <div className="ads-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {relatedAds.map(rAd => (
                <AdCard key={rAd.id} ad={rAd as any} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
