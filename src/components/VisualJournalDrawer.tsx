import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Search,
  Smile,
  Edit3,
} from 'lucide-react';
import { useAuth, type JournalEntry } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';
import LiquidGlassCard from './ui/liquid-glass-card';
import LiquidGlassBadge from './ui/liquid-glass-badge';

interface VisualJournalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

const MOOD_OPTIONS = [
  { id: 'focused', label: 'Hyperfocused', emoji: '⚡' },
  { id: 'resolute', label: 'Resolute', emoji: '👑' },
  { id: 'victorious', label: 'Victorious', emoji: '⚔️' },
  { id: 'strategic', label: 'Strategic', emoji: '🪐' },
  { id: 'mindful', label: 'Mindful', emoji: '🧘' },
  { id: 'visionary', label: 'Visionary', emoji: '🌌' },
];

/**
 * Formats a timestamp into a friendly date header group (e.g. "Today · 23 Oct 2026")
 */
function getDateGroupHeader(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  if (isToday) return `Today · ${dateStr}`;
  if (isYesterday) return `Yesterday · ${dateStr}`;
  return dateStr;
}

/**
 * Formats exact time (e.g. "05:42:15 PM")
 */
function getExactTimeStr(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export const VisualJournalDrawer: React.FC<VisualJournalDrawerProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { currentUser, addJournalEntry, deleteJournalEntry } = useAuth();
  const journalEntries: JournalEntry[] = currentUser?.preferences?.journalEntries || [];

  // Composer State
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[0]);

  // Search / Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Group entries date by date in descending chronological order
  const groupedEntries = useMemo(() => {
    const filtered = journalEntries.filter((entry) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        (entry.mood && entry.mood.toLowerCase().includes(q))
      );
    });

    // Sort newest first
    const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

    // Group by Date string key (YYYY-MM-DD)
    const groups: { dateHeader: string; entries: JournalEntry[] }[] = [];
    const groupMap = new Map<string, JournalEntry[]>();

    sorted.forEach((entry) => {
      const d = new Date(entry.createdAt);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(entry);
    });

    groupMap.forEach((entries) => {
      if (entries.length > 0) {
        groups.push({
          dateHeader: getDateGroupHeader(entries[0].createdAt),
          entries,
        });
      }
    });

    return groups;
  }, [journalEntries, searchQuery]);

  if (!isOpen) return null;

  // Save New Journal Entry with Exact Date and Time
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryContent.trim()) return;

    soundEngine.playSelect();
    addJournalEntry({
      title: entryTitle.trim(),
      content: entryContent.trim(),
      mood: `${selectedMood.emoji} ${selectedMood.label}`,
    });

    onShowToast('✓ Saved entry to Visual Journal!');
    soundEngine.playSuccessCheck();
    setEntryTitle('');
    setEntryContent('');
    setIsWritingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-out Liquid Glass Drawer */}
      <div className="relative w-full max-w-lg md:max-w-xl h-full flex flex-col bg-neutral-950/85 border-l border-white/15 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-b from-purple-500/15 via-emerald-500/10 to-transparent blur-3xl" />

        {/* Drawer Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-display tracking-wider text-white">
                  GLOBAL VISUAL JOURNAL
                </h2>
                <LiquidGlassBadge tone="purple" pulse>
                  {journalEntries.length} {journalEntries.length === 1 ? 'Entry' : 'Entries'}
                </LiquidGlassBadge>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Stored date by date with exact timestamp. Global and persistent.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all border border-white/10"
            aria-label="Close Journal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search & Compose Action Bar */}
        <div className="p-4 border-b border-white/10 shrink-0 flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journal entries by date or text..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-purple-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {!isWritingNew && (
            <button
              onClick={() => {
                soundEngine.playSelect();
                setIsWritingNew(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-mono font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Write</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* New Entry Composer Form */}
          {isWritingNew && (
            <LiquidGlassCard variant="elevated" tone="smoked" className="p-5 rounded-2xl border border-purple-500/40 animate-in fade-in duration-200">
              <form onSubmit={handleSaveEntry} className="space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-[11px]">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>New Journal Entry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500">
                      {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {getExactTimeStr(Date.now())}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsWritingNew(false)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mood Selector Chips */}
                <div>
                  <label className="block text-neutral-400 mb-1.5 text-[10px] uppercase flex items-center gap-1">
                    <Smile className="w-3 h-3 text-purple-400" />
                    <span>State / Mood</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOOD_OPTIONS.map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => setSelectedMood(mood)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] border transition-all ${
                          selectedMood.id === mood.id
                            ? 'bg-purple-500/30 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                            : 'bg-black/40 border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <span>{mood.emoji}</span> {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entry Title */}
                <div>
                  <input
                    type="text"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder="Entry Title / What's on your mind today?"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 font-bold text-sm"
                  />
                </div>

                {/* Content Area */}
                <div>
                  <textarea
                    value={entryContent}
                    onChange={(e) => setEntryContent(e.target.value)}
                    placeholder="Write freely. Captures thoughts, plans, lessons, milestones, or reflections..."
                    rows={5}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400 resize-none font-sans text-xs leading-relaxed"
                  />
                </div>

                {/* Timestamp Preview & Save Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>Timestamp recorded on save</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWritingNew(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-bold tracking-wider uppercase transition-all shadow-md"
                    >
                      Save Entry
                    </button>
                  </div>
                </div>
              </form>
            </LiquidGlassCard>
          )}

          {/* Empty State */}
          {groupedEntries.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white/5 border border-white/10 text-neutral-400">
              <BookOpen className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-white mb-1">Your Journal is Empty</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Capture thoughts, strategic reflections, and memories. Every entry is stamped with its exact date &amp; time and preserved forever.
              </p>
              {!isWritingNew && (
                <button
                  onClick={() => setIsWritingNew(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Write First Entry</span>
                </button>
              )}
            </div>
          ) : (
            /* Date-by-Date Grouped Feed */
            <div className="space-y-6">
              {groupedEntries.map((group) => (
                <div key={group.dateHeader} className="space-y-3">
                  {/* Sticky Date Group Header */}
                  <div className="sticky top-0 z-20 flex items-center gap-2 py-1.5 px-3 rounded-xl bg-neutral-950/90 border border-white/10 backdrop-blur-xl shadow-md">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-mono font-bold text-neutral-200 tracking-wider uppercase">
                      {group.dateHeader}
                    </span>
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-neutral-400">
                      {group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  {/* Entries for this Date */}
                  <div className="space-y-3 pl-1 sm:pl-2">
                    {group.entries.map((entry) => (
                      <LiquidGlassCard
                        key={entry.id}
                        variant="elevated"
                        tone="smoked"
                        className="p-4 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {/* Exact Time Badge */}
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/30 font-bold">
                                <Clock className="w-3 h-3 text-purple-400" />
                                {getExactTimeStr(entry.createdAt)}
                              </span>

                              {/* Mood Chip */}
                              {entry.mood && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-neutral-200">
                                  {entry.mood}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-white font-display tracking-wide mt-1">
                              {entry.title}
                            </h4>
                          </div>

                          <button
                            onClick={() => {
                              soundEngine.playSelect();
                              deleteJournalEntry(entry.id);
                              onShowToast('✓ Deleted journal entry');
                            }}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-white/5 transition-all"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-neutral-300 whitespace-pre-wrap font-sans leading-relaxed">
                          {entry.content}
                        </p>
                      </LiquidGlassCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualJournalDrawer;
