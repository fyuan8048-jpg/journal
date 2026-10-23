import React from 'react';

export interface LiquidGlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  tone?: 'emerald' | 'amber' | 'cyan' | 'purple' | 'rose' | 'neutral';
  pulse?: boolean;
  className?: string;
}

export const LiquidGlassBadge: React.FC<LiquidGlassBadgeProps> = ({
  children,
  tone = 'emerald',
  pulse = false,
  className = '',
  ...props
}) => {
  const toneMap = {
    emerald: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(0,255,136,0.25)]',
    amber: 'bg-amber-950/60 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    cyan: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]',
    purple: 'bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    rose: 'bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    neutral: 'bg-neutral-900/60 border-white/20 text-neutral-200 shadow-md',
  }[tone];

  const dotMap = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    rose: 'bg-rose-400',
    neutral: 'bg-white',
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-xl transition-all ${toneMap} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotMap}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotMap}`} />
        </span>
      )}
      {children}
    </span>
  );
};

export default LiquidGlassBadge;
