'use client';

import React, { useState, useMemo } from 'react';
import { SUPPORTED_CITIES, CityLocation } from '@/config/chhath';
import { calculateSunTimings, SunTimingsData } from '@/lib/sunTimings';
import {
  MapPin,
  Sunrise,
  Sunset,
  SunMedium,
  Compass,
  Navigation,
  Sparkles,
  Waves,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SunTimingsProps {
  onCityChange?: (city: CityLocation) => void;
  className?: string;
}

export default function SunTimings({ onCityChange, className = '' }: SunTimingsProps) {
  const { lang, t } = useLanguage();
  const [selectedCityId, setSelectedCityId] = useState<string>('patna');
  const [targetDateMode, setTargetDateMode] = useState<'today' | 'sandhya_arghya' | 'usha_arghya'>('sandhya_arghya');
  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const selectedCity = useMemo(() => {
    return SUPPORTED_CITIES.find((c) => c.id === selectedCityId) || SUPPORTED_CITIES[0];
  }, [selectedCityId]);

  const calcDate = useMemo(() => {
    if (targetDateMode === 'today') return new Date();
    if (targetDateMode === 'sandhya_arghya') return new Date('2026-11-15T12:00:00');
    return new Date('2026-11-16T12:00:00');
  }, [targetDateMode]);

  const timings: SunTimingsData = useMemo(() => {
    return calculateSunTimings(selectedCity, calcDate);
  }, [selectedCity, calcDate]);

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    setGeoMessage(null);
    const city = SUPPORTED_CITIES.find((c) => c.id === cityId);
    if (city && onCityChange) {
      onCityChange(city);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage(lang === 'hi' ? 'ब्राउज़र में लोकेशन समर्थित नहीं है' : 'Geolocation is not supported by your browser');
      return;
    }

    setGeoLocating(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocating(false);
        const { latitude, longitude } = position.coords;

        let closestCity = SUPPORTED_CITIES[0];
        let minDistance = Infinity;

        for (const city of SUPPORTED_CITIES) {
          const dLat = (city.lat - latitude) * (Math.PI / 180);
          const dLon = (city.lng - longitude) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(latitude * (Math.PI / 180)) *
              Math.cos(city.lat * (Math.PI / 180)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = 6371 * c;

          if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
          }
        }

        setSelectedCityId(closestCity.id);
        setGeoMessage(`📍 ${lang === 'hi' ? 'निकटतम नगर:' : 'Nearest City:'} ${closestCity.nameEn} (${Math.round(minDistance)} km)`);
        if (onCityChange) onCityChange(closestCity);
      },
      () => {
        setGeoLocating(false);
        setGeoMessage(lang === 'hi' ? 'स्थान अनुमति नहीं मिली। पटना का चयन किया गया।' : 'Location permission denied. Selected Patna.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <section id="timings" className={`py-16 px-4 max-w-6xl mx-auto ${className}`}>
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full glass-pill border border-amber-500/30 text-xs font-semibold text-amber-300">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.timings.badge[lang]}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gold-gradient tracking-tight font-serif">
          {t.timings.title[lang]}
        </h2>
        <p className="text-sm sm:text-base text-amber-200/70 max-w-2xl mx-auto">
          {t.timings.desc[lang]}
        </p>
      </div>

      {/* City Selector and Controls */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/25 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <MapPin className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-300/80 font-semibold">
                {t.timings.locationLabel[lang]}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2">
                <span>{lang === 'hi' ? selectedCity.nameHi : selectedCity.nameEn}</span>
                <span className="text-base font-normal text-amber-200/80">
                  ({lang === 'hi' ? selectedCity.nameEn : selectedCity.nameHi})
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Waves className="w-3 h-3 text-cyan-400" />
                <span>{selectedCity.popularRiverGhat}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions: Geolocation & Date Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDetectLocation}
              disabled={geoLocating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-pill hover:border-amber-400/50 text-xs font-semibold text-amber-200 transition-all hover:bg-amber-500/10"
            >
              <Navigation className={`w-3.5 h-3.5 text-amber-400 ${geoLocating ? 'animate-spin' : ''}`} />
              <span>{geoLocating ? t.timings.detecting[lang] : t.timings.detectBtn[lang]}</span>
            </button>

            {/* Date Mode Pill */}
            <div className="flex rounded-xl p-1 bg-slate-950/60 border border-white/10 text-xs">
              <button
                onClick={() => setTargetDateMode('sandhya_arghya')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  targetDateMode === 'sandhya_arghya'
                    ? 'bg-amber-500/30 text-amber-200 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'hi' ? 'संध्या अर्घ्य (15 Nov)' : 'Sandhya Arghya (Nov 15)'}
              </button>
              <button
                onClick={() => setTargetDateMode('usha_arghya')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  targetDateMode === 'usha_arghya'
                    ? 'bg-amber-500/30 text-amber-200 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'hi' ? 'उषा अर्घ्य (16 Nov)' : 'Usha Arghya (Nov 16)'}
              </button>
              <button
                onClick={() => setTargetDateMode('today')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  targetDateMode === 'today'
                    ? 'bg-amber-500/30 text-amber-200 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'hi' ? 'आज (Today)' : 'Today'}
              </button>
            </div>
          </div>
        </div>

        {geoMessage && (
          <div className="mt-3 text-xs text-amber-300/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            {geoMessage}
          </div>
        )}

        {/* City Quick Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {SUPPORTED_CITIES.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCityId === city.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-amber-200 border border-white/5'
              }`}
            >
              {lang === 'hi' ? city.nameHi : city.nameEn}{' '}
              <span className="opacity-70 text-[10px]">
                ({lang === 'hi' ? city.nameEn : city.nameHi})
              </span>
            </button>
          ))}
        </div>

        {/* Solar Timings Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Sunset & Sandhya Arghya */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-orange-950/40 to-slate-950/60 border border-orange-500/30 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Sunset className="w-4 h-4" />
                {t.timings.sandhyaArghya[lang]}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">Day 3</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-orange-200 tabular-nums">{timings.sunsetTime}</div>
              <div className="text-xs text-slate-400 mt-1">{t.timings.sunset[lang]}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-orange-300/80">
              <span className="text-slate-400">{t.timings.recommendedWindow[lang]}</span>
              <div className="font-semibold text-orange-200 mt-0.5">{timings.sandhyaArghyaWindow}</div>
            </div>
          </div>

          {/* Sunrise & Usha Arghya */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-950/60 border border-amber-500/30 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sunrise className="w-4 h-4" />
                {t.timings.ushaArghya[lang]}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Day 4</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-amber-200 tabular-nums">{timings.sunriseTime}</div>
              <div className="text-xs text-slate-400 mt-1">{t.timings.sunrise[lang]}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-300/80">
              <span className="text-slate-400">{t.timings.recommendedWindow[lang]}</span>
              <div className="font-semibold text-amber-200 mt-0.5">{timings.ushaArghyaWindow}</div>
            </div>
          </div>

          {/* Dawn & Brahma Muhurta */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {t.timings.dawn[lang]}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-indigo-100 tabular-nums">{timings.dawnTime}</div>
              <div className="text-xs text-slate-400 mt-1">{t.timings.dawnSub[lang]}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
              {lang === 'hi'
                ? 'व्रती सूर्योदय से पूर्व नदी तट पर उपस्थित होकर पवित्र जल में प्रवेश करते हैं।'
                : 'Devotees gather at the riverbank before dawn to step into the sacred cold waters.'}
            </div>
          </div>

          {/* Solar Noon & Day Length */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <SunMedium className="w-4 h-4" />
                {t.timings.solarNoon[lang]}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-yellow-100 tabular-nums">{timings.solarNoonTime}</div>
              <div className="text-xs text-slate-400 mt-1">Solar Noon</div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
              <span>{t.timings.dayLength[lang]} </span>
              <span className="font-semibold text-amber-300">{timings.dayLength}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
