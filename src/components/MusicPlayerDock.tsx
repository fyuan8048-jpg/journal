import React from 'react';
import { Play, Pause, SkipForward, Disc, Sliders } from 'lucide-react';
import { type MusicTrack, soundEngine, BUILTIN_MUSIC_TRACKS } from '../audio/soundEngine';

interface MusicPlayerDockProps {
  currentTrack: MusicTrack;
  setCurrentTrack: (track: MusicTrack) => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  onOpenSoundStudio: () => void;
}

export const MusicPlayerDock: React.FC<MusicPlayerDockProps> = ({
  currentTrack,
  setCurrentTrack,
  isMusicPlaying,
  setIsMusicPlaying,
  onOpenSoundStudio,
}) => {
  const handleTogglePlay = () => {
    const next = soundEngine.toggleMusic();
    setIsMusicPlaying(next);
  };

  const handleNextTrack = () => {
    const allTracks = BUILTIN_MUSIC_TRACKS;
    const currentIndex = allTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % allTracks.length;
    const nextTrack = allTracks[nextIndex];
    setCurrentTrack(nextTrack);
    soundEngine.playTrack(nextTrack);
    setIsMusicPlaying(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden md:flex items-center gap-2 p-1.5 rounded-2xl bg-black/75 border border-emerald-500/40 backdrop-blur-xl shadow-2xl text-white">
      {/* Vinyl / Disc Icon */}
      <button
        onClick={onOpenSoundStudio}
        className={`w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center justify-center text-emerald-400 hover:scale-105 transition-all ${
          isMusicPlaying ? 'animate-spin' : ''
        }`}
        style={{ animationDuration: '6s' }}
        title="Open Sound & Soundtrack Studio"
      >
        <Disc className="w-5 h-5" />
      </button>

      {/* Track Details */}
      <div onClick={onOpenSoundStudio} className="cursor-pointer max-w-[150px] pr-1">
        <p className="text-[11px] font-bold text-white truncate leading-tight">
          {currentTrack.title}
        </p>
        <p className="text-[9px] text-neutral-400 truncate">
          {isMusicPlaying ? 'Playing' : 'Paused'} • {currentTrack.artist}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleTogglePlay}
          className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center font-bold transition-transform hover:scale-105 shadow-[0_0_10px_rgba(0,255,136,0.3)]"
          title={isMusicPlaying ? 'Pause Music' : 'Play Soundtrack'}
        >
          {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleNextTrack}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSoundStudio}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-white/10 transition-colors"
          title="Sound FX & Ticking Studio"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
