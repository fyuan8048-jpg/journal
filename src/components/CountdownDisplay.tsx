import React, { useState, useEffect, useRef } from 'react';
import { calculateTimeRemaining, type TimeRemaining, padZero } from '../utils/countdown';
import { type ClockTheme, buildTextShadow } from '../utils/themeAdapter';
import { soundEngine } from '../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Edit3 } from 'lucide-react';

interface CountdownDisplayProps {
  targetDate: string;
  title: string;
  subtitle: string;
  theme: ClockTheme;
  includeYears: boolean;
  onGlitch?: () => void;
  onOpenCustomizer?: () => void;
}

interface LiquidGlassPodProps {
  value: number;
  label: string;
  theme: ClockTheme;
  isTickPulse: boolean;
  onClick?: () => void;
}

/**
 * LiquidGlassPod — Apple iOS 27 / visionOS luxury fluid refractive glass capsule.
 * Features:
 * - Ultra-refractive multi-layer frosted glass (no opaque muddy fills).
 * - Real-time specular cursor light reflection (liquid sheen).
 * - Physical 3D tilt tracking (perspective rotateX / rotateY).
 * - Curved top-edge crystal bevel highlight line.
 * - Fluid second-tick luminescence refraction wave.
 * - Perfectly centered tabular numerals (rock-solid, 0px drift).
 * - Frosted crystal pill unit badge with specular rim.
 */
const LiquidGlassPod: React.FC<LiquidGlassPodProps> = ({
  value,
  label,
  theme,
  isTickPulse,
  onClick,
}) => {
  const podRef = useRef<HTMLDivElement>(null);
  const [mouseState, setMouseState] = useState({
    x: 50,
    y: 50,
    rx: 0,
    ry: 0,
    active: false,
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!podRef.current) return;
    const rect = podRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const rx = (py - 0.5) * -16; // 3D tilt rotation around X-axis
    const ry = (px - 0.5) * 16;  // 3D tilt rotation around Y-axis
    setMouseState({
      x: px * 100,
      y: py * 100,
      rx,
      ry,
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setMouseState({ x: 50, y: 50, rx: 0, ry: 0, active: false });
  };

  const handlePointerEnter = () => {
    soundEngine.playUiHover();
  };

  const handleClick = () => {
    soundEngine.playUiClick();
    onClick?.();
  };

  const isLiquidTheme = theme.preset === 'liquid_glass';
  const accentGlow = isLiquidTheme ? '#38bdf8' : (theme.primaryColor || '#e0f2fe');

  return (
    <div
      ref={podRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      onClick={handleClick}
      className="relative flex-1 min-w-[50px] xs:min-w-[62px] sm:min-w-[80px] md:min-w-[100px] lg:min-w-[125px] xl:min-w-[140px] max-w-[165px] aspect-[3.7/5] sm:aspect-square md:aspect-[4/5] flex flex-col items-center justify-between select-none text-center p-2 sm:p-3.5 md:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/[0.18] via-white/[0.08] to-white/[0.02] hover:from-white/[0.24] hover:via-white/[0.12] hover:to-white/[0.04] border border-white/35 hover:border-white/60 backdrop-blur-3xl shadow-[0_16px_40px_rgba(0,0,0,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(255,255,255,0.06)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(255,255,255,0.25),inset_0_2px_3px_rgba(255,255,255,0.8)] cursor-pointer group transition-all duration-200"
      style={{
        opacity: theme.transparency,
        transform: mouseState.active
          ? `perspective(800px) rotateX(${mouseState.rx.toFixed(2)}deg) rotateY(${mouseState.ry.toFixed(2)}deg) scale3d(1.04, 1.04, 1.04)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: mouseState.active
          ? 'transform 0.08s ease-out'
          : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
      }}
      title="Click to customize title, fonts, colors & themes"
    >
      {/* 1. Specular Curved Top Rim Highlight (Apple visionOS / iOS 27 precision molded crystal edge) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/90 to-transparent rounded-t-2xl sm:rounded-t-3xl z-20"
        aria-hidden="true"
      />

      {/* 2. Prismatic Inner Bevel Line */}
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[1.1rem] sm:rounded-[1.6rem] border border-white/10 z-15"
        aria-hidden="true"
      />

      {/* 3. Bottom Subtle Shadow Groove */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-black/40 to-transparent rounded-b-2xl sm:rounded-b-3xl z-20"
        aria-hidden="true"
      />

      {/* 4. Dynamic Cursor Specular Sheen (Liquid Glass Glare) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: mouseState.active ? 1 : 0,
          background: `radial-gradient(190px circle at ${mouseState.x}% ${mouseState.y}%, rgba(255, 255, 255, 0.38), transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* 5. Second Tick Fluid Refraction Shimmer */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl transition-opacity duration-200 z-10 ${
          isTickPulse
            ? 'opacity-60 bg-gradient-to-tr from-cyan-400/20 via-white/35 to-emerald-400/15'
            : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* 6. Stationary Tabular Numerals (ZERO Drift / Jitter) */}
      <div
        className="flex items-center justify-center w-full my-auto z-20 overflow-hidden"
        style={{
          transform: `scale(${theme.scale})`,
          transformOrigin: 'center center',
        }}
      >
        <span
          className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight tabular-nums block w-full text-center select-none leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
          style={{
            fontFamily: theme.fontFamily,
            color: '#ffffff',
            fontVariantNumeric: 'tabular-nums',
            textShadow: buildTextShadow(
              accentGlow,
              theme.brightness,
              theme.shadowStyle,
              theme.shadowBlur,
              theme.shadowOpacity
            ),
          }}
        >
          {padZero(value)}
        </span>
      </div>

      {/* 7. Liquid Frosted Unit Pill Badge */}
      <div className="mt-1 sm:mt-2.5 px-2 sm:px-3 py-0.5 rounded-full bg-white/[0.12] group-hover:bg-white/[0.22] border border-white/25 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-200 z-20">
        <span
          className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-mono font-black uppercase tracking-widest block transition-colors drop-shadow-sm"
          style={{
            fontFamily: theme.fontFamily,
            color: isLiquidTheme ? '#e0f2fe' : (theme.primaryColor || '#ffffff'),
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  targetDate,
  title,
  subtitle,
  theme,
  includeYears,
  onGlitch,
  onOpenCustomizer,
}) => {
  const [time, setTime] = useState<TimeRemaining>(() => calculateTimeRemaining(targetDate, includeYears));
  const [isTickPulse, setIsTickPulse] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const prevSecondsRef = useRef<number>(time.seconds);
  const confettiTriggeredRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(targetDate, includeYears);
      setTime(remaining);

      // Check if second changed
      if (remaining.seconds !== prevSecondsRef.current) {
        prevSecondsRef.current = remaining.seconds;
        soundEngine.playTick();

        // Visual pulse feedback on tick
        setIsTickPulse(true);
        setTimeout(() => setIsTickPulse(false), 120);
      }

      // Check cinematic zero-hour completion!
      if (remaining.isComplete && !confettiTriggeredRef.current) {
        confettiTriggeredRef.current = true;
        setShowCompletionOverlay(true);
        soundEngine.playCinematicArrivalFanfare();

        // Multi-stage multiversal fireworks
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#00ff88', '#fbbf24', '#ffffff', '#ef4444', '#38bdf8'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 120,
            origin: { y: 0.4 },
            colors: ['#c084fc', '#22d3ee', '#fbbf24', '#00ff88'],
          });
        }, 400);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [targetDate, includeYears, onGlitch]);

  const isLiquidTheme = theme.preset === 'liquid_glass';
  const separatorColor = isLiquidTheme ? '#ffffff' : (theme.separatorColor || '#ffffff');

  // Liquid Glass Dual Droplet Separator
  const renderSeparator = () => (
    <div
      className="flex flex-col justify-center items-center pb-3 xs:pb-4 sm:pb-6 md:pb-8 px-0.5 xs:px-1 shrink-0 text-center select-none"
      style={{ opacity: theme.transparency }}
    >
      <div className="flex flex-col items-center gap-1.5 xs:gap-2 sm:gap-3">
        <span
          className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white/60 backdrop-blur-md transition-all duration-200 ${
            isTickPulse
              ? 'bg-white scale-125 shadow-[0_0_16px_rgba(255,255,255,1),0_0_24px_rgba(56,189,248,0.8)]'
              : 'bg-white/70 scale-100 shadow-[0_0_8px_rgba(255,255,255,0.5)]'
          }`}
          style={{
            borderColor: separatorColor,
            backgroundColor: isTickPulse ? '#ffffff' : separatorColor,
          }}
        />
        <span
          className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white/60 backdrop-blur-md transition-all duration-200 ${
            isTickPulse
              ? 'bg-white scale-125 shadow-[0_0_16px_rgba(255,255,255,1),0_0_24px_rgba(56,189,248,0.8)]'
              : 'bg-white/70 scale-100 shadow-[0_0_8px_rgba(255,255,255,0.5)]'
          }`}
          style={{
            borderColor: separatorColor,
            backgroundColor: isTickPulse ? '#ffffff' : separatorColor,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center text-center px-2 sm:px-4 py-2 sm:py-4 z-10 w-full max-w-7xl mx-auto pointer-events-none no-scrollbar overflow-visible">
      {/* Event Header Banner (Liquid glass card, clickable to edit) */}
      <div
        onClick={onOpenCustomizer}
        className={`mb-3 sm:mb-6 animate-fade-in pointer-events-auto transition-all duration-300 ${
          onOpenCustomizer ? 'cursor-pointer group relative inline-flex flex-col items-center' : ''
        }`}
        style={{
          opacity: theme.titleTransparency,
          transform: `scale(${theme.titleScale})`,
          transformOrigin: 'center center',
        }}
        title={onOpenCustomizer ? 'Click to edit clock title, schedule & styling' : undefined}
      >
        {/* iOS Liquid Glass Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-white/[0.1] hover:bg-white/[0.18] border border-white/25 backdrop-blur-2xl shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] mb-2 sm:mb-3 transition-all duration-300 group-hover:scale-105">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-100 drop-shadow-sm">
            Liquid Glass • iOS 27
          </span>
          {onOpenCustomizer && (
            <span className="text-[9px] text-white/60 group-hover:text-emerald-300 ml-1 font-mono transition-colors">
              • Edit
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <h1
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wider uppercase mb-1 transition-all drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            style={{
              fontFamily: theme.titleFontFamily || theme.fontFamily,
              color: theme.titleColor || '#ffffff',
              textShadow: buildTextShadow(
                theme.titleColor || theme.primaryColor,
                theme.titleBrightness,
                theme.shadowStyle,
                theme.shadowBlur,
                theme.shadowOpacity
              ),
            }}
          >
            {title}
          </h1>

          {onOpenCustomizer && (
            <span className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-xl bg-white/15 border border-white/30 text-cyan-200 hover:text-white shadow-lg -mt-1 backdrop-blur-md">
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          )}
        </div>

        <p
          className="text-[11px] sm:text-xs md:text-sm font-bold tracking-widest uppercase max-w-2xl mx-auto transition-all group-hover:opacity-90 drop-shadow-md"
          style={{
            fontFamily: theme.titleFontFamily || theme.fontFamily,
            color: isLiquidTheme ? '#e0f2fe' : theme.primaryColor,
            textShadow: buildTextShadow(
              theme.primaryColor,
              Math.min(1.5, theme.titleBrightness),
              theme.shadowStyle,
              Math.max(6, Math.round(theme.shadowBlur * 0.6)),
              theme.shadowOpacity
            ),
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Main Countdown Display — Floating Liquid Glass Dock Container (Zero Scrollbars, Fully Responsive) */}
      <div className="relative w-full max-w-5xl p-2.5 sm:p-5 md:p-6 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-black/[0.2] backdrop-blur-3xl border border-white/25 shadow-[0_30px_90px_rgba(0,0,0,0.55),inset_0_1.5px_2px_rgba(255,255,255,0.4),inset_0_-1.5px_2px_rgba(0,0,0,0.3)] pointer-events-auto no-scrollbar overflow-visible">
        {/* Top Horizon Bevel Reflection Beam */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-t-[2rem] sm:rounded-t-[3rem] z-20"
          aria-hidden="true"
        />

        <div className="flex items-center justify-center w-full gap-1 xs:gap-1.5 sm:gap-2.5 md:gap-3.5 select-none no-scrollbar">
          {/* Optional Years */}
          {includeYears && (
            <>
              <LiquidGlassPod
                value={time.years}
                label="Years"
                theme={theme}
                isTickPulse={isTickPulse}
                onClick={onOpenCustomizer}
              />
              {renderSeparator()}
            </>
          )}

          {/* Months */}
          <LiquidGlassPod
            value={time.months}
            label="Months"
            theme={theme}
            isTickPulse={isTickPulse}
            onClick={onOpenCustomizer}
          />
          {renderSeparator()}

          {/* Days */}
          <LiquidGlassPod
            value={time.days}
            label="Days"
            theme={theme}
            isTickPulse={isTickPulse}
            onClick={onOpenCustomizer}
          />
          {renderSeparator()}

          {/* Hours */}
          <LiquidGlassPod
            value={time.hours}
            label="Hours"
            theme={theme}
            isTickPulse={isTickPulse}
            onClick={onOpenCustomizer}
          />
          {renderSeparator()}

          {/* Minutes */}
          <LiquidGlassPod
            value={time.minutes}
            label="Minutes"
            theme={theme}
            isTickPulse={isTickPulse}
            onClick={onOpenCustomizer}
          />
          {renderSeparator()}

          {/* Seconds */}
          <LiquidGlassPod
            value={time.seconds}
            label="Seconds"
            theme={theme}
            isTickPulse={isTickPulse}
            onClick={onOpenCustomizer}
          />
        </div>
      </div>

      {/* Cinematic End / Completion Overlay */}
      {showCompletionOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-950 border-2 border-emerald-500 shadow-[0_0_50px_rgba(0,255,136,0.5)] text-center text-white space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-black uppercase tracking-wider">
              ZERO HOUR REACHED • EVENT COMPLETE
            </div>

            <h2 className="text-3xl font-black font-display uppercase tracking-wide">
              {title}
            </h2>

            <p className="text-sm text-neutral-300">
              The countdown has completed! The moment has arrived.
            </p>

            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={() => setShowCompletionOverlay(false)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,136,0.4)]"
              >
                Continue Viewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
