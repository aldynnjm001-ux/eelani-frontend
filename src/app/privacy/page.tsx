'use client';
import { useLanguage } from '@/lib/LanguageContext';

export default function PrivacyPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div style={{ padding: '60px 24px', minHeight: '80vh', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>
          <span className="gradient-text">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
        </h1>
        
        <div className="glass" style={{ padding: '40px', lineHeight: '1.8', fontSize: '15px', color: '#c8c8e0' }}>
          <h3 style={{ color: '#8b64ff', marginBottom: '12px' }}>1. {isAr ? 'جمع المعلومات' : 'Information Collection'}</h3>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'نحن نقوم بجمع المعلومات التي تقدمها عند التسجيل في الموقع، مثل الاسم، البريد الإلكتروني، ورقم الهاتف، وذلك لغرض تقديم خدماتنا وتحسين تجربتك.'
              : 'We collect information you provide when registering on the site, such as name, email, and phone number, for the purpose of providing our services and improving your experience.'}
          </p>

          <h3 style={{ color: '#8b64ff', marginBottom: '12px' }}>2. {isAr ? 'استخدام المعلومات' : 'Use of Information'}</h3>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'نستخدم بياناتك لتسهيل عملية التواصل بين البائعين والمشترين، ولإرسال إشعارات هامة حول تحديثات الموقع وعروضك، بالإضافة لتحسين خوارزميات الذكاء الاصطناعي.'
              : 'We use your data to facilitate communication between buyers and sellers, and to send important notifications about site updates and your offers, as well as to improve AI algorithms.'}
          </p>

          <h3 style={{ color: '#8b64ff', marginBottom: '12px' }}>3. {isAr ? 'حماية البيانات' : 'Data Protection'}</h3>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'نحن نتبع أعلى المعايير التقنية لتشفير وحماية بياناتك الشخصية من الوصول غير المصرح به. لن نقوم ببيع أو تأجير معلوماتك لأي طرف ثالث.'
              : 'We follow the highest technical standards to encrypt and protect your personal data from unauthorized access. We will not sell or rent your information to any third party.'}
          </p>
          
          <h3 style={{ color: '#8b64ff', marginBottom: '12px' }}>4. {isAr ? 'ملفات الارتباط (Cookies)' : 'Cookies'}</h3>
          <p style={{ marginBottom: '24px' }}>
            {isAr 
              ? 'قد يستخدم الموقع ملفات تعريف الارتباط لتحسين أداء المنصة وتخصيص تجربتك وحفظ تفضيلاتك (مثل اللغة).'
              : 'The site may use cookies to improve platform performance, customize your experience, and save your preferences (like language).'}
          </p>
        </div>
      </div>
    </div>
  );
}
