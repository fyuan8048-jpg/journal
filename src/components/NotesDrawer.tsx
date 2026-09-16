import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Check,
  Target,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { CountdownEvent, CountdownNote } from '../utils/countdown';
import { soundEngine } from '../audio/soundEngine';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCountdown: CountdownEvent;
  onSelectCountdown?: (id: string) => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  activeCountdown,
  onSelectCountdown,
}) => {
  const { currentUser, updateCountdownNotes } = useAuth();

  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  if (!isOpen || !currentUser) return null;

  const countdowns = currentUser.preferences.customCountdowns || [];
  // Find currently targeted countdown
  const currentEvent = countdowns.find(c => c.id === activeCountdown.id) || activeCountdown;
  const notes: CountdownNote[] = currentEvent.notes || [];

  const completedCount = notes.filter(n => n.completed).length;
  const totalCount = notes.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: CountdownNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: newNoteText.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    const updatedNotes = [newNote, ...notes];
    updateCountdownNotes(currentEvent.id, updatedNotes);
    setNewNoteText('');
    soundEngine.playSuccessCheck();
  };

  const handleToggleComplete = (noteId: string) => {
    const updatedNotes = notes.map(n => {
      if (n.id === noteId) {
        const nextState = !n.completed;
        if (nextState) {
          soundEngine.playSuccessCheck();
        }
        return { ...n, completed: nextState };
      }
      return n;
    });
    updateCountdownNotes(currentEvent.id, updatedNotes);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    updateCountdownNotes(currentEvent.id, updatedNotes);
  };

  const handleStartEdit = (note: CountdownNote) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editingText.trim()) {
      handleDeleteNote(noteId);
      setEditingNoteId(null);
      return;
    }
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, text: editingText.trim() } : n
    );
    updateCountdownNotes(currentEvent.id, updatedNotes);
    setEditingNoteId(null);
  };

  const handleClearCompleted = () => {
    const updatedNotes = notes.filter(n => !n.completed);
    updateCountdownNotes(currentEvent.id, updatedNotes);
  };

  const filteredNotes = notes.filter(n => {
    if (filter === 'active') return !n.completed;
    if (filter === 'completed') return n.completed;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md h-full bg-neutral-950/95 border-l border-emerald-500/30 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.8)] text-white overflow-hidden animate-slide-left"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-black/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display text-white tracking-wide">
                  Mission Goals & Notes
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Target milestones before zero hour
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

          {/* Countdown Selector Dropdown */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-emerald-400/80 font-bold">
                Linked Countdown
              </span>
              {countdowns.length > 1 && onSelectCountdown ? (
                <select
                  value={currentEvent.id}
                  onChange={(e) => onSelectCountdown(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-white focus:outline-none truncate cursor-pointer"
                >
                  {countdowns.map(c => (
                    <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                      {c.title}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="block text-xs font-bold text-white truncate">
                  {currentEvent.title}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">
                  {completedCount} of {totalCount} completed
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-[0_0_8px_#00ff88]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="p-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a goal or note (e.g. IMAX ticket, comic read)..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newNoteText.trim()}
              className="px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-black font-bold transition-all shadow-[0_0_12px_rgba(0,255,136,0.3)] shrink-0"
              title="Add Note / Goal"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 text-[11px]">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg capitalize font-bold transition-all ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f} ({f === 'all' ? notes.length : f === 'active' ? totalCount - completedCount : completedCount})
            </button>
          ))}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotes.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <Sparkles className="w-8 h-8 text-neutral-600 mb-2" />
              <p className="text-xs font-semibold text-neutral-400">No notes or goals yet</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Add milestones to check off before this countdown arrives!
              </p>
            </div>
          ) : (
            filteredNotes.map(note => {
              const isEditing = editingNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`group flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                    note.completed
                      ? 'bg-white/[0.02] border-white/5 opacity-70'
                      : 'bg-white/5 border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.08]'
                  }`}
                >
                  {/* Complete Toggle Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(note.id)}
                    className="mt-0.5 text-neutral-400 hover:text-emerald-400 transition-colors shrink-0"
                  >
                    {note.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950/60" />
                    ) : (
                      <Circle className="w-4 h-4 hover:stroke-emerald-400" />
                    )}
                  </button>

                  {/* Note Content / Inline Edit */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(note.id);
                            if (e.key === 'Escape') setEditingNoteId(null);
                          }}
                          autoFocus
                          className="w-full px-2 py-1 rounded bg-black border border-emerald-500 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="p-1 rounded bg-white/10 text-neutral-400 hover:text-white"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p
                          onDoubleClick={() => handleStartEdit(note)}
                          className={`text-xs font-medium leading-relaxed select-text cursor-pointer ${
                            note.completed
                              ? 'line-through text-neutral-400'
                              : 'text-neutral-100'
                          }`}
                        >
                          {note.text}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-500 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(note.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons (Hover or always available on touch) */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-white/10 transition-colors"
                        title="Edit note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs">
          {completedCount > 0 ? (
            <button
              onClick={handleClearCompleted}
              className="text-neutral-400 hover:text-rose-400 transition-colors text-[11px]"
            >
              Clear Completed ({completedCount})
            </button>
          ) : (
            <span className="text-neutral-500 text-[11px]">
              Notes auto-save per countdown
            </span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
