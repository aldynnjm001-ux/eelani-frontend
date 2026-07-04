'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer({ lang, siteName, settings }: { lang: 'ar' | 'en', siteName?: string, settings?: any }) {
  const isAr = lang === 'ar';
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <footer style={{ borderTop: '1px solid rgba(108,59,255,0.15)', padding: '40px 24px', marginTop: '80px', textAlign: 'center' }}>
      <div className="container">
        <span style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {siteName || 'إعلاني'}
        </span>
        <p style={{ color: '#8888aa', marginTop: '12px', fontSize: '14px' }}>
          {isAr ? 'منصة الإعلانات الأولى في المنطقة' : 'The #1 Ad Platform in the Region'}
        </p>

        {settings && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px' }}>
            {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer" style={{ color: '#8b64ff', textDecoration: 'none' }}>Facebook</a>}
            {settings.twitter_url && <a href={settings.twitter_url} target="_blank" rel="noreferrer" style={{ color: '#8b64ff', textDecoration: 'none' }}>Twitter</a>}
            {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" style={{ color: '#8b64ff', textDecoration: 'none' }}>Instagram</a>}
            {settings.contact_email && <a href={`mailto:${settings.contact_email}`} style={{ color: '#8b64ff', textDecoration: 'none' }}>Email</a>}
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <Link href="/about" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '14px' }}>{isAr ? 'من نحن' : 'About Us'}</Link>
          <Link href="/contact" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '14px' }}>{isAr ? 'تواصل معنا' : 'Contact Us'}</Link>
          <Link href="/terms" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '14px' }}>{isAr ? 'الشروط والأحكام' : 'Terms of Service'}</Link>
          <Link href="/privacy" style={{ color: '#8888aa', textDecoration: 'none', fontSize: '14px' }}>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
        </div>
        <p style={{ color: '#555577', marginTop: '24px', fontSize: '13px' }}>
          © 2026 {siteName || 'إعلاني'} — {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
        </p>
      </div>
    </footer>
  );
}
