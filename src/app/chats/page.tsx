'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import DashboardSidebar from '@/components/DashboardSidebar';

export default function ChatsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    api.getChats()
      .then(res => setConversations(res.data))
      .catch(() => toast.error(lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'فشل تحميل الرسائل' : 'Failed to load chats'))
      .finally(() => setLoading(false));
  }, [lang]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>⏳ {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;

  return (
    <div style={{ padding: '40px 20px', minHeight: '90vh' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '32px' }} className="dashboard-layout">
          <DashboardSidebar />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
              💬 <span className="gradient-text">{lang === 'ar' ? 'المحادثات' : 'Chats'}</span>
            </h1>

            {conversations.length === 0 ? (
              <div className="glass" style={{ padding: '60px', textAlign: 'center', color: '#8888aa' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📩</div>
                <p style={{ fontSize: '18px' }}>{lang === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {conversations.map((conv: any) => {
                  return (
                    <Link key={conv.id} href={`/chats/${conv.id}`} style={{ textDecoration: 'none' }}>
                      <div className="glass-light chat-item" style={{ 
                        padding: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px',
                        transition: 'all 0.3s ease',
                        border: conv.unread_count > 0 ? '1px solid #6c3bff' : '1px solid var(--border)',
                        background: conv.unread_count > 0 ? 'rgba(108,59,255,0.05)' : 'auto'
                      }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#1a1a35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                          {conv.other_user?.image_path ? <img src={conv.other_user.image_path} alt="avatar" style={{width: '100%', height:'100%', objectFit: 'cover'}}/> : '👤'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#e8e8f0' }}>{conv.other_user?.name || 'مستخدم غير معروف'}</h3>
                            <span style={{ fontSize: '12px', color: '#555577' }}>{conv.latest_message_time || new Date(conv.updated_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US')}</span>
                          </div>
                          {conv.ad?.title && (
                             <div style={{ fontSize: '13px', color: '#8b64ff', marginBottom: '4px', fontWeight: 600 }}>{lang === 'ar' ? 'بخصوص:' : 'Regarding:'} {conv.ad.title}</div>
                          )}
                          <p style={{ fontSize: '14px', color: conv.unread_count > 0 ? '#fff' : '#8888aa', fontWeight: conv.unread_count > 0 ? 'bold' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                            {conv.latest_message || (lang === 'ar' ? 'لا توجد رسائل' : 'No messages')}
                          </p>
                        </div>
                        {conv.unread_count > 0 && (
                          <div style={{ background: '#6c3bff', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                            {conv.unread_count}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-item:hover {
          background: rgba(108,59,255,0.1) !important;
          transform: translateX(${lang === 'ar' ? '-5px' : '5px'});
        }
      `}</style>
    </div>
  );
}
