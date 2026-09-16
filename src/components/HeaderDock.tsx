import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Clock,
  Sliders,
  Maximize2,
  Minimize2,
  Eye,
  ChevronDown,
  Music,
  Palette,
  Target,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';
import type { CountdownEvent } from '../utils/countdown';

interface HeaderDockProps {
  activeCountdown: CountdownEvent;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenCountdowns: () => void;
  onOpenBackgrounds: () => void;
  onOpenCollections?: () => void;
  onOpenSoundStudio: () => void;
  onOpenClockCustomizer: () => void;
  onOpenNotes: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onEnterCinemaMode: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const HeaderDock: React.FC<HeaderDockProps> = ({
  activeCountdown,
  isMuted,
  onToggleMute,
  onOpenCountdowns,
  onOpenBackgrounds,
  onOpenCollections,
  onOpenSoundStudio,
  onOpenClockCustomizer,
  onOpenNotes,
  onOpenSettings,
  onOpenAuth,
  onEnterCinemaMode,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const { currentUser } = useAuth();
  const notesCount = activeCountdown.notes?.length || 0;
  const completedNotes = activeCountdown.notes?.filter(n => n.completed).length || 0;
  const customWallpapersCount = (currentUser?.preferences?.customImages || []).length;

  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (action: () => void) => {
    soundEngine.playUiClick();
    action();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 p-3 sm:p-5 flex items-center justify-between pointer-events-none select-none">
      {/* Left: Journal Brand & Active Event Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {/* JOURNAL Website Branding */}
        <div className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-neutral-950/80 border border-emerald-500/50 backdrop-blur-2xl text-white shadow-[0_0_20px_rgba(0,255,136,0.2)]">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-black font-display tracking-widest text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-300">
              JOURNAL
            </span>
            <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-400 hidden sm:inline">
              CHRONO • {currentTimeStr}
            </span>
          </div>
        </div>

        {/* Active Countdown Switcher Pill */}
        <button
          onClick={() => handleAction(onOpenCountdowns)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-black/70 hover:bg-black/90 border border-white/15 hover:border-emerald-500/50 backdrop-blur-xl text-white transition-all hover:scale-[1.02] shadow-xl group"
          title="Switch Active Countdown Event"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff88]" />
          <div className="text-left">
            <span className="block text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-bold leading-none">
              ACTIVE TIMER
            </span>
            <span className="block text-xs sm:text-sm font-black font-display tracking-wide text-white leading-tight max-w-[110px] sm:max-w-[200px] truncate">
              {activeCountdown.title}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>

      {/* Right: Quick Action Buttons Dock */}
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-neutral-950/80 border border-white/15 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto">
        {/* Sound Toggle */}
        <button
          onClick={() => handleAction(onToggleMute)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className={`p-2 sm:p-2.5 rounded-xl transition-all ${
            isMuted
              ? 'text-neutral-400 hover:text-white hover:bg-white/10'
              : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_10px_rgba(0,255,136,0.3)]'
          }`}
          title={isMuted ? 'Unmute Clock Sound' : 'Mute Clock Sound'}
          aria-label="Sound Toggle"
        >
          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Soundtrack & Audio Studio */}
        <button
          onClick={() => handleAction(onOpenSoundStudio)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="p-2 sm:p-2.5 rounded-xl text-neutral-300 hover:text-emerald-400 hover:bg-white/10 transition-all"
          title="Soundtrack & Music Studio"
          aria-label="Soundtrack Studio"
        >
          <Music className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Artwork & Wallpapers Studio Button */}
        <button
          onClick={() => handleAction(onOpenCollections || onOpenBackgrounds)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="relative flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/70 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 hover:text-white transition-all group"
          title={`Choose Artworks & Wallpapers (${customWallpapersCount} custom uploads)`}
          aria-label="Background Artworks"
        >
          <ImageIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold font-display tracking-wider hidden md:inline">
            Artworks
          </span>
          {customWallpapersCount > 0 && (
            <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-black font-black text-[9px] font-mono shadow-[0_0_8px_#00ff88]">
              {customWallpapersCount}
            </span>
          )}
        </button>

        {/* Clock & Title Themes Studio Button */}
        <button
          onClick={() => handleAction(onOpenClockCustomizer)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-amber-950/30 hover:bg-amber-950/70 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 hover:text-white transition-all group"
          title="Clock & Title Themes Studio (16+ Curated Themes, Fonts & Colors)"
          aria-label="Themes Studio"
        >
          <Palette className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold font-display tracking-wider hidden md:inline">
            Themes
          </span>
        </button>

        {/* Countdowns Station */}
        <button
          onClick={() => handleAction(onOpenCountdowns)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="p-2 sm:p-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
          title="Manage & Switch Countdowns"
          aria-label="Countdowns"
        >
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Goals & Notes Manager */}
        <button
          onClick={() => handleAction(onOpenNotes)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="relative p-2 sm:p-2.5 rounded-xl text-neutral-300 hover:text-emerald-400 hover:bg-white/10 transition-all"
          title={`Mission Goals & Notes (${completedNotes}/${notesCount} achieved)`}
          aria-label="Goals and Notes"
        >
          <Target className="w-4 h-4 sm:w-5 sm:h-5" />
          {notesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-black font-black text-[9px] font-mono shadow-[0_0_8px_#00ff88]">
              {completedNotes}/{notesCount}
            </span>
          )}
        </button>

        {/* Settings / Console */}
        <button
          onClick={() => handleAction(onOpenSettings)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="p-2 sm:p-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
          title="Audio Engine & Clock Settings"
          aria-label="Settings"
        >
          <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Cinema Mode (Clean view) */}
        <button
          onClick={() => handleAction(onEnterCinemaMode)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="p-2 sm:p-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all hidden sm:block"
          title="Cinema Mode (Pure Artwork & Transparent Countdown)"
          aria-label="Cinema Mode"
        >
          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => handleAction(onToggleFullscreen)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="p-2 sm:p-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-all hidden sm:block"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          aria-label="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* User Profile / Auth */}
        <button
          onClick={() => handleAction(onOpenAuth)}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all"
          title="User Profile & Storage"
        >
          <span className="text-base sm:text-lg">{currentUser?.avatar || '👑'}</span>
          <span className="text-xs font-bold text-white max-w-[70px] truncate hidden md:inline">
            {currentUser?.username || 'Profile'}
          </span>
        </button>
      </div>
    </header>
  );
};
