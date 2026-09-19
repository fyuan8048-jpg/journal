// Dynamic Web Artwork Discovery Engine
// Fetches high-definition artworks from the Unsplash API matching countdown themes
// Falls back to curated library when API is unavailable

import type { BackgroundItem, UserInterest } from '../data/curatedBackgrounds';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_API = 'https://api.unsplash.com';

// Cache to avoid redundant API calls within a session
const searchCache = new Map<string, BackgroundItem[]>();

// Color palette templates by mood
const PALETTE_TEMPLATES: Record<string, BackgroundItem['palette']> = {
  dark: { primary: '#00ff88', secondary: '#059669', glowColor: 'rgba(0, 255, 136, 0.6)', badgeBg: 'rgba(5, 150, 105, 0.25)', accentHex: '#00ff88' },
  warm: { primary: '#f59e0b', secondary: '#d97706', glowColor: 'rgba(245, 158, 11, 0.6)', badgeBg: 'rgba(217, 119, 6, 0.25)', accentHex: '#f59e0b' },
  cool: { primary: '#38bdf8', secondary: '#0284c7', glowColor: 'rgba(56, 189, 248, 0.6)', badgeBg: 'rgba(2, 132, 199, 0.3)', accentHex: '#38bdf8' },
  cosmic: { primary: '#a78bfa', secondary: '#7c3aed', glowColor: 'rgba(167, 139, 250, 0.6)', badgeBg: 'rgba(124, 58, 237, 0.25)', accentHex: '#a78bfa' },
  red: { primary: '#ef4444', secondary: '#b91c1c', glowColor: 'rgba(239, 68, 68, 0.6)', badgeBg: 'rgba(185, 28, 28, 0.25)', accentHex: '#ef4444' },
  neon: { primary: '#ec4899', secondary: '#be185d', glowColor: 'rgba(236, 72, 153, 0.6)', badgeBg: 'rgba(190, 24, 93, 0.25)', accentHex: '#ec4899' },
  emerald: { primary: '#10b981', secondary: '#047857', glowColor: 'rgba(16, 185, 129, 0.6)', badgeBg: 'rgba(4, 120, 87, 0.3)', accentHex: '#10b981' },
};

function guessPalette(query: string): BackgroundItem['palette'] {
  const q = query.toLowerCase();
  if (q.includes('doom') || q.includes('gothic') || q.includes('dark') || q.includes('castle')) return PALETTE_TEMPLATES.dark;
  if (q.includes('fire') || q.includes('sunset') || q.includes('gold') || q.includes('warm')) return PALETTE_TEMPLATES.warm;
  if (q.includes('ice') || q.includes('frost') || q.includes('ocean') || q.includes('water')) return PALETTE_TEMPLATES.cool;
  if (q.includes('space') || q.includes('galaxy') || q.includes('nebula') || q.includes('cosmic')) return PALETTE_TEMPLATES.cosmic;
  if (q.includes('blood') || q.includes('war') || q.includes('battle') || q.includes('crimson')) return PALETTE_TEMPLATES.red;
  if (q.includes('neon') || q.includes('cyber') || q.includes('punk') || q.includes('city')) return PALETTE_TEMPLATES.neon;
  return PALETTE_TEMPLATES.emerald;
}

function guessCategory(query: string): UserInterest {
  const q = query.toLowerCase();
  if (q.includes('doom') || q.includes('latveria') || q.includes('victor')) return 'doom';
  if (q.includes('marvel') || q.includes('avenger') || q.includes('iron') || q.includes('hero')) return 'marvel';
  if (q.includes('secret') || q.includes('war') || q.includes('battleworld')) return 'secretwars';
  if (q.includes('comic') || q.includes('vintage') || q.includes('retro')) return 'comics';
  if (q.includes('cyber') || q.includes('neon') || q.includes('future') || q.includes('sci-fi')) return 'cyberpunk';
  if (q.includes('dark') || q.includes('magic') || q.includes('sorcery') || q.includes('mystic')) return 'darkart';
  return 'marvel';
}

/**
 * Build an intelligent search query from a countdown title + category
 */
export function buildSearchQuery(title: string, category: string): string {
  const titleWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const categoryMap: Record<string, string> = {
    marvel: 'cinematic dark epic superhero',
    gaming: 'gaming digital art fantasy',
    scifi: 'science fiction futuristic space',
    personal: 'aesthetic wallpaper beautiful landscape',
    holiday: 'celebration festive lights',
  };
  const categoryKeywords = categoryMap[category] || 'cinematic dark art';
  return `${titleWords} ${categoryKeywords}`.trim();
}

/**
 * Fetch artworks from Unsplash API based on a search query
 */
export async function fetchArtworksFromWeb(query: string, count: number = 10): Promise<BackgroundItem[]> {
  const cacheKey = `${query}_${count}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  if (UNSPLASH_ACCESS_KEY) {
    try {
      const params = new URLSearchParams({
        query,
        per_page: String(count),
        orientation: 'landscape',
        content_filter: 'high',
      });

      const response = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const results: BackgroundItem[] = data.results.map((photo: {
          id: string;
          description?: string;
          alt_description?: string;
          urls: { regular: string; full: string };
          user: { name: string };
        }) => ({
          id: `unsplash_${photo.id}`,
          title: photo.description || photo.alt_description || query,
          category: guessCategory(query),
          imageUrl: photo.urls.regular,
          artistCredit: `Photo by ${photo.user.name} on Unsplash`,
          description: photo.alt_description || `Artwork matching "${query}"`,
          palette: guessPalette(query),
        }));

        searchCache.set(cacheKey, results);
        return results;
      }
    } catch (e) {
      console.warn('Unsplash API fetch failed, falling back to curated library:', e);
    }
  }

  return fetchWebArtworksByInterest(query);
}

/**
 * Fetch artworks for a countdown timer based on its title + category
 */
export async function fetchArtworksForCountdown(title: string, category: string): Promise<BackgroundItem[]> {
  const query = buildSearchQuery(title, category);
  return fetchArtworksFromWeb(query, 12);
}

// --- STATIC FALLBACK LIBRARY ---

const CURATED_WEB_LIBRARY: Record<string, Omit<BackgroundItem, 'category'>[]> = {
  doom: [
    {
      id: 'web_doom_throne_1',
      title: 'Gothic Cathedral of Dark Power',
      imageUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Gothic Architecture Photography',
      description: 'Dark gothic cathedral interior radiating with ominous emerald energy.',
      palette: PALETTE_TEMPLATES.dark,
    },
    {
      id: 'web_doom_castle_2',
      title: 'Fortress of Shadows at Midnight',
      imageUrl: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Castle Photography',
      description: 'Ancient castle fortress silhouetted against a foreboding night sky.',
      palette: PALETTE_TEMPLATES.dark,
    },
    {
      id: 'web_doom_emerald_3',
      title: 'Emerald Aurora of Latverian Sorcery',
      imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Aurora Photography',
      description: 'Green aurora borealis cascading across the frozen northern sky.',
      palette: PALETTE_TEMPLATES.emerald,
    },
  ],
  marvel: [
    {
      id: 'web_marvel_storm_1',
      title: 'Doomsday Lightning Storm',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Storm Photography',
      description: 'Apocalyptic lightning storm splitting the dark sky with raw cosmic power.',
      palette: PALETTE_TEMPLATES.cool,
    },
    {
      id: 'web_marvel_nebula_2',
      title: 'Multiversal Incursion Nebula',
      imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'NASA / Space Photography',
      description: 'Deep space nebula as two multiversal incursion points converge.',
      palette: PALETTE_TEMPLATES.cosmic,
    },
    {
      id: 'web_marvel_earth_3',
      title: 'Earth-616 from the Quantum Realm',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'NASA Earth Observatory',
      description: 'Planet Earth glowing in the darkness of space.',
      palette: PALETTE_TEMPLATES.cool,
    },
  ],
  comics: [
    {
      id: 'web_comic_abstract_1',
      title: 'Pop Art Explosion',
      imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Abstract Art Photography',
      description: 'Bold abstract pop art colors reminiscent of classic comic splash pages.',
      palette: PALETTE_TEMPLATES.red,
    },
    {
      id: 'web_comic_fluid_2',
      title: 'Ink Flow: Comic Book Genesis',
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Fluid Art Photography',
      description: 'Vivid fluid art swirls reminiscent of cosmic comic book energy blasts.',
      palette: PALETTE_TEMPLATES.neon,
    },
  ],
  secretwars: [
    {
      id: 'web_sw_galaxy_1',
      title: 'Battleworld: Fragmented Galaxy',
      imageUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Galaxy Photography',
      description: 'A swirling galaxy representing fractured remains of Battleworld.',
      palette: PALETTE_TEMPLATES.cosmic,
    },
    {
      id: 'web_sw_planet_2',
      title: "The Beyonder's Domain",
      imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'NASA / Planetary Science',
      description: 'A lone planet orbiting in the void between collapsed multiversal realms.',
      palette: PALETTE_TEMPLATES.cool,
    },
  ],
  darkart: [
    {
      id: 'web_dark_forest_1',
      title: 'Sanctum of the Darkhold',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Dark Forest Photography',
      description: 'An ancient dark forest where the Darkhold grimoire was first inscribed.',
      palette: PALETTE_TEMPLATES.dark,
    },
  ],
  cyberpunk: [
    {
      id: 'web_cyber_city_1',
      title: 'Neo-Latveria 2099',
      imageUrl: 'https://images.unsplash.com/photo-1515705576963-95cad62945b6?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Night City Photography',
      description: 'Towering neon-drenched skyscrapers of Neo-Latveria in the year 2099.',
      palette: PALETTE_TEMPLATES.neon,
    },
    {
      id: 'web_cyber_neon_2',
      title: 'Holographic Data Grid',
      imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1920&auto=format&fit=crop',
      artistCredit: 'Digital Art',
      description: 'A pulsing gradient field of holographic data cascading through cyberspace.',
      palette: PALETTE_TEMPLATES.neon,
    },
  ],
};

/**
 * Searches the static curated library based on keyword matching
 */
export function fetchWebArtworksByInterest(interestQuery: string): BackgroundItem[] {
  const q = interestQuery.toLowerCase().trim();
  let matchedKeys: string[] = [];

  if (q.includes('doom') || q.includes('latveria') || q.includes('victor') || q.includes('gothic') || q.includes('castle')) {
    matchedKeys.push('doom');
  }
  if (q.includes('marvel') || q.includes('avenger') || q.includes('doomsday') || q.includes('mcu') || q.includes('iron') || q.includes('stark') || q.includes('hero')) {
    matchedKeys.push('marvel');
  }
  if (q.includes('comic') || q.includes('secret') || q.includes('war') || q.includes('kirby') || q.includes('cover') || q.includes('art')) {
    matchedKeys.push('comics');
  }
  if (q.includes('cyber') || q.includes('neon') || q.includes('city') || q.includes('future') || q.includes('sci') || q.includes('tech')) {
    matchedKeys.push('cyberpunk');
  }
  if (q.includes('dark') || q.includes('magic') || q.includes('rune') || q.includes('sorcery') || q.includes('mystic')) {
    matchedKeys.push('darkart');
  }
  if (q.includes('secret') || q.includes('battleworld') || q.includes('space') || q.includes('galaxy') || q.includes('cosmic')) {
    matchedKeys.push('secretwars');
  }

  if (matchedKeys.length === 0) {
    matchedKeys = ['doom', 'marvel', 'comics'];
  }

  const results: BackgroundItem[] = [];
  const seen = new Set<string>();
  matchedKeys.forEach(k => {
    const list = CURATED_WEB_LIBRARY[k] || [];
    list.forEach(item => {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        results.push({ ...item, category: guessCategory(k) });
      }
    });
  });

  return results;
}
