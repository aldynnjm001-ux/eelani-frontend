'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

import DashboardSidebar from '@/components/DashboardSidebar';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAds: 0, totalPaid: 0, pending: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tRes, adsRes] = await Promise.all([api.getTransactions(), api.myAds()]);
      const tData = tRes.data.data || [];
      setTransactions(tData);
      
      // حساب الإحصائيات
      const ads = adsRes.data.data || [];
      const totalPaid = tData.reduce((acc: number, curr: any) => acc + (curr.status === 'success' ? Number(curr.amount) : 0), 0);
      const pending = tData.filter((t: any) => t.status === 'pending').length;
      
      setStats({
        totalAds: ads.length,
        totalPaid: totalPaid,
        pending: pending
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'success': return { background: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'ناجحة' };
      case 'pending': return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'قيد المراجعة' };
      default: return { background: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'مرفوضة' };
    }
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: '90vh' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '32px' }} className="dashboard-layout">
          <DashboardSidebar />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
                <span className="gradient-text">السجل المالي والإحصائيات</span>
              </h1>
              <p style={{ color: '#8888aa' }}>تقرير مفصل عن نشاطك المالي وإعلاناتك في المنصة</p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { label: 'إجمالي الإعلانات', value: stats.totalAds, icon: '📢', color: '#6c3bff' },
                { label: 'إجمالي المدفوعات', value: `${stats.totalPaid} $`, icon: '💰', color: '#10b981' },
                { label: 'عمليات بانتظار التأكيد', value: stats.pending, icon: '⏳', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="glass" style={{ padding: '24px', textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>{s.icon}</div>
                  <div style={{ fontSize: '14px', color: '#8888aa', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Detailed Table */}
            <div className="glass" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>سجل العمليات التفصيلي</h3>
                <button onClick={fetchData} style={{ background: 'none', border: 'none', color: '#8b64ff', cursor: 'pointer', fontSize: '14px' }}>🔄 تحديث البيانات</button>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                  <thead style={{ background: 'rgba(108,59,255,0.05)', color: '#8888aa', fontSize: '13px' }}>
                    <tr>
                      <th style={{ padding: '16px' }}>رقم العملية</th>
                      <th style={{ padding: '16px' }}>التاريخ والوقت</th>
                      <th style={{ padding: '16px' }}>الإعلان</th>
                      <th style={{ padding: '16px' }}>طريقة الدفع</th>
                      <th style={{ padding: '16px' }}>رقم المرجع</th>
                      <th style={{ padding: '16px' }}>المبلغ</th>
                      <th style={{ padding: '16px' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '14px' }}>
                    {loading ? (
                      <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#555' }}>جاري جلب البيانات...</td></tr>
                    ) : transactions.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#555' }}>لا توجد عمليات مسجلة حتى الآن</td></tr>
                    ) : transactions.map((t: any) => {
                      const style = getStatusStyle(t.status);
                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '16px', fontWeight: 600 }}>#{t.id}</td>
                          <td style={{ padding: '16px', fontSize: '12px', color: '#8888aa' }}>
                            {new Date(t.created_at).toLocaleDateString('ar-YE')} <br/>
                            {new Date(t.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <Link href={`/ads/${t.ad?.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                              {t.ad?.title || 'إعلان محذوف'}
                            </Link>
                          </td>
                          <td style={{ padding: '16px' }}>{t.payment_method}</td>
                          <td style={{ padding: '16px', fontFamily: 'monospace', color: '#8b64ff' }}>{t.reference_number || '---'}</td>
                          <td style={{ padding: '16px', fontWeight: 700, color: '#ff6b35' }}>
                            {t.amount} {t.currency === 'USD' ? '$' : t.currency === 'SAR' ? 'ر.س' : 'ر.ي'}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '11px', 
                              fontWeight: 700,
                              background: style.background,
                              color: style.color
                            }}>
                              {style.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '24px', borderRadius: '16px', background: 'rgba(108,59,255,0.05)', border: '1px dashed rgba(108,59,255,0.2)' }}>
              <h4 style={{ marginBottom: '12px', color: '#8b64ff' }}>💡 ملاحظات هامة:</h4>
              <ul style={{ fontSize: '13px', color: '#8888aa', paddingRight: '20px', lineHeight: 1.8 }}>
                <li>العمليات "قيد المراجعة" يتم تفعيلها من قبل الإدارة بعد التأكد من وصول الحوالة.</li>
                <li>في حال تم رفض العملية، يرجى التواصل مع الدعم الفني وتزويدهم برقم العملية.</li>
                <li>المبالغ الظاهرة هي بالدولار الأمريكي حسب سعر الصرف المعتمد في المنصة.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
