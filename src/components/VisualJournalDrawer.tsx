import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Copy,
  Layers,
  ArrowRight,
  Target,
  Music,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth, type JournalEntry, type StrategyMilestone, type GoalStrategy } from '../context/AuthContext';
import { soundEngine } from '../audio/soundEngine';
import LiquidGlassCard from './ui/liquid-glass-card';
import LiquidGlassTabSwitch from './ui/liquid-glass-tab-switch';
import LiquidGlassBadge from './ui/liquid-glass-badge';

interface VisualJournalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCountdownTitle?: string;
  targetDate?: string;
  activeBackgroundTitle?: string;
  activeBackgroundUrl?: string;
  activeTrackTitle?: string;
  onShowToast: (message: string) => void;
}

const MOOD_OPTIONS = [
  { id: 'focused', label: 'Hyperfocused', emoji: '⚡' },
  { id: 'resolute', label: 'Resolute', emoji: '👑' },
  { id: 'battle', label: 'Battle-Ready', emoji: '⚔️' },
  { id: 'strategic', label: 'Strategic', emoji: '🪐' },
  { id: 'mindful', label: 'Mindful', emoji: '🧘' },
  { id: 'visionary', label: 'Visionary', emoji: '🌌' },
];

export const VisualJournalDrawer: React.FC<VisualJournalDrawerProps> = ({
  isOpen,
  onClose,
  activeCountdownTitle = 'Avengers: Doomsday',
  targetDate,
  activeBackgroundTitle = 'Latverian Citadel',
  activeBackgroundUrl,
  activeTrackTitle = 'Doomsday Theme',
  onShowToast,
}) => {
  const {
    currentUser,
    addJournalEntry,
    deleteJournalEntry,
    updateGoalStrategy,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'journal' | 'strategy'>('journal');

  // New Journal Entry Composer State
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[0]);

  // Strategy Canvas State
  const existingStrategy: GoalStrategy = currentUser?.preferences?.goalStrategy || {
    missionTitle: activeCountdownTitle || 'Mission Objective',
    coreObjective: '',
    targetTimeline: targetDate ? `Deadline: ${new Date(targetDate).toLocaleDateString()}` : '30-Day Sprint',
    primaryBlockers: '',
    milestones: [],
    lastUpdated: Date.now(),
  };

  const [missionTitle, setMissionTitle] = useState(existingStrategy.missionTitle);
  const [coreObjective, setCoreObjective] = useState(existingStrategy.coreObjective);
  const [targetTimeline, setTargetTimeline] = useState(existingStrategy.targetTimeline);
  const [primaryBlockers, setPrimaryBlockers] = useState(existingStrategy.primaryBlockers);
  const [milestones, setMilestones] = useState<StrategyMilestone[]>(existingStrategy.milestones || []);

  // Gemini Integration State
  const [geminiPasteText, setGeminiPasteText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  if (!isOpen) return null;

  const journalEntries: JournalEntry[] = currentUser?.preferences?.journalEntries || [];

  // Save New Journal Entry
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryContent.trim()) return;

    soundEngine.playSelect();
    addJournalEntry({
      title: entryTitle.trim(),
      content: entryContent.trim(),
      mood: `${selectedMood.emoji} ${selectedMood.label}`,
      artworkTitle: activeBackgroundTitle,
      artworkUrl: activeBackgroundUrl,
      trackTitle: activeTrackTitle,
      countdownTitle: activeCountdownTitle,
    });

    onShowToast('✓ Saved entry to Visual Journal!');
    soundEngine.playSuccessCheck();
    setEntryTitle('');
    setEntryContent('');
    setIsWritingNew(false);
  };

  // Generate High-Reasoning Prompt for Gemini
  const generateGeminiPrompt = () => {
    const formattedPrompt = `You are a world-class Strategic Executive and First-Principles Problem Solver.

I need a high-reasoning, actionable milestone roadmap for my core mission.

## Mission Context
- Mission: ${missionTitle || activeCountdownTitle}
- Core Objective: ${coreObjective || 'Execute high-impact goals with precision'}
- Timeline: ${targetTimeline || 'Immediate'}
- Critical Blockers & Constraints: ${primaryBlockers || 'None specified'}

## What I need from you:
1. First-principles analysis of the single most leverage point.
2. A chronological, structured breakdown of 4 to 7 concrete, verifiable Milestones.
3. Formulate each milestone on a new line formatted strictly as:
   - [ ] [Phase Name]: Specific actionable milestone objective
4. A 1-sentence strategic maxim to keep front-and-center.

Execute with ruthless clarity and zero fluff.`;

    return formattedPrompt;
  };

  // Launch Google Gemini with Strategy Prompt
  const handleLaunchGemini = async () => {
    soundEngine.playSelect();
    const prompt = generateGeminiPrompt();

    try {
      await navigator.clipboard.writeText(prompt);
      onShowToast('✓ Gemini prompt copied to clipboard! Opening Google Gemini...');
    } catch {
      onShowToast('Opening Google Gemini...');
    }

    // Direct link to Google Gemini web app
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
  };

  // Copy Prompt to Clipboard
  const handleCopyPrompt = async () => {
    soundEngine.playSelect();
    const prompt = generateGeminiPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      onShowToast('✓ Strategy brief copied to clipboard!');
      soundEngine.playSuccessCheck();
    } catch {
      onShowToast('Failed to copy to clipboard');
    }
  };

  // Parse Gemini's Output into Milestones
  const handleParseGeminiOutput = () => {
    if (!geminiPasteText.trim()) return;
    soundEngine.playSelect();

    const lines = geminiPasteText.split('\n');
    const parsedMilestones: StrategyMilestone[] = [];

    lines.forEach((line) => {
      const clean = line.trim();
      // Match markdown checklist items, numbered lists, or bullet points
      const match = clean.match(/^(?:[-*]\s*\[[\sxX]?\]\s*|(?:\d+\.|\*|-)\s*)(.+)$/);
      if (match && match[1] && match[1].length > 3) {
        const text = match[1].replace(/^\*\*|\*\*$/g, '').trim();
        parsedMilestones.push({
          id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: text,
          completed: clean.includes('[x]') || clean.includes('[X]'),
          priority: parsedMilestones.length === 0 ? 'high' : parsedMilestones.length < 3 ? 'medium' : 'low',
        });
      }
    });

    if (parsedMilestones.length > 0) {
      const updated = [...milestones, ...parsedMilestones];
      setMilestones(updated);
      saveStrategyState(updated);
      setGeminiPasteText('');
      setIsImporting(false);
      onShowToast(`✓ Parsed & added ${parsedMilestones.length} milestones from Gemini!`);
      soundEngine.playSuccessCheck();
    } else {
      onShowToast('Could not find list items. Paste bullet points or numbered steps.');
    }
  };

  // Save Strategy to Auth Context
  const saveStrategyState = (newMilestones: StrategyMilestone[]) => {
    const updatedStrategy: GoalStrategy = {
      missionTitle,
      coreObjective,
      targetTimeline,
      primaryBlockers,
      milestones: newMilestones,
      lastUpdated: Date.now(),
    };
    updateGoalStrategy(updatedStrategy);
  };

  // Toggle Milestone Completion
  const handleToggleMilestone = (id: string) => {
    soundEngine.playUiClick();
    const updated = milestones.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updated);
    saveStrategyState(updated);
  };

  // Add Manual Milestone
  const handleAddManualMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;

    soundEngine.playSelect();
    const newMs: StrategyMilestone = {
      id: `ms_${Date.now()}`,
      title: newMilestoneText.trim(),
      completed: false,
      priority: 'medium',
    };

    const updated = [newMs, ...milestones];
    setMilestones(updated);
    saveStrategyState(updated);
    setNewMilestoneText('');
  };

  // Delete Milestone
  const handleDeleteMilestone = (id: string) => {
    soundEngine.playSelect();
    const updated = milestones.filter((m) => m.id !== id);
    setMilestones(updated);
    saveStrategyState(updated);
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-out Liquid Glass Drawer */}
      <div className="relative w-full max-w-lg md:max-w-xl h-full flex flex-col bg-neutral-950/85 border-l border-white/15 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.9)] z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-b from-emerald-500/15 via-cyan-500/10 to-transparent blur-3xl" />

        {/* Drawer Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-display tracking-wider text-white">
                  VISUAL JOURNAL &amp; STRATEGY
                </h2>
                <LiquidGlassBadge tone="emerald" pulse>
                  iOS Liquid Glass
                </LiquidGlassBadge>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Thought logs anchored to your artwork, plus Gemini goal strategizing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Liquid Glass Segmented Switch */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <LiquidGlassTabSwitch
            options={[
              { id: 'journal', label: 'Visual Journal', icon: <BookOpen className="w-3.5 h-3.5" />, badge: journalEntries.length },
              { id: 'strategy', label: 'Gemini Strategizer', icon: <Sparkles className="w-3.5 h-3.5" />, badge: milestones.length > 0 ? `${progressPercent}%` : undefined },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as 'journal' | 'strategy')}
            tone="emerald"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* ============================================================== */}
          {/* TAB 1: VISUAL JOURNAL ENTRIES                                  */}
          {/* ============================================================== */}
          {activeTab === 'journal' && (
            <div className="space-y-4">
              {/* Write New Entry Button / Card */}
              {!isWritingNew ? (
                <button
                  type="button"
                  onClick={() => setIsWritingNew(true)}
                  className="w-full p-4 rounded-2xl bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:text-white flex items-center justify-between transition-all group shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500 text-black">
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-bold font-mono tracking-wider">
                        Log Daily Reflection / Strategy
                      </span>
                      <span className="block text-[11px] text-neutral-400">
                        Anchors to your active artwork &amp; soundtrack
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <LiquidGlassCard variant="elevated" tone="smoked" className="p-5 rounded-2xl border border-emerald-500/40">
                  <form onSubmit={handleSaveEntry} className="space-y-3.5 text-xs font-mono">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold text-emerald-400 uppercase tracking-widest text-[11px]">
                        New Journal Reflection
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsWritingNew(false)}
                        className="text-neutral-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mood Selector Chips */}
                    <div>
                      <label className="block text-neutral-400 mb-1.5 text-[10px] uppercase">Aesthetic Mood</label>
                      <div className="flex flex-wrap gap-1.5">
                        {MOOD_OPTIONS.map((mood) => (
                          <button
                            key={mood.id}
                            type="button"
                            onClick={() => setSelectedMood(mood)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] border transition-all ${
                              selectedMood.id === mood.id
                                ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-[0_0_10px_rgba(0,255,136,0.3)]'
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
                        placeholder="Entry Title / Focus of the Day..."
                        required
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 font-bold"
                      />
                    </div>

                    {/* Content Area */}
                    <div>
                      <textarea
                        value={entryContent}
                        onChange={(e) => setEntryContent(e.target.value)}
                        placeholder="What strategy did you conquer today? What is your next primary milestone? Write freely..."
                        rows={4}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 resize-none"
                      />
                    </div>

                    {/* Ambient Meta Pill */}
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 p-2 rounded-xl bg-black/40 border border-white/5">
                      <ImageIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{activeBackgroundTitle}</span>
                      <span>·</span>
                      <Music className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{activeTrackTitle}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsWritingNew(false)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold tracking-wider uppercase transition-all shadow-md"
                      >
                        Save Entry
                      </button>
                    </div>
                  </form>
                </LiquidGlassCard>
              )}

              {/* Journal Feed */}
              {journalEntries.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-neutral-400">
                  <BookOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs font-mono">No journal entries yet.</p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Click above to capture your first strategic thought or milestone reflection!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {journalEntries.map((entry) => (
                    <LiquidGlassCard
                      key={entry.id}
                      variant="elevated"
                      tone="smoked"
                      className="p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {entry.mood && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
                                {entry.mood}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-neutral-400">
                              {new Date(entry.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white font-display">
                            {entry.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => {
                            soundEngine.playSelect();
                            deleteJournalEntry(entry.id);
                          }}
                          className="p-1 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-neutral-300 whitespace-pre-wrap font-sans leading-relaxed mb-3">
                        {entry.content}
                      </p>

                      {/* Attached Artwork & Music Footer */}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 pt-2 border-t border-white/10">
                        {entry.artworkTitle && (
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <ImageIcon className="w-3 h-3 text-emerald-400" />
                            {entry.artworkTitle}
                          </span>
                        )}
                        {entry.trackTitle && (
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <Music className="w-3 h-3 text-cyan-400" />
                            {entry.trackTitle}
                          </span>
                        )}
                      </div>
                    </LiquidGlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: GEMINI GOAL STRATEGIZER                                 */}
          {/* ============================================================== */}
          {activeTab === 'strategy' && (
            <div className="space-y-4">
              {/* Mission Objective Card */}
              <LiquidGlassCard variant="elevated" tone="emerald" className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-300 font-mono text-xs uppercase tracking-wider">
                      Mission Blueprint
                    </span>
                  </div>
                  <LiquidGlassBadge tone="emerald">
                    {milestones.length} Milestones
                  </LiquidGlassBadge>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-neutral-400 mb-1 text-[10px] uppercase">Mission Title</label>
                    <input
                      type="text"
                      value={missionTitle}
                      onChange={(e) => {
                        setMissionTitle(e.target.value);
                        saveStrategyState(milestones);
                      }}
                      placeholder="e.g. Master React 19 & Launch Production Platform"
                      className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1 text-[10px] uppercase">Core Objective</label>
                    <input
                      type="text"
                      value={coreObjective}
                      onChange={(e) => {
                        setCoreObjective(e.target.value);
                        saveStrategyState(milestones);
                      }}
                      placeholder="What must happen for this to be a total victory?"
                      className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-neutral-400 mb-1 text-[10px] uppercase">Timeline / Target Date</label>
                      <input
                        type="text"
                        value={targetTimeline}
                        onChange={(e) => {
                          setTargetTimeline(e.target.value);
                          saveStrategyState(milestones);
                        }}
                        placeholder="e.g. 45 Days Remaining"
                        className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 mb-1 text-[10px] uppercase">Key Blocker / Risk</label>
                      <input
                        type="text"
                        value={primaryBlockers}
                        onChange={(e) => {
                          setPrimaryBlockers(e.target.value);
                          saveStrategyState(milestones);
                        }}
                        placeholder="e.g. Procrastination, Scope Creep"
                        className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Gemini Thinking Action Buttons */}
                <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleLaunchGemini}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Google Gemini</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all border border-white/15"
                    title="Copy full strategy prompt"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Brief</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsImporting(!isImporting)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-xs font-bold transition-all"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isImporting ? 'Close Importer' : 'Import AI Plan'}</span>
                  </button>
                </div>
              </LiquidGlassCard>

              {/* Paste & Import Gemini Output Box */}
              {isImporting && (
                <LiquidGlassCard variant="elevated" tone="cyan" className="p-4 rounded-2xl border border-cyan-500/40">
                  <div className="flex items-center justify-between mb-2 text-cyan-300 font-mono text-xs font-bold">
                    <span>Paste Gemini's Strategic Plan</span>
                    <button onClick={() => setIsImporting(false)} className="text-neutral-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={geminiPasteText}
                    onChange={(e) => setGeminiPasteText(e.target.value)}
                    placeholder="Paste Gemini's bullet points or checklist here..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-cyan-500/30 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-cyan-400 resize-none mb-2"
                  />
                  <button
                    type="button"
                    onClick={handleParseGeminiOutput}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Parse into Strategic Milestones
                  </button>
                </LiquidGlassCard>
              )}

              {/* Milestones Progress Bar */}
              {milestones.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Roadmap Completion</span>
                    <span className="text-emerald-400 font-bold">
                      {completedCount} / {milestones.length} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_#00ff88]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Add Manual Milestone Form */}
              <form onSubmit={handleAddManualMilestone} className="flex gap-2">
                <input
                  type="text"
                  value={newMilestoneText}
                  onChange={(e) => setNewMilestoneText(e.target.value)}
                  placeholder="Add a milestone step manually..."
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Milestones List */}
              <div className="space-y-2">
                {milestones.map((ms) => (
                  <div
                    key={ms.id}
                    onClick={() => handleToggleMilestone(ms.id)}
                    className={`group flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      ms.completed
                        ? 'bg-emerald-950/20 border-emerald-500/20 opacity-70'
                        : 'bg-neutral-900/60 hover:bg-neutral-900 border-white/10 hover:border-emerald-500/40'
                    }`}
                  >
                    <button
                      type="button"
                      className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        ms.completed
                          ? 'bg-emerald-500 border-emerald-500 text-black'
                          : 'border-white/30 group-hover:border-emerald-400'
                      }`}
                    >
                      {ms.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <span
                      className={`flex-1 text-xs font-mono leading-relaxed transition-all ${
                        ms.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                      }`}
                    >
                      {ms.title}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMilestone(ms.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualJournalDrawer;
