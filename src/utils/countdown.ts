export interface TimeRemaining {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isComplete: boolean;
}

export interface CountdownNote {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type ShadowStyleType = 'deep' | 'halo' | 'hard' | 'ambient' | 'none';

export interface ClockCustomSettings {
  primaryColor: string;
  glowColor: string;
  brightness: number;     // 0.0 to 4.0
  scale: number;          // 0.6 to 1.6
  transparency: number;   // 0.05 to 1.0
  fontFamily: string;     // 'Orbitron' | 'Cinzel' | 'Montserrat' | 'Rajdhani' | 'Share Tech Mono'
  // Shadow Effects Controls
  shadowStyle?: ShadowStyleType; // 'deep' | 'halo' | 'hard' | 'ambient' | 'none'
  shadowBlur?: number;           // 0 to 40 px
  shadowOpacity?: number;        // 0.0 to 1.0
  // Title & Header Customization Controls
  titleScale?: number;         // 0.5 to 2.2
  titleBrightness?: number;    // 0.0 to 4.0
  titleTransparency?: number;  // 0.05 to 1.0
  titleColor?: string;         // custom hex or empty
  titleFontFamily?: string;    // specific font for title
}

export const DEFAULT_CLOCK_CUSTOM_SETTINGS: ClockCustomSettings = {
  primaryColor: '#00ff88',
  glowColor: 'rgba(0, 255, 136, 0.8)',
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
};

export interface CountdownEvent {
  id: string;
  title: string;
  subtitle: string;
  targetDate: string; // ISO string e.g. "2026-12-18T00:00:00"
  category: 'marvel' | 'gaming' | 'scifi' | 'personal' | 'holiday';
  customBackground?: string;
  themePreset?: string;
  notes?: CountdownNote[];
}

export const DEFAULT_COUNTDOWN_EVENTS: CountdownEvent[] = [
  {
    id: 'doomsday',
    title: 'AVENGERS: DOOMSDAY',
    subtitle: 'THE DOOMSDAY CLOCK IS TICKING • IN THEATERS WORLDWIDE',
    targetDate: '2026-12-18T00:00:00',
    category: 'marvel',
    themePreset: 'doomsday',
    notes: [
      { id: 'n1', text: 'Book opening night IMAX 70mm tickets', completed: false, createdAt: Date.now() - 3600000 },
      { id: 'n2', text: 'Rewatch Avengers: Infinity War and Endgame', completed: true, createdAt: Date.now() - 7200000 },
      { id: 'n3', text: 'Read Jonathan Hickman Secret Wars run', completed: false, createdAt: Date.now() - 10800000 },
    ]
  },
  {
    id: 'secret-wars',
    title: 'AVENGERS: SECRET WARS',
    subtitle: 'THE MULTIVERSE COLLIDES • THE FINAL BATTLE',
    targetDate: '2027-05-07T00:00:00',
    category: 'marvel',
    themePreset: 'quantum',
    notes: [
      { id: 'n4', text: 'Track trailer and San Diego Comic-Con reveals', completed: false, createdAt: Date.now() - 5000000 },
    ]
  },
  {
    id: 'new-year-2027',
    title: 'NEW YEAR 2027',
    subtitle: 'ENTERING THE NEXT SOLAR CYCLE',
    targetDate: '2027-01-01T00:00:00',
    category: 'holiday',
    themePreset: 'stark',
    notes: [
      { id: 'n5', text: 'Review 2026 milestones and set new vision', completed: false, createdAt: Date.now() - 2000000 },
    ]
  }
];

/**
 * Calculates the exact remaining time breakdown in Years, Months, Days, Hours, Minutes, Seconds.
 * Accounts for leap years and calendar days.
 */
export function calculateTimeRemaining(targetIso: string, includeYears: boolean = true): TimeRemaining {
  const target = new Date(targetIso).getTime();
  const now = new Date().getTime();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isComplete: true,
    };
  }

  const currentDate = new Date(now);
  const targetDate = new Date(target);

  let years = 0;
  let months = 0;

  if (includeYears) {
    years = targetDate.getFullYear() - currentDate.getFullYear();
    const tempDate = new Date(currentDate);
    tempDate.setFullYear(tempDate.getFullYear() + years);

    if (tempDate > targetDate) {
      years--;
      tempDate.setFullYear(currentDate.getFullYear() + years);
    }

    currentDate.setFullYear(currentDate.getFullYear() + years);
  }

  // Calculate remaining months
  while (true) {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= targetDate) {
      months++;
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      break;
    }
  }

  // Remaining days, hours, mins, secs
  const remainingDiffMs = targetDate.getTime() - currentDate.getTime();
  const days = Math.floor(remainingDiffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingDiffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remainingDiffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((remainingDiffMs / 1000) % 60);

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(diffMs / 1000),
    isComplete: false,
  };
}

export function padZero(num: number, digits: number = 2): string {
  return num.toString().padStart(digits, '0');
}
