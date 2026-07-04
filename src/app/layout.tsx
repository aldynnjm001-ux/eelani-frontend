import './globals.css';
import Providers from './Providers';

export const metadata = {
  title: 'إعلاني | منصة الإعلانات الأولى',
  description: 'أفضل منصة إعلانية لبيع وشراء كل ما تحتاجه بأسرع وقت وأقل جهد',
  manifest: '/manifest.json',
  themeColor: '#050511',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'إعلاني',
  },
  openGraph: {
    title: 'إعلاني | منصة الإعلانات الأولى',
    description: 'أفضل منصة إعلانية لبيع وشراء كل ما تحتاجه',
    type: 'website',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // We use standard dir="rtl" initially, Providers will handle dynamic lang if needed
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
