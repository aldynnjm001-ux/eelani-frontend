'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import AdCard from '@/components/AdCard';
import Link from 'next/link';
import { toast } from '@/lib/toast';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useLanguage } from '@/lib/LanguageContext';

export default function MyAdsPage() {
  const { t, lang } = useLanguage();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchMyAds();
    api.profile().then(r => setUser(r.data));
  }, []);

  const fetchMyAds = async () => {
    try {
      const res = await api.myAds();
      setAds(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferral = () => {
    if (!user?.referral_code) return;
    const link = `${window.location.origin}/register?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success(lang === 'ar' ? 'تم النسخ' : 'Copied', lang === 'ar' ? 'تم نسخ رابط الدعوة الخاص بك' : 'Your invite link has been copied');
  };

  const handleDelete = async (id: number) => {
    const title = lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion';
    const msg = lang === 'ar' ? 'هل أنت متأكد من حذف هذا الإعلان نهائياً؟' : 'Are you sure you want to permanently delete this ad?';
    const result = await toast.confirm(title, msg);
    
    if (result.isConfirmed) {
      try {
        await api.deleteAd(id);
        setAds(ads.filter(ad => ad.id !== id));
        toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted', lang === 'ar' ? 'تم حذف الإعلان بنجاح من حسابك' : 'Ad deleted successfully');
      } catch (err) {
        toast.error(lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'حدث خطأ أثناء محاولة الحذف' : 'An error occurred while deleting');
      }
    }
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: '90vh' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '32px' }} className="dashboard-layout">
          
          <DashboardSidebar />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
                  <span className="gradient-text">{t('myads.title')}</span>
                </h1>
                <p style={{ color: '#8888aa' }}>{t('myads.subtitle')}</p>
              </div>
            </div>

            {/* لوحة تحكم الدعوات */}
            <div className="glass" style={{ 
              padding: '24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              background: 'linear-gradient(135deg, rgba(108,59,255,0.1) 0%, rgba(255,107,53,0.05) 100%)',
              border: '1px solid rgba(108,59,255,0.2)'
            }}>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#6c3bff' }}>{user?.invites_count || 0}</div>
                  <div style={{ fontSize: '12px', color: '#8888aa' }}>{t('myads.invites_completed')}</div>
                </div>
                <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{t('myads.rewards')}</h3>
                  <p style={{ fontSize: '13px', color: '#8888aa' }}>{t('myads.rewards_desc')}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: lang === 'ar' ? 'flex-end' : 'flex-start', gap: '8px' }}>
                <div style={{ fontSize: '11px', color: '#8888aa' }}>{t('myads.invite_link')}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontFamily: 'monospace',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {user?.referral_code || '...'}
                  </div>
                  <button onClick={copyReferral} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>{t('myads.copy_link')}</button>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ color: '#8888aa' }}>{t('myads.loading')}</div>
            ) : ads.length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ color: '#8888aa', marginBottom: '24px' }}>{t('myads.no_ads')}</p>
                <Link href="/post-ad" className="btn-secondary">{t('myads.post_new')}</Link>
              </div>
            ) : (
              <div className="ads-grid">
                {ads.map(ad => (
                  <div key={ad.id} style={{ position: 'relative' }}>
                    <AdCard ad={ad} lang={lang} />
                    <div style={{ position: 'absolute', top: '10px', left: lang === 'ar' ? '10px' : 'auto', right: lang === 'en' ? '10px' : 'auto', zIndex: 10, display: 'flex', gap: '8px' }}>
                       <div style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '11px', 
                          fontWeight: 800,
                          background: ad.status === 'active' ? '#10b981' : ad.status === 'pending' ? '#f59e0b' : '#ef4444',
                          color: '#fff'
                       }}>
                         {ad.status === 'active' ? t('myads.ad.active') : ad.status === 'pending' ? t('myads.ad.pending') : t('myads.ad.rejected')}
                       </div>
                       <button 
                        onClick={() => handleDelete(ad.id)}
                        style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' }}>
                         {t('myads.ad.delete')}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
