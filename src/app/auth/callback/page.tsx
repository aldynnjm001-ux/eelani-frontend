'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/lib/toast';
import { api } from '@/lib/api';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        api.setToken(token);
        
        toast.success('تم تسجيل الدخول بنجاح');
        router.push('/dashboard');
      } catch (e) {
        toast.error('حدث خطأ أثناء معالجة بيانات الدخول');
        router.push('/login');
      }
    } else {
      toast.error('لم يتم استلام بيانات المصادقة');
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <div style={{ fontSize: '48px', animation: 'spin 1s linear infinite' }}>🔄</div>
      <p style={{ marginTop: '20px', fontSize: '18px', color: '#e8e8f0', fontWeight: 600 }}>جاري المصادقة، يرجى الانتظار...</p>
    </div>
  );
}
