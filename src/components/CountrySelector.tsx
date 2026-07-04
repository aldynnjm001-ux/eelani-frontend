'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

export default function CountrySelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.getCountries().then(res => {
            const data = res.data || [];
            if (data.length === 0) return;
            setCountries(data);
            
            const saved = localStorage.getItem('selected_country');
            if (saved) {
                const found = data.find((c: any) => c.code === saved);
                if (found) {
                    setSelected(found);
                    localStorage.setItem('selected_country_id', String(found.id));
                } else {
                    const globalCountry = data.find((c: any) => c.code === 'Global') || data[0];
                    setSelected(globalCountry);
                    localStorage.setItem('selected_country', globalCountry.code);
                    localStorage.setItem('selected_country_id', String(globalCountry.id));
                    window.dispatchEvent(new Event('country_changed'));
                }
            } else {
                const globalCountry = data.find((c: any) => c.code === 'Global') || data[0];
                setSelected(globalCountry);
                localStorage.setItem('selected_country', globalCountry.code);
                localStorage.setItem('selected_country_id', String(globalCountry.id));
            }
        }).catch(console.error);

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (c: any) => {
        setSelected(c);
        localStorage.setItem('selected_country', c.code);
        localStorage.setItem('selected_country_id', String(c.id));
        setIsOpen(false);
        // Dispatch custom event to notify other components (e.g. AdCard to change currency)
        window.dispatchEvent(new Event('country_changed'));
    };

    if (!selected) return null;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 16px', borderRadius: '20px', color: '#fff',
                    cursor: 'pointer', transition: 'all 0.3s'
                }}
            >
                <span style={{ fontSize: '18px' }}>{selected.flag_emoji || '🌍'}</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{selected.name}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute', top: '120%', right: 0,
                            background: '#1a1a2e', border: '1px solid rgba(108,59,255,0.3)',
                            borderRadius: '16px', padding: '8px', width: '200px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 50,
                            maxHeight: '300px', overflowY: 'auto'
                        }}
                    >
                        {countries.map(c => (
                            <div 
                                key={c.code}
                                onClick={() => handleSelect(c)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '10px 12px', borderRadius: '12px',
                                    cursor: 'pointer', transition: 'background 0.2s',
                                    background: selected.code === c.code ? 'rgba(108,59,255,0.2)' : 'transparent',
                                    color: selected.code === c.code ? '#fff' : '#8888aa'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = selected.code === c.code ? 'rgba(108,59,255,0.2)' : 'transparent'}
                            >
                                <span style={{ fontSize: '20px' }}>{c.flag_emoji || '🌍'}</span>
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>{c.name}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>{c.currency_code}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
