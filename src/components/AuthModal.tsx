import React, { useState } from 'react';
import {
  X,
  User,
  LogIn,
  UserPlus,
  Check,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = ['👑', '🛡️', '⚡', '👁️', '🪐', '🔮', '🤖', '💀', '🌌', '🐉'];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, usersList, login, signup, logout } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👑');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isSignUp) {
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid email address');
        return;
      }
      if (!username.trim()) {
        setError('Please choose an operative username / call-sign');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const res = signup(email, password, username, selectedAvatar);
      if (!res.success) {
        setError(res.error || 'Signup failed');
        return;
      }

      soundEngine.playSuccessCheck();
      setSuccessMsg('Account created successfully! Welcome to the Multiverse Registry.');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      // Login
      const res = login(email, password);
      if (!res.success) {
        setError(res.error || 'Login failed. Please check credentials.');
        return;
      }

      soundEngine.playSuccessCheck();
      setSuccessMsg('Authentication successful! Initializing chronometer...');
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  const handleSelectUser = (u: UserProfile) => {
    // If user has no password, login directly, else prefill email
    if (!u.passwordHash) {
      login(u.email || u.username);
      onClose();
    } else {
      setEmail(u.email || u.username);
      setError('Please enter your password for this account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[95vh] flex flex-col rounded-3xl bg-neutral-950/95 border border-emerald-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-3xl mx-auto mb-3 shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              {currentUser?.avatar || '👑'}
            </div>
            <h2 className="text-2xl font-black font-display text-white">
              {isSignUp ? 'Operative Registry (Sign Up)' : 'Multiverse Access (Log In)'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Store your countdowns, custom music, and wallpapers across sessions
            </p>
          </div>

          {/* Current Active Account summary */}
          {currentUser && (
            <div className="mb-5 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{currentUser.avatar}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-snug truncate">
                    {currentUser.username}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono truncate">
                    {currentUser.email || 'guest@latveria.gov'}
                  </p>
                </div>
              </div>
              {currentUser.id !== 'guest' ? (
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-neutral-400 hover:text-rose-400 underline font-medium shrink-0 ml-2"
                >
                  Sign Out
                </button>
              ) : (
                <span className="text-[10px] uppercase font-bold text-neutral-500 bg-neutral-900 px-2 py-1 rounded shrink-0 ml-2">
                  Guest
                </span>
              )}
            </div>
          )}

          {/* Toggle Login / Sign Up */}
          <div className="flex p-1 rounded-xl bg-neutral-900 border border-neutral-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-950/50 p-3 rounded-xl border border-rose-500/40 mb-4 animate-shake">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="text-xs text-emerald-400 bg-emerald-950/50 p-3 rounded-xl border border-emerald-500/40 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Account Switcher (In Sign-In mode if multiple accounts exist) */}
          {!isSignUp && usersList.length > 1 && (
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Quick Select Saved Operative:
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {usersList.map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                      currentUser?.id === u.id
                        ? 'bg-emerald-950/50 border-emerald-500 text-white'
                        : 'bg-neutral-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{u.avatar}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{u.username}</span>
                        <span className="text-[10px] text-neutral-500 block truncate">{u.email}</span>
                      </div>
                    </div>
                    {currentUser?.id === u.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="text-xs text-neutral-400 block mb-1 font-semibold">
                {isSignUp ? 'Email Address *' : 'Email or Username *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type={isSignUp ? 'email' : 'text'}
                  placeholder={isSignUp ? 'operative@mcu.com' : 'Enter email or username...'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Username Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="text-xs text-neutral-400 block mb-1 font-semibold">
                  Operative Username / Call-sign *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Victor Von Doom"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="text-xs text-neutral-400 block mb-1 font-semibold">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Create password (min 6 chars)...' : 'Enter password...'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="text-xs text-neutral-400 block mb-1 font-semibold">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password..."
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Avatar Selector (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-semibold">
                  Select Sigil Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map(av => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                        selectedAvatar === av
                          ? 'border-emerald-500 bg-emerald-950/60 scale-110 shadow-[0_0_10px_rgba(0,255,136,0.4)]'
                          : 'border-white/10 bg-neutral-900 hover:border-white/30'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,255,136,0.3)] flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{isSignUp ? 'Create Operative Account' : 'Authenticate & Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

