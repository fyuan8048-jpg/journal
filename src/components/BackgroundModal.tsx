import React, { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Trash2,
  Check,
  Sparkles,
  SlidersHorizontal,
  Search,
  Globe,
  RefreshCw,
  Clock,
  Plus,
  Loader2
} from 'lucide-react';
import { CURATED_BACKGROUNDS, type BackgroundItem, getDailyBackground } from '../data/curatedBackgrounds';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';
import { fetchArtworksForCountdown, fetchArtworksFromWeb } from '../utils/artworkFetcher';

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInterests: () => void;
  activeBackground: BackgroundItem;
  setActiveBackground: (bg: BackgroundItem) => void;
  activeCustomUrl?: string;
  setActiveCustomUrl: (url: string | undefined) => void;
  initialTab?: TabType;
  activeCountdown?: { id: string; title: string; category?: string };
}

export type TabType = 'curated' | 'web' | 'custom' | 'daily';

const SEARCH_SUGGESTIONS = [
  'Avengers: Doomsday',
  'Doctor Doom Latveria',
  'Secret Wars Battleworld',
  'Cyberpunk Neo City',
  'Gothic Castle Throne',
  'Cosmic Incursion Galaxy',
  'Classic Vintage Marvel'
];

export const BackgroundModal: React.FC<BackgroundModalProps> = ({
  isOpen,
  onClose,
  onOpenInterests,
  activeBackground,
  setActiveBackground,
  activeCustomUrl,
  setActiveCustomUrl,
  initialTab = 'curated',
  activeCountdown,
}) => {
  const { currentUser, addCustomImage, removeCustomImage, updatePreferences } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [collectionName] = useState('My Wallpapers');
  const [uploadError, setUploadError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Web Art Discovery State
  const [webArtworks, setWebArtworks] = useState<BackgroundItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasLoadedWeb, setHasLoadedWeb] = useState(false);

  // 24h Rotation State
  const isAutoRotate = currentUser?.preferences?.autoRotate24h !== false;
  const [dailyOffset, setDailyOffset] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const customImages = currentUser?.preferences?.customImages || [];

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'curated');
    }
  }, [isOpen, initialTab]);

  // Load artworks matched to active countdown when Web tab is opened or countdown changes
  useEffect(() => {
    if (isOpen && activeTab === 'web' && !hasLoadedWeb) {
      loadWebArtworks();
    }
  }, [isOpen, activeTab, activeCountdown?.title]);

  const loadWebArtworks = async (query?: string) => {
    setIsSearching(true);
    try {
      if (query && query.trim()) {
        const results = await fetchArtworksFromWeb(query.trim(), 12);
        setWebArtworks(results);
      } else if (activeCountdown) {
        const results = await fetchArtworksForCountdown(activeCountdown.title, activeCountdown.category || 'marvel');
        setWebArtworks(results);
      } else {
        const results = await fetchArtworksFromWeb('avengers doomsday cinematic', 12);
        setWebArtworks(results);
      }
      setHasLoadedWeb(true);
    } catch (e) {
      console.error('Failed to load web artworks:', e);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  const interests = currentUser.preferences.interests;
  const todayDaily = getDailyBackground(interests, dailyOffset);
  const tomorrowDaily = getDailyBackground(interests, dailyOffset + 1);

  // Unified Wallpaper Activators
  const handleSelectCustom = (url: string, name?: string) => {
    setActiveCustomUrl(url);
    updatePreferences({ activeCustomImageUrl: url });
    soundEngine.playUiClick();
    showToast(`✓ Wallpaper applied: ${name || 'Custom Image'}`);
  };

  const handleSelectCurated = (item: BackgroundItem) => {
    setActiveCustomUrl(undefined);
    setActiveBackground(item);
    updatePreferences({ activeBackgroundId: item.id, activeCustomImageUrl: undefined });
    soundEngine.playUiClick();
    showToast(`✓ Wallpaper applied: ${item.title}`);
  };

  const handleSelectDaily = (item: BackgroundItem) => {
    setActiveCustomUrl(undefined);
    setActiveBackground(item);
    updatePreferences({
      activeBackgroundId: item.id,
      activeCustomImageUrl: undefined,
      lastRotationTimestamp: Date.now()
    });
    soundEngine.playUiClick();
    showToast(`✓ Daily wallpaper applied: ${item.title}`);
  };

  const handleToggleAutoRotate = () => {
    const next = !isAutoRotate;
    updatePreferences({ autoRotate24h: next });
    soundEngine.playUiClick();
    showToast(next ? '✓ 24-Hour Auto-Rotation Enabled' : '○ 24-Hour Auto-Rotation Disabled');
  };

  const handleForceRotate = () => {
    const nextOffset = dailyOffset + 1;
    setDailyOffset(nextOffset);
    const nextItem = getDailyBackground(interests, nextOffset);
    handleSelectDaily(nextItem);
  };

  const handleSaveToWallpapers = (item: BackgroundItem) => {
    addCustomImage({
      name: item.title,
      url: item.imageUrl,
      collectionName: 'Web Saved Art'
    });
    soundEngine.playSuccessCheck();
    showToast(`✓ Saved "${item.title}" to My Wallpapers!`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadWebArtworks(searchQuery.trim());
    }
  };

  // Handle URL Add
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    try {
      new URL(newImageUrl.trim());
    } catch {
      setUploadError('Please enter a valid image URL');
      return;
    }

    const title = newImageName.trim() || 'Custom Artwork';
    addCustomImage({
      name: title,
      url: newImageUrl.trim(),
      collectionName: collectionName.trim() || 'General',
    });

    handleSelectCustom(newImageUrl.trim(), title);
    setNewImageUrl('');
    setNewImageName('');
    setUploadError('');
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File exceeds 8MB limit. Please use a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const title = file.name.replace(/\.[^/.]+$/, '');
      addCustomImage({
        name: title,
        url: dataUrl,
        collectionName: collectionName.trim() || 'Uploaded Wallpapers',
      });
      handleSelectCustom(dataUrl, title);
      setUploadError('');
    };
    reader.onerror = () => {
      setUploadError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] flex flex-col rounded-3xl bg-neutral-950/95 border border-emerald-500/30 shadow-2xl text-white overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                Artwork &amp; Wallpaper Studio
              </h2>
              <p className="text-xs text-neutral-400">
                100% Legit High-Resolution Artworks • Matched to Clock Themes • 24h Auto-Rotation
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

        {/* Tab Switcher & Interest Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-neutral-900/40">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('curated')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'curated'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              🎨 Curated Artworks ({CURATED_BACKGROUNDS.length})
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'web'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Art Discovery</span>
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>24h Auto-Rotation</span>
              {isAutoRotate && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'custom'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              🖼️ Uploads ({customImages.length})
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenInterests();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70 text-xs font-semibold transition-all shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Artwork Interests</span>
          </button>
        </div>

        {/* Floating Action Confirmation Toast inside Modal */}
        {toastMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300 animate-fade-in">
            <span className="flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>{toastMessage}</span>
            </span>
            <span className="text-[10px] uppercase font-mono text-emerald-400/80">Live On Screen</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: CURATED ARTWORKS GALLERY */}
          {activeTab === 'curated' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>Click any high-resolution artwork to apply it immediately:</span>
                <span className="text-emerald-400 font-mono">100% Legit HD Photography &amp; Art</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CURATED_BACKGROUNDS.map(item => {
                  const isActive = !activeCustomUrl && activeBackground.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectCurated(item)}
                      className={`group relative h-48 rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] ${
                        isActive
                          ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                          : 'border-white/10 hover:border-emerald-500/50'
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/10 text-neutral-200">
                          {item.category}
                        </span>
                      </div>
                      {isActive && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,136,0.8)]">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate drop-shadow">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-neutral-300 truncate max-w-[160px]">
                            {item.artistCredit || 'Curated Archive'}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.palette.primary }} />
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.palette.secondary }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE WEB ART DISCOVERY (Matched to Clock & Live Search) */}
          {activeTab === 'web' && (
            <div className="space-y-6">
              {/* Contextual Clock Match Banner */}
              {activeCountdown && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900/60 to-purple-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500 text-black">
                        Active Clock
                      </span>
                      <h3 className="font-bold text-sm text-white">
                        {activeCountdown.title}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Showing web artworks contextually related to this countdown's title &amp; theme.
                    </p>
                  </div>
                  <button
                    onClick={() => loadWebArtworks()}
                    disabled={isSearching}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,136,0.3)] shrink-0 disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Re-Match Clock Art</span>
                  </button>
                </div>
              )}

              {/* Live Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search any artwork on the web (e.g. Doomsday, Cyberpunk, Gothic, Starfield)..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-neutral-900/80 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Search</span>
                </button>
              </form>

              {/* Quick Search Suggestion Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] text-neutral-400 shrink-0">Quick Themes:</span>
                {SEARCH_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSearchQuery(s);
                      loadWebArtworks(s);
                    }}
                    className="px-3 py-1 rounded-lg text-xs bg-white/5 hover:bg-emerald-500/20 text-neutral-300 hover:text-emerald-300 border border-white/5 hover:border-emerald-500/30 transition-all shrink-0"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Artworks Grid */}
              {isSearching ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-sm text-neutral-400">Discovering high-definition web artworks...</p>
                </div>
              ) : webArtworks.length === 0 ? (
                <div className="py-16 text-center text-neutral-400">
                  <Globe className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
                  <p className="text-sm">No artworks found. Try another search query above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {webArtworks.map(item => {
                    const isActive = activeCustomUrl === item.imageUrl || (!activeCustomUrl && activeBackground.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`group relative h-52 rounded-2xl overflow-hidden border transition-all ${
                          isActive
                            ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                            : 'border-white/10 hover:border-emerald-500/50'
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        
                        {/* Top action row */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/10 text-neutral-200">
                            {item.category}
                          </span>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleSaveToWallpapers(item);
                            }}
                            title="Save to My Wallpapers"
                            className="p-1.5 rounded-lg bg-black/70 hover:bg-emerald-500 hover:text-black text-neutral-300 transition-colors border border-white/10"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {isActive && (
                          <div className="absolute top-10 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,136,0.8)]">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
                          </div>
                        )}

                        {/* Bottom info & apply button */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h4 className="text-sm font-bold text-white truncate drop-shadow">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-neutral-300 truncate mt-0.5">
                            {item.artistCredit}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.palette.primary }} />
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.palette.secondary }} />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectCustom(item.imageUrl, item.title)}
                              className="px-3 py-1 rounded-lg bg-emerald-500/90 hover:bg-emerald-400 text-black text-[11px] font-bold uppercase transition-all shadow"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 24-HOUR AUTO-ROTATION STUDIO */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              {/* 24h Auto-Rotation Switch Card */}
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-base text-white">
                      24-Hour Artwork Auto-Rotation
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 max-w-xl">
                    When enabled, Journal automatically rotates your background every 24 hours to a fresh masterpiece matching your interests and active countdown theme.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleForceRotate}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5"
                    title="Advance to next daily artwork"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rotate Now</span>
                  </button>
                  <button
                    onClick={handleToggleAutoRotate}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                      isAutoRotate
                        ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,136,0.5)]'
                        : 'bg-neutral-800 text-neutral-400 border border-white/10'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAutoRotate ? 'bg-black' : 'bg-neutral-500'}`} />
                    <span>{isAutoRotate ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Today's Active Spotlight Artwork */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                  <span>Today's Rotation Artwork</span>
                  {!activeCustomUrl && activeBackground.id === todayDaily.id && (
                    <span className="text-emerald-400 text-[10px] font-mono">• Active Right Now</span>
                  )}
                </h4>
                <div
                  onClick={() => handleSelectDaily(todayDaily)}
                  className="group relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/20 cursor-pointer shadow-xl transition-all hover:scale-[1.01]"
                >
                  <img
                    src={todayDaily.imageUrl}
                    alt={todayDaily.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-black mb-2 inline-block">
                        {todayDaily.category.toUpperCase()}
                      </span>
                      <h4 className="text-2xl font-black font-display text-white drop-shadow-md">
                        {todayDaily.title}
                      </h4>
                      <p className="text-xs text-neutral-300 max-w-xl mt-1 line-clamp-2">
                        {todayDaily.description}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Credit: {todayDaily.artistCredit}
                      </p>
                    </div>
                    {!activeCustomUrl && activeBackground.id === todayDaily.id && (
                      <div className="w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,255,136,0.8)]">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tomorrow's Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  Upcoming Tomorrow (24h Preview)
                </h4>
                <div
                  onClick={() => handleSelectDaily(tomorrowDaily)}
                  className="group relative h-36 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-emerald-500/50 transition-all opacity-80 hover:opacity-100"
                >
                  <img
                    src={tomorrowDaily.imageUrl}
                    alt={tomorrowDaily.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">Upcoming Tomorrow</span>
                      <h5 className="text-sm font-bold text-white">{tomorrowDaily.title}</h5>
                    </div>
                    <span className="text-xs text-neutral-300 font-semibold px-3 py-1 rounded-lg bg-white/10 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      Activate Early
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOADS & CUSTOM WALLPAPERS */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Upload */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <Upload className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-sm font-bold text-white mb-1">Upload from Device</p>
                  <p className="text-xs text-neutral-400 mb-4">PNG, JPG, WebP up to 8MB</p>
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct Image URL Add */}
                <form
                  onSubmit={handleAddUrl}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-white mb-2">Add via Direct URL</p>
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-emerald-500 mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Wallpaper title (optional)"
                      value={newImageName}
                      onChange={e => setNewImageName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-3 w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Save &amp; Apply
                  </button>
                </form>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs">
                  {uploadError}
                </div>
              )}

              {/* User Custom Wallpaper Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                  My Wallpapers ({customImages.length})
                </h4>
                {customImages.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-sm">No custom wallpapers saved yet.</p>
                    <p className="text-xs text-neutral-600 mt-1">Upload an image or explore the Web Discovery tab.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {customImages.map(img => {
                      const isActive = activeCustomUrl === img.url;
                      return (
                        <div
                          key={img.id}
                          onClick={() => handleSelectCustom(img.url, img.name)}
                          className={`group relative h-48 rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] ${
                            isActive
                              ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                              : 'border-white/10 hover:border-emerald-500/50'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              removeCustomImage(img.id);
                              showToast('Removed wallpaper');
                            }}
                            className="absolute top-2 right-2 p-2 rounded-lg bg-black/70 hover:bg-rose-600 text-neutral-300 hover:text-white transition-colors z-10"
                            title="Delete Wallpaper"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {isActive && (
                            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,255,136,0.6)] z-10">
                              <Check className="w-3.5 h-3.5 stroke-[3]" /> Active Wallpaper
                            </div>
                          )}

                          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                            <p className="text-sm font-bold text-white truncate drop-shadow">{img.name}</p>
                            <p className="text-[10px] text-neutral-300">{img.collectionName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-neutral-400">
          <span>The clock numerals are transparent and adapt their glow to complement your artwork.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors shadow-[0_0_10px_rgba(0,255,136,0.3)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
