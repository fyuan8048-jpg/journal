import React, { useState } from 'react';
import {
  X,
  Clock,
  Plus,
  Trash2,
  Check,
  Calendar,
  Sparkles,
  Edit3,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { type CountdownEvent, DEFAULT_COUNTDOWN_EVENTS } from '../utils/countdown';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';

interface CountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCountdownId: string;
  onSelectCountdown: (id: string) => void;
  onOpenNotes?: () => void;
}

const toInputDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

export const CountdownModal: React.FC<CountdownModalProps> = ({
  isOpen,
  onClose,
  activeCountdownId,
  onSelectCountdown,
  onOpenNotes,
}) => {
  const { currentUser, addCustomCountdown, updateCountdown, deleteCountdown } = useAuth();

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<CountdownEvent['category']>('marvel');
  const [themePreset, setThemePreset] = useState('doomsday');
  const [error, setError] = useState('');

  // Cinematic Disintegration state
  const [disintegratingId, setDisintegratingId] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const countdowns = currentUser.preferences.customCountdowns || DEFAULT_COUNTDOWN_EVENTS;

  const handleOpenAdd = () => {
    setEditingEventId(null);
    setTitle('');
    setSubtitle('');
    setTargetDate('');
    setCategory('marvel');
    setThemePreset('doomsday');
    setError('');
    setShowForm(true);
  };

  const handleOpenEdit = (item: CountdownEvent) => {
    setEditingEventId(item.id);
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setTargetDate(toInputDateTime(item.targetDate));
    setCategory(item.category);
    setThemePreset(item.themePreset || 'doomsday');
    setError('');
    setShowForm(true);
  };

  const handleSaveCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an event title');
      return;
    }
    if (!targetDate) {
      setError('Please select a target date and time');
      return;
    }

    if (editingEventId) {
      const existing = countdowns.find(c => c.id === editingEventId);
      const updated: CountdownEvent = {
        id: editingEventId,
        title: title.trim().toUpperCase(),
        subtitle: subtitle.trim() || 'COUNTDOWN IN PROGRESS',
        targetDate: new Date(targetDate).toISOString(),
        category,
        themePreset,
        notes: existing?.notes || [],
        customBackground: existing?.customBackground,
      };
      updateCountdown(updated);
      setShowForm(false);
    } else {
      const newEvent: CountdownEvent = {
        id: `cd_${Date.now()}`,
        title: title.trim().toUpperCase(),
        subtitle: subtitle.trim() || 'COUNTDOWN IN PROGRESS',
        targetDate: new Date(targetDate).toISOString(),
        category,
        themePreset,
        notes: [],
      };
      addCustomCountdown(newEvent);
      onSelectCountdown(newEvent.id);
      setShowForm(false);
    }

    setTitle('');
    setSubtitle('');
    setTargetDate('');
    setError('');
    setEditingEventId(null);
  };

  const handleTriggerCinematicDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (disintegratingId) return;

    // Start cinematic sequence
    setDisintegratingId(id);
    soundEngine.playDisintegrationEffect();

    // After animation finishes, execute deletion
    setTimeout(() => {
      deleteCountdown(id);
      setDisintegratingId(null);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-950/95 border border-emerald-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                Countdown Station
              </h2>
              <p className="text-xs text-neutral-400">
                Track, edit, switch, or purge any multiverse countdown timer
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Active Timers ({countdowns.length})
            </span>
            <button
              onClick={() => {
                if (showForm) setShowForm(false);
                else handleOpenAdd();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,136,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{showForm ? 'Cancel' : 'Add New Countdown'}</span>
            </button>
          </div>

          {/* Add / Edit Countdown Form */}
          {showForm && (
            <form
              onSubmit={handleSaveCountdown}
              className="p-5 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 space-y-4 animate-fade-in shadow-2xl"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{editingEventId ? 'Edit Countdown Timer' : 'Create New Countdown Target'}</span>
              </div>

              {error && (
                <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
                  {error}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Event Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. AVENGERS: DOOMSDAY TEASER"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Tagline / Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. In theaters worldwide in IMAX 70mm"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Target Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CountdownEvent['category'])}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="marvel">Marvel / MCU</option>
                    <option value="gaming">Gaming</option>
                    <option value="scifi">Sci-Fi / Space</option>
                    <option value="personal">Personal / Birthday</option>
                    <option value="holiday">Holiday / New Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Theme Preset</label>
                  <select
                    value={themePreset}
                    onChange={e => setThemePreset(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="doomsday">Avengers: Doomsday</option>
                    <option value="ironman">Iron Man (Nanotech)</option>
                    <option value="quantum">Quantum Realm</option>
                    <option value="tva">TVA Temporal Loom</option>
                    <option value="scarlet">Scarlet Witch (Chaos)</option>
                    <option value="vibranium">Vibranium (Violet)</option>
                    <option value="stark">Stark Holo-HUD</option>
                    <option value="obsidian">Obsidian Diamond</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                >
                  {editingEventId ? 'Update Timer' : 'Save & Launch'}
                </button>
              </div>
            </form>
          )}

          {/* List of Countdowns */}
          <div className="space-y-3">
            {countdowns.map(item => {
              const isActive = activeCountdownId === item.id;
              const isDisintegrating = disintegratingId === item.id;
              const targetDateObj = new Date(item.targetDate);
              const formattedDate = targetDateObj.toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const notesCount = item.notes?.length || 0;
              const completedNotes = item.notes?.filter(n => n.completed).length || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!isDisintegrating) onSelectCountdown(item.id);
                  }}
                  className={`relative group flex items-center justify-between p-4 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ${
                    isDisintegrating
                      ? 'scale-95 opacity-20 border-rose-500 bg-rose-950/80 filter blur-[2px]'
                      : isActive
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-[0_0_25px_rgba(0,255,136,0.15)]'
                      : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  {/* Cinematic Disintegration Overlay (Active on delete) */}
                  {isDisintegrating && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-rose-950/90 border-2 border-rose-500 animate-pulse">
                      <div className="flex items-center gap-2 text-rose-300 font-mono text-xs uppercase tracking-widest font-black animate-glitch">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>TIMELINE PURGED • DISINTEGRATING...</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors shrink-0 ${
                        isActive
                          ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(0,255,136,0.5)]'
                          : 'bg-white/10 text-neutral-400 group-hover:text-white'
                      }`}
                    >
                      {isActive ? <Check className="w-5 h-5 stroke-[3]" /> : <Clock className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-base tracking-wide font-display text-white truncate max-w-[200px] sm:max-w-md">
                          {item.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/50 border border-white/10 text-neutral-300">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{item.subtitle}</p>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>

                        {/* Goals summary pill */}
                        {notesCount > 0 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCountdown(item.id);
                              if (onOpenNotes) onOpenNotes();
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                            title="Click to view goals and notes"
                          >
                            <Target className="w-3 h-3" />
                            <span>
                              {completedNotes}/{notesCount} Goals
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Edit, Delete, Select) */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                    {/* Edit Countdown Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(item);
                      }}
                      className="p-2 rounded-xl bg-black/60 hover:bg-white/20 text-neutral-400 hover:text-white transition-colors"
                      title="Edit this countdown"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete ANY Countdown Button with Cinematic Animation */}
                    <button
                      onClick={(e) => handleTriggerCinematicDelete(e, item.id)}
                      className="p-2 rounded-xl bg-black/60 hover:bg-rose-600 text-neutral-400 hover:text-white transition-colors"
                      title="Purge & Disintegrate countdown"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <span
                      className={`hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(0,255,136,0.4)]'
                          : 'bg-white/10 text-neutral-300 group-hover:bg-white/20'
                      }`}
                    >
                      {isActive ? 'Active' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-neutral-400">
          <span>Target dates and goals synchronize in real time.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
