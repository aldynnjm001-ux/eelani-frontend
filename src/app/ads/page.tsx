'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AdCard from '@/components/AdCard';
import { useLanguage } from '@/lib/LanguageContext';
import { translateDB } from '@/lib/translations';
import { toast } from '@/lib/toast';

interface Ad { id: number; title: string; description: string; status: string; image_urls?: string[]; category?: { name: string }; user?: { name: string }; package?: { title: string; is_featured: boolean }; }
interface Category { id: number; name: string; icon: string; }

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [meta, setMeta] = useState<{ total?: number; current_page?: number; last_page?: number }>({});
  
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  useEffect(() => {
    api.getCategories().then(r => setCategories(r.data || []));
    fetchAds(selectedCat, search); // Fetch initially

    // Handle country changes explicitly
    const handleCountryChange = () => fetchAds(selectedCat, search);
    window.addEventListener('country_changed', handleCountryChange);
    return () => {
      window.removeEventListener('country_changed', handleCountryChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAds = async (catId?: number | null, q?: string, page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (catId) params.set('category_id', String(catId));
    if (q) params.set('search', q);
    params.set('page', String(page));
    
    const countryCode = localStorage.getItem('selected_country');
    if (countryCode && countryCode !== 'Global') {
      params.set('country', countryCode);
    }

    const res = await api.getAds(params.toString());
    setAds(res.data?.data || []);
    setMeta({ total: res.data?.total, current_page: res.data?.current_page, last_page: res.data?.last_page });
    setLoading(false);
  };

  const handleCat = (id: number | null) => { setSelectedCat(id); fetchAds(id, search); };
  const handleSearch = () => { fetchAds(selectedCat, search); };

  return (
    <div style={{ padding: '40px 24px 80px' }}>
      <div className="container">
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          🔎 <span className="gradient-text">{isAr ? 'تصفح الإعلانات' : 'Browse Ads'}</span>
        </h1>
        <p style={{ color: '#8888aa', marginBottom: '32px' }}>{isAr ? 'اعثر على ما تبحث عنه من بين آلاف الإعلانات' : 'Find what you are looking for among thousands of ads'}</p>

        {/* Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input className="input-field" placeholder={isAr ? 'ابحث عن إعلان...' : 'Search for an ad...'} value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, minWidth: '200px' }} />
          <button className="btn-primary" onClick={handleSearch}>🔍 {isAr ? 'بحث' : 'Search'}</button>
          {search && (
            <button className="btn-secondary" onClick={() => toast.success(isAr ? 'تم الحفظ' : 'Saved', isAr ? 'سيتم إشعارك عند توفر إعلانات جديدة تطابق بحثك' : 'You will be notified when new ads match your search')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔔 {isAr ? 'أخبرني عند التوفر' : 'Notify Me'}
            </button>
          )}
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {[{ id: null, name: isAr ? 'الكل' : 'All', icon: '🌐' }, ...categories.map(c => ({ id: c.id, name: translateDB(lang, c.name), icon: c.icon }))].map(cat => (
            <button key={String(cat.id)} onClick={() => handleCat(cat.id as number | null)}
              className="glass-light"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 24px', borderRadius: '100px', 
                border: `2px solid ${selectedCat === cat.id ? '#6c3bff' : 'transparent'}`, 
                background: selectedCat === cat.id ? 'rgba(108,59,255,0.15)' : '', 
                color: selectedCat === cat.id ? '#8b64ff' : '#e8e8f0', 
                cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontWeight: 700, fontSize: '15px', 
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '18px' }}>{cat.icon}</span> 
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Total */}
        {meta.total !== undefined && (
          <p style={{ color: '#8888aa', fontSize: '14px', marginBottom: '20px' }}>
            {isAr ? 'تم العثور على' : 'Found'} <strong style={{ color: '#8b64ff' }}>{meta.total}</strong> {isAr ? 'إعلان' : 'ads'}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="ads-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{ height: '320px', borderRadius: '16px', background: 'rgba(26,26,53,0.5)' }} />
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
              <a href="/post-ad" className="btn-primary" style={{ textDecoration: 'none' }}>
                ➕ {lang === 'ar' ? 'أضف إعلانك الآن' : 'Post Ad Now'}
              </a>
              <button onClick={async () => {
                const userRaw = localStorage.getItem('user');
                if (!userRaw) {
                  window.location.href = '/login';
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
              }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔔 {lang === 'ar' ? 'نبهني عند التوفر' : 'Alert me when available'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="ads-grid">
              {ads.map(ad => <AdCard key={ad.id} ad={ad} lang={lang} />)}
            </div>
            {/* Pagination */}
            {(meta.last_page || 1) > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '48px' }}>
                {[...Array(meta.last_page)].map((_, i) => (
                  <button key={i} onClick={() => fetchAds(selectedCat, search, i + 1)}
                    style={{ width: '40px', height: '40px', borderRadius: '10px', border: `1px solid ${meta.current_page === i + 1 ? '#6c3bff' : 'rgba(108,59,255,0.2)'}`, background: meta.current_page === i + 1 ? 'rgba(108,59,255,0.3)' : 'transparent', color: meta.current_page === i + 1 ? '#fff' : '#8888aa', cursor: 'pointer', fontWeight: 700 }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
