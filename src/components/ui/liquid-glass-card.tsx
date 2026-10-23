import React, { useRef, useState } from 'react';

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'island' | 'accent' | 'sheen';
  tone?: 'dark' | 'light' | 'smoked' | 'emerald' | 'amber' | 'cyan';
  interactive?: boolean;
  className?: string;
}

/**
 * LiquidGlassCard — iOS 18 / visionOS styled fluid glass panel.
 * Features dynamic specular cursor reflection, multi-layered frosted blur,
 * chromatic border rim, and physical tactile depth.
 */
export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  variant = 'default',
  tone = 'dark',
  interactive = true,
  className = '',
  onMouseMove,
  onMouseLeave,
  style,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x, y, opacity: 1 });
    onMouseMove?.(e);
  };

  const handlePointerLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setPos((prev) => ({ ...prev, opacity: 0 }));
    onMouseLeave?.(e);
  };

  // Tone color profiles
  const toneStyles = {
    dark: 'bg-neutral-950/70 border-white/15 text-white',
    smoked: 'bg-[#0b0c10]/75 border-white/10 text-neutral-100',
    light: 'bg-white/10 border-white/30 text-white',
    emerald: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100',
    amber: 'bg-amber-950/40 border-amber-500/30 text-amber-100',
    cyan: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-100',
  }[tone];

  // Variant shadow & blur profiles
  const variantStyles = {
    default: 'backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45)]',
    elevated: 'backdrop-blur-3xl shadow-[0_16px_48px_rgba(0,0,0,0.65)] hover:shadow-[0_24px_64px_rgba(0,0,0,0.8)]',
    island: 'backdrop-blur-2xl rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.5)] border border-white/20',
    accent: 'backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,255,136,0.15)] border-emerald-500/40',
    sheen: 'backdrop-blur-2xl shadow-2xl border-white/25',
  }[variant];

  return (
    <div
      ref={cardRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className={`relative overflow-hidden transition-all duration-300 ${toneStyles} ${variantStyles} ${
        interactive ? 'hover:scale-[1.01] active:scale-[0.99]' : ''
      } ${className}`}
      style={{
        ...style,
      }}
      {...props}
    >
      {/* 1. Specular cursor light highlight (Dynamic Liquid Sheen) */}
      {interactive && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 z-10"
          style={{
            opacity: pos.opacity,
            background: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, rgba(255, 255, 255, 0.14), transparent 60%)`,
          }}
        />
      )}

      {/* 2. Top Specular Bevel Line (iOS / visionOS glass edge highlight) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent z-10"
        aria-hidden="true"
      />

      {/* 3. Subtle bottom shadow ridge */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/40 to-transparent z-10"
        aria-hidden="true"
      />

      {/* Card Content */}
      <div className="relative z-20">{children}</div>
    </div>
  );
};

export default LiquidGlassCard;
