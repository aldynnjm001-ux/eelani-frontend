'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useLanguage } from '@/lib/LanguageContext';

export default function ProfilePage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    account_type: 'individual',
    company_name: '',
    company_description: '',
    company_website: '',
    company_address: ''
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    Promise.all([api.profile(), api.getUserStats()])
      .then(([userRes, statsRes]) => {
        setUser(userRes.data);
        setStats(statsRes.data);
        setFormData({
          name: userRes.data.name,
          phone: userRes.data.phone || '',
          whatsapp: userRes.data.whatsapp || '',
          email: userRes.data.email,
          account_type: userRes.data.account_type || 'individual',
          company_name: userRes.data.company_name || '',
          company_description: userRes.data.company_description || '',
          company_website: userRes.data.company_website || '',
          company_address: userRes.data.company_address || ''
        });
      })
      .catch(() => {
        toast.error('خطأ', 'يجب تسجيل الدخول أولاً');
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (logoFile) data.append('company_logo', logoFile);
      if (coverFile) data.append('company_cover', coverFile);

      const res = await api.updateProfile(data);
      if (res.success) {
        toast.success('نجاح', 'تم تحديث الملف الشخصي');
        setUser(res.data);
      }
    } catch (err: any) {
      toast.error('خطأ', 'فشل تحديث البيانات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>⏳ جاري التحميل...</div>;

  return (
    <div style={{ padding: '40px 20px', minHeight: '90vh' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '32px' }} className="dashboard-layout">
          
          <DashboardSidebar />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Cards */}
            <div className="profile-grid">

            <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{user.name}</h2>
              <div className="badge badge-active" style={{ marginBottom: '16px' }}>
                {user.is_verified ? (isAr ? '🛡️ حساب موثق' : '🛡️ Verified') : (isAr ? '👤 مستخدم عادي' : '👤 Regular User')}
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: isAr ? 'right' : 'left' }}>
                <div style={{ fontSize: '13px', color: '#8888aa', marginBottom: '8px' }}>{isAr ? 'رابط الإحالة الخاص بك:' : 'Your referral link:'}</div>
                <div className="glass-light" style={{ padding: '8px 12px', fontSize: '12px', wordBreak: 'break-all', color: '#8b64ff', cursor: 'pointer' }} onClick={() => {
                  navigator.clipboard.writeText(stats?.referral_link);
                  toast.success(isAr ? 'تم النسخ' : 'Copied', isAr ? 'تم نسخ رابط الإحالة' : 'Referral link copied');
                }}>
                  {stats?.referral_link} 📋
                </div>
              </div>
            </div>

            <div className="responsive-grid-2">
               <div className="glass-light" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#8b64ff' }}>{stats?.active_ads}</div>
                  <div style={{ fontSize: '11px', color: '#8888aa' }}>{isAr ? 'إعلان نشط' : 'Active Ad'}</div>
               </div>
               <div className="glass-light" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#ff6b35' }}>{stats?.total_views}</div>
                  <div style={{ fontSize: '11px', color: '#8888aa' }}>{isAr ? 'مشاهدة' : 'Views'}</div>
               </div>
               <div className="glass-light" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#10b981' }}>{stats?.free_ads_balance}</div>
                  <div style={{ fontSize: '11px', color: '#8888aa' }}>{isAr ? 'رصيد مجاني' : 'Free Balance'}</div>
               </div>
               <div className="glass-light" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#f59e0b' }}>{stats?.invites_count}</div>
                  <div style={{ fontSize: '11px', color: '#8888aa' }}>{isAr ? 'دعوات ناجحة' : 'Successful Invites'}</div>
               </div>
            </div>
          </div>

          {/* Right: Settings Form */}
          <div className="glass" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px' }}>⚙️ {isAr ? 'إعدادات الحساب' : 'Account Settings'}</h3>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="responsive-grid-2">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                  <input className="input-field" placeholder="مثلاً: 770000000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'رقم الواتساب (اختياري)' : 'WhatsApp (Optional)'}</label>
                  <input className="input-field" placeholder="مثلاً: 967770000000" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                </div>
              </div>
              <div style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', padding: '16px', borderRadius: '12px', marginTop: '-8px' }}>
                <h4 style={{ color: '#ff6b35', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>⚠️ {isAr ? 'تنبيه إخلاء مسؤولية' : 'Disclaimer'}</h4>
                <p style={{ fontSize: '13px', color: '#e8e8f0', lineHeight: 1.6, marginBottom: '8px' }}>
                  {isAr ? 'أي شخص يمتلك حساباً في المنصة ويشاهد إعلانك يستطيع الوصول إليك بسهولة وأمان عبر الرسائل الداخلية للموقع دون الحاجة لإظهار رقمك.' : 'Anyone with an account can contact you safely through the internal messaging system without needing your phone number.'}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'البريد الإلكتروني (لا يمكن تغييره)' : 'Email (Cannot be changed)'}</label>
                <input className="input-field" value={formData.email} disabled style={{ opacity: 0.6 }} />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'نوع الحساب' : 'Account Type'}</label>
                  <select 
                    className="input-field" 
                    value={formData.account_type} 
                    onChange={e => setFormData({...formData, account_type: e.target.value})}
                  >
                    <option value="individual">{isAr ? 'فردي' : 'Individual'}</option>
                    <option value="business">{isAr ? 'حساب أعمال / شركة' : 'Business Account'}</option>
                  </select>
                </div>
              </div>

              {formData.account_type === 'business' && (
                <div style={{ background: 'rgba(108,59,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(108,59,255,0.1)' }}>
                  <h4 style={{ color: '#8b64ff', fontWeight: 700, marginBottom: '16px' }}>{isAr ? 'بيانات الشركة' : 'Company Details'}</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'اسم الشركة / المتجر' : 'Company/Store Name'}</label>
                      <input className="input-field" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} required={formData.account_type === 'business'} />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'نبذة عن الشركة' : 'Company Description'}</label>
                      <textarea className="input-field" rows={3} value={formData.company_description} onChange={e => setFormData({...formData, company_description: e.target.value})}></textarea>
                    </div>

                    <div className="responsive-grid-2">
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'الموقع الإلكتروني' : 'Website'}</label>
                        <input type="url" className="input-field" placeholder="https://" value={formData.company_website} onChange={e => setFormData({...formData, company_website: e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'العنوان الفعلي' : 'Physical Address'}</label>
                        <input className="input-field" value={formData.company_address} onChange={e => setFormData({...formData, company_address: e.target.value})} />
                      </div>
                    </div>

                    <div className="responsive-grid-2">
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'شعار الشركة' : 'Company Logo'}</label>
                        <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="input-field" style={{ padding: '8px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>{isAr ? 'صورة الغلاف' : 'Cover Image'}</label>
                        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="input-field" style={{ padding: '8px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                <button className="btn-primary" type="submit" disabled={saving} style={{ flex: 1, minWidth: '200px', padding: '14px', fontSize: '15px' }}>
                  {saving ? (isAr ? '⏳ جاري الحفظ...' : '⏳ Saving...') : (isAr ? '💾 حفظ التغييرات' : '💾 Save Changes')}
                </button>
                <button 
                  type="button" 
                  onClick={async () => {
                    const result = await toast.confirm(
                      isAr ? 'تأكيد الحذف' : 'Confirm Deletion', 
                      isAr ? 'هل أنت متأكد أنك تريد حذف حسابك نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure you want to delete your account permanently? This action cannot be undone.'
                    );
                    if (result.isConfirmed) {
                      setSaving(true);
                      try {
                        await api.deleteProfile();
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/';
                      } catch (e) {
                        toast.error(isAr ? 'خطأ' : 'Error', isAr ? 'حدث خطأ أثناء حذف الحساب' : 'Failed to delete account');
                        setSaving(false);
                      }
                    }
                  }} 
                  className="btn-secondary" 
                  disabled={saving} 
                  style={{ flex: 1, minWidth: '200px', padding: '14px', fontSize: '15px', background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span>🗑️</span> {isAr ? 'حذف الحساب' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>

          </div> {/* End of Main Content flex div */}
        </div>

      </div>
    </div>
  );
}
