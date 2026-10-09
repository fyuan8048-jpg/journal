import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Video, ChevronUp, ChevronDown, Gauge } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface BackgroundVideoControlsProps {
  title?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const BackgroundVideoControls: React.FC<BackgroundVideoControlsProps> = ({
  title = 'Motion Artwork',
  isPlaying,
  onTogglePlay,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  speed,
  onSpeedChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cycleSpeed = () => {
    soundEngine.playSelect();
    const speeds = [0.5, 1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    onSpeedChange(nextSpeed);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start select-none transition-all duration-300">
      <div
        className={`p-2 rounded-2xl bg-black/80 border border-violet-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.25)] text-white transition-all duration-300 flex flex-col gap-2 ${
          isExpanded ? 'w-72' : 'w-auto'
        }`}
      >
        {/* Main Bar Header */}
        <div className="flex items-center gap-2">
          {/* Badge & Toggle Button */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              soundEngine.playUiClick();
            }}
            onMouseEnter={() => soundEngine.playUiHover()}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-violet-950/70 border border-violet-500/50 hover:bg-violet-900/80 transition-all text-violet-300 text-xs font-bold"
            title="Toggle Background Motion Controls"
          >
            <Video className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span className="max-w-[100px] truncate text-[11px] uppercase tracking-wider font-mono">
              Motion Art
            </span>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-violet-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
            )}
          </button>

          {/* Mini Quick Actions (Visible when collapsed) */}
          <button
            onClick={() => {
              onTogglePlay();
              soundEngine.playUiClick();
            }}
            onMouseEnter={() => soundEngine.playUiHover()}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-violet-500 hover:text-black flex items-center justify-center transition-all text-white"
            title={isPlaying ? 'Pause Background Video' : 'Play Background Video'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              onToggleMute();
              soundEngine.playUiClick();
            }}
            onMouseEnter={() => soundEngine.playUiHover()}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-950/60 text-rose-400 hover:bg-rose-900'
                : 'bg-white/10 text-white hover:bg-violet-500 hover:text-black'
            }`}
            title={isMuted ? 'Unmute Video Audio' : 'Mute Video Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expanded Controls Panel */}
        {isExpanded && (
          <div className="pt-2 border-t border-white/10 flex flex-col gap-3 px-1 animate-fade-in text-xs">
            {/* Title */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-violet-400/80">
                ACTIVE MOTION BACKGROUND
              </p>
              <p className="text-xs font-black text-white truncate drop-shadow">{title}</p>
            </div>

            {/* Volume Control */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-violet-400" />
                  <span>Video Audio</span>
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => onVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />
            </div>

            {/* Playback Speed Control */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-300 flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-violet-400" />
                <span>Playback Speed</span>
              </span>
              <button
                onClick={cycleSpeed}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-violet-500 hover:text-black font-mono font-bold text-[10px] transition-all"
                title="Cycle Playback Rate"
              >
                {speed}x Speed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
