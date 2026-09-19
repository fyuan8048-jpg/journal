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
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserCustomImage {
  id: string;
  name: string;
  url: string;
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
    autoRotate24h?: boolean;
    lastRotationTimestamp?: number;
  };
}

interface AuthContextType {
  currentUser: UserProfile | null;
  usersList: UserProfile[];
  login: (emailOrUsername: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, username: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePreferences: (partial: Partial<UserProfile['preferences']>) => void;
  addCustomImage: (img: Omit<UserCustomImage, 'id' | 'addedAt'>) => void;
  removeCustomImage: (id: string) => void;
  addCustomCountdown: (event: CountdownEvent) => void;
  updateCountdown: (event: CountdownEvent) => void;
  deleteCountdown: (id: string) => void;
  removeCustomCountdown: (id: string) => void;
  updateCountdownNotes: (countdownId: string, notes: CountdownNote[]) => void;
  updateClockCustomSettings: (settings: ClockCustomSettings) => void;
  isFirebaseConfigured: boolean;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEY_USERS = 'avengers_doomsday_clock_users_v3';
const STORAGE_KEY_CURRENT = 'avengers_doomsday_clock_current_user_v3';

const DEFAULT_AVATARS = ['🛡️', '⚡', '👑', '👁️', '🪐', '🔮', '🤖', '💀', '🌌'];

export async function strongHash(str: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
      }
    ],
    customCountdowns: DEFAULT_COUNTDOWN_EVENTS,
    clockCustomSettings: DEFAULT_CLOCK_CUSTOM_SETTINGS,
    autoRotate24h: true,
    lastRotationTimestamp: Date.now(),
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedCurrent = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (savedCurrent) {
        const parsed = JSON.parse(savedCurrent);
        return { ...DEFAULT_GUEST, ...parsed, preferences: { ...DEFAULT_GUEST.preferences, ...parsed.preferences } };
      }
    } catch {}
    return DEFAULT_GUEST;
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [DEFAULT_GUEST];
  });

  useEffect(() => {
    const firestore = db;
    const authInstance = auth;
    if (!isFirebaseConfigured || !authInstance || !firestore) return;
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        try {
          const docRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profile = docSnap.data() as UserProfile;
            setCurrentUser(profile);
            setUsersList(prev => {
              const list = [...prev];
              const idx = list.findIndex(u => u.id === profile.id);
              if (idx >= 0) list[idx] = profile;
              else list.push(profile);
              return list;
            });
          }
        } catch (e) {
          console.error('Failed to load user profile from Firestore', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const saveToFirebase = async (profile: UserProfile) => {
    const firestore = db;
    if (isFirebaseConfigured && auth?.currentUser && firestore && profile.id !== 'guest') {
      try {
        await setDoc(doc(firestore, 'users', profile.id), profile);
      } catch (e) {
        console.error('Failed to save to Firestore:', e);
      }
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentUser));
      const updatedList = usersList.map(u => u.id === currentUser.id ? currentUser : u);
      if (!updatedList.some(u => u.id === currentUser.id)) {
        updatedList.push(currentUser);
      }
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedList));
      setUsersList(updatedList);
      saveToFirebase(currentUser);
    } catch (e) {
      console.warn('Failed to save auth state locally:', e);
    }
  }, [currentUser]);

  const login = async (emailOrUsername: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const query = emailOrUsername.trim().toLowerCase();
    if (!query) return { success: false, error: 'Please enter your email or username' };

    if (isFirebaseConfigured && auth) {
      if (!password) return { success: false, error: 'Please enter your password' };
      try {
        await signInWithEmailAndPassword(auth, query, password);
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || 'Firebase login failed' };
      }
    } else {
      const user = usersList.find(u =>
        (u.email && u.email.toLowerCase() === query) ||
        (u.username && u.username.toLowerCase() === query)
      );
      if (!user) return { success: false, error: 'No operative found with this email or username' };

      if (user.passwordHash && password) {
        const hashed = await strongHash(password);
        if (user.passwordHash !== hashed) {
          return { success: false, error: 'Incorrect password. Access denied.' };
        }
      } else if (user.passwordHash && !password) {
        return { success: false, error: 'Please enter your password' };
      }

      setCurrentUser(user);
      return { success: true };
    }
  };

  const signup = async (email: string, password: string, username: string, avatar?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please provide a valid email address' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    if (!cleanUsername) {
      return { success: false, error: 'Please choose a username' };
    }

    const randomAvatar = avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];

    const firestore = db;
    const authInstance = auth;
    if (isFirebaseConfigured && authInstance && firestore) {
      try {
        const userCred = await createUserWithEmailAndPassword(authInstance, cleanEmail, password);
        const newUser: UserProfile = {
          id: userCred.user.uid,
          username: cleanUsername,
          email: cleanEmail,
          avatar: randomAvatar,
          createdAt: Date.now(),
          preferences: { ...DEFAULT_GUEST.preferences },
        };
        await setDoc(doc(firestore, 'users', newUser.id), newUser);
        setCurrentUser(newUser);
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || 'Firebase signup failed' };
      }
    } else {
      const existingEmail = usersList.find(u => u.email?.toLowerCase() === cleanEmail && u.id !== 'guest');
      if (existingEmail) return { success: false, error: 'An account with this email already exists' };

      const hashed = await strongHash(password);
      const newUser: UserProfile = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: hashed,
        avatar: randomAvatar,
        createdAt: Date.now(),
        preferences: { ...DEFAULT_GUEST.preferences },
      };
      setCurrentUser(newUser);
      return { success: true };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setCurrentUser(DEFAULT_GUEST);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseConfigured || !auth) return { success: false, error: 'Firebase is not configured' };
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to send reset email' };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const firestore = db;
    const authInstance = auth;
    if (!isFirebaseConfigured || !authInstance || !firestore) return { success: false, error: 'Firebase is not configured' };
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(authInstance, provider);
      const user = result.user;
      
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const newUser: UserProfile = {
          id: user.uid,
          username: user.displayName || 'Google Operative',
          email: user.email || '',
          avatar: DEFAULT_AVATARS[0],
          createdAt: Date.now(),
          preferences: { ...DEFAULT_GUEST.preferences },
        };
        await setDoc(docRef, newUser);
        setCurrentUser(newUser);
      } else {
        setCurrentUser(docSnap.data() as UserProfile);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Google sign-in failed' };
    }
  };

  const updatePreferences = (partial: Partial<UserProfile['preferences']>) => {
    setCurrentUser(prev => ({ ...prev, preferences: { ...prev.preferences, ...partial } }));
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
              subtitle: 'THE DOOMSDAY CLOCK IS TICKING',
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
        isFirebaseConfigured,
        resetPassword,
        signInWithGoogle
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
