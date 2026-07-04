'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { t, lang } = useLanguage();

  const navItems = [
    { name: t('nav.profile'), href: '/profile', icon: '👤' },
    { name: t('nav.myads'), href: '/my-ads', icon: '📢' },
    { name: t('nav.transactions'), href: '/transactions', icon: '📊' },
    { name: t('nav.messages'), href: '/chats', icon: '💬' },
  ];

  return (
    <div className="glass dashboard-sidebar" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
        {t('myads.dashboard')}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/chats' && pathname.startsWith('/chats'));
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: isActive ? 800 : 600,
              color: isActive ? '#fff' : 'var(--text-muted)',
              background: isActive ? 'linear-gradient(135deg, rgba(108,59,255,0.2), rgba(108,59,255,0.05))' : 'transparent',
              border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
              transition: 'all 0.3s ease',
              boxShadow: isActive ? '0 4px 15px rgba(108,59,255,0.1)' : 'none',
            }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
        <Link href="/post-ad" className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
          {t('myads.post_new')}
        </Link>
      </div>
    </div>
  );
}
