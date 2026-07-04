'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

export default function SellerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.getPublicProfile(Number(id));
      setProfile(res.data);
    } catch (err) {
      toast.error(lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'البائع غير موجود' : 'Seller not found');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    fetchProfile();
  }, [id, lang]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(lang === 'ar' ? 'صلاحية مطلوبة' : 'Auth Required', lang === 'ar' ? 'يجب تسجيل الدخول' : 'You must be logged in');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await api.submitReview({
        user_id: Number(id),
        rating,
        comment
      });
      toast.success(lang === 'ar' ? 'نجاح' : 'Success', lang === 'ar' ? 'تم إضافة تقييمك' : 'Review added successfully');
      setShowReviewModal(false);
      fetchProfile(); // Refresh profile to show new review
    } catch (err: any) {
      toast.error(lang === 'ar' ? 'خطأ' : 'Error', err.message || (lang === 'ar' ? 'فشل إضافة التقييم' : 'Failed to add review'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#ffc107' : '#555577', fontSize: '18px' }}>★</span>
    ));
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>⏳ {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;
  if (!profile) return null;

  return (
    <div style={{ padding: '40px 20px', minHeight: '90vh' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Seller Header Info */}
        <div className="glass" style={{ padding: '40px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#1a1a35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', border: '2px solid #6c3bff', overflow: 'hidden' }}>
            {profile.image_path ? <img src={profile.image_path} alt="avatar" style={{width: '100%', height:'100%', objectFit: 'cover'}}/> : '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', color: '#e8e8f0' }}>{profile.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {renderStars(profile.average_rating)}
                <span style={{ color: '#8888aa', fontSize: '14px', marginLeft: '8px' }}>({profile.average_rating}) • {profile.reviews_count} {lang === 'ar' ? 'تقييم' : 'reviews'}</span>
              </div>
              <span style={{ color: '#8888aa', fontSize: '14px' }}>
                📅 {lang === 'ar' ? 'عضو منذ' : 'Member since'} {new Date(profile.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US', {month: 'long', year: 'numeric'})}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {user?.id !== profile.id && (
              <>
                <button onClick={() => setShowReviewModal(true)} className="btn-secondary" style={{ padding: '10px 20px' }}>
                  ⭐ {lang === 'ar' ? 'أضف تقييم' : 'Leave Review'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          {/* Active Ads */}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>🏷️ {lang === 'ar' ? 'إعلانات البائع' : 'Seller Ads'} ({profile.active_ads?.length || 0})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profile.active_ads?.length > 0 ? profile.active_ads.map((ad: any) => (
                <Link key={ad.id} href={`/ads/${ad.id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass-light" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.3s' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#1a1a35', overflow: 'hidden' }}>
                       <img src={ad.media?.[0]?.file_path ? (ad.media[0].file_path.startsWith('http') ? ad.media[0].file_path : `http://127.0.0.1:8000/storage/${ad.media[0].file_path}`) : 'https://placehold.co/80x80/1a1a35/6c3bff?text=No+Image'} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', color: '#e8e8f0', marginBottom: '4px' }}>{ad.title}</h3>
                      <div style={{ color: '#8b64ff', fontWeight: 'bold' }}>{ad.price} {ad.currency}</div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div style={{ color: '#8888aa' }}>{lang === 'ar' ? 'لا توجد إعلانات فعالة' : 'No active ads'}</div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>⭐ {lang === 'ar' ? 'آراء المشترين' : 'Buyer Reviews'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {profile.reviews?.length > 0 ? profile.reviews.map((review: any) => (
                <div key={review.id} className="glass-light" style={{ padding: '20px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a1a35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', overflow: 'hidden' }}>
                      {review.reviewer?.image_path ? <img src={review.reviewer.image_path} alt="avatar" style={{width: '100%', height:'100%', objectFit: 'cover'}}/> : '👤'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#e8e8f0', fontSize: '15px' }}>{review.reviewer?.name}</div>
                      <div style={{ fontSize: '12px', color: '#8888aa' }}>{new Date(review.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US')}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>{renderStars(review.rating)}</div>
                  {review.comment && <p style={{ color: '#e8e8f0', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>"{review.comment}"</p>}
                </div>
              )) : (
                <div style={{ color: '#8888aa' }}>{lang === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>{lang === 'ar' ? 'تقييم البائع' : 'Review Seller'}</h3>
            <form onSubmit={handleSubmitReview}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', direction: 'ltr' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)} style={{ background: 'none', border: 'none', fontSize: '32px', color: star <= rating ? '#ffc107' : '#555577', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    ★
                  </button>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <textarea 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={lang === 'ar' ? 'اكتب تعليقك هنا (اختياري)...' : 'Write your comment here (optional)...'}
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', minHeight: '100px', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={submittingReview} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  {submittingReview ? '⏳' : (lang === 'ar' ? 'نشر التقييم' : 'Post Review')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
