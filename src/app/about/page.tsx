'use client';
import { useLanguage } from '@/lib/LanguageContext';

export default function AboutPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div style={{ padding: '60px 24px', minHeight: '80vh', position: 'relative' }}>
      <div className="orb orb-purple" style={{ top: '-100px', left: '-100px' }} />
      <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>
          <span className="gradient-text">{isAr ? 'من نحن' : 'About Us'}</span>
        </h1>
        
        <div className="glass" style={{ padding: '40px', lineHeight: '1.8', fontSize: '16px', color: '#e8e8f0' }}>
          <h2 style={{ color: '#8b64ff', marginBottom: '16px' }}>{isAr ? 'قصتنا' : 'Our Story'}</h2>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'نحن منصة إعلانية رائدة تهدف إلى ربط البائعين بالمشترين في بيئة آمنة وسهلة الاستخدام. انطلقت منصة "إعلاني" لتكون الوجهة الأولى للبيع والشراء والتسويق الإلكتروني الشامل.'
              : 'We are a leading advertising platform aiming to connect sellers with buyers in a safe and user-friendly environment. Eelani was launched to be the premier destination for buying, selling, and online marketing.'}
          </p>

          <h2 style={{ color: '#8b64ff', marginBottom: '16px' }}>{isAr ? 'رؤيتنا' : 'Our Vision'}</h2>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'نسعى لبناء مجتمع تجاري مترابط، يمكن فيه لأي شخص أو شركة الوصول إلى ملايين المشترين المحتملين من خلال منصة واحدة تعتمد على أحدث تقنيات الذكاء الاصطناعي.'
              : 'We aim to build an interconnected commercial community where any person or company can reach millions of potential buyers through a single platform powered by the latest AI technologies.'}
          </p>

          <h2 style={{ color: '#8b64ff', marginBottom: '16px' }}>{isAr ? 'ماذا نقدم؟' : 'What We Offer?'}</h2>
          <ul style={{ listStyleType: 'disc', paddingInlineStart: '24px' }}>
            <li style={{ marginBottom: '8px' }}>{isAr ? 'نشر إعلانات مبوبة في مختلف الأقسام (عقارات، سيارات، وظائف...)' : 'Post classified ads in various categories (Real Estate, Cars, Jobs...).'}</li>
            <li style={{ marginBottom: '8px' }}>{isAr ? 'نظام محادثات فوري للتواصل بين البائع والمشتري.' : 'Instant chat system for communication between buyer and seller.'}</li>
            <li style={{ marginBottom: '8px' }}>{isAr ? 'استخدام الذكاء الاصطناعي لتوليد أوصاف جذابة للإعلانات.' : 'Use of Artificial Intelligence to generate attractive ad descriptions.'}</li>
            <li style={{ marginBottom: '8px' }}>{isAr ? 'دليل شركات شامل لتعزيز التواجد الرقمي للأعمال.' : 'A comprehensive company directory to enhance digital business presence.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
