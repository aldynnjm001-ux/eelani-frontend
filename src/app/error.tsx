'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '24px' }}>
      <div className="orb orb-orange" style={{ top: '20%', left: '20%' }} />
      <h1 style={{ fontSize: '80px', fontWeight: 900, color: '#ef4444', lineHeight: 1, marginBottom: '16px' }}>
        ⚠️
      </h1>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
        عذراً، حدث خطأ غير متوقع!
      </h2>
      <p style={{ color: '#8888aa', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.6' }}>
        نواجه بعض الصعوبات التقنية في عرض هذه الصفحة. يرجى المحاولة مرة أخرى أو العودة للرئيسية.
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={() => reset()} className="btn-primary" style={{ padding: '12px 32px' }}>
          إعادة المحاولة
        </button>
        <Link href="/" className="btn-secondary" style={{ textDecoration: 'none', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
