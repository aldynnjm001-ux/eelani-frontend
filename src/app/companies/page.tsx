'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { API_BASE } from '@/lib/api';
import { BuildingOfficeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';

interface Company {
  id: number;
  name: string;
  company_name: string;
  company_logo: string;
  company_cover: string;
  company_description: string;
  ads_count: number;
  is_verified: boolean;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCompanies();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchCompanies = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_BASE}/companies${search ? `?search=${search}&` : '?'}t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative">
      <BackButton />
      {/* Decorative Background Elements */}
      
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6c3bff] to-[#ff6b35] mb-6 drop-shadow-sm">
          دليل الشركات والأعمال
        </h1>
        <p className="text-xl text-gray-400 font-medium">
          اكتشف أفضل الشركات والوكالات الموثوقة على منصتنا بسهولة
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto relative z-10 px-4" style={{ marginBottom: '80px' }}>
        <div className="relative group flex items-center">
          <input
            type="text"
            placeholder="ابحث عن شركة، وكالة، أو مكتب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-5 rounded-full outline-none text-xl transition-all duration-300 shadow-2xl placeholder-gray-500"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              paddingRight: '64px',
              paddingLeft: '24px'
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(108, 59, 255, 0.5)';
              e.target.style.boxShadow = '0 0 30px rgba(108, 59, 255, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button 
            onClick={fetchCompanies}
            className="absolute top-1/2 transform -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-[#6c3bff] transition-colors duration-300 active:scale-95" 
            style={{ width: '32px', height: '32px', right: '20px', zIndex: 10, cursor: 'pointer' }}
            title="بحث"
          >
            <MagnifyingGlassIcon style={{ width: '100%', height: '100%' }} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="relative z-20" style={{ 
          /* Bulletproof CSS Grid using inline styles */
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: '24px', 
          marginTop: '60px',
          marginBottom: '80px',
          padding: '0 20px'
        }}>
          {companies.map((company, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              key={company.id}
              className="flex justify-center"
            >
              {/* Remove strict square aspect ratio to let text breathe naturally */}
              <Link href={`/companies/${company.id}`} className="block relative cursor-pointer h-full" style={{ width: '100%', maxWidth: '240px', minHeight: '220px', zIndex: 30 }}>
                <div className="bg-gradient-to-b from-[#1c1c2e] to-[#12121e] hover:-translate-y-2 transition-all duration-300 group cursor-pointer w-full h-full flex flex-col relative border border-white/10 hover:border-[#6c3bff] shadow-xl hover:shadow-[0_15px_35px_rgba(108,59,255,0.25)] items-center text-center justify-between" style={{ borderRadius: '24px' }}>
                  {/* Top Section (Cover + Logo) */}
                  <div className="w-full flex flex-col items-center shrink-0">
                    {/* Cover Image with flush curved bottom */}
                    <div 
                      className="w-full bg-[#0a0a10] relative shrink-0" 
                      style={{ 
                        height: '80px', 
                        borderBottomLeftRadius: '50% 20px',
                        borderBottomRightRadius: '50% 20px',
                        overflow: 'hidden'
                      }}
                    >
                      {company.company_cover ? (
                        <img 
                          src={company.company_cover.startsWith('http') ? company.company_cover : `${API_BASE.replace('/api', '')}/storage/${company.company_cover}`} 
                          alt="Cover" 
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#6c3bff]/30 to-[#ff6b35]/30"></div>
                      )}
                    </div>

                    {/* Logo - Centered overlapping */}
                    <div className="bg-[#1c1c2e] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] relative z-10 shrink-0 flex items-center justify-center" style={{ width: '64px', height: '64px', marginTop: '-32px', padding: '4px' }}>
                      {company.company_logo ? (
                        <img 
                          src={company.company_logo.startsWith('http') ? company.company_logo : `${API_BASE.replace('/api', '')}/storage/${company.company_logo}`} 
                          alt={company.company_name} 
                          className="w-full h-full rounded-full border-2 border-white/20 group-hover:border-[#ff6b35] transition-colors duration-300 bg-[#1c1c2e] object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6c3bff]/20 to-[#ff6b35]/20 text-[#8b64ff] flex items-center justify-center border-2 border-white/20 group-hover:border-[#ff6b35] transition-colors duration-300">
                          <BuildingOfficeIcon style={{ width: '28px', height: '28px' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Section (Title) */}
                  <div className="px-3 flex flex-col items-center justify-center w-full flex-grow py-3">
                    <h3 className="font-extrabold transition-all duration-300 w-full leading-relaxed truncate px-1" title={company.company_name || company.name} style={{ fontSize: '15px', color: '#ffffff', minHeight: '24px' }}>
                      {company.company_name || company.name}
                    </h3>
                    {company.is_verified && (
                      <div className="mt-2 shrink-0 bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/20" style={{ display: 'flex', alignItems: 'center' }}>
                        <svg style={{ width: '14px', height: '14px' }} className="text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section (Ads Count) */}
                  <div className="w-full shrink-0 flex justify-center" style={{ paddingBottom: '16px' }}>
                    <div className="bg-white/5 border border-white/5 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-colors" style={{ padding: '6px 14px', gap: '8px' }}>
                      <span className="rounded-full bg-[#ff6b35] group-hover:animate-pulse shadow-[0_0_5px_#ff6b35]" style={{ width: '8px', height: '8px' }}></span>
                      <span className="font-bold text-[#d4d4d8]" style={{ fontSize: '12px' }}>
                        {company.ads_count} إعلان
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {companies.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              لا توجد شركات مطابقة للبحث
            </div>
          )}
        </div>
      )}
    </div>
  );
}
