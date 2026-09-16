import type { ClockCustomSettings, ShadowStyleType } from './countdown';

export type ClockStylePreset =
  | 'doomsday'
  | 'godemperor'
  | 'avengers'
  | 'stark'
  | 'ironman'
  | 'vibranium'
  | 'tva'
  | 'scarlet'
  | 'quantum'
  | 'cyberpunk'
  | 'solargold'
  | 'obsidian'
  | 'bloodmoon'
  | 'bifrost'
  | 'darkhold'
  | 'retrocomic';

export interface ClockTheme {
  name: string;
  preset: ClockStylePreset;
  primaryColor: string;
  secondaryColor: string;
  glowFilter: string;
  boxShadow: string;
  borderColor: string;
  badgeColor: string;
  bgCard: string;
  separatorColor: string;
  accentHex: string;
  brightness: number;
  scale: number;
  transparency: number;
  fontFamily: string;
  // Shadow Effects
  shadowStyle: ShadowStyleType;
  shadowBlur: number;
  shadowOpacity: number;
  // Title Specific Properties
  titleScale: number;
  titleBrightness: number;
  titleTransparency: number;
  titleColor: string;
  titleFontFamily: string;
}

export interface PresetInfo {
  label: string;
  desc: string;
  icon: string;
  primary: string;
  secondary: string;
  titleColor: string;
  fontFamily: string;
  titleFontFamily: string;
  tag: string;
}

export const CLOCK_PRESETS: Record<ClockStylePreset, PresetInfo> = {
  doomsday: {
    label: 'Avengers: Doomsday',
    desc: 'Official Latverian emerald titanium glow with imperial Roman title',
    icon: '👑',
    primary: '#00ff88',
    secondary: '#059669',
    titleColor: '#00ff88',
    fontFamily: 'Orbitron',
    titleFontFamily: 'Cinzel',
    tag: 'Official Marvel',
  },
  godemperor: {
    label: 'God Emperor Doom',
    desc: 'Celestial 24K gold starlight aura with divine ivory typography',
    icon: '✨',
    primary: '#fbbf24',
    secondary: '#d97706',
    titleColor: '#fef08a',
    fontFamily: 'Cinzel',
    titleFontFamily: 'Cinzel',
    tag: 'Secret Wars',
  },
  avengers: {
    label: 'Avengers: Obsidian Monolith',
    desc: 'Weathered titanium steel with deep battle-hardened crimson aura',
    icon: '🛡️',
    primary: '#ef4444',
    secondary: '#991b1b',
    titleColor: '#ffffff',
    fontFamily: 'Montserrat',
    titleFontFamily: 'Montserrat',
    tag: 'Cinematic',
  },
  stark: {
    label: 'Arc Reactor Mark 85',
    desc: 'High-output nanotech unibeam cyan with tactical HUD digital title',
    icon: '🤖',
    primary: '#38bdf8',
    secondary: '#0284c7',
    titleColor: '#7dd3fc',
    fontFamily: 'Rajdhani',
    titleFontFamily: 'Rajdhani',
    tag: 'Stark Tech',
  },
  ironman: {
    label: 'Iron Man: Hot-Rod Gold',
    desc: 'Stark crimson armor with gleaming vibrant gold chronometer needles',
    icon: '🦾',
    primary: '#f59e0b',
    secondary: '#b45309',
    titleColor: '#fde68a',
    fontFamily: 'Orbitron',
    titleFontFamily: 'Montserrat',
    tag: 'Avenger',
  },
  vibranium: {
    label: 'Wakanda: Royal Vibranium',
    desc: 'Deep kinetic purple pulse with polished silver titanium sheen',
    icon: '🔮',
    primary: '#c084fc',
    secondary: '#7e22ce',
    titleColor: '#e9d5ff',
    fontFamily: 'Rajdhani',
    titleFontFamily: 'Cinzel',
    tag: 'Wakanda',
  },
  tva: {
    label: 'TVA: Sacred Timeline',
    desc: '1970s analog CRT phosphor amber with vintage terminal typography',
    icon: '⏳',
    primary: '#fbbf24',
    secondary: '#b45309',
    titleColor: '#fef3c7',
    fontFamily: 'Share Tech Mono',
    titleFontFamily: 'Share Tech Mono',
    tag: 'Multiverse',
  },
  scarlet: {
    label: 'Scarlet Witch: Chaos Hex',
    desc: 'Eldritch blood ruby runes pulsing with reality-warping chaos mist',
    icon: '🩸',
    primary: '#f43f5e',
    secondary: '#9f1239',
    titleColor: '#fda4af',
    fontFamily: 'Cinzel',
    titleFontFamily: 'Cinzel',
    tag: 'Dark Magic',
  },
  quantum: {
    label: 'Quantum Realm Subatomic',
    desc: 'Ultraviolet distortion and subatomic electric cyan glow',
    icon: '🌀',
    primary: '#22d3ee',
    secondary: '#ec4899',
    titleColor: '#a5f3fc',
    fontFamily: 'Orbitron',
    titleFontFamily: 'Orbitron',
    tag: 'Quantum',
  },
  cyberpunk: {
    label: 'Midnight Synthwave',
    desc: 'Ultra-vivid electric magenta and neon violet cyber glow',
    icon: '🌆',
    primary: '#ec4899',
    secondary: '#9333ea',
    titleColor: '#f472b6',
    fontFamily: 'Orbitron',
    titleFontFamily: 'Orbitron',
    tag: 'Cyber Neon',
  },
  solargold: {
    label: 'Solar Royal Chronometer',
    desc: 'Ultra-luxurious 24K Swiss chronometer gold with diamond clarity',
    icon: '👑',
    primary: '#eab308',
    secondary: '#a16207',
    titleColor: '#fef08a',
    fontFamily: 'Cinzel',
    titleFontFamily: 'Cinzel',
    tag: 'Luxury',
  },
  obsidian: {
    label: 'Obsidian Pure Diamond',
    desc: 'Monochrome pure diamond white with crystal frost transparency',
    icon: '💎',
    primary: '#ffffff',
    secondary: '#94a3b8',
    titleColor: '#ffffff',
    fontFamily: 'Montserrat',
    titleFontFamily: 'Montserrat',
    tag: 'Minimal',
  },
  bloodmoon: {
    label: 'Blood Moon Incursion',
    desc: 'Apocalyptic cosmic burning ember orange with eclipse shadows',
    icon: '🌑',
    primary: '#ea580c',
    secondary: '#9a3412',
    titleColor: '#fed7aa',
    fontFamily: 'Cinzel',
    titleFontFamily: 'Cinzel',
    tag: 'Incursion',
  },
  bifrost: {
    label: 'Bifrost Asgardian Frost',
    desc: 'Crystalline Arctic blue with shimmering aurora diamond glow',
    icon: '❄️',
    primary: '#67e8f9',
    secondary: '#0e7490',
    titleColor: '#cffafe',
    fontFamily: 'Cinzel',
    titleFontFamily: 'Cinzel',
    tag: 'Asgardian',
  },
  darkhold: {
    label: 'Darkhold Arcane Grimoire',
    desc: 'Ancient grimoire eldritch dark green and void twilight',
    icon: '📖',
    primary: '#10b981',
    secondary: '#064e3b',
    titleColor: '#a7f3d0',
    fontFamily: 'Cinzel',
    titleFontFamily: 'Cinzel',
    tag: 'Dark Arts',
  },
  retrocomic: {
    label: 'Vintage Comic 1984',
    desc: 'Classic Jack Kirby pop art red with bold halftone golden accents',
    icon: '🎨',
    primary: '#e11d48',
    secondary: '#ca8a04',
    titleColor: '#fef08a',
    fontFamily: 'Montserrat',
    titleFontFamily: 'Montserrat',
    tag: 'Retro Ink',
  },
};

export function getAdaptedTheme(
  preset: ClockStylePreset,
  backgroundPalette?: {
    primary: string;
    secondary: string;
    glowColor: string;
    badgeBg: string;
    accentHex: string;
  },
  customSettings?: ClockCustomSettings
): ClockTheme {
  const custom = customSettings || {
    primaryColor: '',
    glowColor: '',
    brightness: 1.0,
    scale: 1.0,
    transparency: 1.0,
    fontFamily: 'Orbitron',
  };

  const presetConfig = CLOCK_PRESETS[preset] || CLOCK_PRESETS.doomsday;
  let primary = custom.primaryColor || presetConfig.primary;
  let secondary = presetConfig.secondary;
  let accentHex = presetConfig.primary;

  // Background adaptation fallback if default
  if (preset === 'doomsday' && backgroundPalette && !custom.primaryColor) {
    primary = backgroundPalette.primary;
    secondary = backgroundPalette.secondary;
    accentHex = backgroundPalette.accentHex;
  }

  const brightnessMultiplier = custom.brightness ?? 1.0;
  const glowBlur1 = Math.round(15 * brightnessMultiplier);
  const glowBlur2 = Math.round(35 * brightnessMultiplier);

  const shadowStyle: ShadowStyleType = custom.shadowStyle || 'deep';
  const shadowBlur = custom.shadowBlur ?? 14;
  const shadowOpacity = custom.shadowOpacity ?? 0.95;

  const titleScale = custom.titleScale ?? 1.0;
  const titleBrightness = custom.titleBrightness ?? brightnessMultiplier;
  const titleTransparency = custom.titleTransparency ?? (custom.transparency ?? 1.0);
  const titleColor = custom.titleColor || presetConfig.titleColor || '#ffffff';
  const titleFontFamily = custom.titleFontFamily || presetConfig.titleFontFamily || 'Cinzel';
  const fontFamily = custom.fontFamily || presetConfig.fontFamily || 'Orbitron';

  return {
    name: presetConfig.label,
    preset,
    primaryColor: primary,
    secondaryColor: secondary,
    glowFilter: `drop-shadow(0 0 ${glowBlur1}px ${primary}) drop-shadow(0 0 ${glowBlur2}px ${primary})`,
    boxShadow: `none`,
    borderColor: 'transparent',
    badgeColor: 'transparent',
    bgCard: 'transparent',
    separatorColor: primary,
    accentHex,
    brightness: brightnessMultiplier,
    scale: custom.scale ?? 1.0,
    transparency: custom.transparency ?? 1.0,
    fontFamily,
    shadowStyle,
    shadowBlur,
    shadowOpacity,
    titleScale,
    titleBrightness,
    titleTransparency,
    titleColor,
    titleFontFamily,
  };
}

export function buildTextShadow(
  primaryColor: string,
  brightness: number,
  shadowStyle: ShadowStyleType = 'deep',
  shadowBlur: number = 14,
  shadowOpacity: number = 0.95
): string {
  const op = Math.max(0, Math.min(1, shadowOpacity));
  const blur = Math.max(0, shadowBlur);
  const glow1 = Math.round(15 * brightness);
  const glow2 = Math.round(35 * brightness);

  switch (shadowStyle) {
    case 'deep':
      // Crisp, heavy obsidian drop shadow for high legibility
      return `
        0 0 ${glow1}px ${primaryColor},
        0 0 ${glow2}px ${primaryColor},
        0 4px ${blur}px rgba(0, 0, 0, ${op}),
        0 2px 4px rgba(0, 0, 0, ${Math.min(1, op + 0.15)})
      `;
    case 'halo':
      // Vibrant neon aura glow halo
      return `
        0 0 ${Math.round(blur * 0.8 + glow1)}px ${primaryColor},
        0 0 ${Math.round(blur * 1.8 + glow2)}px ${primaryColor},
        0 0 ${Math.round(blur * 3.2)}px ${primaryColor},
        0 4px 12px rgba(0, 0, 0, ${op * 0.8})
      `;
    case 'hard': {
      // Classic retro comic offset ink shadow
      const offset = Math.max(2, Math.round(blur / 3));
      return `
        0 0 ${glow1}px ${primaryColor},
        ${offset}px ${offset}px 0px rgba(0, 0, 0, ${op}),
        ${offset * 2}px ${offset * 2}px 0px rgba(0, 0, 0, ${op * 0.7})
      `;
    }
    case 'ambient':
      // Soft diffused cinematic ambient glow
      return `
        0 0 ${glow1}px ${primaryColor},
        0 8px ${blur * 2}px rgba(0, 0, 0, ${op}),
        0 0 ${blur}px rgba(255, 255, 255, ${op * 0.25})
      `;
    case 'none':
    default:
      return glow1 > 0 ? `0 0 ${glow1}px ${primaryColor}` : 'none';
  }
}
