'use client';

import React, { useState } from 'react';
import RiverCanvas from '@/components/RiverCanvas';
import Navbar from '@/components/Navbar';
import HeroExperience from '@/components/HeroExperience';
import DeluxeMusicPlayer from '@/components/DeluxeMusicPlayer';
import SunTimings from '@/components/SunTimings';
import ChhathTimeline from '@/components/ChhathTimeline';
import CommunitySection from '@/components/CommunitySection';
import Footer from '@/components/Footer';
import { SUPPORTED_CITIES, CityLocation } from '@/config/chhath';
import { usePresence } from '@/lib/presence';

export default function ChhathHomePage() {
  const [selectedCity, setSelectedCity] = useState<CityLocation>(SUPPORTED_CITIES[0]); // Default to Patna
  const [spawnDiyaCounter, setSpawnDiyaCounter] = useState<number>(0);

  // Real-time Presence and Virtual Diya state
  const { onlineCount, diyaCount, recentPrayers, lightDiya } = usePresence(selectedCity.nameEn);

  const handleLightDiya = (name?: string) => {
    lightDiya(name);
    // Trigger a visual glowing diya spawn on the river canvas
    setSpawnDiyaCounter((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-[#050814] text-[#fffdf7] overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Immersive 60fps HTML5 Canvas River Background */}
      <RiverCanvas spawnDiyaTrigger={spawnDiyaCounter} interactive={true} />

      {/* 2. Floating Minimal Glassmorphic Navbar */}
      <Navbar onlineCount={onlineCount} />

      {/* 3. Main Experience Content (Layered cleanly on top of the river) */}
      <main className="relative z-10 space-y-8 sm:space-y-16 pb-24 sm:pb-32">
        {/* Full-Screen Cinematic Hero Experience */}
        <HeroExperience
          onlineCount={onlineCount}
          selectedCity={selectedCity}
        />

        {/* Astronomical Solar Timings for Chhath Cities */}
        <SunTimings
          onCityChange={(city) => setSelectedCity(city)}
        />

        {/* 4 Sacred Days Interactive Timeline (Day 1 Nahay Khay, Day 2 Kharna, Day 3 Sandhya Arghya, Day 4 Usha Arghya) */}
        <ChhathTimeline />

        {/* Real-time Global Community Presence & Digital Diya (दीपदान) */}
        <CommunitySection
          onlineCount={onlineCount}
          diyaCount={diyaCount}
          recentPrayers={recentPrayers}
          onLightDiya={handleLightDiya}
          selectedCityName={selectedCity.nameEn}
        />
      </main>

      {/* 4. Deluxe Floating Capsule Music Player Bar (deluxesalon.in style) */}
      <DeluxeMusicPlayer />

      {/* 5. Devotional Footer */}
      <Footer />
    </div>
  );
}

