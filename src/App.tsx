import { useState, useEffect, useRef } from 'react';
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
import { BackgroundVideoControls } from './components/BackgroundVideoControls';
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
import { extractYouTubeId, sendYouTubeCommand } from './utils/mediaUrlParser';

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
  const [musicVolume, setMusicVolume] = useState<number>(preferences?.musicVolume ?? 0.5);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(preferences?.isMusicMuted ?? false);
  const [ambientDrone, setAmbientDrone] = useState<boolean>(preferences?.ambientDrone ?? false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(() => {
    if (preferences?.currentMusicTrackId) {
      const found = BUILTIN_MUSIC_TRACKS.find(t => t.id === preferences.currentMusicTrackId);
      if (found) return found;
    }
    return BUILTIN_MUSIC_TRACKS[0];
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(preferences?.isMusicPlaying ?? false);
  const [hasInteractedAudio, setHasInteractedAudio] = useState(false);

  // Background Video Controls & State
  const [bgVideoVolume, setBgVideoVolume] = useState<number>(preferences?.bgVideoVolume ?? 0.7);
  const [isBgVideoMuted, setIsBgVideoMuted] = useState<boolean>(preferences?.bgVideoMuted ?? true);
  const [isBgVideoPlaying, setIsBgVideoPlaying] = useState<boolean>(preferences?.bgVideoPlaying ?? true);
  const [bgVideoSpeed, setBgVideoSpeed] = useState<number>(preferences?.bgVideoSpeed ?? 1.0);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const bgYouTubeIframeRef = useRef<HTMLIFrameElement>(null);
  const musicYouTubeIframeRef = useRef<HTMLIFrameElement>(null);

  // Clock Style & Display Settings
  const [clockPreset, setClockPreset] = useState<ClockStylePreset>(preferences?.clockPreset ?? 'doomsday');
  const [includeYears, setIncludeYears] = useState<boolean>(preferences?.includeYears ?? true);
  const [customSettings, setCustomSettings] = useState<ClockCustomSettings>(
    preferences?.clockCustomSettings || DEFAULT_CLOCK_CUSTOM_SETTINGS
  );

  // Synchronize clock preset theme when preferences update from cloud / login
  useEffect(() => {
    if (preferences?.clockPreset) {
      setClockPreset(preferences.clockPreset);
    }
  }, [preferences?.clockPreset]);

  // Synchronize includeYears when preferences update
  useEffect(() => {
    if (typeof preferences?.includeYears === 'boolean') {
      setIncludeYears(preferences.includeYears);
    }
  }, [preferences?.includeYears]);

  // Sync customSettings if preferences update
  useEffect(() => {
    if (preferences?.clockCustomSettings) {
      setCustomSettings(preferences.clockCustomSettings);
    }
  }, [preferences?.clockCustomSettings]);

  // Synchronize audio and video preferences when user profile loads from cloud
  useEffect(() => {
    if (preferences?.volume !== undefined) {
      setClockVolume(preferences.volume);
      soundEngine.setClockVolume(preferences.volume);
    }
    if (preferences?.isMuted !== undefined) {
      setIsClockMuted(preferences.isMuted);
      soundEngine.setClockMuted(preferences.isMuted);
    }
    if (preferences?.soundType) {
      setSoundType(preferences.soundType);
      soundEngine.setSoundType(preferences.soundType);
    }
    if (preferences?.ambientDrone !== undefined) {
      setAmbientDrone(preferences.ambientDrone);
      soundEngine.toggleDrone(preferences.ambientDrone);
    }
    if (preferences?.musicVolume !== undefined) {
      setMusicVolume(preferences.musicVolume);
      soundEngine.setMusicVolume(preferences.musicVolume);
    }
    if (preferences?.isMusicMuted !== undefined) {
      setIsMusicMuted(preferences.isMusicMuted);
      soundEngine.setMusicMuted(preferences.isMusicMuted);
    }
    if (preferences?.currentMusicTrackId) {
      const found = BUILTIN_MUSIC_TRACKS.find(t => t.id === preferences.currentMusicTrackId);
      if (found) {
        setCurrentTrack(found);
      } else if (preferences.currentMusicYouTubeId) {
        setCurrentTrack({
          id: preferences.currentMusicTrackId,
          title: 'Custom YouTube Soundtrack',
          artist: 'YouTube Stream',
          url: `https://www.youtube.com/watch?v=${preferences.currentMusicYouTubeId}`,
          isCustom: true,
          isVideo: true,
          isYouTube: true,
          youTubeId: preferences.currentMusicYouTubeId,
        });
      }
    }
    if (preferences?.bgVideoVolume !== undefined) setBgVideoVolume(preferences.bgVideoVolume);
    if (preferences?.bgVideoMuted !== undefined) setIsBgVideoMuted(preferences.bgVideoMuted);
    if (preferences?.bgVideoPlaying !== undefined) setIsBgVideoPlaying(preferences.bgVideoPlaying);
    if (preferences?.bgVideoSpeed !== undefined) setBgVideoSpeed(preferences.bgVideoSpeed);
  }, [
    preferences?.volume,
    preferences?.isMuted,
    preferences?.soundType,
    preferences?.ambientDrone,
    preferences?.musicVolume,
    preferences?.isMusicMuted,
    preferences?.currentMusicTrackId,
    preferences?.currentMusicYouTubeId,
    preferences?.bgVideoVolume,
    preferences?.bgVideoMuted,
    preferences?.bgVideoPlaying,
    preferences?.bgVideoSpeed,
  ]);

  // Synchronize offscreen YouTube audio player iframe commands
  useEffect(() => {
    if (currentTrack.isYouTube && currentTrack.youTubeId && musicYouTubeIframeRef.current) {
      if (isMusicPlaying) {
        sendYouTubeCommand(musicYouTubeIframeRef.current, 'playVideo');
      } else {
        sendYouTubeCommand(musicYouTubeIframeRef.current, 'pauseVideo');
      }
      if (isMusicMuted) {
        sendYouTubeCommand(musicYouTubeIframeRef.current, 'mute');
      } else {
        sendYouTubeCommand(musicYouTubeIframeRef.current, 'unMute');
        sendYouTubeCommand(musicYouTubeIframeRef.current, 'setVolume', [Math.round(musicVolume * 100)]);
      }
    }
  }, [isMusicPlaying, isMusicMuted, musicVolume, currentTrack]);

  // Synchronize video element properties directly
  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.volume = isBgVideoMuted ? 0 : bgVideoVolume;
      bgVideoRef.current.muted = isBgVideoMuted;
      bgVideoRef.current.playbackRate = bgVideoSpeed;
      if (isBgVideoPlaying) {
        bgVideoRef.current.play().catch(() => {});
      } else {
        bgVideoRef.current.pause();
      }
    }
  }, [bgVideoVolume, isBgVideoMuted, isBgVideoPlaying, bgVideoSpeed]);

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
  const [backgroundModalTab, setBackgroundModalTab] = useState<'daily' | 'curated' | 'custom' | 'web'>('curated');
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState(false);

  const handleOpenBackgrounds = (tab: 'daily' | 'curated' | 'custom' | 'web' = 'curated') => {
    setBackgroundModalTab(tab);
    setIsBackgroundModalOpen(true);
    soundEngine.playTransitionWhoosh();
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

  // 24-Hour Auto-Rotation Background Engine (Only runs if user explicitly opted in to daily auto-rotation)
  useEffect(() => {
    if (preferences?.autoRotate24h === true && !activeCustomUrl && preferences?.activeBackgroundId?.startsWith('daily-')) {
      const lastRot = preferences?.lastRotationTimestamp || 0;
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (now - lastRot > oneDayMs) {
        const daily = getDailyBackground(preferences?.interests || ['doom', 'marvel'], 0);
        setActiveBackground(daily);
        updatePreferences({
          activeBackgroundId: daily.id,
          lastRotationTimestamp: now
        });
      }
    }
  }, [preferences?.autoRotate24h, activeCustomUrl, preferences?.activeBackgroundId]);

  // Synchronize active wallpaper whenever preferences update from cloud / storage
  useEffect(() => {
    if (preferences?.activeCustomImageUrl) {
      setActiveCustomUrl(preferences.activeCustomImageUrl);
    } else {
      setActiveCustomUrl(undefined);
      if (preferences?.activeBackgroundId) {
        const found = CURATED_BACKGROUNDS.find(b => b.id === preferences.activeBackgroundId);
        if (found) {
          setActiveBackground(found);
          return;
        }
      }
      const daily = getDailyBackground(preferences?.interests || ['doom', 'marvel'], 0);
      setActiveBackground(daily);
    }
  }, [preferences?.activeCustomImageUrl, preferences?.activeBackgroundId, preferences?.interests]);

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
    soundEngine.playSelect();
  };

  // Background Media Detection (YouTube vs Video vs Image)
  const isCurrentBgYouTube = Boolean(
    (activeCustomUrl && (
      preferences?.activeCustomMediaIsYouTube ||
      extractYouTubeId(activeCustomUrl) !== null ||
      currentUser?.preferences?.customImages?.find(
        i => i.url === activeCustomUrl || i.id === preferences?.activeCustomImageId
      )?.isYouTube
    )) ||
    (!activeCustomUrl && activeBackground?.isYouTube)
  );

  const currentBgYouTubeId =
    (activeCustomUrl && (preferences?.activeCustomMediaYouTubeId || extractYouTubeId(activeCustomUrl))) ||
    (!activeCustomUrl && activeBackground?.youTubeId) ||
    '';

  const isCurrentBgVideo = isCurrentBgYouTube || Boolean(
    (activeCustomUrl && (
      activeCustomUrl.match(/\.(mp4|webm|mov|mkv|m4v)(\?.*)?$/i) ||
      preferences?.activeCustomMediaIsVideo ||
      currentUser?.preferences?.customImages?.find(
        i => i.url === activeCustomUrl || i.id === preferences?.activeCustomImageId
      )?.isVideo
    )) ||
    (!activeCustomUrl && (activeBackground?.isVideo || activeBackground?.videoUrl))
  );

  const currentBgMedia = activeCustomUrl || (activeBackground?.isVideo && activeBackground?.videoUrl ? activeBackground.videoUrl : (activeBackground?.imageUrl || CURATED_BACKGROUNDS[0].imageUrl));

  // Background Video & YouTube Control Handlers
  const handleToggleBgVideoPlay = () => {
    const next = !isBgVideoPlaying;
    setIsBgVideoPlaying(next);
    updatePreferences({ bgVideoPlaying: next });
    if (isCurrentBgYouTube && bgYouTubeIframeRef.current) {
      sendYouTubeCommand(bgYouTubeIframeRef.current, next ? 'playVideo' : 'pauseVideo');
    } else if (bgVideoRef.current) {
      if (next) bgVideoRef.current.play().catch(() => {});
      else bgVideoRef.current.pause();
    }
  };

  const handleToggleBgVideoMute = () => {
    const next = !isBgVideoMuted;
    setIsBgVideoMuted(next);
    updatePreferences({ bgVideoMuted: next });
    if (isCurrentBgYouTube && bgYouTubeIframeRef.current) {
      if (next) {
        sendYouTubeCommand(bgYouTubeIframeRef.current, 'mute');
      } else {
        sendYouTubeCommand(bgYouTubeIframeRef.current, 'unMute');
        sendYouTubeCommand(bgYouTubeIframeRef.current, 'setVolume', [Math.round(bgVideoVolume * 100)]);
      }
    } else if (bgVideoRef.current) {
      bgVideoRef.current.muted = next;
      bgVideoRef.current.volume = next ? 0 : bgVideoVolume;
    }
  };

  const handleBgVideoVolumeChange = (vol: number) => {
    setBgVideoVolume(vol);
    updatePreferences({ bgVideoVolume: vol });
    if (isCurrentBgYouTube && bgYouTubeIframeRef.current) {
      sendYouTubeCommand(bgYouTubeIframeRef.current, 'setVolume', [Math.round(vol * 100)]);
      if (vol > 0 && isBgVideoMuted) {
        setIsBgVideoMuted(false);
        sendYouTubeCommand(bgYouTubeIframeRef.current, 'unMute');
        updatePreferences({ bgVideoMuted: false });
      }
    } else if (bgVideoRef.current) {
      bgVideoRef.current.volume = vol;
      if (vol > 0 && isBgVideoMuted) {
        setIsBgVideoMuted(false);
        bgVideoRef.current.muted = false;
        updatePreferences({ bgVideoMuted: false });
      }
    }
  };

  const handleBgVideoSpeedChange = (spd: number) => {
    setBgVideoSpeed(spd);
    updatePreferences({ bgVideoSpeed: spd });
    if (isCurrentBgYouTube && bgYouTubeIframeRef.current) {
      sendYouTubeCommand(bgYouTubeIframeRef.current, 'setPlaybackRate', [spd]);
    } else if (bgVideoRef.current) {
      bgVideoRef.current.playbackRate = spd;
    }
  };

  // Global YouTube IFrame message listener for onReady and state dispatch
  useEffect(() => {
    const handleYouTubeMessage = (event: MessageEvent) => {
      try {
        if (!event.origin.includes('youtube.com')) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onReady' || data?.info?.playerState === -1) {
          if (currentTrack.isYouTube && musicYouTubeIframeRef.current) {
            if (isMusicPlaying) {
              sendYouTubeCommand(musicYouTubeIframeRef.current, 'playVideo');
            }
            if (isMusicMuted) {
              sendYouTubeCommand(musicYouTubeIframeRef.current, 'mute');
            } else {
              sendYouTubeCommand(musicYouTubeIframeRef.current, 'unMute');
              sendYouTubeCommand(musicYouTubeIframeRef.current, 'setVolume', [Math.round(musicVolume * 100)]);
            }
          }
          if (isCurrentBgYouTube && bgYouTubeIframeRef.current) {
            if (isBgVideoPlaying) {
              sendYouTubeCommand(bgYouTubeIframeRef.current, 'playVideo');
            }
            if (!isBgVideoMuted) {
              sendYouTubeCommand(bgYouTubeIframeRef.current, 'unMute');
              sendYouTubeCommand(bgYouTubeIframeRef.current, 'setVolume', [Math.round(bgVideoVolume * 100)]);
            }
            sendYouTubeCommand(bgYouTubeIframeRef.current, 'setPlaybackRate', [bgVideoSpeed]);
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, [currentTrack, isMusicPlaying, isMusicMuted, musicVolume, isCurrentBgYouTube, isBgVideoPlaying, isBgVideoMuted, bgVideoVolume, bgVideoSpeed]);

  const handleSelectCuratedBackground = (bg: BackgroundItem) => {
    setActiveBackground(bg);
    setActiveCustomUrl(undefined);
    updatePreferences({
      activeBackgroundId: bg.id,
      activeCustomImageUrl: undefined,
      activeCustomImageId: undefined,
      activeCustomMediaIsVideo: Boolean(bg.isVideo),
      activeCustomMediaIsYouTube: Boolean(bg.isYouTube),
      activeCustomMediaYouTubeId: bg.youTubeId,
    });
    soundEngine.playSelect();
    showToast(`✓ Wallpaper applied: ${bg.title}`);
  };

  const handleSelectCustomUrl = (url: string | undefined, mediaMeta?: { isVideo?: boolean; isYouTube?: boolean; youTubeId?: string; name?: string }) => {
    setActiveCustomUrl(url);
    if (!url) {
      updatePreferences({
        activeCustomImageUrl: undefined,
        activeCustomImageId: undefined,
        activeCustomMediaIsVideo: false,
        activeCustomMediaIsYouTube: false,
        activeCustomMediaYouTubeId: undefined,
      });
      return;
    }
    const matched = currentUser?.preferences?.customImages?.find(i => i.url === url || i.id === url);
    const ytId = mediaMeta?.youTubeId || matched?.youTubeId || extractYouTubeId(url) || undefined;
    const isYt = mediaMeta?.isYouTube !== undefined ? mediaMeta.isYouTube : Boolean(matched?.isYouTube || ytId);
    const isVid = mediaMeta?.isVideo !== undefined ? mediaMeta.isVideo : Boolean(matched?.isVideo || isYt || url.match(/\.(mp4|webm|mov|mkv|m4v)(\?.*)?$/i));
    updatePreferences({
      activeCustomImageUrl: url,
      activeCustomImageId: matched?.id,
      activeCustomMediaIsVideo: isVid,
      activeCustomMediaIsYouTube: isYt,
      activeCustomMediaYouTubeId: ytId,
      activeBackgroundId: undefined,
    });
    soundEngine.playSelect();
    showToast(`✓ Wallpaper applied: ${mediaMeta?.name || matched?.name || 'Custom Media'}`);
  };

  // Compute Adaptive Theme with full customizer settings
  const backgroundPalette = activeCustomUrl ? undefined : activeBackground?.palette;
  const adaptedTheme = getAdaptedTheme(clockPreset, backgroundPalette, customSettings);

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
      {/* 1. Base Comic / Marvel Artwork, Motion Video, or Ambient YouTube Background */}
      {isCurrentBgYouTube && currentBgYouTubeId ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none transition-opacity duration-700">
          <iframe
            ref={bgYouTubeIframeRef}
            key={`yt-bg-${currentBgYouTubeId}`}
            src={`https://www.youtube.com/embed/${currentBgYouTubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentBgYouTubeId}&playsinline=1&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`}
            title="Ambient Motion Background"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute -top-[12%] -left-[12%] w-[124%] h-[124%] object-cover pointer-events-none border-none scale-105"
            style={{ pointerEvents: 'none' }}
            onLoad={() => {
              if (bgYouTubeIframeRef.current) {
                if (isBgVideoPlaying) {
                  sendYouTubeCommand(bgYouTubeIframeRef.current, 'playVideo');
                } else {
                  sendYouTubeCommand(bgYouTubeIframeRef.current, 'pauseVideo');
                }
                if (!isBgVideoMuted) {
                  sendYouTubeCommand(bgYouTubeIframeRef.current, 'unMute');
                  sendYouTubeCommand(bgYouTubeIframeRef.current, 'setVolume', [Math.round(bgVideoVolume * 100)]);
                }
                sendYouTubeCommand(bgYouTubeIframeRef.current, 'setPlaybackRate', [bgVideoSpeed]);
              }
            }}
          />
        </div>
      ) : isCurrentBgVideo ? (
        <video
          ref={bgVideoRef}
          key={currentBgMedia}
          src={currentBgMedia}
          autoPlay
          loop
          muted={isBgVideoMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700"
          onLoadedMetadata={(e) => {
            const vid = e.currentTarget;
            vid.volume = isBgVideoMuted ? 0 : bgVideoVolume;
            vid.playbackRate = bgVideoSpeed;
            if (isBgVideoPlaying) {
              vid.play().catch(() => {});
            } else {
              vid.pause();
            }
          }}
        />
      ) : (
        <img
          key={currentBgMedia}
          src={currentBgMedia}
          alt="Background Artwork"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700 animate-ambient-drift"
          onError={(e) => {
            (e.target as HTMLImageElement).src = CURATED_BACKGROUNDS[0].imageUrl;
          }}
        />
      )}

      {/* 2. Clean subtle overlay to ensure countdown numerals remain crisp and readable */}
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

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
          onOpenCountdowns={() => {
            setIsCountdownModalOpen(true);
            soundEngine.playTransitionWhoosh();
          }}
          onOpenBackgrounds={() => handleOpenBackgrounds('curated')}
          onOpenCollections={() => handleOpenBackgrounds('curated')}
          onOpenSoundStudio={() => {
            setIsSoundStudioOpen(true);
            soundEngine.playTransitionWhoosh();
          }}
          onOpenClockCustomizer={() => {
            setIsClockCustomizerOpen(true);
            soundEngine.playTransitionWhoosh();
          }}
          onOpenNotes={() => {
            setIsNotesDrawerOpen(true);
            soundEngine.playTransitionWhoosh();
          }}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            soundEngine.playTransitionWhoosh();
          }}
          onOpenAuth={() => {
            setIsAuthOpen(true);
            soundEngine.playTransitionWhoosh();
          }}
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

      {/* 5. Background Video Controls Widget (Only visible when video background is active) */}
      {isCurrentBgVideo && !isPureCountdownOnly && (
        <BackgroundVideoControls
          title={
            activeCustomUrl
              ? (currentUser?.preferences?.customImages?.find(i => i.url === activeCustomUrl)?.name || 'Custom Motion Background')
              : (activeBackground?.title || 'Ambient Wallpaper')
          }
          isPlaying={isBgVideoPlaying}
          onTogglePlay={handleToggleBgVideoPlay}
          isMuted={isBgVideoMuted}
          onToggleMute={handleToggleBgVideoMute}
          volume={bgVideoVolume}
          onVolumeChange={handleBgVideoVolumeChange}
          speed={bgVideoSpeed}
          onSpeedChange={handleBgVideoSpeedChange}
        />
      )}

      {/* 6. Quick Wallpaper Carousel (Hidden in Fullscreen / Cinema Mode) */}
      {!isPureCountdownOnly && (
        <QuickWallpaperBar
          activeBackground={activeBackground}
          onSelectCuratedBackground={handleSelectCuratedBackground}
          activeCustomUrl={activeCustomUrl}
          onSelectCustomUrl={handleSelectCustomUrl}
          onOpenFullModal={() => handleOpenBackgrounds('curated')}
        />
      )}

      {/* 7. Floating Music Player Mini-Dock (Hidden in Fullscreen / Cinema Mode) */}
      {!isPureCountdownOnly && (
        <MusicPlayerDock
          currentTrack={currentTrack}
          setCurrentTrack={setCurrentTrack}
          isMusicPlaying={isMusicPlaying}
          setIsMusicPlaying={setIsMusicPlaying}
          onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
        />
      )}

      {/* Offscreen YouTube Soundtrack Stream (Active audio rendering thread) */}
      {currentTrack.isYouTube && currentTrack.youTubeId && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '-9999px',
            width: '240px',
            height: '240px',
            opacity: 0.001,
            pointerEvents: 'none',
            zIndex: -9999,
          }}
          aria-hidden="true"
        >
          <iframe
            ref={musicYouTubeIframeRef}
            key={`yt-audio-${currentTrack.youTubeId}`}
            src={`https://www.youtube.com/embed/${currentTrack.youTubeId}?autoplay=1&mute=${isMusicMuted ? 1 : 0}&controls=0&loop=1&playlist=${currentTrack.youTubeId}&playsinline=1&rel=0&enablejsapi=1`}
            title="Background Music Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full border-none"
            onLoad={() => {
              if (musicYouTubeIframeRef.current) {
                if (isMusicPlaying) {
                  sendYouTubeCommand(musicYouTubeIframeRef.current, 'playVideo');
                } else {
                  sendYouTubeCommand(musicYouTubeIframeRef.current, 'pauseVideo');
                }
                if (isMusicMuted) {
                  sendYouTubeCommand(musicYouTubeIframeRef.current, 'mute');
                } else {
                  sendYouTubeCommand(musicYouTubeIframeRef.current, 'unMute');
                  sendYouTubeCommand(musicYouTubeIframeRef.current, 'setVolume', [Math.round(musicVolume * 100)]);
                }
              }
            }}
          />
        </div>
      )}

      {/* 8. Subtle Exit Button for Fullscreen/Cinema (Only appears on hover near top right) */}
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

      {/* 9. First-Interaction Audio Unlock Toast */}
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

      {/* 10. Modals */}
      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        initialTab={backgroundModalTab}
        onOpenInterests={() => setIsInterestModalOpen(true)}
        activeBackground={activeBackground}
        setActiveBackground={handleSelectCuratedBackground}
        activeCustomUrl={activeCustomUrl}
        setActiveCustomUrl={handleSelectCustomUrl}
        activeCountdown={activeCountdown}
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
          soundEngine.playSelect();
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
          soundEngine.playSelect();
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
          updatePreferences({ isMusicMuted: next });
        }}
        isClockMuted={isClockMuted}
        onToggleClockMute={handleToggleClockMute}
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
          updatePreferences({ musicVolume: vol });
        }}
        isMusicMuted={isMusicMuted}
        setIsMusicMuted={(muted: boolean) => {
          setIsMusicMuted(muted);
          soundEngine.setMusicMuted(muted);
          updatePreferences({ isMusicMuted: muted });
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
