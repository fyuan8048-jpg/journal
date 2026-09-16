import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Plus, Check, Sparkles, Layers } from 'lucide-react';
import { CURATED_BACKGROUNDS, type BackgroundItem } from '../data/curatedBackgrounds';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';

interface QuickWallpaperBarProps {
  activeBackground: BackgroundItem;
  onSelectCuratedBackground: (bg: BackgroundItem) => void;
  activeCustomUrl?: string;
  onSelectCustomUrl: (url: string) => void;
  onOpenFullModal: () => void;
}

export const QuickWallpaperBar: React.FC<QuickWallpaperBarProps> = ({
  activeBackground,
  onSelectCuratedBackground,
  activeCustomUrl,
  onSelectCustomUrl,
  onOpenFullModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentUser } = useAuth();
  const customImages = currentUser?.preferences?.customImages || [];

  const handleToggle = () => {
    soundEngine.playUiClick();
    setIsExpanded(!isExpanded);
  };

  const handleOpenCollections = () => {
    soundEngine.playUiClick();
    onOpenFullModal();
  };

  return (
    <div className="fixed bottom-4 inset-x-0 z-30 flex flex-col items-center px-4 pointer-events-none select-none">
      <div className="pointer-events-auto flex flex-col items-center max-w-4xl w-full">
        {/* Toggle Pill Button */}
        <button
          onClick={handleToggle}
          onMouseEnter={() => soundEngine.playUiHover()}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-neutral-950/85 hover:bg-black border border-emerald-500/60 backdrop-blur-2xl text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,0,0,0.8)] hover:scale-105 group"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Layers className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Wallpaper Collections ({customImages.length} custom)</span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
          )}
        </button>

        {/* Expandable Carousel Drawer */}
        {isExpanded && (
          <div className="mt-2 w-full p-4 rounded-3xl bg-neutral-950/95 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl animate-fade-in text-white">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick Artwork Selector</span>
              </div>
              <button
                onClick={handleOpenCollections}
                onMouseEnter={() => soundEngine.playUiHover()}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold tracking-wide transition-colors flex items-center gap-1 hover:underline"
              >
                <span>Open Full Collection Studio</span>
                <span>→</span>
              </button>
            </div>

            {/* Horizontal Scroll Strip */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
              {/* Add / Upload Custom Button */}
              <button
                onClick={onOpenFullModal}
                className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-emerald-500 bg-black/40 hover:bg-emerald-950/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <Plus className="w-6 h-6 text-neutral-400 group-hover:text-emerald-400 mb-1" />
                <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white uppercase">
                  Add Custom
                </span>
              </button>

              {/* User Custom Images */}
              {customImages.map(img => {
                const isSelected = activeCustomUrl === img.url;
                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      onSelectCustomUrl(img.url);
                    }}
                    className={`group relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-105 ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                        : 'border-white/15 hover:border-white/40'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate bg-black/60 px-1 rounded">
                      {img.name}
                    </span>
                  </div>
                );
              })}

              {/* Curated Marvel & Doom Artworks */}
              {CURATED_BACKGROUNDS.map(item => {
                const isSelected = !activeCustomUrl && activeBackground.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectCuratedBackground(item);
                    }}
                    className={`group relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-105 ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                        : 'border-white/15 hover:border-white/40'
                    }`}
                  >
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate bg-black/60 px-1 rounded">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
