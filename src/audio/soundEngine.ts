// Comprehensive Audio & Music Engine with Separate Volume & Mute Controls
// Independent channels for:
// 1. Clock Ticking Sound (volume & mute)
// 2. Background Soundtrack / Music (volume & mute)

export type SoundEffectType = 'doomsday' | 'heartbeat' | 'grandfather' | 'tachyon' | 'custom' | 'none';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string; // Blob URL, web URL, or synthetic generator identifier
  isCustom?: boolean;
  isVideo?: boolean;
  fileType?: string;
}

export const BUILTIN_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'doomsday-theme',
    title: 'Avengers: Doomsday Theme (Cinematic Ambience)',
    artist: 'Latverian Orchestra',
    url: 'synthetic:doomsday',
  },
  {
    id: 'doomsday-stream-drone',
    title: 'Doomsday Clock 24/7 Livestream Drone',
    artist: 'Marvel Studios Ambient Feed',
    url: 'synthetic:stream',
  },
  {
    id: 'incursion-tension',
    title: 'Multiversal Incursion Tension Score',
    artist: 'Marvel Cinematic Soundscape',
    url: 'synthetic:incursion',
  },
  {
    id: 'battleworld-requiem',
    title: 'God Emperor Doom: Battleworld Requiem',
    artist: 'Doomstadt Choir',
    url: 'synthetic:requiem',
  }
];

class SoundEngine {
  private ctx: AudioContext | null = null;

  // Channel 1: Clock Ticking
  private clockVolume: number = 0.6; // 0.0 to 1.0
  private isClockMuted: boolean = false;
  private soundType: SoundEffectType = 'doomsday';
  private customTickAudio: HTMLAudioElement | null = null;

  // Channel 2: Background Music / Soundtrack (Supports Audio & Video Formats)
  private musicVolume: number = 0.5; // 0.0 to 1.0
  private isMusicMuted: boolean = false;
  private bgMusicMedia: HTMLMediaElement | null = null;
  private currentTrack: MusicTrack = BUILTIN_MUSIC_TRACKS[0];
  private isMusicPlaying: boolean = false;
  private synthMusicNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null;

  // Ambient Drone (linked to music or independent)
  private droneGain: GainNode | null = null;
  private isDroneActive: boolean = false;

  public init() {
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn('Web Audio not available:', e);
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- CHANNEL 1: CLOCK TICKING SOUND CONTROLS ---
  public setClockVolume(vol: number) {
    this.clockVolume = Math.max(0, Math.min(1, vol));
  }

  public getClockVolume(): number {
    return this.clockVolume;
  }

  public setClockMuted(muted: boolean) {
    this.isClockMuted = muted;
  }

  public getClockMuted(): boolean {
    return this.isClockMuted;
  }

  private customTickAudioName: string = '';

  public setSoundType(type: SoundEffectType) {
    this.soundType = type;
  }

  public getSoundType(): SoundEffectType {
    return this.soundType;
  }

  public setCustomTickAudio(url: string, name?: string) {
    try {
      this.customTickAudio = new Audio(url);
      this.customTickAudio.preload = 'auto';
      if (name) {
        this.customTickAudioName = name;
      }
    } catch (e) {
      console.warn('Failed to initialize custom tick audio:', e);
    }
  }

  public getCustomTickAudioName(): string {
    return this.customTickAudioName || 'Custom Uploaded Sound';
  }

  public hasCustomTickAudio(): boolean {
    return !!this.customTickAudio;
  }

  // --- CHANNEL 2: MUSIC SOUND CONTROLS ---
  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.bgMusicMedia) {
      this.bgMusicMedia.volume = this.musicVolume;
    }
    if (this.synthMusicNodes && this.ctx && !this.isMusicMuted) {
      this.synthMusicNodes.gain.gain.setTargetAtTime(this.musicVolume * 0.2, this.ctx.currentTime, 0.05);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.bgMusicMedia) {
      this.bgMusicMedia.muted = muted;
    }
    if (this.synthMusicNodes && this.ctx) {
      this.synthMusicNodes.gain.gain.setTargetAtTime(muted ? 0 : this.musicVolume * 0.2, this.ctx.currentTime, 0.05);
    }
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  // Play Clock Tick (Respects Clock Volume & Clock Mute)
  public playTick() {
    if (this.isClockMuted || this.clockVolume <= 0.001 || this.soundType === 'none') return;

    if (this.soundType === 'custom' && this.customTickAudio) {
      try {
        const clone = this.customTickAudio.cloneNode() as HTMLAudioElement;
        clone.volume = this.clockVolume;
        clone.currentTime = 0;
        const playPromise = clone.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Smooth clamp at 500ms so uploaded songs don't overlap into a cacophony
              setTimeout(() => {
                try {
                  clone.pause();
                  clone.currentTime = 0;
                } catch {}
              }, 500);
            })
            .catch(() => {});
        }
        return;
      } catch {}
    }

    if (!this.ctx) {
      this.init();
      if (!this.ctx) return;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      switch (this.soundType) {
        case 'doomsday':
          this.playDoomsdayTick();
          break;
        case 'heartbeat':
          this.playHeartbeatTick();
          break;
        case 'grandfather':
          this.playGrandfatherTick();
          break;
        case 'tachyon':
          this.playTachyonTick();
          break;
      }
    } catch {}
  }

  private playDoomsdayTick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.clockVolume * 0.9, now);
    masterGain.connect(this.ctx.destination);

    // Sharp metallic impact
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const clickFilter = this.ctx.createBiquadFilter();

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1800, now);
    clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(1200, now);
    clickFilter.Q.setValueAtTime(5, now);

    clickGain.gain.setValueAtTime(0.7, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // Heavy iron escapement body
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(140, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

    bodyGain.gain.setValueAtTime(0.85, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(masterGain);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.1);

    // Sub-bass tension
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(62, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.16);
  }

  private playHeartbeatTick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.clockVolume * 0.8, now);
    masterGain.connect(this.ctx.destination);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  private playGrandfatherTick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.clockVolume * 0.7, now);
    masterGain.connect(this.ctx.destination);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  private playTachyonTick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.clockVolume * 0.6, now);
    masterGain.connect(this.ctx.destination);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playGlitchEffect() {
    if (this.isClockMuted || this.clockVolume <= 0.001 || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(450, now + 0.08);
      osc.frequency.linearRampToValueAtTime(80, now + 0.16);

      gain.gain.setValueAtTime(this.clockVolume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // --- MUSIC TRACK MANAGEMENT ---
  public getCurrentTrack(): MusicTrack {
    return this.currentTrack;
  }

  public isMusicActive(): boolean {
    return this.isMusicPlaying;
  }

  public playTrack(track: MusicTrack) {
    this.stopMusic();
    this.currentTrack = track;
    this.init();

    if (track.url.startsWith('synthetic:')) {
      this.startSyntheticTrack(track.url);
    } else {
      try {
        if (track.isVideo) {
          const video = document.createElement('video');
          video.src = track.url;
          video.loop = true;
          video.playsInline = true;
          video.volume = this.musicVolume;
          video.muted = this.isMusicMuted;
          video.style.display = 'none';
          this.bgMusicMedia = video;
          video.play().catch(err => {
            console.warn('Video audio playback failed, attempting audio fallback:', err);
            try {
              const audio = new Audio(track.url);
              audio.loop = true;
              audio.volume = this.musicVolume;
              audio.muted = this.isMusicMuted;
              this.bgMusicMedia = audio;
              audio.play().catch(() => {});
            } catch {}
          });
        } else {
          const audio = new Audio(track.url);
          audio.loop = true;
          audio.volume = this.musicVolume;
          audio.muted = this.isMusicMuted;
          this.bgMusicMedia = audio;
          audio.play().catch(err => {
            console.warn('Audio play failed:', err);
          });
        }
      } catch (e) {
        console.warn('Failed to start media track:', e);
      }
    }
    this.isMusicPlaying = true;
  }

  public toggleMusic() {
    if (this.isMusicPlaying) {
      this.pauseMusic();
    } else {
      this.playTrack(this.currentTrack);
    }
    return this.isMusicPlaying;
  }

  public pauseMusic() {
    this.stopMusic();
    this.isMusicPlaying = false;
  }

  private stopMusic() {
    if (this.bgMusicMedia) {
      try {
        this.bgMusicMedia.pause();
        this.bgMusicMedia.currentTime = 0;
        this.bgMusicMedia = null;
      } catch {}
    }
    if (this.synthMusicNodes && this.ctx) {
      try {
        this.synthMusicNodes.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        const nodes = this.synthMusicNodes;
        setTimeout(() => {
          nodes.oscs.forEach(o => {
            try { o.stop(); o.disconnect(); } catch {}
          });
          nodes.gain.disconnect();
        }, 250);
        this.synthMusicNodes = null;
      } catch {
        this.synthMusicNodes = null;
      }
    }
    this.isMusicPlaying = false;
  }

  private startSyntheticTrack(type: string) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    const targetGain = this.isMusicMuted ? 0 : this.musicVolume * 0.18;
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(targetGain, now + 1.2);
    masterGain.connect(this.ctx.destination);

    const oscs: OscillatorNode[] = [];

    if (type === 'synthetic:doomsday') {
      const freqs = [73.42, 110.0, 174.61];
      freqs.forEach(f => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, now);
        filter.Q.setValueAtTime(3, now);

        osc.connect(filter);
        filter.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });
    } else if (type === 'synthetic:stream') {
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(44, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(66, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();
      oscs.push(osc1, osc2);
    } else if (type === 'synthetic:incursion') {
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(116.54, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(123.47, now);

      osc1.connect(masterGain);
      osc2.connect(masterGain);
      osc1.start();
      osc2.start();
      oscs.push(osc1, osc2);
    } else {
      const freqs = [65.41, 98.00, 130.81, 164.81];
      freqs.forEach(f => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });
    }

    this.synthMusicNodes = { oscs, gain: masterGain };
  }

  public toggleDrone(enable?: boolean) {
    const target = enable !== undefined ? enable : !this.isDroneActive;
    this.isDroneActive = target;
    if (target) {
      this.startDrone();
    } else {
      this.stopDrone();
    }
    return this.isDroneActive;
  }

  public getDroneActive(): boolean {
    return this.isDroneActive;
  }

  private startDrone() {
    if (!this.ctx || this.droneGain) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.0001, now);
      const targetGain = this.isMusicMuted ? 0 : this.musicVolume * 0.08;
      this.droneGain.gain.linearRampToValueAtTime(targetGain, now + 1.5);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(48, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(36, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
    } catch {}
  }

  private stopDrone() {
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        this.droneGain = null;
      } catch {
        this.droneGain = null;
      }
    }
  }

  // --- CINEMATIC SEQUENCES & FEEDBACK ---
  public playDisintegrationEffect() {
    if (this.isClockMuted || this.clockVolume <= 0.001) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(this.clockVolume * 0.9, now);
      master.connect(this.ctx.destination);

      // Deep sub-bass drop (Reality collapse)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(22, now + 1.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(40, now + 1.2);

      subGain.gain.setValueAtTime(0.7, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      subOsc.connect(filter);
      filter.connect(subGain);
      subGain.connect(master);
      subOsc.start(now);
      subOsc.stop(now + 1.25);

      // Quantum glitch shatter / static burst
      const bufferSize = this.ctx.sampleRate * 0.8;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 0.9);
      noiseFilter.Q.setValueAtTime(3, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.9);
    } catch (e) {
      console.warn('Disintegration audio failed:', e);
    }
  }

  public playCinematicArrivalFanfare() {
    if (this.isClockMuted || this.clockVolume <= 0.001) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(this.clockVolume * 0.85, now);
      master.connect(this.ctx.destination);

      // Sub boom impact
      const boom = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(90, now);
      boom.frequency.exponentialRampToValueAtTime(28, now + 1.8);
      boomGain.gain.setValueAtTime(0.8, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      boom.connect(boomGain);
      boomGain.connect(master);
      boom.start(now);
      boom.stop(now + 1.85);

      // Harmonic chords (Resonant cinematic fanfare)
      const freqs = [130.81, 196.0, 261.63, 329.63, 392.0, 523.25];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const chordFilter = this.ctx.createBiquadFilter();
        chordFilter.type = 'lowpass';
        chordFilter.frequency.setValueAtTime(600, now);
        chordFilter.frequency.linearRampToValueAtTime(1400, now + 0.6);
        chordFilter.frequency.exponentialRampToValueAtTime(200, now + 2.5);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

        osc.connect(chordFilter);
        chordFilter.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } catch (e) {
      console.warn('Cinematic arrival fanfare audio failed:', e);
    }
  }

  public playUiClick() {
    if (this.isClockMuted || this.clockVolume <= 0.001) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

      gain.gain.setValueAtTime(this.clockVolume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch {}
  }

  public playUiHover() {
    if (this.isClockMuted || this.clockVolume <= 0.001) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(this.clockVolume * 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  public playSuccessCheck() {
    if (this.isClockMuted || this.clockVolume <= 0.001) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.08);

      gain.gain.setValueAtTime(this.clockVolume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
