'use client';
import { useState, useEffect } from 'react';

export default function VerifyPage() {
    const [status, setStatus] = useState('جاري الفحص...');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/stats-v2?t=' + Date.now())
            .then(res => res.json())
            .then(json => {
                setStatus('✅ متصل بنجاح!');
                setData(json);
            })
            .catch(err => {
                setStatus('❌ فشل الاتصال: ' + err.message);
            });
    }, []);

    return (
        <div style={{ padding: '50px', background: '#0a0a20', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#6c3bff' }}>درع الحماية - فحص الاتصال</h1>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', marginTop: '20px' }}>
                <h3>الحالة: {status}</h3>
                {data && (
                    <pre style={{ background: '#000', padding: '20px', borderRadius: '10px', overflow: 'auto' }}>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )}
            </div>
            <div style={{ marginTop: '30px' }}>
                <a href="/" style={{ color: '#ff6b35' }}>← العودة للصفحة الرئيسية</a>
            </div>
        </div>
    );
}
