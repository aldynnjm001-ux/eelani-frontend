'use client';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from '@/lib/toast';

export default function ContactPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    setTimeout(() => {
      setLoading(false);
      setForm({ name: '', email: '', message: '' });
      toast.success(isAr ? 'تم الإرسال!' : 'Sent!', isAr ? 'تم إرسال رسالتك بنجاح، سنرد عليك قريباً.' : 'Your message has been sent successfully, we will reply soon.');
    }, 1500);
  };

  return (
    <div style={{ padding: '60px 24px', minHeight: '80vh', position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <div className="orb orb-orange" style={{ bottom: '-100px', right: '-100px' }} />
      <div className="container" style={{ maxWidth: '600px', position: 'relative', zIndex: 1, width: '100%' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', textAlign: 'center' }}>
          <span className="gradient-text">{isAr ? 'تواصل معنا' : 'Contact Us'}</span>
        </h1>
        <p style={{ textAlign: 'center', color: '#8888aa', marginBottom: '16px' }}>
          {isAr ? 'نحن هنا لمساعدتك والإجابة على جميع استفساراتك.' : 'We are here to help and answer all your inquiries.'}
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', marginBottom: '32px' }}>
          <div className="glass" style={{ padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📞</span>
            <div>
              <div style={{ fontSize: '12px', color: '#8888aa' }}>{isAr ? 'رقم الهاتف' : 'Phone'}</div>
              <div style={{ fontWeight: 'bold', color: '#fff' }} dir="ltr">+967714909648</div>
            </div>
          </div>
          <div className="glass" style={{ padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📧</span>
            <div>
              <div style={{ fontSize: '12px', color: '#8888aa' }}>{isAr ? 'البريد الإلكتروني' : 'Email'}</div>
              <div style={{ fontWeight: 'bold', color: '#fff' }}>alamalr8114@gmail.com</div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{isAr ? 'الاسم' : 'Name'}</label>
            <input 
              className="input-field" 
              required 
              type="text" 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
            <input 
              className="input-field" 
              required 
              type="email" 
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{isAr ? 'الرسالة' : 'Message'}</label>
            <textarea 
              className="input-field" 
              required 
              rows={5}
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة 🚀' : 'Send Message 🚀')}
          </button>
        </form>
      </div>
    </div>
  );
}
