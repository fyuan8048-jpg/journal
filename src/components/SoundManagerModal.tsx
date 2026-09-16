import React, { useState, useEffect } from 'react';
import {
  X,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Trash2,
  Upload,
  Disc,
  Check,
  Radio,
  Film,
  Clock,
  Sparkles,
} from 'lucide-react';
import { soundEngine, type SoundEffectType, type MusicTrack, BUILTIN_MUSIC_TRACKS } from '../audio/soundEngine';
import { useAuth } from '../context/AuthContext';
import { get, set as idbSet, del as idbDel } from 'idb-keyval';

interface SoundManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundType: SoundEffectType;
  setSoundType: (type: SoundEffectType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentTrack: MusicTrack;
  setCurrentTrack: (track: MusicTrack) => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
}

const STORAGE_KEY_CUSTOM_TRACKS = 'avengers_clock_custom_tracks_v2';

export const SoundManagerModal: React.FC<SoundManagerModalProps> = ({
  isOpen,
  onClose,
  soundType,
  setSoundType,
  isMuted,
  onToggleMute,
  currentTrack,
  setCurrentTrack,
  isMusicPlaying,
  setIsMusicPlaying,
}) => {
  const { currentUser, updatePreferences } = useAuth();
  const [activeTab, setActiveTab] = useState<'music' | 'ticks'>('music');

  // Custom Track Upload Form
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackUrl, setTrackUrl] = useState('');
  const [customTracks, setCustomTracks] = useState<MusicTrack[]>([]);
  const [musicVol, setMusicVol] = useState(soundEngine.getMusicVolume());
  const [tickVol, setTickVol] = useState(soundEngine.getClockVolume());
  const [error, setError] = useState('');
  const [clockSoundNotice, setClockSoundNotice] = useState('');

  const handleMatchAsClockSound = (url: string, name: string) => {
    soundEngine.setCustomTickAudio(url, name);
    setSoundType('custom');
    updatePreferences({ soundType: 'custom' });
    soundEngine.playTick();
    setClockSoundNotice(`"${name}" is now active as your Clock Ticking Sound!`);
    setTimeout(() => setClockSoundNotice(''), 4000);
  };

  const handleUploadAndMatchClockSound = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i);
    const isAudio = file.type.startsWith('audio/') || !!file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i);

    if (!isVideo && !isAudio) {
      setError('Please upload an audio file (MP3, WAV, OGG) or video file (MP4, WEBM)');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const soundName = file.name.replace(/\.[^/.]+$/, '');
    const trackId = `custom_tick_${Date.now()}`;

    try {
      await idbSet(`media_blob_${trackId}`, file);
    } catch {}

    const newTrack: MusicTrack = {
      id: trackId,
      title: soundName,
      artist: currentUser?.username || 'Custom Clock Audio',
      url: objectUrl,
      isCustom: true,
      isVideo,
      fileType: file.type,
    };
    const updated = [newTrack, ...customTracks];
    setCustomTracks(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(updated.map(t => ({ ...t, url: '' }))));
    } catch {}

    handleMatchAsClockSound(objectUrl, soundName);
    setError('');
  };

  // Re-hydrate custom tracks on load from IndexedDB
  useEffect(() => {
    try {
      const savedMetadata = localStorage.getItem(STORAGE_KEY_CUSTOM_TRACKS);
      if (savedMetadata) {
        const parsed: MusicTrack[] = JSON.parse(savedMetadata);
        Promise.all(
          parsed.map(async (t) => {
            if (t.isCustom && !t.url.startsWith('http')) {
              try {
                const blob = await get(`media_blob_${t.id}`);
                if (blob instanceof Blob) {
                  return { ...t, url: URL.createObjectURL(blob) };
                }
              } catch {}
            }
            return t;
          })
        ).then(rehydrated => {
          setCustomTracks(rehydrated);
        });
      }
    } catch {}
  }, []);

  if (!isOpen) return null;

  const allTracks = [...BUILTIN_MUSIC_TRACKS, ...customTracks];

  const handleSelectTrack = (track: MusicTrack) => {
    setCurrentTrack(track);
    soundEngine.playTrack(track);
    setIsMusicPlaying(true);
  };

  const handleTogglePlay = () => {
    const next = soundEngine.toggleMusic();
    setIsMusicPlaying(next);
  };

  const handleAddUrlTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !trackUrl.trim()) {
      setError('Please provide a title and media URL');
      return;
    }

    const isVideo = !!trackUrl.match(/\.(mp4|webm|mov|mkv|m4v)/i);
    const newTrack: MusicTrack = {
      id: `custom_music_${Date.now()}`,
      title: trackTitle.trim(),
      artist: trackArtist.trim() || currentUser?.username || (isVideo ? 'Web Video Soundtrack' : 'Web Audio Stream'),
      url: trackUrl.trim(),
      isCustom: true,
      isVideo,
    };

    const updated = [newTrack, ...customTracks];
    setCustomTracks(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(updated.map(t => ({ ...t, url: t.url.startsWith('blob:') ? '' : t.url }))));
    } catch {}

    handleSelectTrack(newTrack);
    setTrackTitle('');
    setTrackArtist('');
    setTrackUrl('');
    setError('');
  };

  const handleUploadMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || !!file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i);
    const isAudio = file.type.startsWith('audio/') || !!file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i);

    if (!isVideo && !isAudio) {
      setError('Please upload an audio file (MP3, WAV, OGG) or video file (MP4, WEBM, MOV, MKV)');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const trackId = `custom_media_${Date.now()}`;
    const newTrack: MusicTrack = {
      id: trackId,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: isVideo
        ? `${currentUser?.username || 'Custom'} • Video Audio Track`
        : (currentUser?.username || 'Uploaded Audio'),
      url: objectUrl,
      isCustom: true,
      isVideo,
      fileType: file.type,
    };

    // Store binary in IndexedDB for persistence across restarts
    try {
      await idbSet(`media_blob_${trackId}`, file);
    } catch (err) {
      console.warn('Failed to store media blob in IndexedDB:', err);
    }

    const updated = [newTrack, ...customTracks];
    setCustomTracks(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(updated.map(t => ({ ...t, url: '' }))));
    } catch {}

    handleSelectTrack(newTrack);
    setError('');
  };

  const handleDeleteCustomTrack = async (trackId: string) => {
    try {
      await idbDel(`media_blob_${trackId}`);
    } catch {}
    const updated = customTracks.filter(t => t.id !== trackId);
    setCustomTracks(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(updated.map(t => ({ ...t, url: '' }))));
    } catch {}
  };

  const handleUploadCustomTick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    soundEngine.setCustomTickAudio(objectUrl);
    soundEngine.setCustomTickAudio(objectUrl);
    setSoundType('custom');
    updatePreferences({ soundType: 'custom' });
    soundEngine.playTick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-950/95 border border-emerald-500/30 shadow-2xl text-white overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                Audio & Soundtrack Studio
              </h2>
              <p className="text-xs text-neutral-400">
                Avengers Doomsday themes, clock ticking profiles, and custom music uploads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-neutral-900/40">
          <button
            onClick={() => setActiveTab('music')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'music'
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                : 'text-neutral-300 hover:bg-white/5'
            }`}
          >
            🎵 Background Soundtrack & Music
          </button>
          <button
            onClick={() => setActiveTab('ticks')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'ticks'
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                : 'text-neutral-300 hover:bg-white/5'
            }`}
          >
            ⏱️ Clock Ticking Sound Effects
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: MUSIC & SOUNDTRACK */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              {clockSoundNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{clockSoundNotice}</span>
                </div>
              )}
              {/* Active Now Playing Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-black border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`w-12 h-12 rounded-xl bg-black border border-emerald-500/50 flex items-center justify-center text-emerald-400 ${isMusicPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
                    <Disc className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      {isMusicPlaying ? 'NOW PLAYING' : 'PAUSED'}
                    </span>
                    <h3 className="font-black text-sm sm:text-base text-white">{currentTrack.title}</h3>
                    <p className="text-xs text-neutral-400">{currentTrack.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleTogglePlay}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                  >
                    {isMusicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isMusicPlaying ? 'Pause' : 'Play Theme'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMatchAsClockSound(currentTrack.url, currentTrack.title)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/60 hover:bg-emerald-950/80 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-bold text-xs transition-all shadow-md"
                    title="Match this soundtrack to play on every clock tick"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Set as Clock Tick</span>
                  </button>
                </div>
              </div>

              {/* Music Volume Control */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Music Volume</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVol}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setMusicVol(val);
                    soundEngine.setMusicVolume(val);
                  }}
                  className="w-48 sm:w-64 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-neutral-400 w-10 text-right">
                  {Math.round(musicVol * 100)}%
                </span>
              </div>

              {/* Add Custom Music Track */}
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Custom Music Track
                </h4>

                {error && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload (Audio & Video Formats) */}
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-black/40 hover:bg-emerald-950/20 transition-all text-center group">
                    <div className="flex items-center gap-2 text-neutral-400 group-hover:text-emerald-400 mb-1.5">
                      <Upload className="w-5 h-5" />
                      <Film className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">Upload Audio or Video File</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5">
                      MP3, WAV, MP4, WEBM, MOV, MKV, FLAC
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono mt-1 font-semibold">
                      ★ Extracts soundtrack directly from video
                    </span>
                    <input
                      type="file"
                      accept="audio/*,video/*,.mp4,.webm,.mov,.mkv,.avi,.m4v,.mp3,.wav,.ogg,.aac,.flac"
                      onChange={handleUploadMediaFile}
                      className="hidden"
                    />
                  </label>

                  {/* URL Input (Audio or Video stream) */}
                  <form onSubmit={handleAddUrlTrack} className="space-y-2 flex flex-col justify-between">
                    <input
                      type="text"
                      placeholder="Track Title (e.g. Doomsday Trailer Theme)"
                      value={trackTitle}
                      onChange={e => setTrackTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black border border-neutral-700 text-xs text-white"
                    />
                    <input
                      type="url"
                      placeholder="Media Stream URL (MP3, MP4, WEBM link)"
                      value={trackUrl}
                      onChange={e => setTrackUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-black border border-neutral-700 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                    >
                      Add & Play Media
                    </button>
                  </form>
                </div>
              </div>

              {/* Playlist Tracks List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Available Soundtracks & Themes ({allTracks.length})
                </h4>

                <div className="space-y-2">
                  {allTracks.map(t => {
                    const isSelected = currentTrack.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTrack(t)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                            : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                              isSelected ? 'bg-emerald-500 text-black' : 'bg-white/10 text-neutral-400'
                            }`}
                          >
                            {isSelected && isMusicPlaying ? (
                              <Radio className="w-4 h-4 animate-pulse" />
                            ) : t.isVideo ? (
                              <Film className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                                {t.title}
                              </p>
                              {t.isVideo && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 text-[9px] text-sky-300 font-bold uppercase shrink-0">
                                  VIDEO OST
                                </span>
                              )}
                              {t.isCustom && !t.isVideo && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] text-emerald-300 font-bold uppercase shrink-0">
                                  AUDIO
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 truncate">{t.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMatchAsClockSound(t.url, t.title);
                            }}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 border ${
                              soundType === 'custom' && soundEngine.getCustomTickAudioName() === t.title
                                ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(0,255,136,0.4)]'
                                : 'bg-black/50 hover:bg-emerald-950 text-neutral-300 hover:text-emerald-300 border-white/10 hover:border-emerald-500/40'
                            }`}
                            title="Set this track sound for the countdown clock"
                          >
                            <Clock className="w-3 h-3" />
                            <span>${soundType === 'custom' && soundEngine.getCustomTickAudioName() === t.title ? 'Clock Tick Active' : 'Match Clock'}</span>
                          </button>

                          {t.isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomTrack(t.id);
                              }}
                              className="p-1.5 rounded hover:bg-rose-600 text-neutral-400 hover:text-white transition-colors"
                              title="Delete custom track"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                              isSelected ? 'bg-emerald-500 text-black' : 'bg-white/10 text-neutral-300'
                            }`}
                          >
                            {isSelected ? (isMusicPlaying ? 'Active' : 'Selected') : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLOCK TICKING SOUND EFFECTS */}
          {activeTab === 'ticks' && (
            <div className="space-y-6">
              {/* Active Matched Clock Sound Notification Banner */}
              {clockSoundNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{clockSoundNotice}</span>
                </div>
              )}

              {/* Current Active Tick Audio Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-black border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      CURRENT CLOCK TICKING PROFILE
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-white">
                      {soundType === 'custom'
                        ? `Custom Matched: "${soundEngine.getCustomTickAudioName()}"`
                        : soundType === 'doomsday'
                        ? 'Official Avengers Doomsday Tick'
                        : soundType === 'heartbeat'
                        ? 'Dramatic Tension Heartbeat'
                        : soundType === 'grandfather'
                        ? 'Grandfather Mechanical Escapement'
                        : soundType === 'tachyon'
                        ? 'Tachyon Hologram Pulse'
                        : 'Muted / Silent'}
                    </h4>
                    <p className="text-[11px] text-neutral-400">Plays synchronously on every countdown second</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => soundEngine.playTick()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                  >
                    🔊 Test Tick
                  </button>
                  {soundType === 'custom' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSoundType('doomsday');
                        soundEngine.setSoundType('doomsday');
                        updatePreferences({ soundType: 'doomsday' });
                        soundEngine.playTick();
                      }}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-bold transition-all"
                    >
                      Use Doomsday Default
                    </button>
                  )}
                </div>
              </div>

              {/* Match Any Uploaded Sound for Clock Dropzone */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                        Match Any Sound / Video for Clock Ticking
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Upload any personal MP3, WAV, or Video. It is automatically matched &amp; plays on every tick!
                      </p>
                    </div>
                  </div>
                  <label className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_15px_rgba(0,255,136,0.4)]">
                    Browse &amp; Match
                    <input
                      type="file"
                      accept="audio/*,video/*,.mp3,.wav,.ogg,.flac,.mp4,.webm,.m4a"
                      onChange={handleUploadAndMatchClockSound}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {/* Master Mute & Volume */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <button
                  onClick={onToggleMute}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isMuted
                      ? 'bg-rose-950 border border-rose-500 text-rose-300'
                      : 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'Clock Muted' : 'Clock Unmuted'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Tick Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={tickVol}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setTickVol(val);
                      soundEngine.setClockVolume(val);
                    }}
                    className="w-32 sm:w-48 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-neutral-400 w-10 text-right">
                    {Math.round(tickVol * 100)}%
                  </span>
                </div>
              </div>

              {/* Ticking Sound Options */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Select Ticking Profile
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'doomsday',
                      label: '⚡ Avengers Doomsday Tick (Official YouTube)',
                      desc: 'Dual-layer metallic impact with 50Hz sub-bass resonant chamber thud.',
                    },
                    {
                      id: 'heartbeat',
                      label: '💓 Dramatic Tension Heartbeat',
                      desc: 'Deep biological dub-dub pulse building suspense.',
                    },
                    {
                      id: 'grandfather',
                      label: '🕰️ Grandfather Clock Escapement',
                      desc: 'Authentic mechanical brass and timber pendulum ticking.',
                    },
                    {
                      id: 'tachyon',
                      label: '📡 Tachyon Hologram Pulse',
                      desc: 'High-frequency chronometer beam click.',
                    },
                    {
                      id: 'none',
                      label: '🔇 Muted / Silent',
                      desc: 'Disable ticking while keeping music soundtrack playing.',
                    }
                  ].map(item => {
                    const isSelected = soundType === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSoundType(item.id as SoundEffectType);
                          soundEngine.setSoundType(item.id as SoundEffectType);
                          updatePreferences({ soundType: item.id as SoundEffectType });
                          if (item.id !== 'none') {
                            soundEngine.playTick();
                          }
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-bold text-xs sm:text-sm text-white">{item.label}</h5>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                        </div>
                        <p className="text-[11px] text-neutral-400">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Upload Custom Tick Sound */}
                <div className="pt-2">
                  <label className="flex items-center justify-between p-4 border border-dashed border-neutral-700 hover:border-emerald-500 rounded-2xl cursor-pointer bg-neutral-900/60 hover:bg-emerald-950/20 transition-all">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Upload Custom Ticking Sound Effect</p>
                        <p className="text-[10px] text-neutral-400">Use any personal WAV, MP3 or short SFX for each second</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs">
                      Browse File
                    </span>
                    <input type="file" accept="audio/*" onChange={handleUploadCustomTick} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-neutral-400">
          <span>Audio is synthesized and streamed in zero latency.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors shadow-[0_0_12px_rgba(0,255,136,0.3)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
