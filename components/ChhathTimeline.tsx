'use client';

import React, { useState } from 'react';
import { CHHATH_RITUALS_2026, RitualEvent } from '@/config/chhath';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, CheckCircle2, Sparkles, ChevronRight, X, Clock, Waves, Flame, Sun } from 'lucide-react';

interface ChhathTimelineProps {
  className?: string;
}

export default function ChhathTimeline({ className = '' }: ChhathTimelineProps) {
  const { lang, t } = useLanguage();
  const [activeModalRitual, setActiveModalRitual] = useState<RitualEvent | null>(null);
  const nowMs = new Date().getTime();

  const getRitualIcon = (id: string) => {
    switch (id) {
      case 'day-1-nahay-khay':
        return <Waves className="w-6 h-6 text-cyan-400" />;
      case 'day-2-kharna':
        return <Flame className="w-6 h-6 text-amber-400" />;
      case 'day-3-sandhya-arghya':
        return <Sun className="w-6 h-6 text-orange-400" />;
      case 'day-4-usha-arghya':
        return <Sparkles className="w-6 h-6 text-yellow-300" />;
      default:
        return <Sun className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <section id="rituals" className={`py-16 px-4 max-w-6xl mx-auto ${className}`}>
      {/* Detailed Modal / Dialog */}
      {activeModalRitual && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalRitual(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-lg glass-panel rounded-3xl border border-amber-500/40 shadow-2xl p-6 sm:p-8 relative"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setActiveModalRitual(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close ritual details"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                {getRitualIcon(activeModalRitual.id)}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
                  Day 0{activeModalRitual.dayNumber} • {lang === 'hi' ? activeModalRitual.tithiHindi : activeModalRitual.tithiEnglish}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gold-gradient">
                  {lang === 'hi' ? activeModalRitual.hindiName : activeModalRitual.englishName}
                </h3>
              </div>
            </div>

            {/* Date & Moment */}
            <div className="flex flex-wrap items-center gap-3 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-200 mb-5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>
                  {new Date(activeModalRitual.dateISO).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <span className="text-slate-500">•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'hi' ? 'मुख्य समय:' : 'Time:'} {activeModalRitual.targetTimeIST.slice(11, 16)} IST
                </span>
              </div>
            </div>

            {/* Crisp 1-Liner Summary */}
            <div className="mb-5 p-4 rounded-2xl bg-slate-950/60 border border-amber-500/20 text-sm text-slate-200 leading-relaxed">
              <p>{lang === 'hi' ? activeModalRitual.shortDesc : (activeModalRitual.shortDescEn || activeModalRitual.shortDesc)}</p>
            </div>

            {/* Prasad & Offerings */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-2">
                {lang === 'hi' ? 'पावन प्रसाद व नैवेद्य' : 'Sacred Offerings'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {(lang === 'hi' ? activeModalRitual.offerings : (activeModalRitual.offeringsEn || activeModalRitual.offerings)).map((item, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-amber-500/20 text-xs text-amber-100 font-medium"
                  >
                    🪔 {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModalRitual(null)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer"
              >
                {lang === 'hi' ? 'बंद करें (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="text-center space-y-3 mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full glass-pill border border-amber-500/30 text-xs font-semibold text-amber-300">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.timeline.badge[lang]}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gold-gradient tracking-tight font-serif">
          {t.timeline.title[lang]}
        </h2>
        <p className="text-sm sm:text-base text-amber-200/70 max-w-2xl mx-auto">
          {t.timeline.desc[lang]}
        </p>
      </div>

      {/* Timeline Grid: Day 1 (Nahay Khay), Day 2 (Kharna), Day 3 (Sandhya Arghya), Day 4 (Usha Arghya) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {CHHATH_RITUALS_2026.map((ritual) => {
          const ritualMs = new Date(ritual.targetTimeIST).getTime();
          const isPassed = nowMs > ritualMs + 1000 * 60 * 60 * 12; // 12 hours after
          const isCurrent = Math.abs(nowMs - ritualMs) < 1000 * 60 * 60 * 12;
          const currentOfferings = lang === 'hi' ? ritual.offerings : (ritual.offeringsEn || ritual.offerings);

          return (
            <div
              key={ritual.id}
              onClick={() => setActiveModalRitual(ritual)}
              className={`group cursor-pointer rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden border ${
                isCurrent
                  ? 'glass-panel-gold border-amber-400 ring-2 ring-amber-400/40 shadow-2xl scale-102'
                  : 'glass-panel border-amber-500/20 hover:border-amber-500/50 hover:bg-slate-900/60'
              }`}
            >
              {/* Day Badge & Status */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-sm">
                      0{ritual.dayNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t.timeline.day[lang]} {ritual.dayNumber}
                    </span>
                  </div>

                  {isPassed ? (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {t.timeline.completed[lang]}
                    </span>
                  ) : isCurrent ? (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3" /> {t.timeline.active[lang]}
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-amber-200/80 border border-white/10">
                      {t.timeline.upcoming[lang]}
                    </span>
                  )}
                </div>

                {/* Ritual Names */}
                <h3 className="text-2xl font-black text-amber-100 group-hover:text-amber-300 transition-colors">
                  {lang === 'hi' ? ritual.hindiName : ritual.englishName}
                </h3>
                <div className="text-xs font-medium text-amber-300/80 mb-3">
                  {lang === 'hi' ? ritual.englishName : ritual.hindiName}
                </div>

                <div className="text-xs text-amber-400/90 font-medium mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  <span>{lang === 'hi' ? ritual.tithiHindi : ritual.tithiEnglish}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">
                    {new Date(ritual.dateISO).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-300 line-clamp-4 mb-4">
                  {lang === 'hi' ? ritual.shortDesc : (ritual.shortDescEn || ritual.shortDesc)}
                </p>
              </div>

              {/* Offerings and Quick Insight */}
              <div className="pt-4 border-t border-white/10 mt-2">
                <div className="text-[11px] font-semibold text-amber-200/70 mb-1.5 uppercase tracking-wider">
                  {lang === 'hi' ? 'मुख्य पावन प्रसाद:' : 'Sacred Offerings:'}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {currentOfferings.slice(0, 3).map((item, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-amber-100/90 border border-white/5"
                    >
                      {item}
                    </span>
                  ))}
                  {currentOfferings.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md text-amber-400">
                      +{currentOfferings.length - 3} {lang === 'hi' ? 'और' : 'more'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-amber-300 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>{t.timeline.viewDetails[lang]}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
