'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function RegisterContent() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', referral_code: '', country_id: '' });
  const [countries, setCountries] = useState<{id: number, name: string, flag_emoji: string}[]>([]);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setForm(prev => ({ ...prev, referral_code: ref }));
    }
    
    api.getCountries().then(res => {
      if (res.data) {
        // Filter out global country and duplicates
        const uniqueCountries = res.data.filter((v: any, i: number, a: any[]) => 
          a.findIndex(t => (t.id === v.id)) === i && v.code !== 'GL' && v.name !== 'عالمي'
        );
        setCountries(uniqueCountries);
      }
    }).catch(console.error);
  }, [searchParams]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.register(form);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      router.push('/');
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Record<string, string[]> };
      const firstErr = e?.errors ? Object.values(e.errors)[0]?.[0] : e?.message;
      setError(firstErr || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div className="orb orb-purple" style={{ width: '500px', height: '500px', top: '-200px', left: '-100px', opacity: 0.4 }} />
      <div className="orb orb-orange" style={{ width: '350px', height: '350px', bottom: '-100px', right: '-50px', opacity: 0.3 }} />

      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: '440px', padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '32px', fontWeight: 900, background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            إعلاني
          </span>
          <p style={{ color: '#8888aa', marginTop: '8px', fontSize: '15px' }}>إنشاء حساب جديد</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'الاسم الكامل', type: 'text', ph: 'اسمك الكريم' },
            { key: 'email', label: 'البريد الإلكتروني', type: 'email', ph: 'you@example.com' },
            { key: 'password', label: 'كلمة المرور', type: 'password', ph: '8 أحرف على الأقل' },
            { key: 'referral_code', label: 'كود الدعوة (اختياري)', type: 'text', ph: 'إذا كان لديك كود' },
          ].map(({ key, label, type, ph }) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#c8c8e0', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>{label}</label>
              <input className="input-field" type={type} placeholder={ph} required={key !== 'referral_code'}
                value={(form as Record<string, string>)[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}

          <div style={{ marginBottom: '20px' }}>
             <label style={{ display: 'block', color: '#c8c8e0', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>الدولة</label>
             <select className="input-field" required value={form.country_id} onChange={e => setForm({ ...form, country_id: e.target.value })}>
                <option value="">-- اختر دولتك --</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.flag_emoji} {c.name}</option>
                ))}
             </select>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#f87171', fontSize: '14px', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
            {loading ? '⏳ جاري التسجيل...' : '🚀 إنشاء الحساب'}
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button 
            type="button"
            onClick={async () => {
              try {
                const res = await api.client.get('/auth/google/redirect');
                if (res.data?.url) window.location.href = res.data.url;
              } catch (e) {
                toast.error('حدث خطأ', { description: 'يرجى إعداد مفاتيح Google API في لوحة التحكم' });
              }
            }}
            className="btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
          >
            <img src="https://www.google.com/favicon.ico" width="20" height="20" alt="Google" />
            التسجيل باستخدام جوجل
          </button>

          <button 
            type="button"
            onClick={async () => {
              try {
                const res = await api.client.get('/auth/facebook/redirect');
                if (res.data?.url) window.location.href = res.data.url;
              } catch (e) {
                toast.error('حدث خطأ', { description: 'يرجى إعداد مفاتيح Facebook API في لوحة التحكم' });
              }
            }}
            className="btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'rgba(24, 119, 242, 0.1)', borderColor: 'rgba(24, 119, 242, 0.3)' }}
          >
            <span style={{ fontSize: '18px', color: '#1877F2', fontWeight: 'bold' }}>f</span>
            التسجيل باستخدام فيسبوك
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#8888aa', fontSize: '14px' }}>
          لديك حساب بالفعل؟{' '}
          <Link href="/login" style={{ color: '#8b64ff', textDecoration: 'none', fontWeight: 700 }}>سجّل دخولك</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
