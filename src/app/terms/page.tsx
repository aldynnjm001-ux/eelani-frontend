'use client';
import { useLanguage } from '@/lib/LanguageContext';

export default function TermsPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div style={{ padding: '60px 24px', minHeight: '80vh', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>
          <span className="gradient-text">{isAr ? 'الشروط والأحكام' : 'Terms of Service'}</span>
        </h1>
        
        <div className="glass" style={{ padding: '40px', lineHeight: '1.8', fontSize: '15px', color: '#c8c8e0' }}>
          <h3 style={{ color: '#8b64ff', marginBottom: '12px' }}>1. {isAr ? 'القبول بالشروط' : 'Acceptance of Terms'}</h3>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'بدخولك واستخدامك لمنصة "إعلاني"، فإنك توافق صراحة على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام المنصة.'
              : 'By accessing and using the Eelani platform, you expressly agree to be bound by these Terms and Conditions. If you do not agree to any part, please do not use the platform.'}
          </p>

          <h3 style={{ color: '#8b64ff', marginBottom: '12px' }}>2. {isAr ? 'المحتوى المنشور' : 'Published Content'}</h3>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'المستخدم هو المسؤول الوحيد عن محتوى الإعلانات التي يقوم بنشرها. يمنع نشر أي محتوى مخالف للقوانين أو مسيء أو مضلل. للإدارة الحق في حذف أي إعلان تراه مخالفاً دون سابق إنذار.'
              : 'The user is solely responsible for the content of the ads they post. Publishing any illegal, offensive, or misleading content is prohibited. The administration has the right to delete any ad deemed violating without prior notice.'}
          </p>

          <h3 style={{ color: '#8b64ff', marginBottom: '12px' }}>3. {isAr ? 'المدفوعات والباقات' : 'Payments and Packages'}</h3>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'المبالغ المدفوعة للاشتراك في الباقات المميزة أو الترويج غير قابلة للاسترداد بعد تفعيل الخدمة. يرجى التأكد من اختيار الباقة المناسبة لك.'
              : 'Amounts paid for subscribing to premium packages or promotion are non-refundable once the service is activated. Please make sure to choose the right package for you.'}
          </p>

          <h3 style={{ color: '#8b64ff', marginBottom: '12px' }}>4. {isAr ? 'إخلاء المسؤولية' : 'Disclaimer'}</h3>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'منصة "إعلاني" هي وسيط تقني يربط بين البائع والمشتري، ولا تتحمل أي مسؤولية عن صحة المنتجات أو عمليات النصب والاحتيال التي قد تحدث خارج المنصة.'
              : 'The Eelani platform is a technical intermediary connecting the buyer and seller, and assumes no responsibility for the authenticity of the products or any fraud that may occur outside the platform.'}
          </p>
        </div>
      </div>
    </div>
  );
}
