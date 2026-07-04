'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { API_BASE } from '@/lib/api';
import { BuildingOfficeIcon, MapPinIcon, GlobeAltIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import BackButton from '@/components/BackButton';
import AdCard from '@/components/AdCard';

interface Company {
  id: number;
  name: string;
  company_name: string;
  company_logo: string;
  company_cover: string;
  company_description: string;
  company_website: string;
  company_address: string;
  country: { name: string } | null;
  is_verified: boolean;
  joined_at: string;
}

export default function CompanyProfilePage() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_BASE}/companies/${id}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      if (data.success) {
        setCompany(data.company);
        setAds(data.ads.data);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6c3bff] border-t-transparent"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20 min-h-screen">
        <h2 className="text-2xl font-bold text-white">الشركة غير موجودة</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex justify-center">
      <BackButton />
      <div className="w-full max-w-2xl relative z-10">
        
        {/* Main Profile Card - Compact Elegant Design */}
        <div className="bg-gradient-to-b from-[#1c1c2e] to-[#12121e] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative pb-8">
          
          {/* Cover Image with Flush Curve */}
          <div 
            className="w-full bg-[#12121e] relative shrink-0" 
            style={{ 
              height: '180px', 
              borderBottomLeftRadius: '50% 25px',
              borderBottomRightRadius: '50% 25px',
              overflow: 'hidden'
            }}
          >
            {company.company_cover ? (
              <img 
                src={company.company_cover.startsWith('http') ? company.company_cover : `${API_BASE.replace('/api', '')}/storage/${company.company_cover}`} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#6c3bff]/40 to-[#ff6b35]/40"></div>
            )}
          </div>

          {/* Centered Logo */}
          <div className="flex justify-center -mt-16 relative z-20">
            <div className="p-1.5 bg-[#1c1c2e] rounded-full shadow-2xl relative">
              {company.company_logo ? (
                <img 
                  src={company.company_logo.startsWith('http') ? company.company_logo : `${API_BASE.replace('/api', '')}/storage/${company.company_logo}`} 
                  alt={company.company_name} 
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  className="rounded-full border-2 border-white/10 bg-[#1c1c2e]"
                />
              ) : (
                <div style={{ width: '100px', height: '100px' }} className="text-[#8b64ff] bg-gradient-to-br from-[#6c3bff]/20 to-[#ff6b35]/20 rounded-full flex items-center justify-center border-2 border-white/10">
                  <BuildingOfficeIcon style={{ width: '40px', height: '40px' }} />
                </div>
              )}
              {company.is_verified && (
                <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1 border-4 border-[#1c1c2e] shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info - Compact */}
          <div className="px-6 mt-4 text-center flex flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
              {company.company_name || company.name}
            </h1>
            
            <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-lg mb-6">
              {company.company_description || 'مرحباً بك في صفحة الشركة الرسمية. يمكنك تصفح كافة الإعلانات والخدمات التي تقدمها من هنا.'}
            </p>

            {/* Meta Tags */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-6">
              {company.country && (
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <MapPinIcon style={{ width: '14px', height: '14px' }} className="text-[#ff6b35]" />
                  <span className="text-xs text-gray-300">{company.country.name} {company.company_address ? `- ${company.company_address}` : ''}</span>
                </div>
              )}
              {company.company_website && (
                <a href={company.company_website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-[#6c3bff]/20 hover:border-[#6c3bff]/50 transition-all text-white group cursor-pointer">
                  <GlobeAltIcon style={{ width: '14px', height: '14px' }} className="text-blue-400 group-hover:animate-spin-slow" />
                  <span className="text-xs text-gray-300 group-hover:text-blue-300">موقع الويب</span>
                </a>
              )}
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <BuildingOfficeIcon style={{ width: '14px', height: '14px' }} className="text-emerald-400" />
                <span className="text-xs text-gray-300">عضو منذ {new Date(company.joined_at).getFullYear()}</span>
              </div>
            </div>

            {/* Contact Button */}
            <button className="bg-gradient-to-r from-[#6c3bff] to-[#512da8] hover:from-[#512da8] hover:to-[#6c3bff] text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_5px_15px_rgba(108,59,255,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-white/10">
              <EnvelopeIcon style={{ width: '18px', height: '18px' }} />
              تواصل معنا
            </button>
          </div>
        </div>

        {/* Ads Section (Original Cards) */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-[#6c3bff] to-[#ff6b35] rounded-full inline-block shadow-[0_0_10px_#6c3bff]"></span>
              إعلانات الشركة ({ads.length})
            </h2>
          </div>

          {ads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ads.map((ad, index) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  key={ad.id}
                >
                  <AdCard ad={ad} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#12121e]/80 rounded-3xl p-12 text-center border border-white/5 shadow-xl flex flex-col items-center justify-center backdrop-blur-md">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <BuildingOfficeIcon style={{ width: '32px', height: '32px' }} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">لا توجد إعلانات نشطة</h3>
              <p className="text-gray-400 max-w-sm mx-auto text-xs leading-relaxed">هذه الشركة لم تقم بنشر أي إعلانات نشطة حتى الآن.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
