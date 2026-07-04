'use client';
import { useState, useEffect, useRef } from 'react';
import { api, API_URL_DEBUG } from '@/lib/api';
import AdCard from '@/components/AdCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { translateDB } from '@/lib/translations';
import { toast } from '@/lib/toast';

interface Ad { id: number; title: string; description: string; status: string; image_urls?: string[]; category?: { name: string }; user?: { name: string }; package?: { title: string; is_featured: boolean }; }
interface Category { id: number; name: string; icon: string; }

export default function HomePage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [stats, setStats] = useState({ ads_count: 0, categories_count: 0, users_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();
  const router = useRouter();
  const isAr = lang === 'ar';

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    // جلب الأقسام
    api.getCategories().then(res => setCategories(res.data || [])).catch(console.error);

    // دالة جلب الإعلانات حسب الدولة
    const fetchAds = () => {
      setLoading(true);
      const params = new URLSearchParams();
      const countryCode = localStorage.getItem('selected_country');
      
      if (countryCode && countryCode !== 'Global') {
        params.append('country', countryCode);
      }
      if (selectedCat) {
        params.append('category_id', String(selectedCat));
      }
      if (search) {
        params.append('search', search);
      }
      
      api.getAds(params.toString()).then(res => {
        setAds(res.data?.data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    };

    // جلب الإعلانات عند التحميل
    fetchAds();

    // الاستماع لتغيير الدولة
    window.addEventListener('country_changed', fetchAds);

    // جلب العروض النشطة
    api.getActiveOffers().then(res => setOffers(res.data || [])).catch(console.error);

    // جلب الباقات
    api.getPackages().then(res => setPackages(res.data || [])).catch(console.error);

    // جلب الإحصائيات
    api.getLiveStats().then(res => {
      console.log('Stats Received:', res);
      const data = res.data || res;
      setStats({
        ads_count: data.ads_count ?? data.ads ?? 0,
        categories_count: data.categories_count ?? data.categories ?? 0,
        users_count: data.users_count ?? data.users ?? 0
      });
      setError(false);
    }).catch((err) => {
      console.error('Stats Fetch Error:', err);
      setError(true);
    });

    return () => {
      window.removeEventListener('country_changed', fetchAds);
    };
  }, []);

  // Auto-slide logic (RTL Compatible)
  useEffect(() => {
    if (packages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % packages.length;
        if (carouselRef.current) {
          const cardWidth = 360; // Card width + gap
          carouselRef.current.scrollTo({
            left: next * cardWidth, // In RTL, scrollLeft 0 is right, positive is left
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [packages]);

  const handleSearch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCat) params.set('category_id', String(selectedCat));
    
    const countryCode = localStorage.getItem('selected_country');
    if (countryCode && countryCode !== 'Global') params.set('country', countryCode);

    const res = await api.getAds(params.toString());
    setAds(res.data?.data || []);
    setLoading(false);
  };

  const handleCatClick = async (catId: number | null) => {
    setSelectedCat(catId);
    setLoading(true);
    const params = new URLSearchParams();
    if (catId) params.set('category_id', String(catId));
    if (search) params.set('search', search);

    const countryCode = localStorage.getItem('selected_country');
    if (countryCode && countryCode !== 'Global') params.set('country', countryCode);

    const res = await api.getAds(params.toString());
    setAds(res.data?.data || []);
    setLoading(false);
  };

  const handleCreateAlert = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const countryId = localStorage.getItem('selected_country_id');
      await api.createSearchAlert({ 
        keyword: search || (lang === 'ar' ? 'الكل' : 'All'), 
        category_id: selectedCat || undefined,
        country_id: countryId ? parseInt(countryId) : undefined
      });
      toast.success(lang === 'ar' ? 'تم تفعيل التنبيه بنجاح!' : 'Alert Activated!', lang === 'ar' ? 'سنرسل لك إشعاراً فور توفر إعلان يطابق طلبك.' : 'We will notify you as soon as a matching ad is available.');
    } catch (e) {
      console.error(e);
      toast.error(lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'حدث خطأ أثناء تفعيل التنبيه.' : 'Error activating alert.');
    }
  };

  const getDynamicTitle = () => {
    if (selectedCat) {
      const cat = categories.find(c => c.id === selectedCat);
      return `${lang === 'ar' ? 'أفضل عروض' : 'Best Offers in'} ${translateDB(lang, cat?.name || '')}`;
    }
    return lang === 'ar' ? '🔥 أحدث الإعلانات المضافة' : '🔥 Latest Added Ads';
  };

  return (
    <div>
      {/* ━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 100px', textAlign: 'center' }}>
        <div className="orb orb-purple" style={{ width: '600px', height: '600px', top: '-200px', right: '-100px', opacity: 0.5 }} />
        <div className="orb orb-orange" style={{ width: '400px', height: '400px', bottom: '-100px', left: '-100px', opacity: 0.4 }} />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(108,59,255,0.1)', border: '1px solid rgba(108,59,255,0.3)', borderRadius: '20px', padding: '8px 20px', marginBottom: '24px', fontSize: '14px', color: '#8b64ff', fontWeight: 600 }}>
            ✨ {t('home.hero.explore')}
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '20px' }}>
            <span className="gradient-text">{t('home.hero.title_part1')}</span>
            <br />
            <span style={{ color: '#e8e8f0' }}>{t('home.hero.title_part2')}</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#8888aa', marginBottom: '40px', lineHeight: 1.7 }}>
            {t('home.hero.subtitle')}
          </p>
          {/* Search Section */}
        <div style={{ marginBottom: '40px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="home-search-bar">
            <div style={{ flex: 1, position: 'relative' }}>
              <input 
                type="text" 
                placeholder={lang === 'ar' ? "ابحث عن سيارات، عقارات، خدمات..." : "Search for cars, real estate, services..."}
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(139, 100, 255, 0.3)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px', outline: 'none', transition: 'all 0.3s' }}
                onFocus={e => e.target.style.borderColor = '#8b64ff'}
                onBlur={e => e.target.style.borderColor = 'rgba(139, 100, 255, 0.3)'}
              />
              <span style={{ position: 'absolute', right: lang === 'ar' ? 'auto' : '20px', left: lang === 'ar' ? '20px' : 'auto', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>
            
            <select 
              value={selectedCat || ''} 
              onChange={e => setSelectedCat(e.target.value ? Number(e.target.value) : null)}
              style={{ padding: '0 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', outline: 'none', minWidth: '150px', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#1a1a2e' }}>{lang === 'ar' ? 'كل الأقسام' : 'All Categories'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>{c.icon} {c.name}</option>
              ))}
            </select>
            
            <button onClick={handleSearch} style={{ padding: '0 25px', borderRadius: '12px', background: 'linear-gradient(135deg, #6c3bff, #ff6b35)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              {lang === 'ar' ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>

          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '48px' }}>
            {error ? (
              <div style={{ color: '#ff6b6b', fontSize: '14px', background: 'rgba(255,107,107,0.1)', padding: '10px 20px', borderRadius: '10px' }}>
                ⚠️ فشل الاتصال بخادم البيانات (Backend). تأكد أنه يعمل على منفذ 8000.
              </div>
            ) : (
              [
                [stats.ads_count + '+', t('home.stats.ads')], 
                [stats.categories_count + '+', t('home.categories.title')], 
                [stats.users_count + '+', t('home.stats.users')]
              ].map(([num, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{num}</div>
                  <div style={{ fontSize: '13px', color: '#8888aa', marginTop: '4px' }}>{label}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━ OFFERS CAROUSEL ━━━━━━━━━━━━━━━ */}
      {offers.length > 0 && (
        <section style={{ padding: '0 24px 60px' }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '20px' }} className="no-scrollbar snap-x">
              {offers.map((offer, idx) => (
                <div key={idx} className="snap-center" style={{ flexShrink: 0, width: '100%', maxWidth: '800px', margin: '0 auto', borderRadius: '24px', overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, rgba(108,59,255,0.1), rgba(255,107,53,0.1))', border: '1px solid rgba(108,59,255,0.2)' }}>
                  {offer.image_url && (
                    <img src={offer.image_url} alt={offer.title} style={{ width: '100%', height: '300px', objectFit: 'cover', opacity: 0.8 }} />
                  )}
                  <div style={{ position: offer.image_url ? 'absolute' : 'relative', bottom: 0, left: 0, right: 0, padding: '40px', background: offer.image_url ? 'linear-gradient(to top, rgba(15,15,26,1), transparent)' : 'transparent', zIndex: 2 }}>
                    {offer.discount_percentage > 0 && (
                      <span style={{ display: 'inline-block', background: '#ff6b35', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 900, marginBottom: '12px' }}>
                        خصم {offer.discount_percentage}% 🔥
                      </span>
                    )}
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>{offer.title}</h2>
                    <p style={{ color: '#e8e8f0', fontSize: '16px', maxWidth: '600px', marginBottom: '24px', lineHeight: 1.5 }}>{offer.description}</p>
                    <Link href="/post-ad" className="btn-primary" style={{ display: 'inline-flex' }}>استفد من العرض الآن ←</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━ CATEGORIES ━━━━━━━━━━━━━━━ */}
      <section style={{ padding: '0 24px 60px' }}>
        <div className="container">
          <div className="no-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px 0' }}>
            <button 
              onClick={() => handleCatClick(null)}
              className={`category-pill ${selectedCat === null ? 'active' : ''}`}
              style={{ flexShrink: 0, padding: '12px 28px', borderRadius: '16px', border: '1px solid rgba(108,59,255,0.2)', background: 'transparent', color: selectedCat === null ? '#fff' : '#8888aa', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontWeight: 700, fontSize: '15px' }}>
              🌐 {lang === 'ar' ? 'الكل' : 'All'}
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleCatClick(cat.id)}
                className={`category-pill ${selectedCat === cat.id ? 'active' : ''}`}
                style={{ flexShrink: 0, padding: '12px 28px', borderRadius: '16px', border: '1px solid rgba(108,59,255,0.2)', background: 'transparent', color: selectedCat === cat.id ? '#fff' : '#8888aa', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '18px', marginLeft: '8px' }}>{cat.icon}</span> {translateDB(lang, cat.name)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━ ADS GRID ━━━━━━━━━━━━━━━ */}
      <section style={{ padding: '0 24px 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#e8e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '4px', height: '32px', background: 'var(--primary)', borderRadius: '2px' }} />
               {getDynamicTitle()}
            </h2>
            <Link href="/ads" style={{ color: '#6c3bff', textDecoration: 'none', fontWeight: 700, fontSize: '14px', borderBottom: '2px solid transparent' }} className="hover-link">
              {lang === 'ar' ? 'استكشاف الجميع ←' : 'Explore All ←'}
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '24px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: '320px', borderRadius: '16px', background: 'rgba(26,26,53,0.5)', animation: 'pulse 2s infinite' }} />
              ))}
            </div>
          ) : ads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(108,59,255,0.2)' }} className="animate-fade-up">
                <div style={{ fontSize: '80px', marginBottom: '24px' }}>✨</div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                  {lang === 'ar' 
                    ? (search || selectedCat ? 'لم نجد أي إعلانات تطابق بحثك' : 'لا توجد إعلانات لمستخدمي هذه الدولة بعد') 
                    : (search || selectedCat ? 'No ads match your search' : 'No ads for users in this country yet')}
                </h3>
                <p style={{ color: '#8888aa', maxWidth: '400px', margin: '0 auto 32px' }}>
                  {lang === 'ar' 
                    ? (search || selectedCat ? 'ولكن لا تقلق! كن أول من يعلم عند توفر طلبك عبر تفعيل التنبيه، أو كن أنت صاحب الإعلان الأول.' : 'سوف يتم تنبيهك عندما تتوفر إعلانات جديدة، أو كن أنت صاحب الإعلان الأول واصنع الفارق.') 
                    : (search || selectedCat ? 'But don\'t worry! Be the first to know by activating the alert, or be the first to post an ad.' : 'You will be notified when new ads become available, or be the first to post an ad and make a difference.')}
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/post-ad" className="btn-primary">➕ {lang === 'ar' ? 'أضف إعلانك الآن' : 'Post Ad Now'}</Link>
                  <button onClick={handleCreateAlert} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔔 {lang === 'ar' ? 'نبهني عند التوفر' : 'Alert me when available'}
                  </button>
                </div>
              </div>
          ) : (
            <motion.div 
              className="ads-grid"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.1 }}
            >
              {ads.map((ad, index) => (
                <motion.div 
                  key={ad.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                   <AdCard ad={ad} lang={lang} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━ PRICING SLIDESHOW (SINGLE CARD FADE) ━━━━━━━━━━━━━━━ */}
      <section style={{ padding: '100px 0', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, transparent, rgba(108,59,255,0.05), transparent)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
             <h2 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '16px' }}>
               💎 <span className="gradient-text">{isAr ? 'باقاتنا الخيالية' : 'Our Fantastic Packages'}</span>
             </h2>
             <p style={{ color: '#8888aa', maxWidth: '600px', margin: '0 auto' }}>{isAr ? 'اكتشف العرض تلو الآخر، واختر ما يبهرك' : 'Discover offers one after another, and choose what amazes you'}</p>
          </div>

          <div style={{ 
            position: 'relative', 
            minHeight: '600px', 
            maxWidth: '420px', 
            margin: '0 auto',
            width: '100%'
          }}>
            {packages.map((pkg, idx) => (
                <div 
                key={pkg.id} 
                className="glow-card-container" 
                style={{ 
                  position: idx === currentIndex ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  opacity: currentIndex === idx ? 1 : 0,
                  visibility: currentIndex === idx ? 'visible' : 'hidden',
                  transition: 'opacity 0.8s ease, visibility 0.8s',
                  zIndex: currentIndex === idx ? 10 : 1
                }}
              >
                <div className="glow-card-inner" style={{ padding: '40px 24px', minHeight: '550px' }}>
                  <div className="light-streak" />
                  {pkg.is_featured && (
                    <div style={{ 
                      position: 'absolute', top: '15px', left: '15px',
                      background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', padding: '5px 14px', borderRadius: '20px',
                      fontSize: '10px', fontWeight: 900, color: '#fff', zIndex: 10
                    }}>
                      {isAr ? 'الأكثر طلباً 🔥' : 'Most Popular 🔥'}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '10px', color: '#fff' }}>{translateDB(lang, pkg.title)}</h3>
                    <p style={{ color: '#8888aa', fontSize: '13px', lineHeight: 1.5, minHeight: '40px' }}>{pkg.description}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '32px' }}>
                    <span style={{ fontSize: '42px', fontWeight: 950, color: '#fff', letterSpacing: '-1px' }}>${pkg.price}</span>
                    <span style={{ color: '#8888aa', fontSize: '14px', fontWeight: 600 }}>/ {pkg.duration_days} {isAr ? 'يوم' : 'Days'}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', flex: 1 }}>
                     {[
                       isAr ? 'ظهور في النتائج العامة' : 'Appearance in general results',
                       isAr ? 'دعم الصور والفيديوهات' : 'Photo and video support',
                       pkg.is_featured ? (isAr ? 'أولوية الظهور في المقدمة' : 'Priority display at the top') : (isAr ? 'وصول قياسي عبر المنصة' : 'Standard reach across the platform'),
                       pkg.duration_days > 30 ? (isAr ? 'تثبيت في الصفحة الرئيسية' : 'Pinned on home page') : (isAr ? 'ظهور مؤقت للعملاء' : 'Temporary appearance to customers')
                     ].map((feat, index) => (
                       <div key={index} style={{ fontSize: '13px', color: '#e8e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(108,59,255,0.1)', color: '#8b64ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>✓</span>
                         {feat}
                       </div>
                     ))}
                  </div>

                  <Link href={`/post-ad?package_id=${pkg.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px', fontSize: '15px' }}>
                    {isAr ? 'اشترك الآن ⚡' : 'Subscribe Now ⚡'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
             {packages.map((_, i) => (
               <div key={i} onClick={() => setCurrentIndex(i)} style={{ width: currentIndex === i ? '24px' : '8px', height: '8px', borderRadius: '4px', background: currentIndex === i ? '#6c3bff' : 'rgba(108,59,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }} />
             ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━ CTA ━━━━━━━━━━━━━━━ */}
      <section style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-purple" style={{ width: '500px', height: '500px', top: '-200px', left: '50%', transform: 'translateX(-50%)', opacity: 0.3 }} />
        <div className="glass" style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 40px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px' }}>
            <span className="gradient-text">{isAr ? 'انشر إعلانك الآن' : 'Post Your Ad Now'}</span>
          </h2>
          <p style={{ color: '#8888aa', fontSize: '16px', marginBottom: '32px', lineHeight: 1.7 }}>
            {isAr ? 'وصل إعلانك لآلاف المهتمين في دقائق. باقات متنوعة تناسب جميع الميزانيات.' : 'Reach thousands of interested buyers in minutes. Various packages to suit all budgets.'}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/post-ad" className="btn-primary">➕ {isAr ? 'انشر إعلاناً الآن' : 'Post Ad Now'}</Link>
            {user ? (
              <Link href="/profile" className="btn-secondary" style={{ textDecoration: 'none' }}>👤 {isAr ? 'ملفي الشخصي' : 'My Profile'}</Link>
            ) : (
              <Link href="/register" className="btn-secondary" style={{ textDecoration: 'none' }}>{isAr ? 'إنشاء حساب' : 'Create Account'}</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
