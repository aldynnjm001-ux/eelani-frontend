// Force HMR Rebuild
'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import CountrySelector from './CountrySelector';
import { useLanguage } from '@/lib/LanguageContext';
import { api } from '@/lib/api';
import { useEcho } from '@/providers/EchoProvider';
import { toast } from 'react-hot-toast';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function Navbar({ siteName }: { siteName?: string }) {
  const [user, setUser] = useState<{ name: string; role?: string } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPos, setNotifPos] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  const echo = useEcho();

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.unread_count !== undefined) {
        setUnreadCount(res.unread_count);
        setNotifications(res.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);

    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
      fetchNotifications();
    } else {
      setUser(null);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (echo && user) {
      // Get User ID from localStorage (or we can just fetch it from profile)
      const userId = localStorage.getItem('user_id') || (user as any).id;
      if (userId) {
        echo.private(`App.Models.User.${userId}`)
          .notification((notification: any) => {
            // New notification received
            toast.success(notification.title || 'إشعار جديد', notification.message || '');
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [notification, ...prev].slice(0, 5));
          });
      }
    }

    return () => {
      if (echo && user) {
        const userId = localStorage.getItem('user_id') || (user as any).id;
        if (userId) {
           echo.leaveChannel(`private-App.Models.User.${userId}`);
        }
      }
    };
  }, [echo, user]);

  const handleMarkAsRead = async (id: any, link: string) => {
    try {
      await api.markNotificationAsRead(id);
      await fetchNotifications();
      setNotifOpen(false);
      if (link && link !== '/') {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const handleNotifClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setNotifPos({ top: rect.top, bottom: rect.bottom, left: rect.left, right: window.innerWidth - rect.right });
    setNotifOpen(!notifOpen);
  };

  const mainLinks = [
    { path: '/', icon: '🏠', label: t('nav.home') },
    { path: '/ads', icon: '🏷️', label: t('nav.ads') },
    { path: '/companies', icon: '🏢', label: lang === 'ar' ? 'دليل الشركات' : 'Companies' },
  ];

  const userLinks = [
    { path: '/my-ads', icon: '📋', label: t('nav.myads') },
    { path: '/chats', icon: '💬', label: t('nav.messages') },
    { path: '/profile', icon: '👤', label: t('nav.profile') },
    { path: '/transactions', icon: '📊', label: t('nav.transactions') },
  ];

  const NotificationsDropdown = () => {
    if (typeof window === 'undefined') return null;
    
    return createPortal(
      <div 
        className="notif-container"
        style={{
          position: 'fixed',
          top: isMobile ? notifPos.bottom + 8 + 'px' : Math.min(notifPos.top, window.innerHeight - 400) + 'px',
          [lang === 'ar' ? 'left' : 'right']: isMobile ? '16px' : (isExpanded ? '290px' : '100px'),
          width: '300px',
          background: '#12122a', border: '1px solid rgba(108,59,255,0.3)', borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 999999, overflow: 'hidden'
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</h4>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} style={{ background: 'none', border: 'none', color: '#6c3bff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
            </button>
          )}
        </div>
        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8888aa', fontSize: '14px' }}>
              {lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => handleMarkAsRead(n.id, n.data?.link || '/')}
                style={{
                  padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                  background: n.read_at ? 'transparent' : 'rgba(108,59,255,0.1)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read_at ? 'transparent' : 'rgba(108,59,255,0.1)'}
              >
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: n.read_at ? 'normal' : 'bold', marginBottom: '4px' }}>{n.data?.title || 'إشعار جديد'}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{n.data?.message}</div>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <Link 
            onClick={() => setNotifOpen(false)}
            href="/notifications"
            style={{ 
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer', 
              fontSize: '14px', fontWeight: 'bold', width: '100%', padding: '8px',
              display: 'inline-block', textDecoration: 'none'
            }}
          >
            {lang === 'ar' ? 'عرض كل الإشعارات' : 'View all notifications'}
          </Link>
        </div>
      </div>,
      document.body
    );
  };

  if (!isMobile) {
    const sidebarWidth = isExpanded ? '280px' : '88px';
    return (
      <aside style={{
        width: sidebarWidth, height: '100vh', background: '#0a0a1a', 
        borderLeft: lang === 'ar' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        borderRight: lang === 'ar' ? 'none' : '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative', zIndex: 100, flexShrink: 0, boxShadow: '5px 0 25px rgba(0,0,0,0.5)'
      }}>
        {/* Toggle Button */}
        <button onClick={() => setIsExpanded(!isExpanded)} style={{
          position: 'absolute', top: '32px', [lang === 'ar' ? 'left' : 'right']: '-14px',
          width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c3bff, #512da8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          border: '2px solid #0a0a1a', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 10px rgba(108,59,255,0.5)'
        }}>
          {lang === 'ar' ? (isExpanded ? <ChevronRightIcon style={{ width: 14 }} /> : <ChevronLeftIcon style={{ width: 14 }} />) : (isExpanded ? <ChevronLeftIcon style={{ width: 14 }} /> : <ChevronRightIcon style={{ width: 14 }} />)}
        </button>

        {/* Logo */}
        <div style={{ padding: '24px', paddingRight: lang === 'en' ? '30px' : '24px', paddingLeft: lang === 'ar' ? '30px' : '24px', display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', height: '88px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/" style={{ textDecoration: 'none', overflow: 'hidden' }}>
            <span style={{ fontSize: isExpanded ? '24px' : '20px', fontWeight: 900, background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transition: 'all 0.3s', whiteSpace: 'nowrap' }}>
              {isExpanded ? (siteName || (lang === 'ar' ? 'إعلاني' : 'Eelani')) : (lang === 'ar' ? 'إ' : 'E')}
            </span>
          </Link>
        </div>

        {/* Nav Links */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {user && (
            <div style={{ marginBottom: '24px', padding: isExpanded ? '12px' : '8px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(108,59,255,0.1), rgba(255,107,53,0.1))', border: '1px solid rgba(108,59,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: '12px' }}>
              <div style={{ width: isExpanded ? '44px' : '36px', height: isExpanded ? '44px' : '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c3bff, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: isExpanded ? '20px' : '16px', fontWeight: 'bold', flexShrink: 0 }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</span>
                  <span style={{ color: '#8b64ff', fontSize: '12px' }}>{user.role === 'admin' ? (lang === 'ar' ? 'مدير النظام' : 'Admin') : (lang === 'ar' ? 'عضو' : 'Member')}</span>
                </div>
              )}
            </div>
          )}

          <Link href="/post-ad" style={{
            display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: '16px',
            padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #6c3bff, #ff6b35)', color: '#fff',
            textDecoration: 'none', fontWeight: 'bold', marginBottom: '16px', boxShadow: '0 4px 15px rgba(108,59,255,0.4)', transition: 'all 0.2s'
          }}>
            <span style={{ fontSize: '20px' }}>➕</span>
            {isExpanded && <span style={{ whiteSpace: 'nowrap' }}>{t('nav.post')}</span>}
          </Link>

          {isExpanded && <div style={{ fontSize: '11px', color: '#666688', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', padding: '0 12px' }}>{lang === 'ar' ? 'الرئيسية' : 'Main'}</div>}
          
          {mainLinks.map(item => (
            <Link key={item.path} href={item.path} style={{
              display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: '16px',
              padding: '12px', borderRadius: '12px', textDecoration: 'none',
              background: pathname === item.path ? 'rgba(108,59,255,0.15)' : 'transparent',
              color: pathname === item.path ? '#fff' : '#aaa', transition: 'all 0.2s',
              borderLeft: lang !== 'ar' && pathname === item.path ? '4px solid #6c3bff' : 'none',
              borderRight: lang === 'ar' && pathname === item.path ? '4px solid #6c3bff' : 'none',
            }}>
              <span style={{ fontSize: '22px' }}>{item.icon}</span>
              {isExpanded && <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </Link>
          ))}

          {user && (
            <>
              {isExpanded && <div style={{ fontSize: '11px', color: '#666688', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', marginTop: '24px', padding: '0 12px' }}>{lang === 'ar' ? 'حسابي' : 'Account'}</div>}
              {user.role === 'admin' && (
                <a href="http://localhost:8000/admin" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: '16px', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: '#f59e0b', fontWeight: 'bold', background: 'rgba(245,158,11,0.1)', marginTop: isExpanded ? 0 : '24px' }}>
                  <span style={{ fontSize: '22px' }}>🛡️</span>
                  {isExpanded && <span style={{ whiteSpace: 'nowrap' }}>{lang === 'ar' ? 'الإدارة' : 'Admin'}</span>}
                </a>
              )}
              
              <div style={{ position: 'relative' }} ref={!isMobile ? notifDropdownRef : null}>
                <button onClick={() => setNotifOpen(!notifOpen)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: '16px',
                  padding: '12px', borderRadius: '12px', background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer',
                  width: '100%', textAlign: 'left', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '22px', position: 'relative' }}>
                    🔔
                    {unreadCount > 0 && <span style={{ position: 'absolute', top: -5, right: -10, background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 5px', fontSize: '9px', fontWeight: 'bold' }}>{unreadCount}</span>}
                  </span>
                  {isExpanded && <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontFamily: 'inherit', fontSize: '15px' }}>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</span>}
                </button>
                {notifOpen && !isMobile && <NotificationsDropdown />}
              </div>

              {userLinks.map(item => (
                <Link key={item.path} href={item.path} style={{
                  display: 'flex', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: '16px',
                  padding: '12px', borderRadius: '12px', textDecoration: 'none',
                  background: pathname === item.path ? 'rgba(108,59,255,0.15)' : 'transparent',
                  color: pathname === item.path ? '#fff' : '#aaa', transition: 'all 0.2s',
                  borderLeft: lang !== 'ar' && pathname === item.path ? '4px solid #6c3bff' : 'none',
                  borderRight: lang === 'ar' && pathname === item.path ? '4px solid #6c3bff' : 'none',
                }}>
                  <span style={{ fontSize: '22px' }}>{item.icon}</span>
                  {isExpanded && <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{item.label}</span>}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Footer Settings & User */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isExpanded && (
            <div style={{ padding: '0 8px', marginBottom: '8px' }}>
              <CountrySelector />
            </div>
          )}
          
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', cursor: 'pointer'
          }}>
            <span style={{ fontSize: '20px' }}>🌐</span>
            {isExpanded && <span style={{ marginLeft: '12px', marginRight: '12px', fontWeight: 'bold' }}>{lang === 'ar' ? 'EN' : 'AR'}</span>}
          </button>
          
          {!user ? (
            <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(108,59,255,0.2)', color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>
              <span style={{ fontSize: '20px' }}>🔑</span>
              {isExpanded && <span style={{ marginLeft: '8px', marginRight: '8px' }}>{t('nav.login')}</span>}
            </Link>
          ) : (
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              <span style={{ fontSize: '20px' }}>🚪</span>
              {isExpanded && <span style={{ marginLeft: '8px', marginRight: '8px' }}>{t('nav.logout')}</span>}
            </button>
          )}
        </div>
      </aside>
    );
  }

  // Mobile Topbar + Drawer
  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,26,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setDrawerOpen(!drawerOpen)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', color: '#fff', display: 'flex', cursor: 'pointer' }}>
            <Bars3Icon style={{ width: '24px', height: '24px' }} />
          </button>
          
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {siteName || (lang === 'ar' ? 'إعلاني' : 'Eelani')}
            </span>
          </Link>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user && (
            <div style={{ position: 'relative' }} ref={isMobile ? notifDropdownRef : null}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <span style={{ fontSize: '20px' }}>🔔</span>
                {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>{unreadCount}</span>}
              </button>
              {notifOpen && isMobile && <NotificationsDropdown />}
            </div>
          )}
          <Link href="/post-ad" style={{ background: 'linear-gradient(135deg, #6c3bff, #ff6b35)', color: '#fff', borderRadius: '8px', padding: '8px 12px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ➕ {t('nav.post')}
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer (React Portal) */}
      {typeof window !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, pointerEvents: drawerOpen ? 'auto' : 'none' }}>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', opacity: drawerOpen ? 1 : 0, transition: 'opacity 0.3s ease', cursor: 'pointer' }} />
          
          <div style={{
            position: 'absolute', top: 0, bottom: 0, right: lang === 'ar' ? 0 : 'auto', left: lang === 'ar' ? 'auto' : 0, width: '300px', maxWidth: '85vw',
            background: '#0a0a1a', borderLeft: lang === 'ar' ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRight: lang === 'ar' ? '1px solid rgba(255,255,255,0.1)' : 'none',
            display: 'flex', flexDirection: 'column', transform: drawerOpen ? 'translateX(0)' : (lang === 'ar' ? 'translateX(100%)' : 'translateX(-100%)'), transition: 'transform 0.3s ease'
          }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {siteName || (lang === 'ar' ? 'إعلاني' : 'Eelani')}
              </span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', padding: '4px' }}>
                <XMarkIcon style={{ width: '24px', height: '24px' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* User Profile Summary */}
              {user && (
                <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(108,59,255,0.1), rgba(255,107,53,0.1))', border: '1px solid rgba(108,59,255,0.2)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c3bff, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{user.name}</span>
                    <span style={{ color: '#8b64ff', fontSize: '13px' }}>{user.role === 'admin' ? (lang === 'ar' ? 'مدير النظام' : 'Admin') : (lang === 'ar' ? 'عضو' : 'Member')}</span>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '11px', color: '#666688', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', padding: '0 12px' }}>{lang === 'ar' ? 'الرئيسية' : 'Main'}</div>
              {mainLinks.map(item => (
                <Link key={item.path} onClick={() => setDrawerOpen(false)} href={item.path} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: pathname === item.path ? '#fff' : '#aaa', background: pathname === item.path ? 'rgba(108,59,255,0.15)' : 'transparent', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '22px' }}>{item.icon}</span> {item.label}
                </Link>
              ))}

              {user && (
                <>
                  <div style={{ fontSize: '11px', color: '#666688', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', marginTop: '24px', padding: '0 12px' }}>{lang === 'ar' ? 'حسابي' : 'Account'}</div>
                  {user.role === 'admin' && (
                    <a href="http://localhost:8000/admin" target="_blank" rel="noreferrer" onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: '#f59e0b', fontWeight: 'bold', background: 'rgba(245,158,11,0.1)' }}>
                      <span style={{ fontSize: '22px' }}>🛡️</span> {lang === 'ar' ? 'الإدارة' : 'Admin'}
                    </a>
                  )}
                  {userLinks.map(item => (
                    <Link key={item.path} onClick={() => setDrawerOpen(false)} href={item.path} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: pathname === item.path ? '#fff' : '#aaa', background: pathname === item.path ? 'rgba(108,59,255,0.15)' : 'transparent', fontWeight: 'bold' }}>
                      <span style={{ fontSize: '22px' }}>{item.icon}</span> {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Mobile Drawer Footer Settings */}
            <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#12122a', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '0 8px' }}>
                <CountrySelector />
              </div>
              
              <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                <span style={{ fontSize: '20px' }}>🌐</span>
                <span style={{ marginLeft: '12px', marginRight: '12px' }}>{lang === 'ar' ? 'English' : 'العربية'}</span>
              </button>
              
              {!user ? (
                <Link href="/login" onClick={() => setDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(108,59,255,0.2)', color: '#fff', fontWeight: 'bold', textDecoration: 'none' }}>
                  <span style={{ fontSize: '20px' }}>🔑</span>
                  <span style={{ marginLeft: '8px', marginRight: '8px' }}>{t('nav.login')}</span>
                </Link>
              ) : (
                <button onClick={() => { handleLogout(); setDrawerOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                  <span style={{ fontSize: '20px' }}>🚪</span>
                  <span style={{ marginLeft: '8px', marginRight: '8px' }}>{t('nav.logout')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      , document.body)}

      {/* Global Floating Back Button */}
      {pathname !== '/' && (
        <div style={{ position: 'fixed', bottom: '24px', [lang === 'ar' ? 'left' : 'right']: '24px', zIndex: 90 }}>
          <button onClick={() => router.back()} style={{ background: 'linear-gradient(135deg, #1c1c2e, #12121e)', border: '1px solid rgba(255,255,255,0.1)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff', cursor: 'pointer' }}>
            {lang === 'ar' ? <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg> : <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>}
          </button>
        </div>
      )}
    </>
  );
}

