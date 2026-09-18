'use client';

import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import LiveCountdown from '@/components/LiveCountdown';
import { CityLocation } from '@/config/chhath';
import { useLanguage } from '@/context/LanguageContext';

interface HeroExperienceProps {
  onlineCount: number;
  selectedCity: CityLocation;
  className?: string;
}

export default function HeroExperience({
  onlineCount,
  selectedCity,
  className = '',
}: HeroExperienceProps) {
  const { lang, t } = useLanguage();

  const handleScrollToContent = () => {
    const el = document.getElementById('timings') || document.getElementById('rituals');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className={`relative min-h-screen flex flex-col justify-between items-center px-4 pt-28 pb-12 z-10 ${className}`}
    >
      {/* Radiant Solar Background Flare */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] md:w-[720px] h-[340px] sm:h-[540px] md:h-[720px] rounded-full bg-gradient-to-b from-amber-500/20 via-orange-600/10 to-transparent blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      {/* Top Spiritual Tag */}
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-gold border border-amber-400/40 text-xs font-semibold text-amber-200 shadow-xl">
          <span className="text-amber-400">🪔</span>
          <span>{t.hero.tag[lang]}</span>
        </div>

        {/* Grand Hindi & English Title */}
        <div className="space-y-1">
          <h1
            className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-gold-gradient drop-shadow-2xl ${
              lang === 'hi' ? 'font-hindi tracking-normal' : 'font-serif tracking-tight'
            }`}
          >
            {lang === 'hi' ? 'छठ महापर्व' : 'CHHATH MAHAPARV'}
          </h1>
          <div className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-[0.25em] text-amber-200/90 drop-shadow">
            {lang === 'hi' ? 'CHHATH MAHAPARV 2026' : 'A SACRED VEDIC ODYSSEY • 2026'}
          </div>
        </div>

        {/* Sacred Subtitle Line */}
        <p className="text-base sm:text-xl md:text-2xl font-serif text-amber-100/95 italic max-w-2xl mx-auto drop-shadow">
          {t.hero.subtitle[lang]}
        </p>
      </div>

      {/* Dynamic Live Countdown Engine */}
      <div className="w-full max-w-3xl my-6">
        <LiveCountdown />
      </div>

      {/* CTA Buttons and City Badge */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Prominent ENTER EXPERIENCE Button */}
          <button
            onClick={handleScrollToContent}
            className="group relative px-7 py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-black font-black text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3"
          >
            <span>{t.hero.enterButton[lang]}</span>
            <ChevronDown className="w-4 h-4 text-black group-hover:translate-y-1 transition-transform" />
          </button>

          {/* Location Timing Quick Badge */}
          <a
            href="#timings"
            className="flex items-center gap-2 px-5 py-4 rounded-full glass-panel border border-amber-500/30 text-xs font-semibold text-amber-200 hover:text-white hover:border-amber-400 transition-all shadow-lg"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>
              📍 {lang === 'hi' ? selectedCity.nameHi : selectedCity.nameEn} {t.hero.viewTimings[lang]}
            </span>
          </a>
        </div>

        {/* Subtle Devotional Footer Banner */}
        <div className="text-[11px] text-amber-300/70 flex items-center gap-2">
          <span>{t.hero.taglineBar[lang]}</span>
        </div>
      </div>
    </section>
  );
}
