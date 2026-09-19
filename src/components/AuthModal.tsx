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
  Loader2,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useAuth, type UserProfile } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = ['👑', '🛡️', '⚡', '👁️', '🪐', '🔮', '🤖', '💀', '🌌', '🐉'];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, usersList, login, signup, logout, isFirebaseConfigured, resetPassword, signInWithGoogle } = useAuth();
  
  type Mode = 'login' | 'signup' | 'forgotPassword';
  const [mode, setMode] = useState<Mode>('login');
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👑');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    resetMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    if (mode === 'forgotPassword') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      const res = await resetPassword(email);
      if (!res.success) {
        setError(res.error || 'Failed to send reset email');
      } else {
        setSuccessMsg('Password reset email sent! Check your inbox.');
        setTimeout(() => handleModeSwitch('login'), 3000);
      }
      setIsLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      if (!username.trim()) {
        setError('Please choose an operative username');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const res = await signup(email, password, username, selectedAvatar);
      if (!res.success) {
        setError(res.error || 'Signup failed');
        setIsLoading(false);
        return;
      }

      soundEngine.playSuccessCheck();
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1000);
    } else if (mode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Login failed. Please check credentials.');
        setIsLoading(false);
        return;
      }

      soundEngine.playSuccessCheck();
      setSuccessMsg('Authentication successful!');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1000);
    }
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    setIsLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setError(res.error || 'Google sign in failed');
      setIsLoading(false);
      return;
    }
    soundEngine.playSuccessCheck();
    setSuccessMsg('Google Authentication successful!');
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleSelectUser = (u: UserProfile) => {
    if (!u.passwordHash && !isFirebaseConfigured) {
      login(u.email || u.username);
      onClose();
    } else {
      setEmail(u.email || u.username);
      setError('Please enter your password for this account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md max-h-[95vh] flex flex-col rounded-3xl bg-neutral-900/80 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-white overflow-hidden backdrop-blur-3xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-4xl mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              {currentUser?.id !== 'guest' ? currentUser?.avatar : '🔮'}
            </div>
            <h2 className="text-2xl font-black text-white">
              {mode === 'signup' ? 'Operative Registry' : mode === 'forgotPassword' ? 'Reset Password' : 'Multiverse Access'}
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              Sync countdowns, custom music, and settings
            </p>
          </div>

          {currentUser && currentUser.id !== 'guest' && (
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-3xl shrink-0 drop-shadow-md">{currentUser.avatar}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {currentUser.username}
                  </p>
                  <p className="text-xs text-emerald-400/80 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors shrink-0 ml-2 border border-transparent hover:border-rose-500/30"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {mode !== 'forgotPassword' && (
            <div className="flex relative rounded-xl bg-black/40 border border-white/10 mb-6 p-1">
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-transform duration-300 ease-in-out ${mode === 'signup' ? 'translate-x-full left-1' : 'translate-x-0 left-1'}`} />
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors z-10 ${
                  mode === 'login' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors z-10 ${
                  mode === 'signup' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {error && (
            <div className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 mb-5 animate-shake">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-5 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' && usersList.length > 1 && !isFirebaseConfigured && (
            <div className="mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                Quick Select:
              </span>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {usersList.filter(u => u.id !== 'guest').map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      currentUser?.id === u.id
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                        : 'bg-black/20 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl">{u.avatar}</span>
                      <div className="min-w-0">
                        <span className="text-sm font-bold block truncate">{u.username}</span>
                        <span className="text-xs text-neutral-400 block truncate">{u.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-neutral-400 block mb-1.5 font-medium ml-1">
                {mode === 'signup' ? 'Email Address' : mode === 'forgotPassword' ? 'Account Email' : 'Email or Username'}
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={mode === 'signup' || mode === 'forgotPassword' ? 'email' : 'text'}
                  placeholder={mode === 'signup' ? 'operative@mcu.com' : 'Enter details...'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="animate-fade-in">
                <label className="text-xs text-neutral-400 block mb-1.5 font-medium ml-1">
                  Operative Username
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="e.g. Victor Von Doom"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {mode !== 'forgotPassword' && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="text-xs text-neutral-400 font-medium">Password</label>
                  {mode === 'login' && isFirebaseConfigured && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgotPassword')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Create password (min 6 chars)...' : 'Enter password...'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="animate-fade-in">
                <label className="text-xs text-neutral-400 block mb-1.5 font-medium ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password..."
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="animate-fade-in pt-2">
                <label className="text-xs text-neutral-400 block mb-2 font-medium ml-1">
                  Select Sigil Avatar
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {AVATARS.map(av => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border transition-all duration-300 ${
                        selectedAvatar === av
                          ? 'border-emerald-500 bg-emerald-500/20 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'border-white/10 bg-black/40 hover:bg-black/60 hover:border-white/30'
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
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? <UserPlus className="w-5 h-5" /> : mode === 'forgotPassword' ? <KeyRound className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  <span>{mode === 'signup' ? 'Create Account' : mode === 'forgotPassword' ? 'Send Reset Link' : 'Authenticate'}</span>
                </>
              )}
            </button>

            {mode === 'forgotPassword' && (
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="w-full py-3 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Back to Sign In
              </button>
            )}

            {isFirebaseConfigured && mode !== 'forgotPassword' && (
              <>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-neutral-500 uppercase tracking-wider">OR</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
