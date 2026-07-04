'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/lib/toast';
import { useLanguage } from '@/lib/LanguageContext';
import { translateDB } from '@/lib/translations';

const currencies = [
  { id: 'USD', name_ar: 'دولار أمريكي', name_en: 'US Dollar', symbol: '$', rate: 1 },
  { id: 'SAR', name_ar: 'ريال سعودي', name_en: 'Saudi Riyal', symbol: 'ر.س', rate: 3.75 },
  { id: 'AED', name_ar: 'درهم إماراتي', name_en: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  { id: 'YER', name_ar: 'ريال يمني', name_en: 'Yemeni Rial', symbol: 'ر.ي', rate: 530 },
  { id: 'EGP', name_ar: 'جنيه مصري', name_en: 'Egyptian Pound', symbol: 'ج.م', rate: 47 },
];

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [ad, setAd] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [reference, setReference] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  useEffect(() => {
    if (!id) return;
    
    // Fetch user, ad data, and payment settings, and active offers
    Promise.all([
      api.profile(),
      api.getAd(Number(id)),
      api.getPaymentSettings(),
      api.getActiveOffers()
    ]).then(([profileRes, adRes, settingsRes, offersRes]) => {
      setUser(profileRes.data);
      setAd(adRes.data);
      const methods = settingsRes?.local_methods || [];
      const isStripeEnabled = settingsRes?.is_electronic_payment_enabled;
      
      const allMethods = [];
      
      if (profileRes.data?.free_ads_balance > 0) {
        allMethods.push({
          id: 'free_balance',
          name: isAr ? '🎁 استخدام الهدية الترحيبية' : '🎁 Use Welcome Gift',
          icon: '🎁',
          details: isAr ? 'استخدم رصيد الإعلانات المجانية الخاص بك لدفع قيمة هذه الباقة!' : 'Use your free ads balance to pay for this package!',
          disabled: false
        });
      }

      allMethods.push({
        id: 'stripe',
        name: isAr ? 'بطاقة ائتمانية (Visa/Mastercard)' : 'Credit Card (Visa/Mastercard)',
        icon: '💳',
        details: isStripeEnabled 
          ? (isAr ? 'الدفع الإلكتروني الآمن بالبطاقات (فيزا/ماستركارد) من جميع أنحاء العالم' : 'Secure electronic payment via cards (Visa/Mastercard) globally')
          : (isAr ? 'غير متاح حالياً - سيتم تفعيله قريباً' : 'Currently unavailable - will be activated soon'),
        disabled: !isStripeEnabled
      });
      
      allMethods.push(...methods);
      
      setPaymentMethods(allMethods);
      setSelectedMethod(allMethods[0]);
      
      // تطبيق العروض العامة تلقائياً إذا وجدت (العروض التي ليس لها كود مخصص)
      if (offersRes?.data?.length > 0) {
        const globalOffer = offersRes.data.find((o: any) => !o.code);
        if (globalOffer) {
          setAppliedPromo(globalOffer);
        }
      }

      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const calculateAmount = () => {
    let basePrice = ad?.package?.price || 0;
    if (appliedPromo) {
      basePrice = basePrice * (1 - appliedPromo.discount_percentage / 100);
    }
    return (basePrice * selectedCurrency.rate).toFixed(0);
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await api.validatePromoCode(promoCode);
      if (res.success) {
        setAppliedPromo(res.data);
        toast.success('تم التفعيل', `تم تطبيق خصم ${res.data.discount_percentage}% بنجاح!`);
      }
    } catch (err: any) {
      setPromoError(err?.message || 'الكود غير صالح');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!ad) return toast.error('خطأ', 'جاري تحميل بيانات الإعلان، يرجى المحاولة بعد لحظات');
    if (!reference && selectedMethod.id !== 'stripe' && selectedMethod.id !== 'free_balance') {
        return toast.error('تنبيه', 'يرجى إدخال رقم العملية أو الحوالة للتأكيد');
    }
    if (!receiptImage && selectedMethod.id !== 'stripe' && selectedMethod.id !== 'free_balance') {
        return toast.error('تنبيه', 'يرجى إرفاق صورة إيصال التحويل البنكي للتأكيد');
    }
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append('ad_id', String(id));
    formData.append('package_id', String(ad?.package_id));
    formData.append('payment_method', selectedMethod.id);
    formData.append('reference_number', reference || 'no-ref');
    formData.append('currency', selectedCurrency.id);
    formData.append('amount', calculateAmount());
    if (appliedPromo && appliedPromo.code) {
      formData.append('promo_code', appliedPromo.code);
    }
    if (receiptImage) {
      formData.append('receipt_image', receiptImage);
    }

    try {
      const res = await api.pay(formData);
      if (res.success) {
        if (res.checkout_url) {
          window.location.href = res.checkout_url;
        } else {
          if (selectedMethod.id === 'free_balance') {
            toast.success(isAr ? 'تم النشر!' : 'Published!', isAr ? 'تم تفعيل إعلانك مجاناً بنجاح!' : 'Your free ad is now active!');
          } else {
            toast.success(isAr ? 'تم الإرسال!' : 'Submitted!', res.message || (isAr ? 'سيتم مراجعة الدفع وتفعيل الإعلان خلال دقائق.' : 'Payment will be reviewed soon.'));
          }
          router.push('/my-ads');
        }
      } else {
        throw res;
      }
    } catch (err: any) {
      console.error('Payment Error Details:', err);
      const errorMessage = err?.message || 'حدث مشكلة أثناء إرسال البيانات. تأكد من اتصالك أو تسجيل الدخول.';
      toast.error('خطأ في الإرسال', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !ad || !selectedMethod) {
    return <div style={{ padding: '100px', textAlign: 'center', color: '#8888aa' }}>⏳ {isAr ? 'جاري تحميل معلومات الدفع...' : 'Loading payment info...'}</div>;
  }

  return (
    <div style={{ padding: '0', minHeight: '90vh', position: 'relative' }}>
      <header className="navbar" style={{ position: 'relative', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 900, background: 'linear-gradient(135deg,#6c3bff,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isAr ? 'إعلاني' : 'Eelani'}
            </span>
            <span style={{ color: '#8888aa', fontSize: '14px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '12px' }}>{isAr ? 'المدفوعات الآمنة 🔒' : 'Secure Payments 🔒'}</span>
          </div>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            {isAr ? 'إلغاء والعودة' : 'Cancel & Return'}
          </button>
        </div>
      </header>

      <div style={{ padding: '40px 20px' }}>
      <div className="orb orb-purple" style={{ width: '400px', height: '400px', top: '-100px', right: '-100px', opacity: 0.3 }} />
      
      <div className="container" style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px' }}>
             💎 <span className="gradient-text">{isAr ? 'تأكيد الاشتراك' : 'Confirm Subscription'}</span>
          </h1>
          <p style={{ color: '#8888aa' }}>{isAr ? 'اختر العملة وطريقة الدفع المناسبة لك' : 'Choose your currency and payment method'}</p>
        </div>

        <div className="pay-grid">
          
          {/* Left Side: Summary & Currency */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px', color: '#8b64ff' }}>{isAr ? 'عملة الدفع' : 'Payment Currency'}</h3>
              <select 
                title={isAr ? 'العملة' : 'Currency'}
                aria-label={isAr ? 'العملة' : 'Currency'}
                className="input-field currency-select"
                value={selectedCurrency.id}
                onChange={(e) => setSelectedCurrency(currencies.find(c => c.id === e.target.value) || currencies[0])}
              >
                {currencies.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>
                    {isAr ? c.name_ar : c.name_en} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="glass" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>{isAr ? 'ملخص الطلب' : 'Order Summary'}</h3>
              {user?.free_ads_balance > 0 && (
                <div style={{ 
                  background: 'rgba(16,185,129,0.1)', 
                  border: '1px solid #10b981', 
                  padding: '12px', 
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '13px', color: '#10b981', fontWeight: 700 }}>🎁 {isAr ? 'رصيد مكافآت متاح!' : 'Rewards Balance Available!'}</div>
                  <div style={{ fontSize: '11px', color: '#8888aa' }}>{isAr ? `لديك ${user.free_ads_balance} إعلان مجاني.` : `You have ${user.free_ads_balance} free ads.`}</div>
                  <button 
                    onClick={() => {
                      setSelectedMethod({ id: 'free_balance', name: isAr ? 'رصيد المكافآت' : 'Rewards Balance', icon: '🎁', details: isAr ? 'سيتم خصم 1 من رصيدك المجاني' : '1 will be deducted from your free balance' });
                      setReference('REWARD-PAY');
                    }}
                    style={{ 
                      marginTop: '8px', width: '100%', padding: '6px', borderRadius: '6px', 
                      background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700 
                    }}
                  >
                    {isAr ? 'استخدام الرصيد المجاني' : 'Use Free Balance'}
                  </button>
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#8888aa' }}>{isAr ? 'الإعلان:' : 'Ad:'}</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{ad?.title || '...'}</div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                {appliedPromo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10b981', fontSize: '14px', fontWeight: 700 }}>
                    <span>{appliedPromo.code ? (isAr ? 'خصم الكوبون' : 'Coupon Discount') : (isAr ? 'خصم العرض المتاح' : 'Available Offer Discount')} ({appliedPromo.discount_percentage}%):</span>
                    <span>- {((ad?.package?.price * appliedPromo.discount_percentage / 100) * selectedCurrency.rate).toFixed(0)} {selectedCurrency.symbol}</span>
                  </div>
                )}
                <div style={{ fontSize: '14px', marginBottom: '4px' }}>{isAr ? 'الإجمالي المطلوب دفعه:' : 'Total Amount:'}</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#ff6b35' }}>
                  {selectedMethod.id === 'free_balance' ? '0' : calculateAmount()} {selectedCurrency.symbol}
                </div>
                <div style={{ fontSize: '11px', color: '#555577', marginTop: '4px' }}>
                  {appliedPromo && <s style={{ marginRight: '6px' }}>{(ad?.package?.price * selectedCurrency.rate).toFixed(0)} {selectedCurrency.symbol}</s>}
                  ({isAr ? 'يعادل' : 'Equals'} {appliedPromo ? (ad?.package?.price * (1 - appliedPromo.discount_percentage / 100)) : ad?.package?.price} $)
                </div>
              </div>
            </div>

            {/* Promo Code Section */}
            {selectedMethod?.id !== 'free_balance' && ad?.package?.price > 0 && (
              <div className="glass" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>{isAr ? 'هل لديك كود خصم إضافي؟' : 'Have a Promo Code?'}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    className="input-field" 
                    placeholder={isAr ? 'أدخل الكود هنا...' : 'Enter code here...'} 
                    value={promoCode} 
                    onChange={e => setPromoCode(e.target.value)}
                    disabled={!!(appliedPromo && appliedPromo.code) || promoLoading}
                    style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }}
                  />
                  {!(appliedPromo && appliedPromo.code) ? (
                    <button 
                      className="btn-primary" 
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode}
                      style={{ padding: '10px 20px', fontSize: '14px' }}
                    >
                      {promoLoading ? '⏳' : (isAr ? 'تطبيق' : 'Apply')}
                    </button>
                  ) : (
                    <button 
                      className="btn-secondary" 
                      onClick={() => { 
                         setAppliedPromo(null); 
                         setPromoCode(''); 
                         setPromoError(''); 
                         // إذا ألغى الكود، نعيد جلب العروض التلقائية
                         api.getActiveOffers().then(res => {
                           const globalOffer = res.data?.find((o: any) => !o.code);
                           if(globalOffer) setAppliedPromo(globalOffer);
                         });
                      }}
                      style={{ padding: '10px 20px', fontSize: '14px', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', borderColor: '#ff6b6b' }}
                    >
                      {isAr ? 'إلغاء الكود' : 'Remove Code'}
                    </button>
                  )}
                </div>
                {promoError && <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>❌ {promoError}</div>}
                {appliedPromo && appliedPromo.code && <div style={{ color: '#10b981', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>✅ تم تطبيق كود الخصم بنجاح</div>}
                {appliedPromo && !appliedPromo.code && <div style={{ color: '#10b981', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>✨ تم تفعيل خصم العرض العام آلياً!</div>}
              </div>
            )}
          </div>

          {/* Right Side: Methods */}
          <div className="glass" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>{isAr ? 'وسيلة الدفع' : 'Payment Method'}</h3>
            {selectedMethod.id === 'free_balance' ? (
               <div className="glass-light" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px', border: '2px solid #10b981' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎁</div>
                  <h4 style={{ color: '#10b981', marginBottom: '8px' }}>{isAr ? 'أنت تستخدم رصيد المكافآت' : 'You are using your Rewards Balance'}</h4>
                  <p style={{ fontSize: '14px', color: '#8888aa' }}>{isAr ? 'سيتم تفعيل إعلانك فوراً وبشكل مجاني تماماً.' : 'Your ad will be activated instantly and for free.'}</p>
                  <button onClick={() => { setSelectedMethod(paymentMethods.find(m => m.id !== 'free_balance') || paymentMethods[0]); setReference(''); }} style={{ marginTop: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#8888aa', fontSize: '12px', cursor: 'pointer', padding: '4px 12px', borderRadius: '6px' }}>{isAr ? 'تغيير الوسيلة' : 'Change Method'}</button>
               </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                {paymentMethods.map(m => (
                  <div key={m.id} onClick={() => !m.disabled && setSelectedMethod(m)} 
                    style={{ 
                      padding: '14px', borderRadius: '14px', cursor: m.disabled ? 'not-allowed' : 'pointer', textAlign: 'center',
                      border: `2px solid ${selectedMethod?.id === m.id ? '#6c3bff' : 'rgba(108,59,255,0.1)'}`,
                      background: selectedMethod?.id === m.id ? 'rgba(108,59,255,0.1)' : 'rgba(255,255,255,0.03)',
                      opacity: m.disabled ? 0.5 : 1,
                      position: 'relative'
                    }}>
                    <div style={{ fontSize: '20px', marginBottom: '6px' }}>{m.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>{m.name}</div>
                    {m.disabled && (
                      <div style={{ fontSize: '10px', color: '#ff6b6b', marginTop: '4px' }}>{isAr ? 'غير متاح حالياً' : 'Currently Unavailable'}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedMethod.id !== 'free_balance' && (
              <>
                <div className="glass-light" style={{ padding: '20px', marginBottom: '24px', borderRight: '4px solid #6c3bff' }}>
                  <h4 style={{ color: '#8b64ff', marginBottom: '8px', fontSize: '14px' }}>
                    {selectedMethod.id === 'stripe' ? (isAr ? 'الدفع الإلكتروني عبر البطاقات (Visa/Mastercard)' : 'Credit Card Payment (Visa/Mastercard)') : (isAr ? `بيانات التحويل لـ ${selectedMethod.name}:` : `Transfer Details for ${selectedMethod.name}:`)}
                  </h4>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#e8e8f0' }}>{selectedMethod.details}</p>
                </div>

                {selectedMethod.id !== 'stripe' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>{isAr ? 'رقم العملية:' : 'Reference Number:'}</label>
                      <input className="input-field" placeholder="000000" value={reference} onChange={e => setReference(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>{isAr ? 'صورة السند (مطلوب) *' : 'Receipt Image (Required) *'}</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => setReceiptImage(e.target.files?.[0] || null)}
                        className="file-input"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button 
              className="btn-primary" 
              onClick={selectedMethod.id === 'stripe' ? () => { setReference('STRIPE_PENDING'); setTimeout(handleConfirm, 100); } : handleConfirm} 
              disabled={submitting || selectedMethod.disabled} 
              style={{ width: '100%', padding: '14px', justifyContent: 'center', opacity: selectedMethod.disabled ? 0.5 : 1, cursor: selectedMethod.disabled ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? (isAr ? '⏳ جاري الإرسال...' : '⏳ Submitting...') : selectedMethod.disabled ? (isAr ? 'غير متاح حالياً' : 'Currently Unavailable') : selectedMethod.id === 'free_balance' ? (isAr ? '🎁 تفعيل بالإعلان المجاني' : '🎁 Activate Free Ad') : selectedMethod.id === 'stripe' ? (isAr ? '💳 المتابعة للدفع الإلكتروني' : '💳 Continue to Payment') : (isAr ? '🚀 تأكيد وإرسال الطلب' : '🚀 Confirm & Submit')}
            </button>
          </div>
        </div>
      </div>
      </div>
      
      <style jsx>{`
        .currency-select {
          cursor: pointer;
          background: rgba(255,255,255,0.05);
        }
        .file-input {
          font-size: 12px;
          width: 100%;
        }
        @media (max-width: 768px) {
          .container > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
