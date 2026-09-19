export type UserInterest = 'marvel' | 'comics' | 'doom' | 'secretwars' | 'darkart' | 'cyberpunk';

export interface BackgroundItem {
  id: string;
  title: string;
  category: UserInterest;
  imageUrl: string;
  artistCredit?: string;
  description: string;
  palette: {
    primary: string;       // Clock glow and primary digits
    secondary: string;     // Labels, subtle borders
    glowColor: string;     // Drop shadow & particle color
    badgeBg: string;       // Chip / badge backplate
    accentHex: string;     // Hex for accent glow
  };
}

export const INTEREST_CONFIG: Record<UserInterest, { label: string; icon: string; desc: string }> = {
  doom: {
    label: 'Doctor Doom & Latveria',
    icon: '👑',
    desc: 'Victor von Doom, Castle Doomstadt, Latverian thrones and mystic emerald sorcery'
  },
  marvel: {
    label: 'Avengers: Doomsday',
    icon: '🛡️',
    desc: 'Official Doomsday aesthetic, battle-worn Avengers emblems, and Multiversal incursions'
  },
  secretwars: {
    label: 'Secret Wars & Battleworld',
    icon: '⚔️',
    desc: 'God Emperor Doom, fragmented multiversal realms, and cosmic masterworks'
  },
  comics: {
    label: 'Classic Comic Book Art',
    icon: '🎨',
    desc: 'Vintage Marvel comic covers, bold Jack Kirby ink lines and retro halftone art'
  },
  darkart: {
    label: 'Dark Mysticism & Sorcery',
    icon: '🔮',
    desc: 'Arcane eldritch runes, sorcerer artifacts, and ominous comic illustrations'
  },
  cyberpunk: {
    label: 'Cyberpunk & Sci-Fi',
    icon: '🌆',
    desc: 'Neon-soaked streets, futuristic cityscapes, and dystopian sci-fi environments'
  }
};

const makeUnsplashUrl = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1920&auto=format&fit=crop`;

// 20 High-Resolution Backgrounds
export const CURATED_BACKGROUNDS: BackgroundItem[] = [
  // Doctor Doom / Dark Gothic
  {
    id: 'doom-gothic-cathedral',
    title: 'Gothic Cathedral Interior',
    category: 'doom',
    imageUrl: makeUnsplashUrl('photo-1478760329108-5c3ed9d495a0'),
    artistCredit: 'Unsplash Archive',
    description: 'Dark atmospheric halls reflecting the grand architecture of Castle Doomstadt.',
    palette: { primary: '#10b981', secondary: '#059669', glowColor: 'rgba(16, 185, 129, 0.6)', badgeBg: 'rgba(5, 150, 105, 0.3)', accentHex: '#10b981' }
  },
  {
    id: 'doom-dark-throne',
    title: 'Ominous Dark Throne Room',
    category: 'doom',
    imageUrl: makeUnsplashUrl('photo-1504608524841-42fe6f032b4b'),
    artistCredit: 'Unsplash Archive',
    description: 'A shadowy hall reminiscent of Victor von Doom\'s royal chambers in Latveria.',
    palette: { primary: '#34d399', secondary: '#047857', glowColor: 'rgba(52, 211, 153, 0.6)', badgeBg: 'rgba(4, 120, 87, 0.3)', accentHex: '#34d399' }
  },
  {
    id: 'doom-dark-castle',
    title: 'Dark Castle at Night',
    category: 'doom',
    imageUrl: makeUnsplashUrl('photo-1507400492013-162706c8c05e'),
    artistCredit: 'Unsplash Archive',
    description: 'The towering silhouettes of a formidable medieval fortress under the night sky.',
    palette: { primary: '#6ee7b7', secondary: '#0f766e', glowColor: 'rgba(110, 231, 183, 0.6)', badgeBg: 'rgba(15, 118, 110, 0.3)', accentHex: '#6ee7b7' }
  },
  {
    id: 'doom-emerald-energy',
    title: 'Emerald Aurora Borealis',
    category: 'doom',
    imageUrl: makeUnsplashUrl('photo-1519074069444-1ba4fff66d16'),
    artistCredit: 'Unsplash Archive',
    description: 'Swirling green cosmic energy illuminating the dark night like mystic sorcery.',
    palette: { primary: '#00ff88', secondary: '#059669', glowColor: 'rgba(0, 255, 136, 0.6)', badgeBg: 'rgba(5, 150, 105, 0.3)', accentHex: '#00ff88' }
  },

  // Marvel / Avengers / Action
  {
    id: 'marvel-storm-lightning',
    title: 'Dramatic Sky with Lightning',
    category: 'marvel',
    imageUrl: makeUnsplashUrl('photo-1534447677768-be436bb09401'),
    artistCredit: 'Unsplash Archive',
    description: 'Thunderous clouds parting under the raw power of elemental fury.',
    palette: { primary: '#eab308', secondary: '#a16207', glowColor: 'rgba(234, 179, 8, 0.6)', badgeBg: 'rgba(161, 98, 7, 0.3)', accentHex: '#eab308' }
  },
  {
    id: 'marvel-cosmic-nebula',
    title: 'Cosmic Nebula Incursion',
    category: 'marvel',
    imageUrl: makeUnsplashUrl('photo-1506703719100-a0f3a48c0f86'),
    artistCredit: 'Unsplash Archive',
    description: 'A multiversal anomaly tearing through the fabric of space and time.',
    palette: { primary: '#c084fc', secondary: '#7e22ce', glowColor: 'rgba(192, 132, 252, 0.6)', badgeBg: 'rgba(126, 34, 206, 0.3)', accentHex: '#c084fc' }
  },
  {
    id: 'marvel-earth-night',
    title: 'Earth from Space at Night',
    category: 'marvel',
    imageUrl: makeUnsplashUrl('photo-1451187580459-43490279c0fa'),
    artistCredit: 'Unsplash Archive',
    description: 'The glimmering city lights of Earth viewed from orbital defense stations.',
    palette: { primary: '#60a5fa', secondary: '#1e3a8a', glowColor: 'rgba(96, 165, 250, 0.6)', badgeBg: 'rgba(30, 58, 138, 0.3)', accentHex: '#60a5fa' }
  },
  {
    id: 'marvel-quantum-realm',
    title: 'Deep Space Quantum Nebula',
    category: 'marvel',
    imageUrl: makeUnsplashUrl('photo-1462331940025-496dfbfc7564'),
    artistCredit: 'Unsplash Archive',
    description: 'Vibrant interstellar dust clouds forming the boundaries of the unknown.',
    palette: { primary: '#f472b6', secondary: '#be185d', glowColor: 'rgba(244, 114, 182, 0.6)', badgeBg: 'rgba(190, 24, 93, 0.3)', accentHex: '#f472b6' }
  },

  // Secret Wars / Cosmic
  {
    id: 'secretwars-planet-atmosphere',
    title: 'Planet with Atmosphere',
    category: 'secretwars',
    imageUrl: makeUnsplashUrl('photo-1446776811953-b23d57bd21aa'),
    artistCredit: 'Unsplash Archive',
    description: 'A lone world suspended in the vastness of the cosmos.',
    palette: { primary: '#38bdf8', secondary: '#0369a1', glowColor: 'rgba(56, 189, 248, 0.6)', badgeBg: 'rgba(3, 105, 161, 0.3)', accentHex: '#38bdf8' }
  },
  {
    id: 'secretwars-night-stars',
    title: 'Night Sky Stars over Battleworld',
    category: 'secretwars',
    imageUrl: makeUnsplashUrl('photo-1419242902214-272b3f66ee7a'),
    artistCredit: 'Unsplash Archive',
    description: 'The scattered starlight watching over the fractured realms of the multiverse.',
    palette: { primary: '#e2e8f0', secondary: '#475569', glowColor: 'rgba(226, 232, 240, 0.6)', badgeBg: 'rgba(71, 85, 105, 0.3)', accentHex: '#e2e8f0' }
  },
  {
    id: 'secretwars-galaxy-nebula',
    title: 'Galaxy and Cosmic Nebula',
    category: 'secretwars',
    imageUrl: makeUnsplashUrl('photo-1464802686167-b939a6910659'),
    artistCredit: 'Unsplash Archive',
    description: 'The swirling majesty of galactic creation, a canvas for God Emperor powers.',
    palette: { primary: '#fbbf24', secondary: '#b45309', glowColor: 'rgba(251, 191, 36, 0.6)', badgeBg: 'rgba(180, 83, 9, 0.3)', accentHex: '#fbbf24' }
  },

  // Classic Comics / Art
  {
    id: 'comics-abstract-colorful',
    title: 'Abstract Colorful Art',
    category: 'comics',
    imageUrl: makeUnsplashUrl('photo-1618005198919-d3d4b5a92ead'),
    artistCredit: 'Unsplash Archive',
    description: 'Bold intersecting colors mirroring classic comic book pop art motifs.',
    palette: { primary: '#ef4444', secondary: '#b91c1c', glowColor: 'rgba(239, 68, 68, 0.6)', badgeBg: 'rgba(185, 28, 28, 0.3)', accentHex: '#ef4444' }
  },
  {
    id: 'comics-abstract-fluid',
    title: 'Abstract Fluid Art',
    category: 'comics',
    imageUrl: makeUnsplashUrl('photo-1541701494587-cb58502866ab'),
    artistCredit: 'Unsplash Archive',
    description: 'Vibrant fluid waves of color evoking creative imagination and retro aesthetics.',
    palette: { primary: '#14b8a6', secondary: '#0f766e', glowColor: 'rgba(20, 184, 166, 0.6)', badgeBg: 'rgba(15, 118, 110, 0.3)', accentHex: '#14b8a6' }
  },
  {
    id: 'comics-vibrant-gradient',
    title: 'Vibrant Abstract Gradient',
    category: 'comics',
    imageUrl: makeUnsplashUrl('photo-1557672172-298e090bd0f1'),
    artistCredit: 'Unsplash Archive',
    description: 'A smooth transition of intense hues providing a dynamic backdrop.',
    palette: { primary: '#8b5cf6', secondary: '#5b21b6', glowColor: 'rgba(139, 92, 246, 0.6)', badgeBg: 'rgba(91, 33, 182, 0.3)', accentHex: '#8b5cf6' }
  },

  // Dark Mysticism / Sorcery
  {
    id: 'darkart-mysterious-forest',
    title: 'Dark Mysterious Forest',
    category: 'darkart',
    imageUrl: makeUnsplashUrl('photo-1518709268805-4e9042af9f23'),
    artistCredit: 'Unsplash Archive',
    description: 'An eerie woodland veiled in shadows and whispering with ancient magic.',
    palette: { primary: '#a3e635', secondary: '#4d7c0f', glowColor: 'rgba(163, 230, 53, 0.6)', badgeBg: 'rgba(77, 124, 15, 0.3)', accentHex: '#a3e635' }
  },
  {
    id: 'darkart-ancient-ruins',
    title: 'Ancient Ruins at Night',
    category: 'darkart',
    imageUrl: makeUnsplashUrl('photo-1509021436665-8f07dbf5bf1d'),
    artistCredit: 'Unsplash Archive',
    description: 'Forgotten stone monuments standing tall beneath the moonlit sky.',
    palette: { primary: '#94a3b8', secondary: '#334155', glowColor: 'rgba(148, 163, 184, 0.6)', badgeBg: 'rgba(51, 65, 85, 0.3)', accentHex: '#94a3b8' }
  },

  // Cyberpunk / Sci-Fi
  {
    id: 'cyberpunk-neon-city',
    title: 'Neon City at Night',
    category: 'cyberpunk',
    imageUrl: makeUnsplashUrl('photo-1515705576963-95cad62945b6'),
    artistCredit: 'Unsplash Archive',
    description: 'A sprawling metropolis glowing with synthetic neon signs and futuristic technology.',
    palette: { primary: '#ec4899', secondary: '#9d174d', glowColor: 'rgba(236, 72, 153, 0.6)', badgeBg: 'rgba(157, 23, 77, 0.3)', accentHex: '#ec4899' }
  },
  {
    id: 'cyberpunk-city-skyline',
    title: 'Dystopian City Skyline',
    category: 'cyberpunk',
    imageUrl: makeUnsplashUrl('photo-1480714378408-67cf0d13bc1b'),
    artistCredit: 'Unsplash Archive',
    description: 'High-tech corporate monoliths dominating the skyline under a dark canopy.',
    palette: { primary: '#06b6d4', secondary: '#155e75', glowColor: 'rgba(6, 182, 212, 0.6)', badgeBg: 'rgba(21, 94, 117, 0.3)', accentHex: '#06b6d4' }
  },
  {
    id: 'cyberpunk-neon-lights',
    title: 'Abstract Neon Lights',
    category: 'cyberpunk',
    imageUrl: makeUnsplashUrl('photo-1517999144091-3d9dca6d1e43'),
    artistCredit: 'Unsplash Archive',
    description: 'Streaks of vibrant artificial light blurring across a synthetic landscape.',
    palette: { primary: '#f43f5e', secondary: '#9f1239', glowColor: 'rgba(244, 63, 94, 0.6)', badgeBg: 'rgba(159, 18, 57, 0.3)', accentHex: '#f43f5e' }
  },
  {
    id: 'cyberpunk-gradient-abstract',
    title: 'Gradient Cyberpunk Abstract',
    category: 'cyberpunk',
    imageUrl: makeUnsplashUrl('photo-1579546929518-9e396f3cc809'),
    artistCredit: 'Unsplash Archive',
    description: 'A mesmerizing synthwave gradient representing the data streams of the net.',
    palette: { primary: '#8b5cf6', secondary: '#4c1d95', glowColor: 'rgba(139, 92, 246, 0.6)', badgeBg: 'rgba(76, 29, 149, 0.3)', accentHex: '#8b5cf6' }
  }
];

export function getDailyBackground(userInterests: UserInterest[], offsetDays: number = 0): BackgroundItem {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const validInterests = userInterests.length > 0 ? userInterests : (['doom', 'marvel'] as UserInterest[]);
  const matchingPool = CURATED_BACKGROUNDS.filter(b => validInterests.includes(b.category));
  const pool = matchingPool.length > 0 ? matchingPool : CURATED_BACKGROUNDS;

  return pool[positiveHash % pool.length];
}
