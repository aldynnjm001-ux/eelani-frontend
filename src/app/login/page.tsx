'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMessage('');

    if (isForgot) {
      try {
        const res = await api.forgotPassword(form.email);
        setResetMessage(res.message || 'تم إرسال كلمة المرور الجديدة');
        setTimeout(() => setIsForgot(false), 3000);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e?.message || 'فشل إرسال طلب استعادة كلمة المرور');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await api.login(form);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      // if ((api as any).client) {
      //   (api as any).client.defaults.headers.common['Authorization'] = `Bearer ${res.token}`;
      // }
      // toast.success('تم تسجيل الدخول بنجاح!');
      router.push('/');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || 'بيانات غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div className="orb orb-purple" style={{ width: '500px', height: '500px', top: '-200px', right: '-100px', opacity: 0.4 }} />
      <div className="orb orb-orange" style={{ width: '350px', height: '350px', bottom: '-100px', left: '-50px', opacity: 0.3 }} />

      <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: '440px', padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '32px', fontWeight: 900, background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            إعلاني
          </span>
          <p style={{ color: '#8888aa', marginTop: '8px', fontSize: '15px' }}>{isForgot ? 'استعادة كلمة المرور' : 'مرحباً بعودتك!'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#c8c8e0', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>البريد الإلكتروني</label>
            <input className="input-field" type="email" placeholder="you@example.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          {!isForgot && (
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', color: '#c8c8e0', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>كلمة المرور</label>
              <input className="input-field" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          )}

          {!isForgot && (
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <button type="button" onClick={() => { setIsForgot(true); setError(''); setResetMessage(''); }} style={{ background: 'none', border: 'none', color: '#8b64ff', fontSize: '13px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
                نسيت كلمة المرور؟
              </button>
            </div>
          )}

          {isForgot && <div style={{ marginBottom: '24px' }}></div>}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#f87171', fontSize: '14px', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          {resetMessage && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#10b981', fontSize: '14px', marginBottom: '20px' }}>
              ✅ {resetMessage}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ يرجى الانتظار...' : (isForgot ? '✉️ إرسال كلمة مرور جديدة' : '🔐 تسجيل الدخول')}
          </button>

          {isForgot && (
            <button type="button" className="btn-secondary" onClick={() => { setIsForgot(false); setError(''); setResetMessage(''); }} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
              ← العودة لتسجيل الدخول
            </button>
          )}
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
                تسجيل الدخول باستخدام جوجل
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
                تسجيل الدخول باستخدام فيسبوك
              </button>
            </div>
            
            <p style={{ textAlign: 'center', marginTop: '24px', color: '#8888aa', fontSize: '14px' }}>
          ليس لديك حساب؟{' '}
          <Link href="/register" style={{ color: '#8b64ff', textDecoration: 'none', fontWeight: 700 }}>أنشئ حساباً</Link>
        </p>
      </div>
    </div>
  );
}
