import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Upload, Trash2, Check, Sparkles, SlidersHorizontal } from 'lucide-react';
import { CURATED_BACKGROUNDS, type BackgroundItem, getDailyBackground } from '../data/curatedBackgrounds';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInterests: () => void;
  activeBackground: BackgroundItem;
  setActiveBackground: (bg: BackgroundItem) => void;
  activeCustomUrl?: string;
  setActiveCustomUrl: (url: string | undefined) => void;
  initialTab?: TabType;
}

type TabType = 'curated' | 'custom' | 'daily';

export const BackgroundModal: React.FC<BackgroundModalProps> = ({
  isOpen,
  onClose,
  onOpenInterests,
  activeBackground,
  setActiveBackground,
  activeCustomUrl,
  setActiveCustomUrl,
  initialTab = 'curated',
}) => {
  const { currentUser, addCustomImage, removeCustomImage, updatePreferences } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [collectionName] = useState('My Wallpapers');
  const [uploadError, setUploadError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  if (!isOpen || !currentUser) return null;

  const interests = currentUser.preferences.interests;
  const todayDaily = getDailyBackground(interests, 0);

  // Unified Wallpaper Activators (Syncs active state, user preferences, and sounds)
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
    updatePreferences({ activeBackgroundId: item.id, activeCustomImageUrl: undefined });
    soundEngine.playUiClick();
    showToast(`✓ Daily wallpaper applied: ${item.title}`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl bg-neutral-950/95 border border-emerald-500/30 shadow-2xl text-white overflow-hidden">
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
                Click any artwork below to immediately apply it as your background
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('curated')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'curated'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              🎨 Marvel &amp; Doom Artworks ({CURATED_BACKGROUNDS.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'custom'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              🖼️ Uploads &amp; Personal Wallpapers ({customImages.length})
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'daily'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                  : 'text-neutral-300 hover:bg-white/5'
              }`}
            >
              📅 Daily 24h Rotation
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenInterests();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70 text-xs font-semibold transition-all"
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
          {/* TAB 1: CURATED UNIVERSES GALLERY (Default) */}
          {activeTab === 'curated' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>Click any artwork to apply it immediately:</span>
                <span className="text-emerald-400 font-mono">100% Guaranteed High-Definition</span>
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/10 text-neutral-200">
                          {item.category}
                        </span>
                      </div>

                      {isActive && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-emerald-500 text-black text-[10px] font-black uppercase flex items-center gap-1 shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-sm font-bold text-white leading-snug drop-shadow">{item.title}</p>
                        <p className="text-[10px] text-neutral-300 truncate mt-0.5">{item.artistCredit}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM COLLECTIONS & UPLOADS */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* Upload / Add Form */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Upload Image from Device or Paste Direct Link
                </h3>

                {uploadError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
                    {uploadError}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Option */}
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-700 hover:border-emerald-500 rounded-2xl cursor-pointer bg-neutral-900/50 hover:bg-emerald-950/20 transition-all text-center group">
                    <Upload className="w-8 h-8 text-neutral-400 group-hover:text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-white uppercase group-hover:text-emerald-300">Choose Image from Computer</span>
                    <span className="text-[11px] text-neutral-400 mt-1">PNG, JPG, WebP up to 8MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* URL Paste Option */}
                  <form onSubmit={handleAddUrl} className="flex flex-col justify-between p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Direct Image URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/artwork.jpg"
                          value={newImageUrl}
                          onChange={e => setNewImageUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Artwork Title (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. My Favorite Marvel Wallpaper"
                          value={newImageName}
                          onChange={e => setNewImageName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-3 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                    >
                      Apply Wallpaper
                    </button>
                  </form>
                </div>
              </div>

              {/* User Saved Images Gallery */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
                  Your Uploaded Wallpapers ({customImages.length})
                </h4>

                {customImages.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-neutral-800 rounded-2xl">
                    <ImageIcon className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                    <p className="text-sm font-bold text-neutral-400">No custom wallpapers uploaded yet</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Upload personal images from your device or paste web URLs above!
                    </p>
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
                              ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomImage(img.id);
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

          {/* TAB 3: DAILY ROTATION */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Today's Curated Artwork
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Automatically chosen based on your selected interests. Changes every midnight.
                  </p>
                </div>
                <button
                  onClick={() => handleSelectDaily(todayDaily)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    !activeCustomUrl && activeBackground.id === todayDaily.id
                      ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(0,255,136,0.5)]'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {!activeCustomUrl && activeBackground.id === todayDaily.id ? 'Active Today' : 'Activate'}
                </button>
              </div>

              {/* Spotlight Today */}
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
                      Art: {todayDaily.artistCredit}
                    </p>
                  </div>
                  {!activeCustomUrl && activeBackground.id === todayDaily.id && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  )}
                </div>
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
