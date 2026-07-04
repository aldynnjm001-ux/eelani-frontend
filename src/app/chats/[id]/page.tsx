'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

export default function ChatRoomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async (isPolling = false) => {
    try {
      const res = await api.getConversation(Number(id));
      setConversation(res.data.conversation);
      setMessages(res.data.messages);
      if (!isPolling) setLoading(false);
    } catch (err) {
      if (!isPolling) {
        toast.error(lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'فشل تحميل المحادثة' : 'Failed to load conversation');
        router.push('/chats');
      }
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    fetchChat();

    // Polling every 3 seconds for real-time feel
    const interval = setInterval(() => {
      fetchChat(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [id, lang]);

  useEffect(() => {
    // Scroll to bottom ONLY when a new message arrives (length changes)
    // This prevents snapping down during normal 3-second polling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: Date.now(),
      sender_id: user?.id,
      body: newMessage,
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      await api.sendChatMessage(Number(id), tempMessage.body);
      fetchChat(true); // Fetch real message object
    } catch (err) {
      toast.error(lang === 'ar' ? 'خطأ' : 'Error', lang === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id)); // rollback
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>⏳ {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Chat Header */}
      <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => router.push('/chats')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>
          {lang === 'ar' ? '⬅️' : '➡️'}
        </button>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#1a1a35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {conversation?.other_user?.image_path ? <img src={conversation.other_user.image_path} alt="avatar" style={{width: '100%', height:'100%', objectFit: 'cover'}}/> : '👤'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{conversation?.other_user?.name || 'مستخدم غير معروف'}</h2>
          {conversation?.ad && (
            <Link href={`/ads/${conversation.ad.id}`} style={{ fontSize: '13px', color: '#8b64ff', textDecoration: 'none' }}>
              {lang === 'ar' ? 'بخصوص:' : 'Regarding:'} {conversation.ad.title}
            </Link>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="glass-light" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: 0, borderTop: 'none', borderBottom: 'none' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#8888aa' }}>
            <p>{lang === 'ar' ? 'ابدأ المحادثة الآن!' : 'Start the conversation now!'}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-start' : 'flex-end' }}>
                <div style={{ 
                  background: isMe ? 'linear-gradient(135deg, #6c3bff, #ff6b35)' : 'rgba(255,255,255,0.05)', 
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  borderBottomRightRadius: isMe && lang === 'ar' ? 0 : isMe && lang === 'en' ? 0 : '16px',
                  borderBottomLeftRadius: isMe && lang === 'ar' ? '16px' : isMe && lang === 'en' ? '16px' : 0,
                  maxWidth: '70%',
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }}>
                  <p style={{ margin: 0, color: '#fff', fontSize: '15px', lineHeight: 1.5 }}>{msg.body}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '4px', fontSize: '11px', color: isMe ? 'rgba(255,255,255,0.7)' : '#8888aa' }}>
                    <span>{new Date(msg.created_at).toLocaleTimeString(lang === 'ar' ? 'ar' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <span>{msg.is_read ? '✓✓' : '✓'}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="glass" style={{ padding: '16px', borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
            style={{ flex: 1, padding: '14px 20px', borderRadius: '24px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '15px' }}
          />
          <button type="submit" disabled={!newMessage.trim()} style={{ background: newMessage.trim() ? '#6c3bff' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}>
            <span style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none', fontSize: '20px' }}>➤</span>
          </button>
        </form>
      </div>

    </div>
  );
}
