import { Volume2, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface AudioUnlockBannerProps {
  onDismiss: () => void;
  onEnableAudio: () => void;
}

export const AudioUnlockBanner: React.FC<AudioUnlockBannerProps> = ({
  onDismiss,
  onEnableAudio,
}) => {
  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-bounce-subtle">
      <div className="pointer-events-auto max-w-md w-full p-4 sm:p-5 rounded-2xl bg-neutral-950/95 border border-emerald-500/50 shadow-[0_0_35px_rgba(0,255,136,0.3)] backdrop-blur-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>Enable Avengers Doomsday Audio?</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </h4>
            <p className="text-[11px] text-neutral-400">
              Synchronize ominous ticking & Latverian ambient soundscape.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              soundEngine.init();
              soundEngine.setClockMuted(false);
              soundEngine.playTick();
              onEnableAudio();
            }}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,136,0.4)] whitespace-nowrap"
          >
            Enable Audio
          </button>
          <button
            onClick={() => {
              onDismiss();
            }}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Mute
          </button>
        </div>
      </div>
    </div>
  );
};
