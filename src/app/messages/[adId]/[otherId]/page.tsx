'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useParams, useRouter } from 'next/navigation';

export default function ChatPage() {
  const { adId, otherId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [ad, setAd] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    // جلب البيانات الأولية
    Promise.all([
      api.getAd(Number(adId)),
      api.getChat(Number(adId), Number(otherId))
    ]).then(([adRes, chatRes]) => {
      setAd(adRes.data);
      setMessages(chatRes.data);
      if (chatRes.data.length > 0) {
        const firstMsg = chatRes.data[0];
        setOtherUser(firstMsg.sender_id == Number(otherId) ? firstMsg.sender : firstMsg.receiver);
      } else {
        // If chat is empty, and we are sending to the ad owner, otherUser is the ad owner.
        if (adRes.data.user?.id == Number(otherId)) {
          setOtherUser(adRes.data.user);
        }
      }
    }).catch((err) => {
      if (err?.message === 'Unauthenticated.' || err?.status === 401) {
        toast.error('تنبيه', 'يرجى تسجيل الدخول أولاً للمراسلة');
        router.push('/login');
      } else {
        toast.error('خطأ', 'فشل تحميل المحادثة');
      }
    }).finally(() => setLoading(false));

    // تحديث تلقائي كل 5 ثوانٍ
    const interval = setInterval(() => {
      api.getChat(Number(adId), Number(otherId))
        .then(res => setMessages(res.data));
    }, 5000);

    return () => clearInterval(interval);
  }, [adId, otherId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.sendMessage({
        ad_id: Number(adId),
        receiver_id: Number(otherId),
        message: newMessage
      });
      if (res.success) {
        setMessages([...messages, res.data]);
        setNewMessage('');
      }
    } catch {
      toast.error('فشل الإرسال');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>⏳ جاري التحميل...</div>;

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="container" style={{ maxWidth: '800px', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Header */}
        <div className="glass" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a1a35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
            <div>
              <div style={{ fontWeight: 800 }}>{otherUser?.name || 'مستخدم'}</div>
              <div style={{ fontSize: '11px', color: '#8b64ff' }}>بخصوص: {ad?.title}</div>
            </div>
          </div>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => window.history.back()}>← رجوع</button>
        </div>

        {/* Messages List */}
        <div className="glass" style={{ flex: 1, marginBottom: '16px', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }} ref={scrollRef}>
          {messages.map((msg: any) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} style={{ 
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                background: isMe ? 'linear-gradient(135deg,#6c3bff,#8b64ff)' : 'rgba(255,255,255,0.05)',
                color: isMe ? '#fff' : '#e8e8f0',
                padding: '12px 18px',
                borderRadius: isMe ? '20px 20px 0 20px' : '20px 20px 20px 0',
                fontSize: '14px',
                position: 'relative',
                boxShadow: isMe ? '0 4px 15px rgba(108,59,255,0.2)' : 'none'
              }}>
                {msg.message}
                <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: isMe ? 'left' : 'right' }}>
                  {new Date(msg.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input 
            className="input-field" 
            placeholder="اكتب رسالتك هنا..." 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={sending} style={{ padding: '0 24px' }}>
            {sending ? '...' : 'إرسال 🚀'}
          </button>
        </form>

      </div>
    </div>
  );
}
