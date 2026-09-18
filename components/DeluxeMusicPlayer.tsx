'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  X,
  ListMusic,
  Sparkles,
  Disc,
  Search,
} from 'lucide-react';
import { MUSIC_PLAYLISTS, CHHATH_SONGS, SongRecord } from '@/config/chhath';
import { useLanguage } from '@/context/LanguageContext';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface DeluxeMusicPlayerProps {
  className?: string;
}

export default function DeluxeMusicPlayer({ className = '' }: DeluxeMusicPlayerProps) {
  const { lang } = useLanguage();
  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const isRepeatRef = useRef<boolean>(false);
  const [repeatToast, setRepeatToast] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [currentTitle, setCurrentTitle] = useState<string>(CHHATH_SONGS[0]?.hindiTitle || 'उग हे सुरुजदेव भेल भिनसरवा');
  const [currentArtist, setCurrentArtist] = useState<string>(CHHATH_SONGS[0]?.artist || 'अनुराधा पौडवाल (Anuradha Paudwal)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(315);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSongsModalOpen, setIsSongsModalOpen] = useState<boolean>(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const timeUpdateTimerRef = useRef<any>(null);

  const currentSong: SongRecord = CHHATH_SONGS[currentTrackIndex] || CHHATH_SONGS[0];

  // Initialize YouTube Iframe API
  useEffect(() => {
    // Load the YouTube Iframe Player API script if not already present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-bg-streamer', {
        height: '200',
        width: '200',
        playerVars: {
          listType: 'playlist',
          list: MUSIC_PLAYLISTS.ytMusic.playlistId,
          autoplay: 0,
          controls: 0,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            try {
              event.target.setVolume(85);
            } catch {}
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING === 1
            if (event.data === 1) {
              setIsPlaying(true);
              updateTrackData();
            }
            // YT.PlayerState.PAUSED === 2
            else if (event.data === 2) {
              setIsPlaying(false);
            }
            // YT.PlayerState.ENDED === 0
            else if (event.data === 0) {
              if (isRepeatRef.current) {
                try {
                  event.target.seekTo(0);
                  event.target.playVideo();
                  setIsPlaying(true);
                } catch {
                  handleNextTrack();
                }
              } else {
                handleNextTrack();
              }
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (timeUpdateTimerRef.current) clearInterval(timeUpdateTimerRef.current);
    };
  }, []);

  // Update track data from player when available
  const updateTrackData = useCallback(() => {
    if (!playerRef.current) return;
    try {
      const pIndex = playerRef.current.getPlaylistIndex?.();
      if (typeof pIndex === 'number' && pIndex >= 0 && pIndex < CHHATH_SONGS.length) {
        setCurrentTrackIndex(pIndex);
        setCurrentTitle(CHHATH_SONGS[pIndex].hindiTitle);
        setCurrentArtist(CHHATH_SONGS[pIndex].artist);
      } else {
        const videoData = playerRef.current.getVideoData?.();
        if (videoData && videoData.title) {
          setCurrentTitle(videoData.title);
          if (videoData.author) {
            setCurrentArtist(videoData.author);
          }
        }
      }
      const dur = playerRef.current.getDuration?.();
      if (dur && dur > 0) {
        setDuration(dur);
      }
    } catch {}
  }, []);

  // Timer to update progress bar while playing
  useEffect(() => {
    if (isPlaying) {
      timeUpdateTimerRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          try {
            const curr = playerRef.current.getCurrentTime();
            setCurrentTime(curr);
            const dur = playerRef.current.getDuration();
            if (dur && dur > 0) setDuration(dur);
          } catch {}
        }
      }, 600);
    } else {
      if (timeUpdateTimerRef.current) clearInterval(timeUpdateTimerRef.current);
    }

    return () => {
      if (timeUpdateTimerRef.current) clearInterval(timeUpdateTimerRef.current);
    };
  }, [isPlaying]);

  // Player controls
  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleRepeat = () => {
    setIsRepeat((prev) => {
      const next = !prev;
      isRepeatRef.current = next;

      try {
        if (playerRef.current?.setLoop) {
          playerRef.current.setLoop(next);
        }
      } catch {}

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setRepeatToast(
        next
          ? (lang === 'hi' ? '🔂 गीत दोहराव चालू (Repeat Song ON)' : '🔂 Single Repeat ON')
          : (lang === 'hi' ? '🔁 सामान्य प्लेबैक (Repeat OFF)' : '🔁 Repeat OFF')
      );
      toastTimerRef.current = setTimeout(() => setRepeatToast(null), 2200);

      return next;
    });
  };

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % CHHATH_SONGS.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTitle(CHHATH_SONGS[nextIdx].hindiTitle);
    setCurrentArtist(CHHATH_SONGS[nextIdx].artist);
    setCurrentTime(0);

    if (playerRef.current) {
      try {
        playerRef.current.nextVideo();
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch {}
    }
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + CHHATH_SONGS.length) % CHHATH_SONGS.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTitle(CHHATH_SONGS[prevIdx].hindiTitle);
    setCurrentArtist(CHHATH_SONGS[prevIdx].artist);
    setCurrentTime(0);

    if (playerRef.current) {
      try {
        playerRef.current.previousVideo();
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch {}
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current && playerRef.current.seekTo) {
      try {
        playerRef.current.seekTo(newTime, true);
      } catch {}
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (playerRef.current && playerRef.current.setVolume) {
      try {
        playerRef.current.setVolume(newVol);
        if (newVol > 0 && playerRef.current.isMuted?.()) {
          playerRef.current.unMute();
        }
      } catch {}
    }
  };

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 80);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {
      setIsMuted(!isMuted);
    }
  };

  const handleSelectSong = (index: number) => {
    setCurrentTrackIndex(index);
    const selected = CHHATH_SONGS[index];
    if (selected) {
      setCurrentTitle(selected.hindiTitle);
      setCurrentArtist(selected.artist);
    }
    setCurrentTime(0);
    setIsSongsModalOpen(false);

    if (playerRef.current) {
      try {
        if (playerRef.current.playVideoAt) {
          playerRef.current.playVideoAt(index);
        } else if (selected?.videoId && playerRef.current.loadVideoById) {
          playerRef.current.loadVideoById(selected.videoId);
        } else {
          playerRef.current.playVideo();
        }
        setIsPlaying(true);
      } catch {}
    }
  };

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return CHHATH_SONGS;
    const q = searchQuery.toLowerCase().trim();
    return CHHATH_SONGS.filter(
      (s) =>
        s.hindiTitle.toLowerCase().includes(q) ||
        s.romanTitle.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.trackNum.includes(q)
    );
  }, [searchQuery]);

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      {/* 
        1. Invisible / Background YouTube Player 
        Kept in a 1px container offscreen with opacity 0 so browsers NEVER suspend audio,
        exactly matching deluxesalon.in!
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 w-px h-px opacity-0 overflow-hidden z-[-1]"
      >
        <div id="yt-bg-streamer" />
      </div>

      {/* 2. Top Right Floating Service Chips (Matching Deluxe Saloon Header) */}
      <div className="fixed top-20 right-4 z-40 flex flex-col items-end gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Spotify Chip */}
          <button
            onClick={() => setIsSpotifyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111827]/80 hover:bg-[#1f2937] text-white border border-white/10 text-xs font-semibold shadow-lg backdrop-blur-md transition-all hover:scale-105"
            title="Open Spotify Player"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#1ED760]">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.12-.899-.48-.12-.421.12-.78.479-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.362 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="hidden sm:inline">Spotify</span>
          </button>

          {/* YT Music Chip */}
          <a
            href={MUSIC_PLAYLISTS.ytMusic.directUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111827]/80 hover:bg-[#1f2937] text-white border border-white/10 text-xs font-semibold shadow-lg backdrop-blur-md transition-all hover:scale-105"
            title="Open Playlist on YouTube Music"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#FF0033]">
              <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
            </svg>
            <span className="hidden sm:inline">YT Music</span>
          </a>
        </div>

        {/* All Songs Button */}
        <button
          onClick={() => setIsSongsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111827]/80 hover:bg-[#1f2937] text-amber-200 border border-amber-500/20 text-xs font-semibold shadow-lg backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
        >
          <ListMusic className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'hi' ? 'सारे गीत (All Songs)' : 'All Songs (सारे गीत)'}</span>
        </button>
      </div>

      {/* 
        3. Iconic Floating Capsule Music Player Bar (Docked at bottom center) 
        Styled exactly like deluxesalon.in with authentic Chhath Mahaparv devotion!
      */}
      <div className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 ${className}`}>
        <div className="pointer-events-auto">
          <div className="relative z-30 mx-auto mb-[max(1rem,env(safe-area-inset-bottom))] w-full max-w-xl px-3 sm:mb-6">
            {/* Interactive Repeat Status Toast */}
            {repeatToast && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-slate-950/95 border border-amber-400/50 text-[11px] font-bold text-amber-200 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-50 pointer-events-none whitespace-nowrap">
                {repeatToast}
              </div>
            )}

            <div className="glass-panel-gold flex items-center gap-3 rounded-full p-2.5 pr-4 sm:gap-4 sm:p-3 sm:pr-5 border border-amber-400/30 shadow-[0_12px_40px_rgba(0,0,0,0.85)] bg-[#0b0f1d]/90 backdrop-blur-2xl">
              {/* Circular Album Artwork (Rotating when playing) */}
              <div className="relative size-12 shrink-0 sm:size-14">
                <div
                  className={`size-full rounded-full overflow-hidden border-2 border-amber-500/40 shadow-md transition-all duration-700 ${
                    isPlaying ? 'animate-spin shadow-[0_0_16px_rgba(251,191,36,0.5)]' : ''
                  }`}
                  style={{ animationDuration: '10s' }}
                >
                  <div className="size-full bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-400 flex items-center justify-center text-black font-black text-xs">
                    🪔
                  </div>
                </div>
                {/* Center spindle dot */}
                <div className="absolute inset-0 m-auto size-3 rounded-full bg-black border border-amber-300 pointer-events-none" />
              </div>

              {/* Track Title, Channel & Scrubber Bar */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs sm:text-sm font-bold text-[#fffdf7] tracking-tight">
                    {currentTitle}
                  </p>
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-3 shrink-0" title="Now Playing">
                      <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-full" />
                      <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-2/3" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 bg-amber-400 rounded-full animate-pulse h-4/5" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="truncate text-[11px] text-amber-300/80">
                    {currentArtist}
                  </p>
                  {isRepeat && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-400/30">
                      🔂 1
                    </span>
                  )}
                </div>

                {/* Scrubber Progress Slider */}
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="1"
                    aria-label="Seek track"
                    value={currentTime}
                    onChange={handleSeek}
                    className="h-1 w-full accent-amber-400 cursor-pointer bg-slate-700/60 rounded-full"
                    style={{
                      background: `linear-gradient(to right, #ffb703 0%, #ffb703 ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
                    }}
                  />
                  <span className="shrink-0 font-mono text-[10px] text-amber-200/70 tabular-nums">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </span>
                </div>
              </div>

              {/* Playback Transport Buttons */}
              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                {/* Previous Track */}
                <button
                  type="button"
                  onClick={handlePrevTrack}
                  aria-label="Previous track"
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <SkipBack className="size-4" />
                </button>

                {/* Main Play / Resume Button */}
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play / Resume'}
                  className="size-10 sm:size-11 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
                </button>

                {/* Repeat Button (Right beside Resume Button!) */}
                <button
                  type="button"
                  onClick={handleToggleRepeat}
                  aria-label={isRepeat ? 'Repeat Single Song (Active)' : 'Repeat Off'}
                  title={isRepeat ? (lang === 'hi' ? 'गीत दोहराव चालू' : 'Repeat Single Song Active') : (lang === 'hi' ? 'गीत दोहराएं' : 'Repeat Off')}
                  className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer ${
                    isRepeat
                      ? 'text-amber-300 bg-amber-500/25 border border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.35)] scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isRepeat ? (
                    <Repeat1 className="size-4 text-amber-300 animate-pulse" />
                  ) : (
                    <Repeat className="size-4" />
                  )}
                </button>

                {/* Next Track */}
                <button
                  type="button"
                  onClick={handleNextTrack}
                  aria-label="Next track"
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <SkipForward className="size-4" />
                </button>
              </div>

              {/* Volume Controls */}
              <div className="relative flex shrink-0 items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="size-4 text-red-400" /> : <Volume2 className="size-4 text-amber-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  aria-label="Volume"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="hidden sm:block h-1 w-16 accent-amber-400 cursor-pointer rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        4. "सारे गाने (All Songs)" Modal (Matching Image 1: deluxesalon.in/songs style)
      */}
      {isSongsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl max-h-[85vh] rounded-3xl glass-panel border border-amber-500/40 shadow-2xl overflow-y-auto p-6 sm:p-8 relative"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setIsSongsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="size-6" />
            </button>

            {/* Header */}
            <div className="mb-4 space-y-1">
              <span className="font-mono text-xs tracking-[0.25em] uppercase text-amber-400 font-bold">
                {CHHATH_SONGS.length} RECORDS • CHHATH GEET PLAYLIST
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gold-gradient font-serif">
                {lang === 'hi' ? 'सारे पावन गीत' : 'All Sacred Songs'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'hi'
                  ? 'YouTube Music प्लेलिस्ट के सभी 67+ अमर छठ गीत। किसी भी गीत पर क्लिक कर तुरंत सुनें।'
                  : 'All 67+ timeless Chhath hymns from the YouTube Music playlist. Click any track to listen instantly.'}
              </p>
            </div>

            {/* Instant Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-amber-400/70 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'hi'
                    ? 'गीत या गायक खोजें... (उदा. शारदा सिन्हा, अनुराधा, पवन, बहंगिया)'
                    : 'Search song or artist... (e.g. Sharda Sinha, Anuradha, Pawan)'
                }
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-black/50 border border-amber-500/25 focus:border-amber-400/70 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Search Match Counter */}
            {searchQuery && (
              <div className="text-[11px] text-amber-300/80 mb-2 px-1 font-mono">
                {lang === 'hi'
                  ? `${filteredSongs.length} गीत मिले (${CHHATH_SONGS.length} में से)`
                  : `Showing ${filteredSongs.length} of ${CHHATH_SONGS.length} songs`}
              </div>
            )}

            {/* Songs List with Smooth Scroll */}
            <div className="divide-y divide-white/5 max-h-[50vh] overflow-y-auto pr-1">
              {filteredSongs.map((song) => {
                const actualIndex = CHHATH_SONGS.findIndex((s) => s.id === song.id);
                const isCurrent = currentTrackIndex === actualIndex;

                return (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(actualIndex >= 0 ? actualIndex : 0)}
                    className={`group cursor-pointer py-3 px-3 rounded-2xl flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="font-mono text-xs text-amber-400/80 font-semibold w-8 shrink-0">
                        {song.trackNum}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-amber-100 group-hover:text-amber-300 transition-colors truncate">
                            {song.hindiTitle}
                          </h4>
                          {isCurrent && isPlaying && (
                            <span className="flex items-end gap-0.5 h-3 shrink-0">
                              <span className="w-0.5 h-full bg-amber-400 animate-[bounce_0.6s_ease-in-out_infinite]" />
                              <span className="w-0.5 h-2/3 bg-amber-300 animate-[bounce_0.6s_ease-in-out_infinite_0.15s]" />
                              <span className="w-0.5 h-4/5 bg-amber-400 animate-[bounce_0.6s_ease-in-out_infinite_0.3s]" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {song.romanTitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <p className="text-xs font-medium text-amber-200/90">{song.artist}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{song.year}</span>
                    </div>
                  </div>
                );
              })}

              {filteredSongs.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  {lang === 'hi' ? 'कोई गीत नहीं मिला' : 'No matching songs found'}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <a
                href={MUSIC_PLAYLISTS.ytMusic.directUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-amber-400 hover:underline"
              >
                <span>{lang === 'hi' ? 'YouTube Music पर पूरी प्लेलिस्ट खोलें' : 'Open Full Playlist on YouTube Music'}</span>
                <ExternalLink className="size-3" />
              </a>
              <button
                onClick={() => setIsSongsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        5. Spotify Drawer / Modal (For users wanting Spotify player specifically)
      */}
      {isSpotifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl glass-panel border border-emerald-500/40 shadow-2xl p-6 relative"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setIsSpotifyModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Radio className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Spotify Chhath Special</h3>
                <p className="text-xs text-slate-400">Official Spotify Embed Player</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/80 shadow-inner">
              <iframe
                data-testid="embed-iframe"
                style={{ borderRadius: '12px' }}
                src={MUSIC_PLAYLISTS.spotify.embedUrl}
                title="Official Spotify Chhath Mahaparv Playlist"
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <a
                href={MUSIC_PLAYLISTS.spotify.directUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
              >
                <span>Open in Spotify App</span>
                <ExternalLink className="size-3" />
              </a>
              <button
                onClick={() => setIsSpotifyModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

