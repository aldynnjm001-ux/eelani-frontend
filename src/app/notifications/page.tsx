'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { api } from '@/lib/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { lang } = useLanguage();

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    fetchNotifications();
  }, [router]);

  const handleMarkAsRead = async (id: number, link: string) => {
    try {
      await api.markNotificationAsRead(id);
      fetchNotifications();
      if (link) {
        router.push(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#fff' }}>
          {lang === 'ar' ? 'سجل الإشعارات' : 'Notifications Log'}
        </h1>
        {notifications.some(n => !n.read_at) && (
          <button 
            onClick={handleMarkAllAsRead} 
            style={{ 
              background: 'rgba(108,59,255,0.1)', border: '1px solid rgba(108,59,255,0.3)', 
              color: '#fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
              fontWeight: 'bold', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,59,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,59,255,0.1)'}
          >
            {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8888aa' }}>
          <div className="spinner" style={{ border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6c3bff', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          {lang === 'ar' ? 'جاري تحميل الإشعارات...' : 'Loading notifications...'}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🔕</div>
          <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>
            {lang === 'ar' ? 'لا توجد إشعارات بعد' : 'No notifications yet'}
          </h3>
          <p style={{ color: '#8888aa' }}>
            {lang === 'ar' ? 'سجل الإشعارات الخاص بك فارغ حالياً.' : 'Your notification log is currently empty.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.map(n => (
            <div 
              key={n.id} 
              onClick={() => handleMarkAsRead(n.id, n.data?.link || '/')}
              style={{
                background: n.read_at ? 'rgba(255,255,255,0.02)' : 'rgba(108,59,255,0.1)',
                border: '1px solid',
                borderColor: n.read_at ? 'rgba(255,255,255,0.05)' : 'rgba(108,59,255,0.3)',
                padding: '24px', borderRadius: '16px', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', gap: '16px'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,59,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = n.read_at ? 'rgba(255,255,255,0.05)' : 'rgba(108,59,255,0.3)'}
            >
              <div style={{ fontSize: '24px', flexShrink: 0, opacity: n.read_at ? 0.5 : 1 }}>
                {n.data?.title?.includes('عرض مميز') || n.data?.title?.includes('Featured') ? '🌟' : '🔔'}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '18px', color: '#fff', fontWeight: n.read_at ? 'normal' : 'bold', margin: 0 }}>
                    {n.data?.title || 'إشعار جديد'}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#8888aa', flexShrink: 0, marginLeft: '16px' }}>
                    {new Date(n.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                <p style={{ fontSize: '15px', color: n.read_at ? '#aaa' : '#e0e0e0', margin: 0, lineHeight: 1.6 }}>
                  {n.data?.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
