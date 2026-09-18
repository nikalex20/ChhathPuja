'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Flame, Sparkles, Globe2, HeartHandshake, Send } from 'lucide-react';

interface CommunitySectionProps {
  onlineCount: number;
  diyaCount: number;
  recentPrayers: Array<{ id: string; city: string; devoteeName?: string }>;
  onLightDiya: (name?: string) => void;
  selectedCityName: string;
  className?: string;
}

export default function CommunitySection({
  onlineCount,
  diyaCount,
  recentPrayers,
  onLightDiya,
  selectedCityName,
  className = '',
}: CommunitySectionProps) {
  const { lang, t } = useLanguage();
  const [devoteeName, setDevoteeName] = useState('');
  const [hasLitLocally, setHasLitLocally] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleLightDiyaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLightDiya(devoteeName.trim() || undefined);
    setHasLitLocally(true);
    setDevoteeName('');
    setShowInput(false);
  };

  return (
    <section id="community" className={`py-16 px-4 max-w-6xl mx-auto ${className}`}>
      {/* Container with golden ambient glow */}
      <div className="rounded-3xl p-8 sm:p-12 glass-panel-gold border border-amber-400/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top Live Presence Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="relative flex items-center justify-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                    {onlineCount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {lang === 'hi' ? 'लाइव' : 'Live'}
                  </span>
                </div>
                <p className="text-sm text-amber-200/90 font-medium mt-0.5">
                  {t.community.liveOnline[lang]}
                </p>
              </div>
            </div>

            {/* Global Diaspora Ticker */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/60 border border-white/10 text-xs text-slate-300">
              <Globe2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {t.community.diasporaPrefix[lang]}{' '}
                <strong className="text-amber-200">Patna, Varanasi, London, Delhi, Ranchi, Toronto, Mumbai</strong>
              </span>
            </div>
          </div>

          {/* Virtual Diya Experience */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-semibold text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.community.badge[lang]}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-gold-gradient">
                {t.community.title[lang]}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {t.community.desc[lang]}
              </p>

              {/* Total Lit Counter */}
              <div className="inline-flex items-center gap-3 p-3 px-5 rounded-2xl bg-slate-950/70 border border-amber-500/30">
                <span className="text-2xl font-black text-amber-300 tabular-nums">
                  🪔 {diyaCount.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-300 border-l border-white/10 pl-3">
                  {lang === 'hi' ? 'विश्वभर के श्रद्धालुओं द्वारा प्रज्वलित दीप' : 'Diyas lit by devotees worldwide'}
                </span>
              </div>

              {/* Action Buttons / Input */}
              <div className="pt-2">
                {!showInput ? (
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <button
                      onClick={() => {
                        onLightDiya();
                        setHasLitLocally(true);
                      }}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Flame className="w-5 h-5 text-black" />
                      <span>{t.community.litButton[lang]}</span>
                    </button>

                    <button
                      onClick={() => setShowInput(true)}
                      className="px-4 py-3 rounded-2xl glass-pill hover:border-amber-400/40 text-xs font-semibold text-amber-200 hover:text-white transition-all cursor-pointer"
                    >
                      {t.community.nameOption[lang]}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleLightDiyaSubmit} className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder={t.community.inputPlaceholder[lang]}
                      value={devoteeName}
                      onChange={(e) => setDevoteeName(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      maxLength={40}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t.community.submitName[lang]}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInput(false)}
                      className="px-3 py-2.5 rounded-xl bg-white/5 text-slate-400 text-xs hover:text-white cursor-pointer"
                    >
                      {t.community.cancel[lang]}
                    </button>
                  </form>
                )}

                {hasLitLocally && (
                  <p className="text-xs text-amber-300 mt-3 flex items-center justify-center lg:justify-start gap-1.5 animate-in fade-in">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{t.community.successMessage[lang]}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Live Devotional Prayer Feed */}
            <div className="lg:col-span-5 bg-slate-950/60 p-5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-semibold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-amber-400" />
                  {t.community.recentTitle[lang]}
                </span>
                <span className="text-[10px] text-slate-400">
                  {lang === 'hi' ? 'लाइव प्रवाह' : 'Live feed'}
                </span>
              </div>

              <div className="space-y-2.5 mt-3 max-h-56 overflow-y-auto">
                {recentPrayers.length > 0 ? (
                  recentPrayers.map((prayer) => (
                    <div
                      key={prayer.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-medium text-amber-100">
                          {prayer.devoteeName || (lang === 'hi' ? 'एक श्रद्धालु' : 'A Devotee')}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-300/80 px-2 py-0.5 rounded bg-amber-500/10">
                        {prayer.city}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    {lang === 'hi' ? 'पहला दीप आप प्रज्वलित करें!' : 'Be the first to light a sacred diya!'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

