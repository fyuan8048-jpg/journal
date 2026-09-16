import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserInterest } from '../data/curatedBackgrounds';
import type { ClockStylePreset } from '../utils/themeAdapter';
import type { SoundEffectType } from '../audio/soundEngine';
import {
  type CountdownEvent,
  type CountdownNote,
  type ClockCustomSettings,
  DEFAULT_COUNTDOWN_EVENTS,
  DEFAULT_CLOCK_CUSTOM_SETTINGS,
} from '../utils/countdown';

export interface UserCustomImage {
  id: string;
  name: string;
  url: string; // URL or Base64 data URL
  collectionName: string;
  addedAt: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  avatar: string;
  createdAt: number;
  preferences: {
    interests: UserInterest[];
    activeCountdownId: string;
    includeYears: boolean;
    clockPreset: ClockStylePreset;
    soundType: SoundEffectType;
    isMuted: boolean;
    volume: number;
    ambientDrone: boolean;
    enable3d: boolean;
    customImages: UserCustomImage[];
    customCountdowns: CountdownEvent[];
    activeBackgroundId?: string;
    activeCustomImageUrl?: string;
    clockCustomSettings?: ClockCustomSettings;
  };
}

interface AuthContextType {
  currentUser: UserProfile | null;
  usersList: UserProfile[];
  login: (emailOrUsername: string, password?: string) => { success: boolean; error?: string };
  signup: (email: string, password: string, username: string, avatar?: string) => { success: boolean; error?: string };
  logout: () => void;
  updatePreferences: (partial: Partial<UserProfile['preferences']>) => void;
  addCustomImage: (img: Omit<UserCustomImage, 'id' | 'addedAt'>) => void;
  removeCustomImage: (id: string) => void;
  addCustomCountdown: (event: CountdownEvent) => void;
  updateCountdown: (event: CountdownEvent) => void;
  deleteCountdown: (id: string) => void;
  removeCustomCountdown: (id: string) => void;
  updateCountdownNotes: (countdownId: string, notes: CountdownNote[]) => void;
  updateClockCustomSettings: (settings: ClockCustomSettings) => void;
}

const STORAGE_KEY_USERS = 'avengers_doomsday_clock_users_v2';
const STORAGE_KEY_CURRENT = 'avengers_doomsday_clock_current_user_v2';

const DEFAULT_AVATARS = [
  '🛡️', '⚡', '👑', '👁️', '🪐', '🔮', '🤖', '💀', '🌌'
];

export function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return 'h_' + (hash >>> 0).toString(16);
}

const DEFAULT_GUEST: UserProfile = {
  id: 'guest',
  username: 'Agent of Doom',
  email: 'guest@latveria.gov',
  avatar: '👑',
  createdAt: Date.now(),
  preferences: {
    interests: ['doom', 'marvel'],
    activeCountdownId: 'doomsday',
    includeYears: true,
    clockPreset: 'doomsday',
    soundType: 'doomsday',
    isMuted: false,
    volume: 0.6,
    ambientDrone: false,
    enable3d: true,
    customImages: [
      {
        id: 'sample_doom_1',
        name: 'Doctor Doom: Master of Science & Sorcery',
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=2000&auto=format&fit=crop',
        collectionName: 'Latverian Royalty',
        addedAt: Date.now() - 100000,
      },
      {
        id: 'sample_doom_2',
        name: 'Avengers: Doomsday Battle Monolith',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
        collectionName: 'Multiverse Incursions',
        addedAt: Date.now() - 50000,
      }
    ],
    customCountdowns: DEFAULT_COUNTDOWN_EVENTS,
    clockCustomSettings: DEFAULT_CLOCK_CUSTOM_SETTINGS,
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (savedCurrent) {
        const parsed = JSON.parse(savedCurrent);
        if (!parsed.preferences) {
          parsed.preferences = { ...DEFAULT_GUEST.preferences };
        }
        if (!parsed.preferences.customImages) {
          parsed.preferences.customImages = DEFAULT_GUEST.preferences.customImages;
        }
        if (!parsed.preferences.customCountdowns) {
          parsed.preferences.customCountdowns = DEFAULT_GUEST.preferences.customCountdowns;
        }
        if (!parsed.preferences.clockCustomSettings) {
          parsed.preferences.clockCustomSettings = DEFAULT_CLOCK_CUSTOM_SETTINGS;
        }
        if (!parsed.email) {
          parsed.email = 'agent@latveria.com';
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_GUEST;
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        return parsed.map(u => ({
          ...u,
          email: u.email || 'agent@latveria.com',
        }));
      }
    } catch {}
    return [DEFAULT_GUEST];
  });

  // Save current user & list whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentUser));
      const updatedList = usersList.map(u => u.id === currentUser.id ? currentUser : u);
      if (!updatedList.some(u => u.id === currentUser.id)) {
        updatedList.push(currentUser);
      }
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedList));
      setUsersList(updatedList);
    } catch (e) {
      console.warn('Failed to save auth state:', e);
    }
  }, [currentUser]);

  const login = (emailOrUsername: string, password?: string): { success: boolean; error?: string } => {
    const query = emailOrUsername.trim().toLowerCase();
    if (!query) {
      return { success: false, error: 'Please enter your email or username' };
    }

    const user = usersList.find(u =>
      (u.email && u.email.toLowerCase() === query) ||
      (u.username && u.username.toLowerCase() === query)
    );

    if (!user) {
      return { success: false, error: 'No operative found with this email or username' };
    }

    // Check password if set
    if (user.passwordHash) {
      if (!password) {
        return { success: false, error: 'Please enter your password' };
      }
      if (user.passwordHash !== simpleHash(password)) {
        return { success: false, error: 'Incorrect password. Access denied.' };
      }
    }

    setCurrentUser(user);
    return { success: true };
  };

  const signup = (
    email: string,
    password: string,
    username: string,
    avatar?: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please provide a valid email address (e.g. agent@mcu.com)' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    if (!cleanUsername) {
      return { success: false, error: 'Please choose an operative username' };
    }

    const existingEmail = usersList.find(
      u => u.email && u.email.toLowerCase() === cleanEmail && u.id !== 'guest'
    );
    if (existingEmail) {
      return { success: false, error: 'An operative account with this email already exists. Please log in.' };
    }

    const randomAvatar = avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: simpleHash(password),
      avatar: randomAvatar,
      createdAt: Date.now(),
      preferences: {
        ...DEFAULT_GUEST.preferences,
        interests: ['doom', 'marvel'],
      },
    };

    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(DEFAULT_GUEST);
  };

  const updatePreferences = (partial: Partial<UserProfile['preferences']>) => {
    setCurrentUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...partial,
      }
    }));
  };

  const addCustomImage = (img: Omit<UserCustomImage, 'id' | 'addedAt'>) => {
    const newImage: UserCustomImage = {
      ...img,
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      addedAt: Date.now(),
    };
    setCurrentUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        customImages: [newImage, ...prev.preferences.customImages],
        activeCustomImageUrl: newImage.url,
      }
    }));
  };

  const removeCustomImage = (id: string) => {
    setCurrentUser(prev => {
      const filtered = prev.preferences.customImages.filter(img => img.id !== id);
      const isCurrentActive = prev.preferences.activeCustomImageUrl === prev.preferences.customImages.find(i => i.id === id)?.url;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          customImages: filtered,
          activeCustomImageUrl: isCurrentActive ? undefined : prev.preferences.activeCustomImageUrl,
        }
      };
    });
  };

  const addCustomCountdown = (event: CountdownEvent) => {
    setCurrentUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        customCountdowns: [...prev.preferences.customCountdowns, event],
        activeCountdownId: event.id,
      }
    }));
  };

  const updateCountdown = (updatedEvent: CountdownEvent) => {
    setCurrentUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        customCountdowns: prev.preferences.customCountdowns.map(e =>
          e.id === updatedEvent.id ? updatedEvent : e
        ),
      }
    }));
  };

  const deleteCountdown = (id: string) => {
    setCurrentUser(prev => {
      const filtered = prev.preferences.customCountdowns.filter(e => e.id !== id);
      // If active countdown was deleted, switch to the first remaining or a fresh fallback
      const nextActiveId = prev.preferences.activeCountdownId === id
        ? (filtered[0]?.id || 'doomsday')
        : prev.preferences.activeCountdownId;

      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          customCountdowns: filtered.length > 0 ? filtered : [
            {
              id: 'doomsday',
              title: 'AVENGERS: DOOMSDAY',
              subtitle: 'THE DOOMSDAY CLOCK IS TICKING • IN THEATERS WORLDWIDE',
              targetDate: '2026-12-18T00:00:00',
              category: 'marvel',
              themePreset: 'doomsday',
              notes: [],
            }
          ],
          activeCountdownId: nextActiveId,
        }
      };
    });
  };

  const updateCountdownNotes = (countdownId: string, notes: CountdownNote[]) => {
    setCurrentUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        customCountdowns: prev.preferences.customCountdowns.map(e =>
          e.id === countdownId ? { ...e, notes } : e
        ),
      }
    }));
  };

  const updateClockCustomSettings = (settings: ClockCustomSettings) => {
    setCurrentUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        clockCustomSettings: settings,
      }
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        login,
        signup,
        logout,
        updatePreferences,
        addCustomImage,
        removeCustomImage,
        addCustomCountdown,
        updateCountdown,
        deleteCountdown,
        removeCustomCountdown: deleteCountdown,
        updateCountdownNotes,
        updateClockCustomSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
