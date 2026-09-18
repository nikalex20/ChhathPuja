'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CHHATH_RITUALS_2026, NEXT_CHHATH_START, RitualEvent } from '@/config/chhath';
import { Clock, Calendar, Sparkles, CheckCircle2, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMsRemaining: number;
}

interface LiveCountdownProps {
  onNextRitualChange?: (ritual: RitualEvent | null) => void;
  className?: string;
  variant?: 'hero' | 'compact' | 'full';
}

export default function LiveCountdown({
  onNextRitualChange,
  className = '',
  variant = 'hero',
}: LiveCountdownProps) {
  const { lang, t } = useLanguage();
  // Test simulation offset (in ms or custom date)
  const [simulationDate, setSimulationDate] = useState<Date | null>(null);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(simulationDate ? new Date(simulationDate.getTime() + 1000) : new Date());
      if (simulationDate) {
        setSimulationDate(new Date(simulationDate.getTime() + 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [simulationDate]);

  // Determine current active or upcoming ritual
  const status = useMemo(() => {
    const currentTimeMs = now.getTime();

    // Check through rituals
    for (let i = 0; i < CHHATH_RITUALS_2026.length; i++) {
      const ritual = CHHATH_RITUALS_2026[i];
      const targetMs = new Date(ritual.targetTimeIST).getTime();

      // If this ritual's target moment is in the future
      if (targetMs > currentTimeMs) {
        const diff = targetMs - currentTimeMs;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return {
          type: 'upcoming' as const,
          ritual,
          nextIndex: i,
          countdown: { days, hours, minutes, seconds, totalMsRemaining: diff },
          isDuringChhath: i > 0,
        };
      }
    }

    // If all 2026 rituals have passed:
    const nextChhathMs = new Date(NEXT_CHHATH_START).getTime();
    const diff = Math.max(0, nextChhathMs - currentTimeMs);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      type: 'completed' as const,
      ritual: null,
      nextIndex: -1,
      countdown: { days, hours, minutes, seconds, totalMsRemaining: diff },
      isDuringChhath: false,
    };
  }, [now]);

  useEffect(() => {
    if (onNextRitualChange) {
      onNextRitualChange(status.ritual);
    }
  }, [status.ritual, onNextRitualChange]);

  const padZero = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Ritual Header Tag */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-amber-400/30 text-xs sm:text-sm font-medium text-amber-200 mb-4 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        {status.type === 'upcoming' ? (
          <span>
            {t.countdown.nextRitual[lang]} •{' '}
            <strong className="text-amber-100 font-semibold">
              {lang === 'hi' ? status.ritual?.hindiName : status.ritual?.englishName}
            </strong>
          </span>
        ) : (
          <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {t.countdown.completed[lang]}
          </span>
        )}
      </div>

      {/* Countdown Digits */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 my-2 max-w-2xl w-full">
        {/* Days */}
        <div className="flex flex-col items-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel border border-amber-500/25 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gold-gradient tabular-nums">
            {padZero(status.countdown.days)}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-amber-300/80 mt-1">
            {t.countdown.days[lang]}
          </span>
        </div>

        {/* Hours */}
        <div className="flex flex-col items-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel border border-amber-500/25 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gold-gradient tabular-nums">
            {padZero(status.countdown.hours)}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-amber-300/80 mt-1">
            {t.countdown.hours[lang]}
          </span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel border border-amber-500/25 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gold-gradient tabular-nums">
            {padZero(status.countdown.minutes)}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-amber-300/80 mt-1">
            {t.countdown.minutes[lang]}
          </span>
        </div>

        {/* Seconds */}
        <div className="flex flex-col items-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl glass-panel border border-amber-500/25 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-saffron-gradient tabular-nums">
            {padZero(status.countdown.seconds)}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-amber-300/80 mt-1">
            {t.countdown.seconds[lang]}
          </span>
        </div>
      </div>

      {/* Subtext info */}
      <div className="mt-3 text-xs sm:text-sm text-amber-200/80 max-w-md">
        {status.type === 'upcoming' ? (
          <p className="flex items-center justify-center gap-1.5">
            <span>{lang === 'hi' ? status.ritual?.shortDesc : (status.ritual?.shortDescEn || status.ritual?.shortDesc)}</span>
          </p>
        ) : (
          <p className="text-slate-300">
            {lang === 'hi'
              ? 'छठ महापर्व 2027 का प्रारंभ होने में शेष समय। छठी मैया का आशीष सदैव आपके साथ रहे।'
              : 'Time remaining until Chhath Mahaparv 2027 begins. May Chhathi Maiya always protect you.'}
          </p>
        )}
      </div>

      {/* Discrete Time Machine / Preview Mode Toggle */}
      <div className="mt-4">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="inline-flex items-center gap-1 text-[11px] text-amber-400/60 hover:text-amber-300 transition-colors px-2.5 py-1 rounded-full bg-white/5 border border-white/5 cursor-pointer"
          title="Preview how countdown behaves on different ritual days"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>
            {simulationDate
              ? (lang === 'hi' ? '⏱️ टाइम मशीन सक्रिय (बदलने हेतु क्लिक करें)' : '⏱️ Time Machine Active (Click to modify)')
              : t.countdown.timeMachine[lang]}
          </span>
        </button>

        {showSimulator && (
          <div className="mt-3 p-3 rounded-xl glass-panel border border-amber-500/20 text-xs flex flex-wrap gap-2 justify-center items-center max-w-lg">
            <span className="text-slate-400 text-[11px]">{lang === 'hi' ? 'समय चुनें:' : 'Jump to:'}</span>
            <button
              onClick={() => setSimulationDate(null)}
              className={`px-2 py-1 rounded text-[11px] cursor-pointer ${
                !simulationDate ? 'bg-amber-500/30 text-amber-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {t.countdown.currentRealTime[lang]}
            </button>
            <button
              onClick={() => setSimulationDate(new Date('2026-11-13T07:00:00+05:30'))}
              className="px-2 py-1 rounded text-[11px] bg-white/5 hover:bg-amber-500/20 text-slate-300 cursor-pointer"
            >
              {lang === 'hi' ? 'दिन 1 (नहाय-खाय)' : 'Day 1 (Nahay Khay)'}
            </button>
            <button
              onClick={() => setSimulationDate(new Date('2026-11-14T14:00:00+05:30'))}
              className="px-2 py-1 rounded text-[11px] bg-white/5 hover:bg-amber-500/20 text-slate-300 cursor-pointer"
            >
              {lang === 'hi' ? 'दिन 2 (खरना)' : 'Day 2 (Kharna)'}
            </button>
            <button
              onClick={() => setSimulationDate(new Date('2026-11-15T15:30:00+05:30'))}
              className="px-2 py-1 rounded text-[11px] bg-white/5 hover:bg-amber-500/20 text-slate-300 cursor-pointer"
            >
              {lang === 'hi' ? 'दिन 3 (संध्या अर्घ्य)' : 'Day 3 (Sandhya Arghya)'}
            </button>
            <button
              onClick={() => setSimulationDate(new Date('2026-11-16T05:00:00+05:30'))}
              className="px-2 py-1 rounded text-[11px] bg-white/5 hover:bg-amber-500/20 text-slate-300 cursor-pointer"
            >
              {lang === 'hi' ? 'दिन 4 (उषा अर्घ्य)' : 'Day 4 (Usha Arghya)'}
            </button>
            <button
              onClick={() => setSimulationDate(new Date('2026-11-17T12:00:00+05:30'))}
              className="px-2 py-1 rounded text-[11px] bg-white/5 hover:bg-amber-500/20 text-slate-300 cursor-pointer"
            >
              {lang === 'hi' ? 'पारण उपरांत (छठ 2027)' : 'Post-Chhath (Next 2027)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

