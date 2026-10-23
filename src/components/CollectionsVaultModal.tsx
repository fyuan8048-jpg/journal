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
  Bookmark,
  BookmarkCheck,
  Star,
  Tv,
  Check,
  Layers,
} from 'lucide-react';
import GlassFolder, { type FolderFile } from '@/components/ui/glass-folder-cards';
import { useAuth, type UserCustomImage, type SavedTheme } from '../context/AuthContext';
import { soundEngine, BUILTIN_MUSIC_TRACKS, type MusicTrack } from '../audio/soundEngine';
import { CLOCK_PRESETS, type ClockStylePreset } from '../utils/themeAdapter';
import { compressImage, storeImageBlob } from '../utils/mediaStorage';
import { extractYouTubeId, parseMediaUrl } from '../utils/mediaUrlParser';
import { CURATED_BACKGROUNDS, type BackgroundItem } from '../data/curatedBackgrounds';
import type { ClockCustomSettings } from '../utils/countdown';

interface CollectionsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBackground?: BackgroundItem;
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
  customSettings?: ClockCustomSettings;
  onUpdateCustomSettings?: (settings: ClockCustomSettings) => void;
  currentTrack: MusicTrack;
  onSelectMusicTrack: (track: MusicTrack) => void;
  onShowToast: (message: string) => void;
}

export const CollectionsVaultModal: React.FC<CollectionsVaultModalProps> = ({
  isOpen,
  onClose,
  activeBackground,
  onSelectBackground,
  currentClockPreset,
  onSelectClockPreset,
  customSettings,
  onUpdateCustomSettings,
  currentTrack,
  onSelectMusicTrack,
  onShowToast,
}) => {
  const {
    currentUser,
    addCustomImage,
    saveRotationArtwork,
    addCustomMusicTrack,
    saveTheme,
  } = useAuth();

  const customImages: UserCustomImage[] = currentUser?.preferences?.customImages || [];
  const customMusicTracks: MusicTrack[] = currentUser?.preferences?.customMusicTracks || [];
  const savedThemes: SavedTheme[] = currentUser?.preferences?.savedThemes || [];

  // Dialog States
  const [isAddArtworkOpen, setIsAddArtworkOpen] = useState(false);
  const [isBrowseRotationOpen, setIsBrowseRotationOpen] = useState(false);
  const [isAddYouTubeMusicOpen, setIsAddYouTubeMusicOpen] = useState(false);
  const [isSaveThemeOpen, setIsSaveThemeOpen] = useState(false);

  // Add Artwork Form State
  const [artworkName, setArtworkName] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add YouTube Music Form State
  const [ytMusicUrl, setYtMusicUrl] = useState('');
  const [ytMusicTitle, setYtMusicTitle] = useState('');
  const [ytMusicArtist, setYtMusicArtist] = useState('');
  const [musicError, setMusicError] = useState<string | null>(null);

  // Save Theme Form State
  const [themeCustomName, setThemeCustomName] = useState('');
  const [themeError, setThemeError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Check if current active rotation background is already saved
  const isCurrentActiveBgSaved =
    activeBackground &&
    customImages.some(
      (img) => img.url === (activeBackground.videoUrl || activeBackground.imageUrl) || img.name === activeBackground.title
    );

  // 1. Files for Folder 1: Uploaded & Saved Rotation Artworks
  const uploadedArtFiles: FolderFile[] =
    customImages.length > 0
      ? customImages.map((img) => ({
          name: img.name || 'Custom Artwork',
          meta:
            img.collectionName === 'Rotation Archive'
              ? 'Saved Rotation Art'
              : img.isVideo
              ? 'Video · MP4'
              : img.isYouTube
              ? 'YouTube Stream'
              : 'Custom Wallpaper',
          image:
            !img.isVideo && !img.isYouTube && (img.thumbnailDataUrl || img.url.startsWith('http'))
              ? img.thumbnailDataUrl || img.url
              : undefined,
          art: img.isVideo ? 'aurora' : img.isYouTube ? 'ember' : img.collectionName === 'Rotation Archive' ? 'verdant' : 'dusk',
        }))
      : [
          {
            name: '+ Upload or Save Rotation Art',
            meta: 'PNG · JPG · MP4 · YouTube',
            art: 'ember',
          },
          {
            name: 'Glass Vault Storage',
            meta: 'Preserved in your cloud profile',
            art: 'dusk',
          },
        ];

  // 2. Files for Folder 2: Soundtracks & Saved YouTube Music
  const allMusicTracks: MusicTrack[] = [...customMusicTracks, ...BUILTIN_MUSIC_TRACKS];
  const soundtrackFiles: FolderFile[] = allMusicTracks.map((track) => ({
    name: track.title,
    meta: track.isYouTube
      ? `▶ YouTube · ${track.artist}`
      : `${track.artist} · ${track.id.includes('doomsday') ? 'Cinematic Score' : 'Score'}`,
    art: track.isYouTube
      ? 'ember'
      : track.id.includes('doomsday')
      ? 'aurora'
      : track.id.includes('chill')
      ? 'verdant'
      : 'glacier',
  }));

  // 3. Files for Folder 3: Clock Themes & Saved Custom Themes
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

  const allThemeFiles: FolderFile[] = [
    ...savedThemes.map((st) => ({
      name: `⭐ ${st.name}`,
      meta: `Saved Custom · ${st.customSettings?.fontFamily || st.preset}`,
      art: 'aurora' as const,
    })),
    ...themePresetsKeys.map((key) => {
      const preset = CLOCK_PRESETS[key];
      return {
        name: preset?.label || key,
        meta: `${preset?.tag || 'Theme'} · ${preset?.fontFamily || 'Display'}`,
        art:
          key === 'doomsday'
            ? ('verdant' as const)
            : key === 'tva'
            ? ('dusk' as const)
            : key === 'quantum'
            ? ('glacier' as const)
            : key === 'cyberpunk'
            ? ('ember' as const)
            : ('aurora' as const),
      };
    }),
  ];

  // Handler: Save Current Active Rotation Background Forever
  const handleSaveActiveRotation = () => {
    if (!activeBackground) return;
    soundEngine.playSelect();
    saveRotationArtwork(activeBackground);
    onShowToast(`✓ Saved "${activeBackground.title}" to your folder forever!`);
    soundEngine.playSuccessCheck();
  };

  // Handler: Save Any Background Item From Rotation Catalog
  const handleSaveCatalogItem = (item: BackgroundItem) => {
    soundEngine.playSelect();
    saveRotationArtwork(item);
    onShowToast(`✓ Saved "${item.title}" to your folder forever!`);
    soundEngine.playSuccessCheck();
  };

  // Handler: Upload Local Artwork File
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

        onSelectBackground(objectUrl, { isVideo: true, name });
        onShowToast(`✓ Video artwork uploaded & applied: ${name}`);
      } else {
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

        onSelectBackground(compressed.dataUrl, { isVideo: false, name });
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

  // Handler: Add Direct Image / Video / YouTube Artwork URL
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
      collectionName: ytId ? 'YouTube Artworks' : 'Web Media',
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

  // Handler: Add & Save YouTube Music Track to Folder
  const handleSaveYouTubeMusic = (e: React.FormEvent) => {
    e.preventDefault();
    const url = ytMusicUrl.trim();
    if (!url) {
      setMusicError('Please enter a YouTube video URL or live stream link');
      return;
    }

    const ytId = extractYouTubeId(url);
    const title = ytMusicTitle.trim() || (ytId ? `YouTube Soundtrack (${ytId})` : 'Custom Music Track');
    const artist = ytMusicArtist.trim() || (ytId ? 'YouTube Stream' : 'Custom Audio');

    const newTrack: MusicTrack = {
      id: `yt_music_${Date.now()}`,
      title,
      artist,
      url,
      isCustom: true,
      isVideo: Boolean(ytId),
      isYouTube: Boolean(ytId),
      youTubeId: ytId || undefined,
    };

    addCustomMusicTrack(newTrack);
    onSelectMusicTrack(newTrack);
    soundEngine.playTrack(newTrack);

    onShowToast(`♪ Saved "${title}" to your Soundtracks folder!`);
    soundEngine.playSuccessCheck();
    setIsAddYouTubeMusicOpen(false);
    setYtMusicUrl('');
    setYtMusicTitle('');
    setYtMusicArtist('');
    setMusicError(null);
  };

  // Handler: Save Current Clock Theme to Folder
  const handleSaveCurrentTheme = (e: React.FormEvent) => {
    e.preventDefault();
    const name = themeCustomName.trim();
    if (!name) {
      setThemeError('Please enter a name for your custom theme');
      return;
    }

    const newTheme: SavedTheme = {
      id: `theme_${Date.now()}`,
      name,
      preset: currentClockPreset,
      customSettings: customSettings,
      createdAt: Date.now(),
    };

    saveTheme(newTheme);
    onShowToast(`⭐ Saved "${name}" to your Clock Themes folder!`);
    soundEngine.playSuccessCheck();
    setIsSaveThemeOpen(false);
    setThemeCustomName('');
    setThemeError(null);
  };

  // Click Handler for Folder 1 (Uploaded & Saved Art)
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
      onShowToast(`✓ Applied artwork: ${img.name}`);
    }
  };

  // Click Handler for Folder 2 (Soundtrack & YouTube Music)
  const handleSelectSoundtrack = (_file: FolderFile, index: number) => {
    soundEngine.playSelect();
    const track = allMusicTracks[index];
    if (track) {
      onSelectMusicTrack(track);
      soundEngine.playTrack(track);
      onShowToast(`♪ Playing: ${track.title}`);
    }
  };

  // Click Handler for Folder 3 (Themes & Saved Themes)
  const handleSelectTheme = (_file: FolderFile, index: number) => {
    soundEngine.playSelect();

    if (index < savedThemes.length) {
      // User-saved custom theme
      const saved = savedThemes[index];
      onSelectClockPreset(saved.preset);
      if (saved.customSettings && onUpdateCustomSettings) {
        onUpdateCustomSettings(saved.customSettings);
      }
      onShowToast(`⭐ Restored theme: ${saved.name}`);
    } else {
      // Standard curated preset
      const presetIndex = index - savedThemes.length;
      const key = themePresetsKeys[presetIndex];
      if (key) {
        onSelectClockPreset(key);
        const presetInfo = CLOCK_PRESETS[key];
        onShowToast(`✓ Theme switched: ${presetInfo?.label || key}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl my-auto rounded-3xl bg-neutral-950/90 border border-white/15 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl" />

        {/* Header Bar */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
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
                  Permanent Storage
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                Physical glass folders preserving your rotation artworks forever, YouTube music streams, and custom themes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Action: Save Active Rotation Artwork */}
            {activeBackground && (
              <button
                onClick={handleSaveActiveRotation}
                disabled={Boolean(isCurrentActiveBgSaved)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold font-mono tracking-wider transition-all ${
                  isCurrentActiveBgSaved
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 opacity-80 cursor-default'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300 hover:text-white hover:scale-105'
                }`}
                title={isCurrentActiveBgSaved ? 'Already saved in your folder' : `Save "${activeBackground.title}" forever`}
              >
                {isCurrentActiveBgSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{isCurrentActiveBgSaved ? 'Rotation Art Saved' : 'Save Active Art'}</span>
              </button>
            )}

            {/* Quick Action: Save Current Theme */}
            <button
              onClick={() => {
                soundEngine.playSelect();
                setIsSaveThemeOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold font-mono tracking-wider transition-all"
              title="Save current theme configuration into Themes folder"
            >
              <Star className="w-4 h-4" />
              <span>Save Theme</span>
            </button>

            {/* Quick Action: Add YouTube Music */}
            <button
              onClick={() => {
                soundEngine.playSelect();
                setIsAddYouTubeMusicOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold font-mono tracking-wider transition-all"
              title="Add YouTube track to Soundtracks folder"
            >
              <Music className="w-4 h-4" />
              <span>Add YouTube</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playSelect();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-400 hover:text-white transition-all ml-1"
              aria-label="Close Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Folders Grid: 3 Interactive Glass Folders */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10 justify-items-center items-end py-4">
          {/* Folder 1: Uploaded & Saved Rotation Artworks */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-1">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                  Artworks Folder ({customImages.length})
                </span>
              </div>
              <button
                onClick={() => setIsBrowseRotationOpen(true)}
                className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
              >
                <Layers className="w-3 h-3" />
                <span>Rotation Catalog</span>
              </button>
            </div>

            <GlassFolder
              label="Saved Art"
              meta={`${customImages.length} saved file${customImages.length === 1 ? '' : 's'}`}
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

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setIsAddArtworkOpen(true)}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30"
              >
                <Plus className="w-3 h-3" /> Upload / Add Media
              </button>
              <button
                onClick={() => setIsBrowseRotationOpen(true)}
                className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
              >
                <Bookmark className="w-3 h-3" /> Save Daily Art
              </button>
            </div>
          </div>

          {/* Folder 2: Soundtracks & Saved YouTube Music */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-1">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                  Soundtracks Folder ({allMusicTracks.length})
                </span>
              </div>
              {customMusicTracks.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  {customMusicTracks.length} YouTube
                </span>
              )}
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
                  label: '+ Add YouTube Track to Folder',
                  onSelect: () => setIsAddYouTubeMusicOpen(true),
                },
                {
                  label: 'Play Random Track',
                  onSelect: () => {
                    const rnd = allMusicTracks[Math.floor(Math.random() * allMusicTracks.length)];
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

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setIsAddYouTubeMusicOpen(true)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30"
              >
                <Plus className="w-3 h-3" /> Add YouTube Music
              </button>
            </div>
          </div>

          {/* Folder 3: Themes & Saved Custom Themes */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-[340px] mb-3 px-1">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                  Themes Folder ({allThemeFiles.length})
                </span>
              </div>
              {savedThemes.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">
                  {savedThemes.length} Custom
                </span>
              )}
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
              files={allThemeFiles}
              onFileSelect={handleSelectTheme}
            />

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setIsSaveThemeOpen(true)}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30"
              >
                <Star className="w-3 h-3" /> Save Current Theme
              </button>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="relative mt-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Interactive 3D Glass: Tilt to lean, click folder to open & fan files, click any item to apply immediately</span>
          </div>
          <div className="mt-2 sm:mt-0 text-neutral-400">
            {customImages.length} Saved Artworks · {customMusicTracks.length} YouTube Tracks · {savedThemes.length} Custom Themes
          </div>
        </div>

        {/* MODAL 1: Upload / Add Media Artwork */}
        {isAddArtworkOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-emerald-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-display">
                  <Upload className="w-5 h-5" />
                  <span>Add Artwork to Folder</span>
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
                  Save to Artworks Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: Browse & Save Rotation Catalog Forever */}
        {isBrowseRotationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col p-6 rounded-3xl bg-neutral-900 border border-emerald-500/40 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold font-display text-white">
                      Save Rotation Artworks Forever
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Pick any rotating artwork to preserve permanently in your personal folder.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBrowseRotationOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Rotation Artworks */}
              <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pr-1">
                {CURATED_BACKGROUNDS.map((item) => {
                  const isSaved = customImages.some(
                    (img) => img.url === (item.videoUrl || item.imageUrl) || img.name === item.title
                  );
                  return (
                    <div
                      key={item.id}
                      className="group relative h-40 rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all flex flex-col justify-end p-3"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      <div className="relative z-10 flex items-end justify-between gap-2">
                        <div className="truncate">
                          <span className="block text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                            {item.category}
                          </span>
                          <span className="block text-xs font-bold text-white truncate drop-shadow">
                            {item.title}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveCatalogItem(item)}
                          disabled={isSaved}
                          className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono tracking-wider transition-all ${
                            isSaved
                              ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 cursor-default'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg hover:scale-105'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3 h-3" /> Saved
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 h-3" /> Save Forever
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: Add & Save YouTube Music to Folder */}
        {isAddYouTubeMusicOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-cyan-400 font-bold font-display">
                  <Tv className="w-5 h-5" />
                  <span>Save YouTube Music to Folder</span>
                </div>
                <button
                  onClick={() => setIsAddYouTubeMusicOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {musicError && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
                  {musicError}
                </div>
              )}

              <form onSubmit={handleSaveYouTubeMusic} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-400 mb-1">YouTube URL or Live Stream Link</label>
                  <input
                    type="text"
                    value={ytMusicUrl}
                    onChange={(e) => setYtMusicUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Track Title (Optional)</label>
                  <input
                    type="text"
                    value={ytMusicTitle}
                    onChange={(e) => setYtMusicTitle(e.target.value)}
                    placeholder="e.g. Marvel Lofi Beats to Study"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Artist / Channel (Optional)</label>
                  <input
                    type="text"
                    value={ytMusicArtist}
                    onChange={(e) => setYtMusicArtist(e.target.value)}
                    placeholder="e.g. Lofi Girl / Marvel Studios"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  Save Track to Soundtracks Folder
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: Save Current Theme to Folder */}
        {isSaveThemeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-display">
                  <Star className="w-5 h-5" />
                  <span>Save Theme to Folder</span>
                </div>
                <button
                  onClick={() => setIsSaveThemeOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {themeError && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono">
                  {themeError}
                </div>
              )}

              <form onSubmit={handleSaveCurrentTheme} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-neutral-400 mb-1">Custom Theme Name</label>
                  <input
                    type="text"
                    value={themeCustomName}
                    onChange={(e) => setThemeCustomName(e.target.value)}
                    placeholder="e.g. TVA Golden Multiverse, Emerald Doom"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-neutral-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Preset:</span>
                    <span className="text-amber-400 font-bold">{CLOCK_PRESETS[currentClockPreset]?.label || currentClockPreset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Font:</span>
                    <span>{customSettings?.fontFamily || CLOCK_PRESETS[currentClockPreset]?.fontFamily || 'Default'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Scale / Glow:</span>
                    <span>{customSettings?.scale || 1.0}x / {customSettings?.brightness ? `${customSettings.brightness}x` : 'Auto'}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  Save to Themes Folder
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsVaultModal;
