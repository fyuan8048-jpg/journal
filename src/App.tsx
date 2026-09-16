import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CountdownDisplay } from './components/CountdownDisplay';
import { HeaderDock } from './components/HeaderDock';
import { BackgroundModal } from './components/BackgroundModal';
import { InterestModal } from './components/InterestModal';
import { CountdownModal } from './components/CountdownModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { AuthModal } from './components/AuthModal';
import { AudioUnlockBanner } from './components/AudioUnlockBanner';
import { QuickWallpaperBar } from './components/QuickWallpaperBar';
import { MusicPlayerDock } from './components/MusicPlayerDock';
import { SoundManagerModal } from './components/SoundManagerModal';
import { ClockCustomizerModal } from './components/ClockCustomizerModal';
import { NotesDrawer } from './components/NotesDrawer';
import { CURATED_BACKGROUNDS, getDailyBackground, type BackgroundItem } from './data/curatedBackgrounds';
import { getAdaptedTheme, type ClockStylePreset } from './utils/themeAdapter';
import { soundEngine, type SoundEffectType, type MusicTrack, BUILTIN_MUSIC_TRACKS } from './audio/soundEngine';
import {
  DEFAULT_COUNTDOWN_EVENTS,
  type CountdownEvent,
  DEFAULT_CLOCK_CUSTOM_SETTINGS,
  type ClockCustomSettings,
} from './utils/countdown';
import { Minimize2, Check } from 'lucide-react';

function AppContent() {
  const { currentUser, updatePreferences } = useAuth();

  // Preferences from currentUser
  const preferences = currentUser?.preferences;

  // Background State
  const initialDaily = getDailyBackground(preferences?.interests || ['doom', 'marvel'], 0);
  const [activeBackground, setActiveBackground] = useState<BackgroundItem>(() => {
    if (preferences?.activeBackgroundId) {
      const found = CURATED_BACKGROUNDS.find(b => b.id === preferences.activeBackgroundId);
      if (found) return found;
    }
    return initialDaily;
  });
  const [activeCustomUrl, setActiveCustomUrl] = useState<string | undefined>(preferences?.activeCustomImageUrl);

  // Global feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Independent Dual Audio Channels
  // Channel 1: Clock Ticking Sound
  const [clockVolume, setClockVolume] = useState<number>(preferences?.volume ?? 0.6);
  const [isClockMuted, setIsClockMuted] = useState<boolean>(preferences?.isMuted ?? false);
  const [soundType, setSoundType] = useState<SoundEffectType>(preferences?.soundType ?? 'doomsday');

  // Channel 2: Background Music Sound
  const [musicVolume, setMusicVolume] = useState<number>(0.5);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const [ambientDrone, setAmbientDrone] = useState<boolean>(preferences?.ambientDrone ?? false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(BUILTIN_MUSIC_TRACKS[0]);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [hasInteractedAudio, setHasInteractedAudio] = useState(false);

  // Clock Style & Display Settings
  const [clockPreset, setClockPreset] = useState<ClockStylePreset>(preferences?.clockPreset ?? 'doomsday');
  const [includeYears, setIncludeYears] = useState<boolean>(preferences?.includeYears ?? true);
  const [customSettings, setCustomSettings] = useState<ClockCustomSettings>(
    preferences?.clockCustomSettings || DEFAULT_CLOCK_CUSTOM_SETTINGS
  );

  // Sync customSettings if preferences update
  useEffect(() => {
    if (preferences?.clockCustomSettings) {
      setCustomSettings(preferences.clockCustomSettings);
    }
  }, [preferences?.clockCustomSettings]);

  const handleUpdateCustomSettings = (newSettings: ClockCustomSettings) => {
    setCustomSettings(newSettings);
    updatePreferences({ clockCustomSettings: newSettings });
  };

  // Active Countdown Event
  const countdowns = preferences?.customCountdowns || DEFAULT_COUNTDOWN_EVENTS;
  const activeEventId = preferences?.activeCountdownId || 'doomsday';
  const activeCountdown: CountdownEvent = countdowns.find(c => c.id === activeEventId) || countdowns[0] || DEFAULT_COUNTDOWN_EVENTS[0];

  // Modals & UI States
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [backgroundModalTab, setBackgroundModalTab] = useState<'daily' | 'curated' | 'custom'>('curated');
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState(false);

  const handleOpenBackgrounds = (tab: 'daily' | 'curated' | 'custom' = 'curated') => {
    setBackgroundModalTab(tab);
    setIsBackgroundModalOpen(true);
  };
  const [isClockCustomizerOpen, setIsClockCustomizerOpen] = useState(false);
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSoundStudioOpen, setIsSoundStudioOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Synchronize audio engine channels on mount
  useEffect(() => {
    soundEngine.setSoundType(soundType);
    soundEngine.setClockVolume(clockVolume);
    soundEngine.setClockMuted(isClockMuted);
    soundEngine.setMusicVolume(musicVolume);
    soundEngine.setMusicMuted(isMusicMuted);
    if (ambientDrone) {
      soundEngine.toggleDrone(true);
    }
  }, []);

  // Update daily background when user preferences change
  useEffect(() => {
    if (!activeCustomUrl) {
      const daily = getDailyBackground(preferences?.interests || ['doom', 'marvel'], 0);
      setActiveBackground(daily);
    }
  }, [preferences?.interests]);

  // Synchronize active wallpaper whenever preferences change in storage
  useEffect(() => {
    setActiveCustomUrl(preferences?.activeCustomImageUrl);
    if (preferences?.activeBackgroundId) {
      const found = CURATED_BACKGROUNDS.find(b => b.id === preferences.activeBackgroundId);
      if (found) {
        setActiveBackground(found);
      }
    }
  }, [preferences?.activeCustomImageUrl, preferences?.activeBackgroundId]);

  // Fullscreen change listener & ESC handler
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCinemaMode(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleClockMute = () => {
    const next = !isClockMuted;
    setIsClockMuted(next);
    soundEngine.setClockMuted(next);
    updatePreferences({ isMuted: next });
  };

  // Compute Adaptive Theme with full customizer settings
  const backgroundPalette = activeCustomUrl ? undefined : activeBackground.palette;
  const adaptedTheme = getAdaptedTheme(clockPreset, backgroundPalette, customSettings);

  // Active Background Image Source
  const currentBgImage = activeCustomUrl || activeBackground.imageUrl;

  // Pure Clean View Condition: in full screen OR cinema mode, ONLY the countdown is visible!
  const isPureCountdownOnly = isCinemaMode || isFullscreen;

  return (
    <div
      onDoubleClick={() => {
        // Double click anywhere to toggle clean cinema view
        if (isPureCountdownOnly) {
          setIsCinemaMode(false);
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        } else {
          setIsCinemaMode(true);
        }
      }}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* 1. Base Comic / Marvel Artwork Background (Full clarity, pure artwork, no 3D effects, no green haze) */}
      <img
        key={currentBgImage}
        src={currentBgImage}
        alt="Background Artwork"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700"
        onError={(e) => {
          (e.target as HTMLImageElement).src = CURATED_BACKGROUNDS[0].imageUrl;
        }}
      />

      {/* 2. Clean subtle overlay to ensure countdown numerals remain crisp and readable */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 z-50 px-4 py-2 rounded-2xl bg-neutral-950/90 border border-emerald-500/60 shadow-[0_0_25px_rgba(0,255,136,0.3)] backdrop-blur-xl text-xs font-bold text-emerald-300 animate-fade-in flex items-center gap-2 pointer-events-none">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Top Navigation Dock (Completely hidden in Fullscreen / Cinema Mode) */}
      {!isPureCountdownOnly && (
        <HeaderDock
          activeCountdown={activeCountdown}
          isMuted={isClockMuted}
          onToggleMute={handleToggleClockMute}
          onOpenCountdowns={() => setIsCountdownModalOpen(true)}
          onOpenBackgrounds={() => handleOpenBackgrounds('curated')}
          onOpenCollections={() => handleOpenBackgrounds('curated')}
          onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
          onOpenClockCustomizer={() => setIsClockCustomizerOpen(true)}
          onOpenNotes={() => setIsNotesDrawerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onEnterCinemaMode={() => setIsCinemaMode(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {/* 4. Central 100% Fully Transparent Countdown Clock */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-4 pt-10 pb-16">
        <CountdownDisplay
          targetDate={activeCountdown.targetDate}
          title={activeCountdown.title}
          subtitle={activeCountdown.subtitle}
          theme={adaptedTheme}
          includeYears={includeYears}
          onOpenCustomizer={() => setIsClockCustomizerOpen(true)}
        />
      </main>

      {/* 5. Quick Wallpaper Carousel (Hidden in Fullscreen / Cinema Mode) */}
      {!isPureCountdownOnly && (
        <QuickWallpaperBar
          activeBackground={activeBackground}
          onSelectCuratedBackground={(bg) => {
            setActiveBackground(bg);
            setActiveCustomUrl(undefined);
            updatePreferences({ activeBackgroundId: bg.id, activeCustomImageUrl: undefined });
            showToast(`✓ Wallpaper applied: ${bg.title}`);
          }}
          activeCustomUrl={activeCustomUrl}
          onSelectCustomUrl={(url) => {
            setActiveCustomUrl(url);
            updatePreferences({ activeCustomImageUrl: url });
            showToast('✓ Custom wallpaper applied');
          }}
          onOpenFullModal={() => handleOpenBackgrounds('curated')}
        />
      )}

      {/* 6. Floating Music Player Mini-Dock (Hidden in Fullscreen / Cinema Mode) */}
      {!isPureCountdownOnly && (
        <MusicPlayerDock
          currentTrack={currentTrack}
          setCurrentTrack={setCurrentTrack}
          isMusicPlaying={isMusicPlaying}
          setIsMusicPlaying={setIsMusicPlaying}
          onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
        />
      )}

      {/* 7. Subtle Exit Button for Fullscreen/Cinema (Only appears on hover near top right) */}
      {isPureCountdownOnly && (
        <div className="fixed top-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => {
              setIsCinemaMode(false);
              if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black border border-white/20 hover:border-emerald-500 text-xs font-bold text-white transition-all shadow-xl backdrop-blur-md"
          >
            <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exit Fullscreen (ESC)</span>
          </button>
        </div>
      )}

      {/* 8. First-Interaction Audio Unlock Toast */}
      {!hasInteractedAudio && !isPureCountdownOnly && (
        <AudioUnlockBanner
          onDismiss={() => {
            setHasInteractedAudio(true);
            setIsClockMuted(true);
            soundEngine.setClockMuted(true);
          }}
          onEnableAudio={() => {
            setHasInteractedAudio(true);
            setIsClockMuted(false);
            soundEngine.setClockMuted(false);
            soundEngine.playTick();
          }}
        />
      )}

      {/* 9. Modals */}
      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        initialTab={backgroundModalTab}
        onOpenInterests={() => setIsInterestModalOpen(true)}
        activeBackground={activeBackground}
        setActiveBackground={(bg) => {
          setActiveBackground(bg);
          setActiveCustomUrl(undefined);
          updatePreferences({ activeBackgroundId: bg.id, activeCustomImageUrl: undefined });
          showToast(`✓ Wallpaper: ${bg.title}`);
        }}
        activeCustomUrl={activeCustomUrl}
        setActiveCustomUrl={(url) => {
          setActiveCustomUrl(url);
          updatePreferences({ activeCustomImageUrl: url });
          showToast('✓ Custom wallpaper applied');
        }}
      />

      <InterestModal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
      />

      <CountdownModal
        isOpen={isCountdownModalOpen}
        onClose={() => setIsCountdownModalOpen(false)}
        activeCountdownId={activeCountdown.id}
        onSelectCountdown={(id) => {
          updatePreferences({ activeCountdownId: id });
        }}
        onOpenNotes={() => setIsNotesDrawerOpen(true)}
      />

      <ClockCustomizerModal
        isOpen={isClockCustomizerOpen}
        onClose={() => setIsClockCustomizerOpen(false)}
        clockPreset={clockPreset}
        setClockPreset={(preset) => {
          setClockPreset(preset);
          updatePreferences({ clockPreset: preset });
          showToast(`✓ Theme: ${preset}`);
        }}
        customSettings={customSettings}
        setCustomSettings={handleUpdateCustomSettings}
        activeCountdown={activeCountdown}
        onUpdateCountdown={(event) => {
          updatePreferences({
            customCountdowns: countdowns.map(c => c.id === event.id ? event : c)
          });
        }}
      />

      <NotesDrawer
        isOpen={isNotesDrawerOpen}
        onClose={() => setIsNotesDrawerOpen(false)}
        activeCountdown={activeCountdown}
      />

      <SoundManagerModal
        isOpen={isSoundStudioOpen}
        onClose={() => setIsSoundStudioOpen(false)}
        soundType={soundType}
        setSoundType={(type) => {
          setSoundType(type);
          soundEngine.setSoundType(type);
          updatePreferences({ soundType: type });
        }}
        isMuted={isMusicMuted}
        onToggleMute={() => {
          const next = !isMusicMuted;
          setIsMusicMuted(next);
          soundEngine.setMusicMuted(next);
        }}
        currentTrack={currentTrack}
        setCurrentTrack={setCurrentTrack}
        isMusicPlaying={isMusicPlaying}
        setIsMusicPlaying={setIsMusicPlaying}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clockVolume={clockVolume}
        setClockVolume={(vol: number) => {
          setClockVolume(vol);
          soundEngine.setClockVolume(vol);
          updatePreferences({ volume: vol });
        }}
        isClockMuted={isClockMuted}
        setIsClockMuted={(muted: boolean) => {
          setIsClockMuted(muted);
          soundEngine.setClockMuted(muted);
          updatePreferences({ isMuted: muted });
        }}
        soundType={soundType}
        setSoundType={(type: SoundEffectType) => {
          setSoundType(type);
          soundEngine.setSoundType(type);
          updatePreferences({ soundType: type });
        }}
        musicVolume={musicVolume}
        setMusicVolume={(vol: number) => {
          setMusicVolume(vol);
          soundEngine.setMusicVolume(vol);
        }}
        isMusicMuted={isMusicMuted}
        setIsMusicMuted={(muted: boolean) => {
          setIsMusicMuted(muted);
          soundEngine.setMusicMuted(muted);
        }}
        ambientDrone={ambientDrone}
        setAmbientDrone={(active: boolean) => {
          setAmbientDrone(active);
          soundEngine.toggleDrone(active);
          updatePreferences({ ambientDrone: active });
        }}
        clockPreset={clockPreset}
        setClockPreset={(preset: ClockStylePreset) => {
          setClockPreset(preset);
          updatePreferences({ clockPreset: preset });
        }}
        includeYears={includeYears}
        setIncludeYears={(inc: boolean) => {
          setIncludeYears(inc);
          updatePreferences({ includeYears: inc });
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
