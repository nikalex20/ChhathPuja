'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sun, ArrowUp } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const { lang, t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`border-t border-amber-500/20 bg-slate-950/80 backdrop-blur-xl pt-10 pb-12 px-4 relative z-10 ${className}`}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Links & Brand */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-lg">🪔</span>
            <div>
              <span className="font-bold text-amber-100 block">
                {lang === 'hi' ? 'छठ महापर्व 2026' : 'Chhath Mahaparv 2026'}
              </span>
              <span className="text-[11px] text-slate-500">{t.footer.brandSub[lang]}</span>
            </div>
          </div>

          {/* Right: Scroll to top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-200 hover:text-amber-100 transition-colors cursor-pointer"
          >
            <span>{t.footer.backToTop[lang]}</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom copyright notice */}
        <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-white/5 space-y-1">
          <p>{t.footer.copyright[lang]}</p>
          <p>
            Chhath Mahaparv 2026 • Astronomical Solar Calculation Engine • Sacred Digital Experience
          </p>
        </div>
      </div>
    </footer>
  );
}
