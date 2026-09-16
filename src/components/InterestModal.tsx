import React from 'react';
import { X, Check } from 'lucide-react';
import { INTEREST_CONFIG, type UserInterest } from '../data/curatedBackgrounds';
import { useAuth } from '../context/AuthContext';

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterestModal: React.FC<InterestModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updatePreferences } = useAuth();
  if (!isOpen || !currentUser) return null;

  const currentInterests = currentUser.preferences.interests;

  const toggleInterest = (interest: UserInterest) => {
    let next: UserInterest[];
    if (currentInterests.includes(interest)) {
      // Keep at least one
      if (currentInterests.length === 1) return;
      next = currentInterests.filter(i => i !== interest);
    } else {
      next = [...currentInterests, interest];
    }
    updatePreferences({ interests: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-neutral-950/95 border border-emerald-500/30 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>✨ Personalized 3D Backgrounds</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-wide text-white">
            Choose Your Visual Interests
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Your 3D background dynamically adapts every 24 hours based on the universes you select.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {(Object.keys(INTEREST_CONFIG) as UserInterest[]).map(key => {
            const config = INTEREST_CONFIG[key];
            const isSelected = currentInterests.includes(key);

            return (
              <div
                key={key}
                onClick={() => toggleInterest(key)}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(0,255,136,0.15)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">{config.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">{config.label}</h3>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-black'
                          : 'border-neutral-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{config.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm tracking-wider uppercase bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all hover:scale-[1.02]"
          >
            Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
