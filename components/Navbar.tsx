'use client';

import React, { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface NavbarProps {
  onlineCount: number;
  className?: string;
}

export default function Navbar({ onlineCount, className = '' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLanguage();

  const navLinks = [
    { href: '#home', label: t.nav.home[lang] },
    { href: '#timings', label: t.nav.timings[lang] },
    { href: '#rituals', label: t.nav.rituals[lang] },
    { href: '#community', label: t.nav.community[lang] },
  ];

  return (
    <header className={`fixed top-4 inset-x-0 z-40 max-w-6xl mx-auto px-4 ${className}`}>
      <nav className="glass-panel rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-amber-500/25 shadow-2xl flex items-center justify-between">
        {/* Logo / Title */}
        <a href="#home" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
            🪔
          </div>
          <div>
            <span className="text-sm font-black text-gold-gradient tracking-tight block">
              {lang === 'hi' ? 'छठ महापर्व' : 'CHHATH'} <span className="text-xs font-normal text-amber-300">2026</span>
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-1.5 rounded-full hover:text-amber-200 hover:bg-white/5 transition-colors"
            >
              <span>{link.label}</span>
            </a>
          ))}
        </div>

        {/* Right Actions: Live Indicator & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Visitor Indicator Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/60 border border-white/10 text-[11px] text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-300 tabular-nums">{onlineCount.toLocaleString('en-IN')}</span>
            <span className="text-slate-400">{t.nav.online[lang]}</span>
          </div>

          {/* Language Switcher Pill */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-white transition-all hover:scale-105 shadow-sm"
            title="Switch Language / भाषा बदलें"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.nav.switchLang[lang]}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full hover:bg-white/10 text-slate-300"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-3xl glass-panel border border-amber-500/30 shadow-2xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-xs text-amber-300 font-semibold">
            <span>{lang === 'hi' ? 'नेविगेशन' : 'Navigation'}</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{onlineCount.toLocaleString('en-IN')} Live</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-medium text-slate-200 hover:text-amber-200 transition-colors"
              >
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
