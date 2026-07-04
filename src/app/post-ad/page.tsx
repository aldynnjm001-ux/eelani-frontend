'use client';
import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/lib/toast';
import { useLanguage } from '@/lib/LanguageContext';
import { translateDB } from '@/lib/translations';

function PostAdContent() {
  const { t, lang } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    category_id: '',
    package_id: searchParams.get('package_id') || '',
    title: '',
    description: '',
    link: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (!localUser) {
      router.push('/login');
      return;
    }
    api.profile().then(r => setUser(r.data));
    api.getCategories().then(r => setCategories(r.data || []));
    api.getPackages().then(r => {
      const pkgs = r.data || [];
      setPackages(pkgs);
      const pId = searchParams.get('package_id');
      if (pId) {
        setForm(prev => ({ ...prev, package_id: pId }));
      }
    });
  }, [searchParams]);

  const copyReferral = () => {
    if (!user?.referral_code) return;
    const link = `${window.location.origin}/register?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success(lang === 'ar' ? 'تم النسخ' : 'Copied', lang === 'ar' ? 'تم نسخ رابط الدعوة الخاص بك' : 'Your invite link has been copied');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('category_id', form.category_id);
    formData.append('package_id', form.package_id);
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (form.link) formData.append('link', form.link);
    
    const selectedPkg = packages.find(p => String(p.id) === String(form.package_id));
    const maxImages = selectedPkg?.max_images || 5;

    if (images.length > maxImages) {
      setError(lang === 'ar' ? `عذراً، الباقة المحددة تسمح برفع ${maxImages} صور كحد أقصى.` : `Sorry, the selected package allows a maximum of ${maxImages} images.`);
      setLoading(false);
      return;
    }

    if (images.length > 0) {
      images.forEach((img) => formData.append('images[]', img));
    }
    if (video) formData.append('video', video);

    try {
      const res = await api.createAd(formData);
      if (res.success) {
        if (res.is_free) {
          toast.success(lang === 'ar' ? 'تم النشر' : 'Published', lang === 'ar' ? 'تم تفعيل إعلانك المجاني بنجاح!' : 'Your free ad is now active!');
          router.push('/my-ads');
        } else {
          router.push(`/pay/${res.ad_id}`);
        }
      } else {
        toast.error(lang === 'ar' ? 'خطأ' : 'Error', res.message || (lang === 'ar' ? 'حدث خطأ أثناء النشر' : 'An error occurred'));
      }
    } catch (err: any) {
      if (err?.code === 'FREE_LIMIT_REACHED') {
        setError(err.message);
      } else {
        toast.error(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection Error', err?.message || (lang === 'ar' ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitlePlaceholder = () => {
    return lang === 'ar' ? 'اكتب عنواناً جذاباً وواضحاً هنا...' : 'Write an attractive and clear title here...';
  };

  const selectedPkg = packages.find(p => String(p.id) === String(form.package_id));
  const maxImages = selectedPkg?.max_images || 5;

  return (
    <div style={{ padding: '40px 24px 80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          ➕ <span className="gradient-text">{t('post.title')}</span>
        </h1>
        <p style={{ color: '#8888aa', marginBottom: '32px' }}>{t('post.subtitle')}</p>

        {user?.free_ads_balance > 0 ? (
          <div style={{ background: 'linear-gradient(135deg, rgba(108,59,255,0.2), rgba(255,107,53,0.2))', padding: '16px', borderRadius: '12px', border: '1px solid rgba(108,59,255,0.4)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎁</span>
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: 700 }}>{lang === 'ar' ? 'لديك هدية ترحيبية!' : 'You have a welcome gift!'}</h4>
              <p style={{ margin: '4px 0 0 0', color: '#e8e8f0', fontSize: '14px' }}>{lang === 'ar' ? `لديك رصيد (${user.free_ads_balance}) إعلان مجاني. يمكنك استخدامه بنشر إعلانك عبر الباقة المجانية.` : `You have a balance of (${user.free_ads_balance}) free ads. Use it by selecting the free package.`}</p>
            </div>
          </div>
        ) : user?.can_post_weekly_free ? (
          <div style={{ background: 'rgba(59, 255, 108, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59, 255, 108, 0.3)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📅</span>
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: 700 }}>{lang === 'ar' ? 'إعلانك المجاني الأسبوعي متاح!' : 'Your weekly free ad is available!'}</h4>
              <p style={{ margin: '4px 0 0 0', color: '#e8e8f0', fontSize: '14px' }}>{lang === 'ar' ? 'يمكنك نشر إعلان واحد مجاناً كل أسبوع.' : 'You can post one ad for free every week.'}</p>
            </div>
          </div>
        ) : user?.next_free_ad_date ? (
          <div style={{ background: 'rgba(255, 107, 107, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 107, 107, 0.3)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⏳</span>
            <div>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: 700 }}>{lang === 'ar' ? 'لقد استهلكت إعلانك المجاني الأسبوعي' : 'You have used your weekly free ad'}</h4>
              <p style={{ margin: '4px 0 0 0', color: '#e8e8f0', fontSize: '14px' }}>{lang === 'ar' ? `سيتوفر إعلانك المجاني القادم بتاريخ: ${new Date(user.next_free_ad_date).toLocaleDateString('ar-EG')} - يمكنك الآن الترقية لباقة مدفوعة للاستمرار.` : `Your next free ad will be available on: ${new Date(user.next_free_ad_date).toLocaleDateString()}. You can upgrade to a paid package to continue.`}</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="glass" style={{ padding: '40px' }}>
          <div className="responsive-grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('post.form.category')}</label>
              <select className="input-field" required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                <option value="">{t('post.form.select_category')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {translateDB(lang, c.name)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('ad.details.package')}</label>
              <select className="input-field" required value={form.package_id} onChange={e => setForm({...form, package_id: e.target.value})}>
                <option value="">{lang === 'ar' ? 'اختر الباقة...' : 'Select Package...'}</option>
                {packages.map(p => <option key={p.id} value={p.id}>{translateDB(lang, p.title)} ({p.price} $)</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('post.form.ad_title')}</label>
            <input 
              className="input-field" 
              required 
              placeholder={getTitlePlaceholder()} 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('post.form.description')}</label>
            <textarea className="input-field" required style={{ minHeight: '120px' }} placeholder={lang === 'ar' ? 'اكتب تفاصيل الإعلان هنا...' : 'Write ad details here...'} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('post.form.images').replace('{limit}', String(maxImages))}</label>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={URL.createObjectURL(img)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✕
                  </button>
                </div>
              ))}
              
              {images.length < maxImages && (
                <label style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed rgba(108,59,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(108,59,255,0.05)', color: '#8b64ff', fontSize: '24px', transition: 'all 0.3s' }}>
                  +
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setImages(prev => {
                            const newImages = [...prev, ...files];
                            if (newImages.length > maxImages) {
                                toast.error(lang === 'ar' ? 'تجاوز الحد المسموح' : 'Limit Exceeded', lang === 'ar' ? `الباقة تسمح برفع ${maxImages} صور فقط!` : `Package allows only ${maxImages} images!`);
                                return newImages.slice(0, maxImages);
                            }
                            return newImages;
                        });
                        e.target.value = ''; 
                    }} 
                  />
                </label>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#8888aa' }}>
               {t('post.form.images_desc').replace('{count}', String(images.length)).replace('{limit}', String(maxImages))}
            </div>
          </div>
          {(() => {
            const selectedPkg = packages.find(p => String(p.id) === String(form.package_id));
            if (selectedPkg?.allows_video) {
              return (
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('post.form.video')}</label>
                  <input type="file" accept="video/*" onChange={e => setVideo(e.target.files ? e.target.files[0] : null)} />
                </div>
              );
            }
            return null;
          })()}

          {error && (
            <div className="glass" style={{ 
              color: '#ff6b6b', 
              marginBottom: '20px', 
              padding: '15px', 
              border: '1px solid rgba(255,107,107,0.3)',
              background: 'rgba(255,107,107,0.1)',
              borderRadius: '12px'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '8px' }}>⚠️ {lang === 'ar' ? 'خطأ' : 'Error'}</div>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{error}</p>
              {error.includes(lang === 'ar' ? 'دعوة 5 أشخاص' : '5 people') && (
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={copyReferral} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>🔗 {lang === 'ar' ? 'نسخ رابط الدعوة' : 'Copy Invite Link'}</button>
                  <button type="button" onClick={() => { setForm({...form, package_id: ''}); setError(''); }} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', background: 'linear-gradient(135deg, #6c3bff, #8b64ff)' }}>💎 {lang === 'ar' ? 'رؤية الباقات المدفوعة' : 'View Paid Packages'}</button>
                </div>
              )}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? (lang === 'ar' ? '⏳ جاري النشر...' : '⏳ Publishing...') : t('post.form.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PostAdPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <PostAdContent />
    </Suspense>
  );
}
