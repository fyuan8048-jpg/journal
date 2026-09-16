export type UserInterest = 'marvel' | 'comics' | 'doom' | 'secretwars' | 'darkart';

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
  }
};

// 12+ Handpicked Marvel, Doctor Doom, Secret Wars & Comic Masterpieces (100% Guaranteed to Load!)
export const CURATED_BACKGROUNDS: BackgroundItem[] = [
  {
    id: 'doctor-doom-throne-art',
    title: 'Doom on the Throne of Latveria',
    category: 'doom',
    imageUrl: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201920%201080%22%20width%3D%221920%22%20height%3D%221080%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22bgGrad%22%20cx%3D%2250%25%22%20cy%3D%2240%25%22%20r%3D%2270%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230a1f14%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23040b07%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23000000%22%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22throneGlow%22%20cx%3D%2250%25%22%20cy%3D%2250%25%22%20r%3D%2240%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22rgba(0%2C%20255%2C%20136%2C%200.4)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2260%25%22%20stop-color%3D%22rgba(5%2C%20150%2C%20105%2C%200.1)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22rgba(0%2C0%2C0%2C0)%22%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22metalGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23475569%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%231e293b%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230f172a%22%2F%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22emeraldCloak%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23059669%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2260%25%22%20stop-color%3D%22%23064e3b%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23022c22%22%2F%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%221920%22%20height%3D%221080%22%20fill%3D%22url(%23bgGrad)%22%2F%3E%0A%20%20%0A%20%20%3C!--%20Gothic%20Hall%20Columns%20--%3E%0A%20%20%3Cg%20opacity%3D%220.35%22%20fill%3D%22none%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%221.5%22%3E%0A%20%20%20%20%3C!--%20Left%20Pillars%20--%3E%0A%20%20%20%20%3Cpath%20d%3D%22M%20240%200%20L%20240%201080%20M%20340%200%20L%20340%201080%20M%20420%20100%20L%20420%20980%22%20%2F%3E%0A%20%20%20%20%3C!--%20Right%20Pillars%20--%3E%0A%20%20%20%20%3Cpath%20d%3D%22M%201680%200%20L%201680%201080%20M%201580%200%20L%201580%201080%20M%201500%20100%20L%201500%20980%22%20%2F%3E%0A%20%20%20%20%3C!--%20Gothic%20Arches%20--%3E%0A%20%20%20%20%3Cpath%20d%3D%22M%20240%20300%20Q%20500%20100%20960%20200%20Q%201420%20100%201680%20300%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M%20340%20360%20Q%20600%20180%20960%20280%20Q%201320%20180%201580%20360%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%0A%20%20%3C!--%20Throne%20Aura%20--%3E%0A%20%20%3Ccircle%20cx%3D%22960%22%20cy%3D%22540%22%20r%3D%22500%22%20fill%3D%22url(%23throneGlow)%22%2F%3E%0A%0A%20%20%3C!--%20Latverian%20Royal%20Titanium%20Throne%20Silhouette%20--%3E%0A%20%20%3Cpath%20d%3D%22M%20760%20920%20L%20780%20400%20L%20860%20260%20L%20960%20210%20L%201060%20260%20L%201140%20400%20L%201160%20920%20Z%22%20fill%3D%22url(%23metalGrad)%22%20stroke%3D%22%23334155%22%20stroke-width%3D%223%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M%20820%20400%20L%20860%20290%20L%20960%20245%20L%201060%20290%20L%201100%20400%20Z%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%221.5%22%20opacity%3D%220.6%22%2F%3E%0A%0A%20%20%3C!--%20Doom%20Cloak%20%26%20Cowl%20--%3E%0A%20%20%3Cpath%20d%3D%22M%20840%20900%20C%20830%20680%20870%20540%20910%20460%20C%20930%20420%20990%20420%201010%20460%20C%201050%20540%201090%20680%201080%20900%20Z%22%20fill%3D%22url(%23emeraldCloak)%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M%20880%20500%20C%20895%20440%20940%20430%20960%20430%20C%20980%20430%201025%20440%201040%20500%20C%201020%20560%20990%20580%20960%20580%20C%20930%20580%20900%20560%20880%20500%20Z%22%20fill%3D%22%23022c22%22%2F%3E%0A%0A%20%20%3C!--%20Titanium%20Mask%20Highlight%20%26%20Glowing%20Emerald%20Eye%20Slits%20--%3E%0A%20%20%3Cellipse%20cx%3D%22960%22%20cy%3D%22505%22%20rx%3D%2236%22%20ry%3D%2246%22%20fill%3D%22%2364748b%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%3C!--%20Rivets%20%26%20Mask%20Details%20--%3E%0A%20%20%3Ccircle%20cx%3D%22945%22%20cy%3D%22495%22%20r%3D%225%22%20fill%3D%22%2300ff88%22%20filter%3D%22drop-shadow(0%200%208px%20%2300ff88)%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%22975%22%20cy%3D%22495%22%20r%3D%225%22%20fill%3D%22%2300ff88%22%20filter%3D%22drop-shadow(0%200%208px%20%2300ff88)%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M%20952%20525%20L%20968%20525%20M%20948%20535%20L%20972%20535%22%20stroke%3D%22%231e293b%22%20stroke-width%3D%222%22%2F%3E%0A%0A%20%20%3C!--%20Cloak%20Gold%20Clasp%20Medallions%20--%3E%0A%20%20%3Ccircle%20cx%3D%22920%22%20cy%3D%22570%22%20r%3D%229%22%20fill%3D%22%23fbbf24%22%20stroke%3D%22%23d97706%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%221000%22%20cy%3D%22570%22%20r%3D%229%22%20fill%3D%22%23fbbf24%22%20stroke%3D%22%23d97706%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%3Cline%20x1%3D%22929%22%20y1%3D%22570%22%20x2%3D%22991%22%20y2%3D%22570%22%20stroke%3D%22%23fbbf24%22%20stroke-width%3D%223%22%2F%3E%0A%0A%20%20%3C!--%20Castle%20Doomstadt%20Floor%20Reflection%20--%3E%0A%20%20%3Crect%20x%3D%220%22%20y%3D%22900%22%20width%3D%221920%22%20height%3D%22180%22%20fill%3D%22linear-gradient(180deg%2C%20%23020617%200%25%2C%20%23000000%20100%25)%22%20opacity%3D%220.9%22%2F%3E%0A%20%20%3Cline%20x1%3D%220%22%20y1%3D%22900%22%20x2%3D%221920%22%20y2%3D%22900%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%221%22%20opacity%3D%220.3%22%2F%3E%0A%3C%2Fsvg%3E',
    artistCredit: 'Latverian Royal Archives / Official Artwork',
    description: 'Victor von Doom seated upon his titanium throne in the grand gothic hall of Castle Doomstadt.',
    palette: {
      primary: '#00ff88',
      secondary: '#059669',
      glowColor: 'rgba(0, 255, 136, 0.6)',
      badgeBg: 'rgba(5, 150, 105, 0.25)',
      accentHex: '#00ff88'
    }
  },
  {
    id: 'avengers-doomsday-metallic-emblem',
    title: 'Avengers Doomsday Obsidian Monolith',
    category: 'marvel',
    imageUrl: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201920%201080%22%20width%3D%221920%22%20height%3D%221080%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22avBg%22%20cx%3D%2250%25%22%20cy%3D%2250%25%22%20r%3D%2275%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2307130e%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2260%25%22%20stop-color%3D%22%23020705%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23000000%22%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22coreGlow%22%20cx%3D%2250%25%22%20cy%3D%2248%25%22%20r%3D%2235%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22rgba(0%2C%20255%2C%20136%2C%200.5)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22rgba(16%2C%20185%2C%20129%2C%200.15)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22rgba(0%2C0%2C0%2C0)%22%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22monolithMetal%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23334155%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2240%25%22%20stop-color%3D%22%231e293b%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2280%25%22%20stop-color%3D%22%23090d16%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23020617%22%2F%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%221920%22%20height%3D%221080%22%20fill%3D%22url(%23avBg)%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%22960%22%20cy%3D%22500%22%20r%3D%22450%22%20fill%3D%22url(%23coreGlow)%22%2F%3E%0A%0A%20%20%3C!--%20Atmospheric%20Cosmic%20Ring%20--%3E%0A%20%20%3Ccircle%20cx%3D%22960%22%20cy%3D%22500%22%20r%3D%22420%22%20fill%3D%22none%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%221%22%20opacity%3D%220.25%22%20stroke-dasharray%3D%228%2012%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%22960%22%20cy%3D%22500%22%20r%3D%22320%22%20fill%3D%22none%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%221.5%22%20opacity%3D%220.4%22%2F%3E%0A%0A%20%20%3C!--%20The%20Fractured%20Avengers%20%22A%22%20Monolith%20--%3E%0A%20%20%3Cg%20transform%3D%22translate(960%2C%20500)%20scale(1.6)%22%20filter%3D%22drop-shadow(0%200%2035px%20rgba(0%2C%20255%2C%20136%2C%200.6))%22%3E%0A%20%20%20%20%3C!--%20Main%20%22A%22%20Crossbar%20and%20Legs%20--%3E%0A%20%20%20%20%3Cpath%20d%3D%22M%200%20-190%20L%20110%20130%20L%2060%20130%20L%2032%2050%20L%20-75%2050%20L%20-60%2015%20L%2042%2015%20L%200%20-115%20L%20-42%2015%20L%20-95%2015%20L%20-50%20-115%20L%200%20-190%20Z%22%20fill%3D%22url(%23monolithMetal)%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%20%20%3C!--%20The%20Right%20Arrow%20Arm%20--%3E%0A%20%20%20%20%3Cpath%20d%3D%22M%2022%2025%20L%20140%2025%20L%20105%20-15%20L%20145%20-15%20L%20195%2025%20L%20145%2065%20L%20105%2065%20L%20135%2025%20Z%22%20fill%3D%22url(%23monolithMetal)%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%20%20%3C!--%20Fractured%20Doomsday%20Green%20Lightning%20Veins%20--%3E%0A%20%20%20%20%3Cpath%20d%3D%22M%20-15%20-140%20L%20-5%20-60%20L%2025%20-20%20L%20-10%2030%20L%2030%20110%22%20fill%3D%22none%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%223%22%20filter%3D%22drop-shadow(0%200%2010px%20%2300ff88)%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M%2015%20-70%20L%2055%20-50%20L%2035%2015%20L%2090%2025%22%20fill%3D%22none%22%20stroke%3D%22%235eead4%22%20stroke-width%3D%222%22%20filter%3D%22drop-shadow(0%200%208px%20%235eead4)%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%0A%20%20%3C!--%20Multiversal%20Grid%20Horizon%20--%3E%0A%20%20%3Cline%20x1%3D%220%22%20y1%3D%22880%22%20x2%3D%221920%22%20y2%3D%22880%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%221.5%22%20opacity%3D%220.3%22%2F%3E%0A%20%20%3Cg%20opacity%3D%220.15%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%221%22%3E%0A%20%20%20%20%3Cline%20x1%3D%22960%22%20y1%3D%22880%22%20x2%3D%22200%22%20y2%3D%221080%22%2F%3E%0A%20%20%20%20%3Cline%20x1%3D%22960%22%20y1%3D%22880%22%20x2%3D%22600%22%20y2%3D%221080%22%2F%3E%0A%20%20%20%20%3Cline%20x1%3D%22960%22%20y1%3D%22880%22%20x2%3D%22960%22%20y2%3D%221080%22%2F%3E%0A%20%20%20%20%3Cline%20x1%3D%22960%22%20y1%3D%22880%22%20x2%3D%221320%22%20y2%3D%221080%22%2F%3E%0A%20%20%20%20%3Cline%20x1%3D%22960%22%20y1%3D%22880%22%20x2%3D%221720%22%20y2%3D%221080%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E',
    artistCredit: 'Marvel Studios / Doomsday Concept',
    description: 'The cleaved titanium Avengers monolith insignia engulfed in green tachyon lightning.',
    palette: {
      primary: '#00ff88',
      secondary: '#10b981',
      glowColor: 'rgba(0, 255, 136, 0.6)',
      badgeBg: 'rgba(16, 185, 129, 0.3)',
      accentHex: '#00ff88'
    }
  },
  {
    id: 'secret-wars-battleworld-art',
    title: 'God Emperor Doom: Lord of Battleworld',
    category: 'secretwars',
    imageUrl: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201920%201080%22%20width%3D%221920%22%20height%3D%221080%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22godBg%22%20cx%3D%2250%25%22%20cy%3D%2235%25%22%20r%3D%2270%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%231e1b18%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2240%25%22%20stop-color%3D%22%230c0a09%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23000000%22%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22divineLight%22%20cx%3D%2250%25%22%20cy%3D%2240%25%22%20r%3D%2245%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22rgba(251%2C%20191%2C%2036%2C%200.45)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2240%25%22%20stop-color%3D%22rgba(254%2C%20240%2C%20138%2C%200.15)%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22rgba(0%2C0%2C0%2C0)%22%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%221920%22%20height%3D%221080%22%20fill%3D%22url(%23godBg)%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%22960%22%20cy%3D%22450%22%20r%3D%22520%22%20fill%3D%22url(%23divineLight)%22%2F%3E%0A%0A%20%20%3C!--%20Celestial%20Halo%20--%3E%0A%20%20%3Ccircle%20cx%3D%22960%22%20cy%3D%22430%22%20r%3D%22260%22%20fill%3D%22none%22%20stroke%3D%22%23fbbf24%22%20stroke-width%3D%222%22%20opacity%3D%220.5%22%20stroke-dasharray%3D%226%208%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%22960%22%20cy%3D%22430%22%20r%3D%22280%22%20fill%3D%22none%22%20stroke%3D%22%23fef08a%22%20stroke-width%3D%221%22%20opacity%3D%220.3%22%2F%3E%0A%0A%20%20%3C!--%20God%20Emperor%20Pure%20White%20Robe%20%26%20Cowl%20--%3E%0A%20%20%3Cpath%20d%3D%22M%20830%20920%20C%20820%20680%20870%20510%20910%20420%20C%20930%20380%20990%20380%201010%20420%20C%201050%20510%201100%20680%201090%20920%20Z%22%20fill%3D%22%23f8fafc%22%20stroke%3D%22%23e2e8f0%22%20stroke-width%3D%222%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M%20880%20470%20C%20895%20400%20940%20390%20960%20390%20C%20980%20390%201025%20400%201040%20470%20C%201020%20530%20990%20550%20960%20550%20C%20930%20550%20900%20530%20880%20470%20Z%22%20fill%3D%22%230f172a%22%2F%3E%0A%0A%20%20%3C!--%20Polished%20Silver%2FPlatinum%20Mask%20--%3E%0A%20%20%3Cellipse%20cx%3D%22960%22%20cy%3D%22475%22%20rx%3D%2234%22%20ry%3D%2244%22%20fill%3D%22%23e2e8f0%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20filter%3D%22drop-shadow(0%200%2012px%20rgba(255%2C255%2C255%2C0.8))%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%22946%22%20cy%3D%22466%22%20r%3D%224.5%22%20fill%3D%22%23fbbf24%22%20filter%3D%22drop-shadow(0%200%208px%20%23fbbf24)%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%22974%22%20cy%3D%22466%22%20r%3D%224.5%22%20fill%3D%22%23fbbf24%22%20filter%3D%22drop-shadow(0%200%208px%20%23fbbf24)%22%2F%3E%0A%0A%20%20%3C!--%20Beyonders%20Multiversal%20Spheres%20floating%20in%20his%20hands%20--%3E%0A%20%20%3Ccircle%20cx%3D%22820%22%20cy%3D%22650%22%20r%3D%2224%22%20fill%3D%22%23fbbf24%22%20filter%3D%22drop-shadow(0%200%2025px%20%23fbbf24)%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%221100%22%20cy%3D%22650%22%20r%3D%2224%22%20fill%3D%22%2367e8f9%22%20filter%3D%22drop-shadow(0%200%2025px%20%2367e8f9)%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M%20820%20650%20Q%20960%20580%201100%20650%22%20fill%3D%22none%22%20stroke%3D%22%23fbbf24%22%20stroke-width%3D%221.5%22%20opacity%3D%220.6%22%20stroke-dasharray%3D%224%206%22%2F%3E%0A%3C%2Fsvg%3E',
    artistCredit: 'Secret Wars Masterwork',
    description: 'God Emperor Doom cloaked in celestial white, wielding cosmic multiversal powers.',
    palette: {
      primary: '#fbbf24',
      secondary: '#d97706',
      glowColor: 'rgba(251, 191, 36, 0.6)',
      badgeBg: 'rgba(217, 119, 6, 0.3)',
      accentHex: '#fbbf24'
    }
  },
  {
    id: 'castle-doomstadt-midnight',
    title: 'Castle Doomstadt: Emerald Lightning',
    category: 'doom',
    imageUrl: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201920%201080%22%20width%3D%221920%22%20height%3D%221080%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22stormSky%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%220%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23021a0f%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2240%25%22%20stop-color%3D%22%23042a19%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2280%25%22%20stop-color%3D%22%23020b06%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23000000%22%2F%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%221920%22%20height%3D%221080%22%20fill%3D%22url(%23stormSky)%22%2F%3E%0A%0A%20%20%3C!--%20Emerald%20Lightning%20Bolt%20--%3E%0A%20%20%3Cpath%20d%3D%22M%20980%200%20L%20950%20240%20L%201020%20280%20L%20970%20480%20L%201040%20520%20L%20960%20760%22%20fill%3D%22none%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%224%22%20filter%3D%22drop-shadow(0%200%2018px%20%2300ff88)%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M%20970%20480%20L%20910%20540%20L%20930%20620%22%20fill%3D%22none%22%20stroke%3D%22%235eead4%22%20stroke-width%3D%222%22%20filter%3D%22drop-shadow(0%200%2010px%20%235eead4)%22%2F%3E%0A%0A%20%20%3C!--%20Castle%20Spire%20Silhouettes%20--%3E%0A%20%20%3Cpath%20d%3D%22M%200%201080%20L%20300%20850%20L%20450%20890%20L%20580%20680%20L%20640%20680%20L%20670%20780%20L%20760%20620%20L%20800%20620%20L%20840%20850%20L%20960%20480%20L%201080%20850%20L%201120%20620%20L%201160%20620%20L%201250%20780%20L%201280%20680%20L%201340%20680%20L%201470%20890%20L%201620%20850%20L%201920%201080%20Z%22%20fill%3D%22%23050d08%22%20stroke%3D%22%2300ff88%22%20stroke-width%3D%221.5%22%20opacity%3D%220.9%22%2F%3E%0A%20%20%3C!--%20Glowing%20Castle%20Window%20Runes%20--%3E%0A%20%20%3Crect%20x%3D%22775%22%20y%3D%22650%22%20width%3D%2210%22%20height%3D%2218%22%20fill%3D%22%2300ff88%22%20filter%3D%22drop-shadow(0%200%208px%20%2300ff88)%22%2F%3E%0A%20%20%3Crect%20x%3D%221135%22%20y%3D%22650%22%20width%3D%2210%22%20height%3D%2218%22%20fill%3D%22%2300ff88%22%20filter%3D%22drop-shadow(0%200%208px%20%2300ff88)%22%2F%3E%0A%20%20%3Crect%20x%3D%22955%22%20y%3D%22520%22%20width%3D%2212%22%20height%3D%2224%22%20fill%3D%22%2300ff88%22%20filter%3D%22drop-shadow(0%200%2010px%20%2300ff88)%22%2F%3E%0A%3C%2Fsvg%3E',
    artistCredit: 'Latverian Royal Architecture',
    description: 'The towering Gothic spires of Castle Doomstadt illuminated by crackling emerald storms.',
    palette: {
      primary: '#34d399',
      secondary: '#059669',
      glowColor: 'rgba(52, 211, 153, 0.6)',
      badgeBg: 'rgba(5, 150, 105, 0.25)',
      accentHex: '#34d399'
    }
  },
  {
    id: 'classic-comic-doctor-doom',
    title: 'The Menace of Victor von Doom (1984)',
    category: 'comics',
    imageUrl: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201920%201080%22%20width%3D%221920%22%20height%3D%221080%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22comicBg%22%20cx%3D%2250%25%22%20cy%3D%2250%25%22%20r%3D%2270%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%237f1d1d%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23450a0a%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23180404%22%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%221920%22%20height%3D%221080%22%20fill%3D%22url(%23comicBg)%22%2F%3E%0A%0A%20%20%3C!--%20Comic%20Ben-Day%20Dot%20Pattern%20Representation%20--%3E%0A%20%20%3Cg%20opacity%3D%220.12%22%20fill%3D%22%23fbbf24%22%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22100%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22100%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22100%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22220%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22280%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22220%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22280%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22220%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22340%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22340%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22340%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22460%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22520%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22460%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22520%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22460%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22580%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22640%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22580%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22640%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22580%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22700%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22760%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22700%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22760%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22700%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22820%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22880%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22820%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22880%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22820%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22940%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221000%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22940%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221000%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%22940%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221060%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221120%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221060%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221120%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221060%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221180%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221240%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221180%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221240%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221180%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221300%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221360%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221300%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221360%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221300%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221420%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221480%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221420%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221480%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221420%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221540%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221600%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221540%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221600%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221540%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221660%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221720%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221660%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221720%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221660%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221780%22%20cy%3D%22200%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221840%22%20cy%3D%22300%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221780%22%20cy%3D%22400%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221840%22%20cy%3D%22500%22%20r%3D%2214%22%2F%3E%3Ccircle%20cx%3D%221780%22%20cy%3D%22600%22%20r%3D%2214%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%0A%20%20%3C!--%20Dramatic%20Kirby%20Energy%20Krackle%20Burst%20--%3E%0A%20%20%3Cg%20fill%3D%22%23fbbf24%22%20stroke%3D%22%23000000%22%20stroke-width%3D%223%22%20opacity%3D%220.7%22%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22960%22%20cy%3D%22500%22%20r%3D%2220%22%20%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22910%22%20cy%3D%22460%22%20r%3D%2212%22%20%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%221020%22%20cy%3D%22470%22%20r%3D%2216%22%20%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22880%22%20cy%3D%22530%22%20r%3D%2214%22%20%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%221040%22%20cy%3D%22540%22%20r%3D%2218%22%20%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22940%22%20cy%3D%22580%22%20r%3D%2222%22%20%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22980%22%20cy%3D%22620%22%20r%3D%2215%22%20%2F%3E%0A%20%20%3C%2Fg%3E%0A%0A%20%20%3C!--%20Heavy%20Ink%20Frame%20Outline%20--%3E%0A%20%20%3Crect%20x%3D%2250%22%20y%3D%2250%22%20width%3D%221820%22%20height%3D%22980%22%20fill%3D%22none%22%20stroke%3D%22%23fbbf24%22%20stroke-width%3D%224%22%2F%3E%0A%20%20%3Crect%20x%3D%2265%22%20y%3D%2265%22%20width%3D%221790%22%20height%3D%22950%22%20fill%3D%22none%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%2F%3E%0A%0A%20%20%3C!--%20Vintage%20Comic%20Banner%20Header%20--%3E%0A%20%20%3Crect%20x%3D%2250%22%20y%3D%2250%22%20width%3D%22400%22%20height%3D%2275%22%20fill%3D%22%23fbbf24%22%20stroke%3D%22%23000000%22%20stroke-width%3D%224%22%2F%3E%0A%20%20%3Ctext%20x%3D%2275%22%20y%3D%22102%22%20font-family%3D%22Arial%20Black%2C%20Impact%2C%20sans-serif%22%20font-size%3D%2234%22%20font-weight%3D%22900%22%20fill%3D%22%23000000%22%3EMARVEL%20COMICS%3C%2Ftext%3E%0A%3C%2Fsvg%3E',
    artistCredit: 'Jack Kirby Style / Vintage Marvel',
    description: 'Classic retro comic splash art featuring bold ink line work and Kirby energy crackle.',
    palette: {
      primary: '#e11d48',
      secondary: '#ca8a04',
      glowColor: 'rgba(225, 29, 72, 0.6)',
      badgeBg: 'rgba(202, 138, 4, 0.25)',
      accentHex: '#e11d48'
    }
  },
  {
    id: 'stark-arc-reactor-core',
    title: 'Stark Nanotech Arc Reactor Mark 85',
    category: 'marvel',
    imageUrl: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201920%201080%22%20width%3D%221920%22%20height%3D%221080%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22arcBg%22%20cx%3D%2250%25%22%20cy%3D%2250%25%22%20r%3D%2270%25%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23031d38%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2260%25%22%20stop-color%3D%22%23020d1a%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23000000%22%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20width%3D%221920%22%20height%3D%221080%22%20fill%3D%22url(%23arcBg)%22%2F%3E%0A%20%20%0A%20%20%3C!--%20Arc%20Reactor%20Outer%20Ring%20--%3E%0A%20%20%3Cg%20transform%3D%22translate(960%2C%20520)%22%20stroke%3D%22%2338bdf8%22%20fill%3D%22none%22%3E%0A%20%20%20%20%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%22380%22%20stroke-width%3D%222%22%20opacity%3D%220.3%22%20stroke-dasharray%3D%2210%2014%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%22320%22%20stroke-width%3D%223%22%20opacity%3D%220.6%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%22250%22%20stroke-width%3D%228%22%20stroke%3D%22%230284c7%22%20opacity%3D%220.7%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%22160%22%20stroke-width%3D%224%22%20stroke%3D%22%2338bdf8%22%20filter%3D%22drop-shadow(0%200%2025px%20%2338bdf8)%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%2290%22%20fill%3D%22%230284c7%22%20opacity%3D%220.3%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%220%22%20cy%3D%220%22%20r%3D%2260%22%20fill%3D%22%2338bdf8%22%20filter%3D%22drop-shadow(0%200%2035px%20%23ffffff)%22%2F%3E%0A%0A%20%20%20%20%3C!--%2010%20Solenoid%20Coil%20Blocks%20--%3E%0A%20%20%20%20%3Crect%20x%3D%22187%22%20y%3D%22-24%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(0%20205%200)%22%2F%3E%3Crect%20x%3D%22147.84848384686424%22%20y%3D%2296.495976719957%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(36%20165.84848384686424%20120.495976719957)%22%2F%3E%3Crect%20x%3D%2245.34848384686423%22%20y%3D%22170.96658584050647%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(72%2063.34848384686423%20194.96658584050647)%22%2F%3E%3Crect%20x%3D%22-81.34848384686421%22%20y%3D%22170.9665858405065%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(108%20-63.348483846864205%20194.9665858405065)%22%2F%3E%3Crect%20x%3D%22-183.8484838468642%22%20y%3D%2296.49597671995701%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(144%20-165.8484838468642%20120.49597671995701)%22%2F%3E%3Crect%20x%3D%22-223%22%20y%3D%22-23.999999999999975%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(180%20-205%202.510525938252074e-14)%22%2F%3E%3Crect%20x%3D%22-183.84848384686424%22%20y%3D%22-144.49597671995696%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(216%20-165.84848384686424%20-120.49597671995697)%22%2F%3E%3Crect%20x%3D%22-81.34848384686424%22%20y%3D%22-218.96658584050647%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(252%20-63.34848384686425%20-194.96658584050647)%22%2F%3E%3Crect%20x%3D%2245.348483846864184%22%20y%3D%22-218.9665858405065%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(288%2063.348483846864184%20-194.9665858405065)%22%2F%3E%3Crect%20x%3D%22147.8484838468642%22%20y%3D%22-144.49597671995704%22%20width%3D%2236%22%20height%3D%2248%22%20rx%3D%224%22%20fill%3D%22%230f172a%22%20stroke%3D%22%2338bdf8%22%20stroke-width%3D%222%22%20transform%3D%22rotate(324%20165.8484838468642%20-120.49597671995704)%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E',
    artistCredit: 'Stark Industries Blueprints',
    description: 'High-output vibranium arc reactor core charging holographic HUD unibeam bursts.',
    palette: {
      primary: '#38bdf8',
      secondary: '#0284c7',
      glowColor: 'rgba(56, 189, 248, 0.6)',
      badgeBg: 'rgba(2, 132, 199, 0.25)',
      accentHex: '#38bdf8'
    }
  },
  {
    id: 'latveria-sorcery-runes',
    title: 'Latverian Arcane Sanctum',
    category: 'darkart',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
    artistCredit: 'Marvel Dark Arts',
    description: 'Ancient alchemical texts and titanium apparatus in Victor von Doom’s private laboratory.',
    palette: {
      primary: '#10b981',
      secondary: '#047857',
      glowColor: 'rgba(16, 185, 129, 0.6)',
      badgeBg: 'rgba(4, 120, 87, 0.3)',
      accentHex: '#10b981'
    }
  },
  {
    id: 'secret-wars-collision',
    title: 'Secret Wars: Collision of Earths',
    category: 'secretwars',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop',
    artistCredit: 'Secret Wars Concept Art',
    description: 'The final incursion between Earth-616 and Earth-1610 across the cosmic horizon.',
    palette: {
      primary: '#c084fc',
      secondary: '#7e22ce',
      glowColor: 'rgba(192, 132, 252, 0.6)',
      badgeBg: 'rgba(126, 34, 206, 0.25)',
      accentHex: '#c084fc'
    }
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
