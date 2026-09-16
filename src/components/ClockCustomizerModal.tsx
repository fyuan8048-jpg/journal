import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Palette,
  Sun,
  Maximize,
  Eye,
  Type,
  RotateCcw,
  Check,
  Edit3,
  Calendar,
  Tag,
  Layers,
} from 'lucide-react';
import { CLOCK_PRESETS, type ClockStylePreset, buildTextShadow } from '../utils/themeAdapter';
import type { ClockCustomSettings, CountdownEvent, ShadowStyleType } from '../utils/countdown';

interface ClockCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clockPreset: ClockStylePreset;
  setClockPreset: (preset: ClockStylePreset) => void;
  customSettings: ClockCustomSettings;
  setCustomSettings: (settings: ClockCustomSettings) => void;
  activeCountdown: CountdownEvent;
  onUpdateCountdown: (event: CountdownEvent) => void;
}

const toInputDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

const COLOR_PALETTES = [
  '#00ff88', // Doom Emerald
  '#ef4444', // Stark Crimson
  '#fbbf24', // Golden Amber
  '#22d3ee', // Quantum Cyan
  '#ec4899', // Neon Magenta
  '#c084fc', // Vibranium Violet
  '#ffffff', // Diamond White
  '#f97316', // Infinity Orange
];

const FONTS = [
  { id: 'Orbitron', name: 'Orbitron (Futuristic Display)' },
  { id: 'Cinzel', name: 'Cinzel (Cinematic Serif)' },
  { id: 'Montserrat', name: 'Montserrat (Modern Bold Sans)' },
  { id: 'Rajdhani', name: 'Rajdhani (HUD Tech)' },
  { id: 'Share Tech Mono', name: 'Share Tech (Digital Terminal)' },
];

export const ClockCustomizerModal: React.FC<ClockCustomizerModalProps> = ({
  isOpen,
  onClose,
  clockPreset,
  setClockPreset,
  customSettings,
  setCustomSettings,
  activeCountdown,
  onUpdateCountdown,
}) => {
  // Timer Event Title & Schedule State
  const [titleInput, setTitleInput] = useState(activeCountdown.title);
  const [subtitleInput, setSubtitleInput] = useState(activeCountdown.subtitle);
  const [targetDateInput, setTargetDateInput] = useState(() => toInputDateTime(activeCountdown.targetDate));
  const [categoryInput, setCategoryInput] = useState<CountdownEvent['category']>(activeCountdown.category);

  useEffect(() => {
    setTitleInput(activeCountdown.title);
    setSubtitleInput(activeCountdown.subtitle);
    setTargetDateInput(toInputDateTime(activeCountdown.targetDate));
    setCategoryInput(activeCountdown.category);
  }, [activeCountdown]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitleInput(val);
    onUpdateCountdown({
      ...activeCountdown,
      title: val.toUpperCase(),
    });
  };

  const handleSubtitleChange = (val: string) => {
    setSubtitleInput(val);
    onUpdateCountdown({
      ...activeCountdown,
      subtitle: val,
    });
  };

  const handleDateChange = (val: string) => {
    setTargetDateInput(val);
    if (val) {
      try {
        const iso = new Date(val).toISOString();
        onUpdateCountdown({
          ...activeCountdown,
          targetDate: iso,
        });
      } catch {}
    }
  };

  const handleQuickShift = (days: number) => {
    const current = new Date(activeCountdown.targetDate).getTime() || Date.now();
    const nextDate = new Date(current + days * 24 * 60 * 60 * 1000);
    const iso = nextDate.toISOString();
    setTargetDateInput(toInputDateTime(iso));
    onUpdateCountdown({
      ...activeCountdown,
      targetDate: iso,
    });
  };

  const handleCategoryChange = (cat: CountdownEvent['category']) => {
    setCategoryInput(cat);
    onUpdateCountdown({
      ...activeCountdown,
      category: cat,
    });
  };

  const handleReset = () => {
    setCustomSettings({
      primaryColor: '',
      glowColor: '',
      brightness: 1.0,
      scale: 1.0,
      transparency: 1.0,
      fontFamily: 'Orbitron',
      shadowStyle: 'deep',
      shadowBlur: 14,
      shadowOpacity: 0.95,
      titleScale: 1.0,
      titleBrightness: 1.0,
      titleTransparency: 1.0,
      titleColor: '#ffffff',
      titleFontFamily: 'Orbitron',
    });
    setClockPreset('doomsday');
  };

  const activeColor = customSettings.primaryColor || CLOCK_PRESETS[clockPreset]?.primary || '#00ff88';
  const activeTitleColor = customSettings.titleColor || '#ffffff';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-950/95 border border-emerald-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                Clock &amp; Title Customizer Studio
              </h2>
              <p className="text-xs text-neutral-400">
                Customize timer title, target schedule, themes, colors, brightness, scale &amp; fonts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Title & Digit Preview Box */}
        <div className="p-4 bg-black/70 border-b border-white/5 flex flex-col items-center justify-center py-5 select-none overflow-hidden text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1.5">
            LIVE PREVIEW
          </span>

          {/* Title Live Render */}
          <h3
            className="text-lg sm:text-2xl font-black uppercase tracking-wider mb-2 max-w-lg truncate transition-all"
            style={{
              fontFamily: customSettings.titleFontFamily || customSettings.fontFamily,
              color: activeTitleColor,
              opacity: customSettings.titleTransparency ?? 1.0,
              transform: `scale(${customSettings.titleScale ?? 1.0})`,
              transformOrigin: 'center center',
              textShadow: `
                0 0 ${15 * (customSettings.titleBrightness ?? customSettings.brightness)}px ${activeColor},
                0 0 ${35 * (customSettings.titleBrightness ?? customSettings.brightness)}px ${activeColor},
                0 2px 8px rgba(0,0,0,0.9)
              `,
            }}
          >
            {titleInput || 'COUNTDOWN TITLE'}
          </h3>

          {/* Numerals Live Render */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 transition-all"
            style={{
              opacity: customSettings.transparency,
              transform: `scale(${customSettings.scale})`,
            }}
          >
            <span
              className="text-4xl sm:text-5xl font-black tabular-nums"
              style={{
                fontFamily: customSettings.fontFamily,
                color: '#ffffff',
                textShadow: buildTextShadow(
                  activeColor,
                  customSettings.brightness,
                  customSettings.shadowStyle || 'deep',
                  customSettings.shadowBlur ?? 14,
                  customSettings.shadowOpacity ?? 0.95
                ),
              }}
            >
              08
            </span>
            <span
              className="text-2xl sm:text-3xl font-black"
              style={{
                color: activeColor,
                textShadow: `0 0 ${12 * customSettings.brightness}px ${activeColor}`,
              }}
            >
              :
            </span>
            <span
              className="text-4xl sm:text-5xl font-black tabular-nums"
              style={{
                fontFamily: customSettings.fontFamily,
                color: '#ffffff',
                textShadow: `
                  0 0 ${15 * customSettings.brightness}px ${activeColor},
                  0 0 ${35 * customSettings.brightness}px ${activeColor},
                  0 3px 8px rgba(0,0,0,0.95)
                `,
              }}
            >
              42
            </span>
            <span
              className="text-2xl sm:text-3xl font-black"
              style={{
                color: activeColor,
                textShadow: `0 0 ${12 * customSettings.brightness}px ${activeColor}`,
              }}
            >
              :
            </span>
            <span
              className="text-4xl sm:text-5xl font-black tabular-nums"
              style={{
                fontFamily: customSettings.fontFamily,
                color: '#ffffff',
                textShadow: buildTextShadow(
                  activeColor,
                  customSettings.brightness,
                  customSettings.shadowStyle || 'deep',
                  customSettings.shadowBlur ?? 14,
                  customSettings.shadowOpacity ?? 0.95
                ),
              }}
            >
              19
            </span>
          </div>

          {/* Subtitle Live Render */}
          <p
            className="text-[11px] sm:text-xs font-bold tracking-widest uppercase mt-2 max-w-md truncate transition-all"
            style={{
              fontFamily: customSettings.fontFamily,
              color: activeColor,
              textShadow: '0 2px 6px rgba(0,0,0,0.9)',
            }}
          >
            {subtitleInput || 'COUNTDOWN TAGLINE'}
          </p>
        </div>

        {/* Controls Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: TIMER TITLE & SCHEDULE (Combined with clock features) */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                1. Edit Timer Title & Schedule
              </span>
              <span className="text-[10px] text-neutral-400 bg-black/60 px-2 py-0.5 rounded border border-white/10 uppercase">
                Active Countdown
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1 font-semibold">
                  Countdown Title *
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. AVENGERS: DOOMSDAY"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1 font-semibold">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={subtitleInput}
                  onChange={e => handleSubtitleChange(e.target.value)}
                  placeholder="e.g. IN THEATERS WORLDWIDE"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Target Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={targetDateInput}
                  onChange={e => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                {/* Quick Shifters */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-neutral-500">Quick adjust:</span>
                  {[
                    { label: '+1 Day', days: 1 },
                    { label: '+1 Week', days: 7 },
                    { label: '+1 Month', days: 30 },
                    { label: '+1 Year', days: 365 },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => handleQuickShift(btn.days)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 border border-white/10 text-[10px] font-mono transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1 font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Category
                </label>
                <select
                  value={categoryInput}
                  onChange={e => handleCategoryChange(e.target.value as CountdownEvent['category'])}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="marvel">Marvel / MCU</option>
                  <option value="gaming">Gaming</option>
                  <option value="scifi">Sci-Fi / Space</option>
                  <option value="personal">Personal / Birthday</option>
                  <option value="holiday">Holiday / New Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: TITLE & HEADING STYLING (Manipulate Size, Glow, Transparency, Color & Font) */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                2. Title Styling (Size, Glow, Opacity &amp; Color)
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomSettings({
                    ...customSettings,
                    titleScale: customSettings.scale,
                    titleBrightness: customSettings.brightness,
                    titleTransparency: customSettings.transparency,
                    titleColor: activeColor,
                    titleFontFamily: customSettings.fontFamily,
                  });
                }}
                className="text-[10px] text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/80 px-2.5 py-1 rounded-lg border border-cyan-500/40 transition-colors uppercase tracking-wider font-mono font-bold"
              >
                Sync with Clock Style
              </button>
            </div>

            {/* Title Size / Scale */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-cyan-400" />
                  Title Size (Scale)
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round((customSettings.titleScale ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={customSettings.titleScale ?? 1.0}
                onChange={e =>
                  setCustomSettings({ ...customSettings, titleScale: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>Compact (50%)</span>
                <span>Default (100%)</span>
                <span>Massive Billboard (200%)</span>
              </div>
            </div>

            {/* Title Glow Brightness & Aura (0% Flat to 400% Supernova) */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-cyan-400" />
                  Title Aura &amp; Glow Brightness
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round((customSettings.titleBrightness ?? customSettings.brightness ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.0"
                step="0.05"
                value={customSettings.titleBrightness ?? customSettings.brightness ?? 1.0}
                onChange={e =>
                  setCustomSettings({ ...customSettings, titleBrightness: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 flex-wrap">
                {[
                  { label: 'Flat (0%)', val: 0.0 },
                  { label: 'Subtle (50%)', val: 0.5 },
                  { label: 'Normal (100%)', val: 1.0 },
                  { label: 'Radiant (200%)', val: 2.0 },
                  { label: 'Supernova Aura (400%)', val: 4.0 },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setCustomSettings({ ...customSettings, titleBrightness: p.val })}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-950/60 hover:text-cyan-300 border border-white/10 text-[9px] font-mono transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Transparency (5% Ghost Watermark to 100% Solid) */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Title Transparency (Opacity)
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round((customSettings.titleTransparency ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.01"
                value={customSettings.titleTransparency ?? 1.0}
                onChange={e =>
                  setCustomSettings({ ...customSettings, titleTransparency: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 flex-wrap">
                {[
                  { label: 'Ghost (5%)', val: 0.05 },
                  { label: 'Faint (25%)', val: 0.25 },
                  { label: 'Translucent (60%)', val: 0.6 },
                  { label: 'Solid (100%)', val: 1.0 },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setCustomSettings({ ...customSettings, titleTransparency: p.val })}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-950/60 hover:text-cyan-300 border border-white/10 text-[9px] font-mono transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Color Picker */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  Title Color Palette
                </span>
                <button
                  type="button"
                  onClick={() => setCustomSettings({ ...customSettings, titleColor: '#ffffff' })}
                  className="text-[11px] text-neutral-400 hover:text-white underline"
                >
                  Reset to White
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: 'Pure White', hex: '#ffffff' },
                  { name: 'Doom Emerald', hex: '#00ff88' },
                  { name: 'Golden Amber', hex: '#fbbf24' },
                  { name: 'Stark Crimson', hex: '#ef4444' },
                  { name: 'Quantum Cyan', hex: '#22d3ee' },
                  { name: 'Vibranium Violet', hex: '#c084fc' },
                  { name: 'Infinity Orange', hex: '#f97316' },
                ].map(item => {
                  const isSelected = activeTitleColor.toLowerCase() === item.hex.toLowerCase();
                  return (
                    <button
                      key={item.hex}
                      type="button"
                      onClick={() => setCustomSettings({ ...customSettings, titleColor: item.hex })}
                      className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                        isSelected
                          ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: item.hex }}
                      title={item.name}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </button>
                  );
                })}

                <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <span className="text-[11px] font-bold">Hex:</span>
                  <input
                    type="color"
                    value={activeTitleColor}
                    onChange={e => setCustomSettings({ ...customSettings, titleColor: e.target.value })}
                    className="w-5 h-5 rounded border-none bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] font-mono uppercase text-neutral-300">
                    {activeTitleColor}
                  </span>
                </label>
              </div>
            </div>

            {/* Title Font Family */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-cyan-400" />
                Title Typography Font
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {FONTS.map(f => {
                  const isSelected = (customSettings.titleFontFamily || customSettings.fontFamily) === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCustomSettings({ ...customSettings, titleFontFamily: f.id })}
                      className={`px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-bold'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                      }`}
                    >
                      <p className="text-[11px] truncate font-bold" style={{ fontFamily: f.id }}>
                        {f.name.split(' ')[0]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: PRESET THEMES (16 Curated Themes for Clock & Title) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                3. Curated Clock &amp; Title Themes (16 Presets)
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                Click any theme to transform clock &amp; title together
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(CLOCK_PRESETS) as ClockStylePreset[]).map(p => {
                const conf = CLOCK_PRESETS[p];
                const isSelected = clockPreset === p && !customSettings.primaryColor;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setClockPreset(p);
                      setCustomSettings({
                        ...customSettings,
                        primaryColor: '',
                        titleColor: conf.titleColor,
                        fontFamily: conf.fontFamily,
                        titleFontFamily: conf.titleFontFamily,
                      });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-900 border-emerald-400 ring-2 ring-emerald-400/80 shadow-[0_0_20px_rgba(0,255,136,0.3)] text-white'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06] text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">{conf.icon}</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: conf.primary, boxShadow: `0 0 10px ${conf.primary}` }}
                        />
                      </div>
                      <p className="text-xs font-bold leading-snug">{conf.label}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/5">
                        {conf.tag}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <p
                        className="text-[11px] font-mono tracking-wider font-bold"
                        style={{ color: conf.primary, fontFamily: conf.fontFamily }}
                      >
                        00:00:00
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CUSTOM COLOR PICKER */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                4. Clock Digit Custom Color
              </span>
              {customSettings.primaryColor && (
                <button
                  onClick={() => setCustomSettings({ ...customSettings, primaryColor: '' })}
                  className="text-[11px] text-neutral-400 hover:text-white underline"
                >
                  Use Theme Color
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_PALETTES.map(hex => (
                <button
                  key={hex}
                  onClick={() => setCustomSettings({ ...customSettings, primaryColor: hex })}
                  className={`w-9 h-9 rounded-xl border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                    customSettings.primaryColor === hex
                      ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {customSettings.primaryColor === hex && <Check className="w-4 h-4 text-black stroke-[3]" />}
                </button>
              ))}

              {/* Exact HTML5 Color Picker */}
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-xs font-bold">Custom Hex:</span>
                <input
                  type="color"
                  value={activeColor}
                  onChange={e => setCustomSettings({ ...customSettings, primaryColor: e.target.value })}
                  className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono uppercase text-neutral-300">{activeColor}</span>
              </label>
            </div>
          </div>

          {/* SECTION: SHADOW & DEPTH EFFECTS (Customizable Shadows for Legibility & Style) */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Shadow &amp; Depth Effects
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                Applies to Clock Digits &amp; Titles
              </span>
            </div>

            {/* Shadow Style Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                {
                  id: 'deep',
                  name: 'Deep Obsidian',
                  desc: 'High-contrast dark shadow, best for bright art',
                  icon: '🌑',
                },
                {
                  id: 'halo',
                  name: 'Neon Halo',
                  desc: 'Radiant glowing aura halo matching clock color',
                  icon: '✨',
                },
                {
                  id: 'hard',
                  name: 'Hard Comic Ink',
                  desc: 'Classic Marvel comic offset block ink shadow',
                  icon: '💥',
                },
                {
                  id: 'ambient',
                  name: 'Soft Ambient',
                  desc: 'Subtle cinematic diffused glow depth',
                  icon: '🌫️',
                },
                {
                  id: 'none',
                  name: 'Crisp Flat',
                  desc: 'Minimalist razor-sharp typography without drop shadow',
                  icon: '⚡',
                },
              ].map(s => {
                const isSelected = (customSettings.shadowStyle || 'deep') === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCustomSettings({ ...customSettings, shadowStyle: s.id as ShadowStyleType })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400 text-white ring-1 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs font-bold truncate">{s.name}</span>
                    </div>
                    <p className="text-[9px] text-neutral-400 leading-tight line-clamp-2">{s.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Shadow Blur Slider */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Shadow Blur &amp; Radius</span>
                <span className="font-mono text-amber-400 font-bold">{customSettings.shadowBlur ?? 14}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={customSettings.shadowBlur ?? 14}
                onChange={e => setCustomSettings({ ...customSettings, shadowBlur: parseInt(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 flex-wrap">
                {[
                  { label: '0px (Sharp)', val: 0 },
                  { label: '8px (Crisp)', val: 8 },
                  { label: '14px (Standard)', val: 14 },
                  { label: '25px (Deep)', val: 25 },
                  { label: '40px (Massive)', val: 40 },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setCustomSettings({ ...customSettings, shadowBlur: p.val })}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-amber-950/60 hover:text-amber-300 border border-white/10 text-[9px] font-mono transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow Opacity Slider */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Shadow Opacity &amp; Density</span>
                <span className="font-mono text-amber-400 font-bold">
                  {Math.round((customSettings.shadowOpacity ?? 0.95) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={customSettings.shadowOpacity ?? 0.95}
                onChange={e => setCustomSettings({ ...customSettings, shadowOpacity: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1 flex-wrap">
                {[
                  { label: '30% (Subtle)', val: 0.3 },
                  { label: '60% (Medium)', val: 0.6 },
                  { label: '95% (Intense)', val: 0.95 },
                  { label: '100% (Solid)', val: 1.0 },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setCustomSettings({ ...customSettings, shadowOpacity: p.val })}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-amber-950/60 hover:text-amber-300 border border-white/10 text-[9px] font-mono transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. CLOCK DIGIT GLOW BRIGHTNESS & INTENSITY */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-emerald-400" />
                5. Clock Digit Glow Brightness
              </span>
              <span className="font-mono text-emerald-400">{Math.round(customSettings.brightness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="4.0"
              step="0.05"
              value={customSettings.brightness}
              onChange={e => setCustomSettings({ ...customSettings, brightness: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1 flex-wrap mt-1">
              {[
                { label: '0% Flat', val: 0.0 },
                { label: '50% Dim', val: 0.5 },
                { label: '100% Normal', val: 1.0 },
                { label: '200% High', val: 2.0 },
                { label: '400% Supernova', val: 4.0 },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setCustomSettings({ ...customSettings, brightness: p.val })}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-950/60 hover:text-emerald-300 border border-white/10 text-[9px] font-mono transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>Subtle Minimal</span>
              <span>Standard (100%)</span>
              <span>Supernova Neon (250%)</span>
            </div>
          </div>

          {/* 6. CLOCK DIGIT SIZE / SCALE */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-emerald-400" />
                6. Clock Digit Size (Scale)
              </span>
              <span className="font-mono text-emerald-400">{Math.round(customSettings.scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.5"
              step="0.05"
              value={customSettings.scale}
              onChange={e => setCustomSettings({ ...customSettings, scale: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>Compact (60%)</span>
              <span>Default (100%)</span>
              <span>Giant Cinematic (150%)</span>
            </div>
          </div>

          {/* 7. CLOCK DIGIT TRANSPARENCY / OPACITY */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                7. Clock Digit Transparency (Opacity)
              </span>
              <span className="font-mono text-emerald-400">{Math.round(customSettings.transparency * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.01"
              value={customSettings.transparency}
              onChange={e => setCustomSettings({ ...customSettings, transparency: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1 flex-wrap mt-1">
              {[
                { label: '5% Ghost', val: 0.05 },
                { label: '30% Glass', val: 0.3 },
                { label: '60% Translucent', val: 0.6 },
                { label: '100% Solid', val: 1.0 },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setCustomSettings({ ...customSettings, transparency: p.val })}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-950/60 hover:text-emerald-300 border border-white/10 text-[9px] font-mono transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500">
              <span>Ghostly Glass (20%)</span>
              <span>Translucent (60%)</span>
              <span>Solid Vibrant (100%)</span>
            </div>
          </div>

          {/* 8. CLOCK DIGIT TYPOGRAPHY / FONT FAMILY */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              8. Clock Digit Typography &amp; Font
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FONTS.map(f => {
                const isSelected = customSettings.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setCustomSettings({ ...customSettings, fontFamily: f.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                        : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                    }`}
                  >
                    <p className="text-xs font-bold" style={{ fontFamily: f.id }}>{f.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
