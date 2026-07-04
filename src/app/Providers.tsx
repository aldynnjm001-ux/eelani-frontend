'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LanguageContext } from '@/lib/LanguageContext';
import { t } from '@/lib/translations';
import EchoProvider from '@/providers/EchoProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [settings, setSettings] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('site_lang') as 'ar' | 'en';
    if (savedLang) setLang(savedLang);
    api.getGlobalSettings().then(res => setSettings(res)).catch(console.error);
  }, []);

  const handleSetLang = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    localStorage.setItem('site_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  let siteName = settings?.site_name || 'إعلاني';
  if (lang === 'en' && siteName === 'إعلاني') {
    siteName = 'Eelani';
  }

  return (
    <EchoProvider>
      <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t: (k) => t(lang, k) }}>
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100vw', overflow: 'hidden' }}>
          <Navbar siteName={siteName} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ flex: '1 0 auto', padding: isMobile ? '80px 16px 24px' : '24px', minHeight: 'calc(100vh - 100px)' }}>
              {children}
            </div>
            <Footer lang={lang} siteName={siteName} settings={settings} />
          </div>
        </div>
      </LanguageContext.Provider>
    </EchoProvider>
  );
}
