'use client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  const { lang, t } = useLanguage();

  return (
    <button 
      onClick={() => router.back()}
      className={`fixed top-24 z-40 bg-[#12121e]/80 backdrop-blur-md border border-white/10 hover:border-[#6c3bff]/50 text-white hover:text-[#6c3bff] rounded-full p-3 shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_5px_20px_rgba(108,59,255,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center ${lang === 'ar' ? 'right-4 md:right-8' : 'left-4 md:left-8'} ${className}`}
      title={lang === 'ar' ? 'رجوع' : 'Back'}
    >
      {lang === 'ar' ? (
        <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />
      ) : (
        <ArrowLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
      )}
    </button>
  );
}
