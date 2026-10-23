import React from 'react';
import { soundEngine } from '../../audio/soundEngine';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface LiquidGlassTabSwitchProps<T extends string = string> {
  options: TabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  tone?: 'emerald' | 'amber' | 'cyan' | 'white';
  className?: string;
}

/**
 * LiquidGlassTabSwitch — iOS 18 fluid segmented glass switch.
 * Employs physical frosted glass casing, tactile click feedback, and floating liquid lens capsule.
 */
export function LiquidGlassTabSwitch<T extends string = string>({
  options,
  activeId,
  onChange,
  tone = 'emerald',
  className = '',
}: LiquidGlassTabSwitchProps<T>) {
  const toneGlows = {
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,136,0.3)]',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.3)]',
    white: 'bg-white/20 text-white border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.25)]',
  }[tone];

  return (
    <div
      className={`relative flex items-center p-1 rounded-2xl bg-neutral-950/60 border border-white/10 backdrop-blur-2xl shadow-inner ${className}`}
    >
      {options.map((option) => {
        const isActive = activeId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              if (!isActive) {
                soundEngine.playUiClick();
                onChange(option.id);
              }
            }}
            onMouseEnter={() => soundEngine.playUiHover()}
            className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all duration-300 z-10 ${
              isActive
                ? `${toneGlows} text-white border`
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {option.icon && <span className="w-3.5 h-3.5">{option.icon}</span>}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-white/15 text-white">
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default LiquidGlassTabSwitch;
