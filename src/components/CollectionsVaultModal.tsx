import React, { useState, useRef } from 'react';
import {
  X,
  FolderArchive,
  Plus,
  Music,
  Palette,
  Sparkles,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import GlassFolder, { type FolderFile } from '@/components/ui/glass-folder-cards';
import { useAuth, type UserCustomImage } from '../context/AuthContext';
import { soundEngine, BUILTIN_MUSIC_TRACKS, type MusicTrack } from '../audio/soundEngine';
import { CLOCK_PRESETS, type ClockStylePreset } from '../utils/themeAdapter';
import { compressImage, storeImageBlob } from '../utils/mediaStorage';
import { extractYouTubeId, parseMediaUrl } from '../utils/mediaUrlParser';

interface CollectionsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (
    url: string | undefined,
    mediaMeta?: {
      isVideo?: boolean;
      isYouTube?: boolean;
      youTubeId?: string;
      name?: string;
      id?: string;
    }
  ) => void;
  currentClockPreset: ClockStylePreset;
  onSelectClockPreset: (preset: ClockStylePreset) => void;
  currentTrack: MusicTrack;
  onSelectMusicTrack: (track: MusicTrack) => void;
  onShowToast: (message: string) => void;
}

export const CollectionsVaultModal: React.FC<CollectionsVaultModalProps> = ({
  isOpen,
  onClose,
  onSelectBackground,
  currentClockPreset,
  onSelectClockPreset,
  currentTrack,
  onSelectMusicTrack,
  onShowToast,
}) => {
  const { currentUser, addCustomImage } = useAuth();
  const customImages: UserCustomImage[] = currentUser?.preferences?.customImages || [];

  // Add Artwork Dialog State
  const [isAddArtworkOpen, setIsAddArtworkOpen] = useState(false);
  const [artworkName, setArtworkName] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Files for Folder 1: Uploaded Artworks (Only User Custom Uploads)
  const uploadedArtFiles: FolderFile[] =
    customImages.length > 0
      ? customImages.map((img) => ({
          name: img.name || 'Custom Artwork',
          meta: img.isVideo
            ? 'Video · MP4'
            : img.isYouTube
            ? 'YouTube Stream'
            : 'Custom Wallpaper',
          image:
            !img.isVideo && !img.isYouTube && (img.thumbnailDataUrl || img.url.startsWith('http'))
              ? img.thumbnailDataUrl || img.url
              : undefined,
          art: img.isVideo ? 'aurora' : img.isYouTube ? 'ember' : 'dusk',
        }))
      : [
          {
            name: '+ Upload Your First Artwork',
            meta: 'PNG · JPG · MP4 · YouTube',
            art: 'ember',
          },
          {
            name: 'Glass Vault Storage',
            meta: 'Synced to your cloud profile',
            art: 'dusk',
          },
        ];

  // 2. Files for Folder 2: Music & Soundtracks
  const soundtrackFiles: FolderFile[] = BUILTIN_MUSIC_TRACKS.map((track) => ({
    name: track.title,
    meta: `${track.artist} · ${track.isYouTube ? 'YouTube' : 'Cinematic'}`,
    art: track.id.includes('doomsday')
      ? 'aurora'
      : track.id.includes('cyberpunk')
      ? 'ember'
      : track.id.includes('chill')
      ? 'verdant'
      : 'glacier',
  }));

  // 3. Files for Folder 3: Clock Themes & Styles
  const themePresetsKeys: ClockStylePreset[] = [
    'doomsday',
    'tva',
    'quantum',
    'wakanda_sunset',
    'cyberpunk',
    'midnight_noir',
    'sakura_zen',
    'electric_storm',
    'galactus_nebula',
    'kang_dynasty',
    'phantom_stealth',
    'bifrost',
  ];

  const themeFiles: FolderFile[] = themePresetsKeys.map((key) => {
    const preset = CLOCK_PRESETS[key];
    return {
      name: preset?.label || key,
      meta: `${preset?.tag || 'Theme'} · ${preset?.fontFamily || 'Display'}`,
      art:
        key === 'doomsday'
          ? 'verdant'
          : key === 'tva'
          ? 'dusk'
          : key === 'quantum'
          ? 'glacier'
          : key === 'cyberpunk'
          ? 'ember'
          : 'aurora',
    };
  });

  // Handle Artwork File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      soundEngine.playSelect();
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
      const name = artworkName.trim() || file.name.replace(/\.[^/.]+$/, '');

      if (isVideo) {
        // Videos are stored in IndexedDB blob storage
        const storageKey = `vid_${Date.now()}`;
        await storeImageBlob(storageKey, file);
        const objectUrl = URL.createObjectURL(file);

        addCustomImage({
          name,
          url: objectUrl,
          collectionName: 'My Uploads',
          storageKey,
          isVideo: true,
        });

        onSelectBackground(objectUrl, {
          isVideo: true,
          name,
        });

        onShowToast(`✓ Video artwork uploaded & applied: ${name}`);
      } else {
        // Compress image to 1080p and generate lightweight thumbnail
        const compressed = await compressImage(file, 1920, 1080, 0.84);
        const storageKey = `img_${Date.now()}`;
        await storeImageBlob(storageKey, compressed.blob);

        addCustomImage({
          name,
          url: compressed.dataUrl,
          collectionName: 'My Uploads',
          storageKey,
          thumbnailDataUrl: compressed.thumbnailDataUrl,
          isVideo: false,
        });

        onSelectBackground(compressed.dataUrl, {
          isVideo: false,
          name,
        });

        onShowToast(`✓ Artwork uploaded & applied: ${name}`);
      }

      setIsAddArtworkOpen(false);
      setArtworkName('');
      setArtworkUrl('');
      soundEngine.playSuccessCheck();
    } catch (err: unknown) {
      console.error('Failed to upload artwork:', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Direct Artwork URL or YouTube Addition
  const handleAddUrlArtwork = () => {
    const url = artworkUrl.trim();
    if (!url) {
      setUploadError('Please enter a valid image, video, or YouTube URL');
      return;
    }

    const parsed = parseMediaUrl(url);
    if (!parsed.directUrl || parsed.directUrl.length < 5) {
      setUploadError('Invalid URL. Provide a direct image/video link or a YouTube watch link.');
      return;
    }

    const ytId = extractYouTubeId(url);
    const isVideo = Boolean(ytId || /\.(mp4|webm|mov|mkv)$/i.test(url));
    const name = artworkName.trim() || (ytId ? `YouTube Stream (${ytId})` : 'Web Artwork');

    addCustomImage({
      name,
      url,
      collectionName: 'Web Media',
      isVideo,
      isYouTube: Boolean(ytId),
      youTubeId: ytId || undefined,
    });

    onSelectBackground(url, {
      isVideo,
      isYouTube: Boolean(ytId),
      youTubeId: ytId || undefined,
      name,
    });

    onShowToast(`✓ Added to Vault & applied: ${name}`);
    soundEngine.playSuccessCheck();
    setIsAddArtworkOpen(false);
    setArtworkName('');
    setArtworkUrl('');
  };

  // Click Handler for Folder 1 (Uploaded Art)
  const handleSelectUploadedArt = (_file: FolderFile, index: number) => {
    soundEngine.playSelect();
    if (customImages.length === 0) {
      setIsAddArtworkOpen(true);
      return;
    }

    const img = customImages[index];
    if (img) {
      onSelectBackground(img.url, {
        isVideo: img.isVideo,
        isYouTube: img.isYouTube,
        youTubeId: img.youTubeId,
        name: img.name,
        id: img.id,
      });
      onShowToast(`✓ Applied uploaded artwork: ${img.name}`);
    }
  };

  // Click Handler for Folder 2 (Soundtrack)
  const handleSelectSoundtrack = (_file: FolderFile, index: number) => {
    soundEngine.playSelect();
    const track = BUILTIN_MUSIC_TRACKS[index];
    if (track) {
      onSelectMusicTrack(track);
      soundEngine.playTrack(track);
      onShowToast(`♪ Playing: ${track.title}`);
    }
  };

  // Click Handler for Folder 3 (Themes)
  const handleSelectTheme = (_file: FolderFile, index: number) => {
    soundEngine.playSelect();
    const key = themePresetsKeys[index];
    if (key) {
      onSelectClockPreset(key);
      const presetInfo = CLOCK_PRESETS[key];
      onShowToast(`✓ Theme switched: ${presetInfo?.label || key}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl my-auto rounded-3xl bg-neutral-950/90 border border-white/15 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl" />

        {/* Header Bar */}
        <div className="relative flex items-center justify-between pb-6 mb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(0,255,136,0.25)]">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-wider text-white">
                  COLLECTIONS VAULT
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                  3D Glass Cards
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                Interactive physical glass folders for your uploaded artworks, soundtrack scores, and clock themes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playSelect();
                setIsAddArtworkOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold font-mono tracking-wider transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Art</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playSelect();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-400 hover:text-white transition-all"
              aria-label="Close Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Folders Grid: 3 Interactive Glass Folders */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10 justify-items-center items-end py-4">
          {/* Folder 1: Uploaded Artworks */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                Uploaded Artworks ({customImages.length})
              </span>
            </div>
            <GlassFolder
              label="Uploaded Art"
              meta={`${customImages.length} custom file${customImages.length === 1 ? '' : 's'}`}
              tone="dark"
              art="ember"
              seed={42}
              action="add"
              labelPlacement="bottom-left"
              appearDelay={0}
              files={uploadedArtFiles}
              onAdd={() => {
                soundEngine.playSelect();
                setIsAddArtworkOpen(true);
              }}
              onFileSelect={handleSelectUploadedArt}
            />
            <span className="text-[11px] font-mono text-neutral-500 mt-4 tracking-wider">
              Click + to drop art · Tap card to apply wallpaper
            </span>
          </div>

          {/* Folder 2: Soundtracks & Music */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                Soundtrack Vault ({BUILTIN_MUSIC_TRACKS.length})
              </span>
            </div>
            <GlassFolder
              label="Soundtracks"
              meta={currentTrack?.title ? `Playing: ${currentTrack.title.slice(0, 18)}…` : 'Music Scores'}
              tone="light"
              art="aurora"
              seed={7}
              action="more"
              labelPlacement="top-left"
              appearDelay={140}
              files={soundtrackFiles}
              menu={[
                {
                  label: 'Play Random Track',
                  onSelect: () => {
                    const rnd = BUILTIN_MUSIC_TRACKS[Math.floor(Math.random() * BUILTIN_MUSIC_TRACKS.length)];
                    onSelectMusicTrack(rnd);
                    soundEngine.playTrack(rnd);
                    onShowToast(`♪ Playing: ${rnd.title}`);
                  },
                },
                {
                  label: 'Toggle Music Play/Pause',
                  onSelect: () => {
                    soundEngine.toggleMusic();
                  },
                },
              ]}
              onFileSelect={handleSelectSoundtrack}
            />
            <span className="text-[11px] font-mono text-neutral-500 mt-4 tracking-wider">
              ··· for options · Tap card to listen
            </span>
          </div>

          {/* Folder 3: Themes & Styles */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                Clock Themes ({themePresetsKeys.length})
              </span>
            </div>
            <GlassFolder
              label="Clock Themes"
              meta={`Active: ${CLOCK_PRESETS[currentClockPreset]?.label || currentClockPreset}`}
              tone="dark"
              art="verdant"
              seed={19}
              action="none"
              labelPlacement="top-right"
              appearDelay={280}
              files={themeFiles}
              onFileSelect={handleSelectTheme}
            />
            <span className="text-[11px] font-mono text-neutral-500 mt-4 tracking-wider">
              Click to open · Select any theme to switch
            </span>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="relative mt-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Hover folders to lean glass · Click to fan out files · Keyboard navigation supported</span>
          </div>
          <div className="mt-2 sm:mt-0 text-neutral-400">
            Current Theme: <span className="text-emerald-400 font-bold">{CLOCK_PRESETS[currentClockPreset]?.label || currentClockPreset}</span>
          </div>
        </div>

        {/* Modal Dialog: Add / Upload New Custom Artwork */}
        {isAddArtworkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-emerald-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-display">
                  <Upload className="w-5 h-5" />
                  <span>Add Custom Artwork to Vault</span>
                </div>
                <button
                  onClick={() => setIsAddArtworkOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
                  {uploadError}
                </div>
              )}

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-400 mb-1">Artwork Title (Optional)</label>
                  <input
                    type="text"
                    value={artworkName}
                    onChange={(e) => setArtworkName(e.target.value)}
                    placeholder="e.g. Secret Wars Battleworld"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Option A: Upload Local File */}
                <div>
                  <label className="block text-neutral-400 mb-1">Option A: Upload Image or Video File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,video/mp4,video/webm"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 file:cursor-pointer cursor-pointer"
                  />
                  {isUploading && (
                    <p className="text-emerald-400 mt-1 animate-pulse">Processing & optimizing artwork...</p>
                  )}
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="flex-shrink mx-2 text-neutral-500 text-[10px] uppercase">Or</span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                {/* Option B: Web URL / YouTube */}
                <div>
                  <label className="block text-neutral-400 mb-1">Option B: Image, Video or YouTube URL</label>
                  <input
                    type="text"
                    value={artworkUrl}
                    onChange={(e) => setArtworkUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or https://youtu.be/..."
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddUrlArtwork}
                  disabled={!artworkUrl.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                >
                  Save URL to Vault
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CollectionsVaultModal;
