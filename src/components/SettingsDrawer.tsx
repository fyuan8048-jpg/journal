import React from 'react';
import { X, Volume2, VolumeX, Sparkles, Sliders, Layers, Music, Clock } from 'lucide-react';
import { soundEngine, type SoundEffectType } from '../audio/soundEngine';
import { CLOCK_PRESETS, type ClockStylePreset } from '../utils/themeAdapter';
import { useAuth } from '../context/AuthContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Clock Sound Channel
  clockVolume: number;
  setClockVolume: (vol: number) => void;
  isClockMuted: boolean;
  setIsClockMuted: (muted: boolean) => void;
  soundType: SoundEffectType;
  setSoundType: (type: SoundEffectType) => void;
  // Music Sound Channel
  musicVolume: number;
  setMusicVolume: (vol: number) => void;
  isMusicMuted: boolean;
  setIsMusicMuted: (muted: boolean) => void;
  ambientDrone: boolean;
  setAmbientDrone: (active: boolean) => void;
  // Aesthetics & Layout
  clockPreset: ClockStylePreset;
  setClockPreset: (preset: ClockStylePreset) => void;
  includeYears: boolean;
  setIncludeYears: (inc: boolean) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  clockVolume,
  setClockVolume,
  isClockMuted,
  setIsClockMuted,
  soundType,
  setSoundType,
  musicVolume,
  setMusicVolume,
  isMusicMuted,
  setIsMusicMuted,
  ambientDrone,
  setAmbientDrone,
  clockPreset,
  setClockPreset,
  includeYears,
  setIncludeYears,
}) => {
  const { currentUser, updatePreferences } = useAuth();
  const isAutoRotate = currentUser?.preferences?.autoRotate24h !== false;

  if (!isOpen) return null;

  const handleSoundChange = (type: SoundEffectType) => {
    setSoundType(type);
    soundEngine.setSoundType(type);
    if (type !== 'none') {
      soundEngine.playTick();
    }
  };

  const handleClockVolumeChange = (newVol: number) => {
    setClockVolume(newVol);
    soundEngine.setClockVolume(newVol);
  };

  const handleClockMuteToggle = () => {
    const next = !isClockMuted;
    setIsClockMuted(next);
    soundEngine.setClockMuted(next);
  };

  const handleMusicVolumeChange = (newVol: number) => {
    setMusicVolume(newVol);
    soundEngine.setMusicVolume(newVol);
  };

  const handleMusicMuteToggle = () => {
    const next = !isMusicMuted;
    setIsMusicMuted(next);
    soundEngine.setMusicMuted(next);
  };

  const handleDroneToggle = () => {
    const next = !ambientDrone;
    setAmbientDrone(next);
    soundEngine.toggleDrone(next);
  };

  const handlePresetChange = (preset: ClockStylePreset) => {
    setClockPreset(preset);
  };

  const handleYearsToggle = () => {
    setIncludeYears(!includeYears);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md h-full bg-neutral-950/95 border-l border-emerald-500/30 text-white shadow-2xl flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-black font-display text-white">Chrono Console</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 py-6">
          {/* 1. SEPARATE SOUND LEVEL CONTROLS */}
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Independent Sound Levels
            </span>

            {/* CHANNEL A: CLOCK TICKING VOLUME */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Clock Ticking Sound Level</span>
                </div>
                <button
                  onClick={handleClockMuteToggle}
                  className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                    isClockMuted
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                      : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {isClockMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isClockMuted ? 'Muted' : 'Unmuted'}</span>
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Tick Volume</span>
                  <span className="font-mono">{Math.round(clockVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={clockVolume}
                  onChange={e => handleClockVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Sound Profile Selection */}
              <div className="pt-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1.5 font-bold">
                  Tick Sound Profile
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'doomsday', label: '⚡ Doomsday Tick' },
                    { id: 'heartbeat', label: '💓 Heartbeat' },
                    { id: 'grandfather', label: '🕰️ Grandfather' },
                    { id: 'tachyon', label: '📡 Tachyon' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleSoundChange(s.id as SoundEffectType)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        soundType === s.id
                          ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500 text-white font-bold'
                          : 'bg-black/40 border-white/10 hover:border-white/20 text-neutral-400'
                      }`}
                    >
                      <p className="text-[11px] truncate">{s.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CHANNEL B: BACKGROUND MUSIC VOLUME */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Soundtrack & Music Level</span>
                </div>
                <button
                  onClick={handleMusicMuteToggle}
                  className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                    isMusicMuted
                      ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                      : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {isMusicMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isMusicMuted ? 'Muted' : 'Unmuted'}</span>
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Music Volume</span>
                  <span className="font-mono">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={musicVolume}
                  onChange={e => handleMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Ambient Multiverse Drone Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xs font-bold text-white">Latverian Ambient Drone</p>
                  <p className="text-[10px] text-neutral-400">Stream rumble drone</p>
                </div>
                <button
                  onClick={handleDroneToggle}
                  className={`w-11 h-5 rounded-full transition-colors relative p-0.5 ${
                    ambientDrone ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      ambientDrone ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. CLOCK STYLES & PRESETS */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Clock Hologram Aesthetics
            </span>
            <div className="space-y-2">
              {(Object.keys(CLOCK_PRESETS) as ClockStylePreset[]).map(p => {
                const conf = CLOCK_PRESETS[p];
                const isSelected = clockPreset === p;
                return (
                  <div
                    key={p}
                    onClick={() => handlePresetChange(p)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                        : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                    }`}
                  >
                    <span className="text-xl">{conf.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{conf.label}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{conf.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. TIMER CONFIGURATION */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Display Layout
            </span>

            {/* Include Years Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-xs font-bold text-white">Include Years (Optional)</p>
                <p className="text-[10px] text-neutral-400 font-mono">
                  {includeYears ? '[YEARS : MONTHS : DAYS : ...]' : '[MONTHS : DAYS : HOURS : ...]'}
                </p>
              </div>
              <button
                onClick={handleYearsToggle}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  includeYears ? 'bg-emerald-500' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    includeYears ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 24-Hour Artwork Auto-Rotation Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-xs font-bold text-white">24-Hour Artwork Auto-Rotation</p>
                <p className="text-[10px] text-neutral-400">
                  Rotates background daily to fresh artworks matching your themes
                </p>
              </div>
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  updatePreferences({ autoRotate24h: !isAutoRotate });
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  isAutoRotate ? 'bg-emerald-500' : 'bg-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isAutoRotate ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all"
          >
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
};
