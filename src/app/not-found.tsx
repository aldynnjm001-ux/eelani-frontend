'use client';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function NotFound() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '24px' }}>
      <div className="orb orb-purple" style={{ top: '20%', right: '20%' }} />
      <h1 style={{ fontSize: '100px', fontWeight: 900, background: 'linear-gradient(135deg, #6c3bff, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
        {isAr ? 'عذراً، الصفحة غير موجودة' : 'Oops, Page Not Found'}
      </h2>
      <p style={{ color: '#8888aa', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.6' }}>
        {isAr 
          ? 'يبدو أن الرابط الذي تبحث عنه غير صحيح أو تم نقل الصفحة. لا تقلق، يمكنك العودة دائماً للرئيسية.' 
          : 'It seems the link you are looking for is incorrect or the page has moved. Do not worry, you can always go back home.'}
      </p>
      <Link href="/" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 32px' }}>
        {isAr ? 'العودة للرئيسية' : 'Back to Home'}
      </Link>
    </div>
  );
}
