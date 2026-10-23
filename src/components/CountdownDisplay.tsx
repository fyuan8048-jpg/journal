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
 * LiquidGlassPod — iOS 27 / visionOS interactive fluid glass capsule.
 * Features dynamic specular cursor light glare, physical 3D tilt tracking,
 * curved top-edge refraction highlight, second tick pulse, and rock-solid stationary tabular digits.
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

  return (
    <div
      ref={podRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      onClick={handleClick}
      className="relative flex flex-col items-center justify-between select-none w-20 sm:w-28 md:w-36 lg:w-44 shrink-0 text-center p-2.5 sm:p-4 md:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.08] hover:bg-white/[0.14] dark:bg-black/35 border border-white/20 hover:border-white/45 backdrop-blur-2xl sm:backdrop-blur-3xl shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-1px_2px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(255,255,255,0.18)] cursor-pointer group transition-colors duration-200"
      style={{
        opacity: theme.transparency,
        transform: mouseState.active
          ? `perspective(800px) rotateX(${mouseState.rx.toFixed(2)}deg) rotateY(${mouseState.ry.toFixed(2)}deg) scale3d(1.04, 1.04, 1.04)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: mouseState.active
          ? 'transform 0.08s ease-out'
          : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      title="Click to customize title, fonts, colors & themes"
    >
      {/* 1. Specular Curved Top Rim Highlight (iOS / visionOS glass refraction line) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-3xl z-20"
        aria-hidden="true"
      />

      {/* 2. Bottom Subtle Shadow Groove */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/40 to-transparent rounded-b-3xl z-20"
        aria-hidden="true"
      />

      {/* 3. Dynamic Cursor Specular Sheen (Liquid Light Glare) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: mouseState.active ? 1 : 0,
          background: `radial-gradient(220px circle at ${mouseState.x}% ${mouseState.y}%, rgba(255, 255, 255, 0.25), transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* 4. Second Tick Refraction Pulse Shimmer */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl transition-opacity duration-150 z-10 ${
          isTickPulse ? 'opacity-40 bg-white/20' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* 5. Stationary Tabular Numerals (ZERO Drift / Jitter) */}
      <div
        className="flex items-center justify-center w-full my-auto z-20"
        style={{
          transform: `scale(${theme.scale})`,
          transformOrigin: 'center center',
        }}
      >
        <span
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight tabular-nums block w-full text-center select-none leading-none"
          style={{
            fontFamily: theme.fontFamily,
            color: '#ffffff',
            fontVariantNumeric: 'tabular-nums',
            textShadow: buildTextShadow(
              theme.primaryColor,
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

      {/* 6. Liquid Frosted Unit Pill Badge */}
      <div className="mt-2 sm:mt-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/[0.08] group-hover:bg-white/[0.18] border border-white/20 backdrop-blur-md shadow-inner transition-colors duration-200 z-20">
        <span
          className="text-[9px] sm:text-[11px] md:text-xs font-mono font-black uppercase tracking-widest block transition-colors"
          style={{
            fontFamily: theme.fontFamily,
            color: theme.primaryColor,
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

  // Liquid Glass Dual Droplet Separator
  const renderSeparator = () => (
    <div
      className="flex flex-col justify-center items-center pb-5 sm:pb-8 px-1 sm:px-1.5 shrink-0 text-center select-none"
      style={{ opacity: theme.transparency }}
    >
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <span
          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white/40 backdrop-blur-md transition-all duration-200 ${
            isTickPulse
              ? 'bg-white scale-125 shadow-[0_0_16px_rgba(255,255,255,1)]'
              : 'bg-white/40 scale-100 shadow-[0_0_6px_rgba(255,255,255,0.3)]'
          }`}
          style={{
            borderColor: theme.separatorColor,
            backgroundColor: isTickPulse ? '#ffffff' : theme.separatorColor,
          }}
        />
        <span
          className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white/40 backdrop-blur-md transition-all duration-200 ${
            isTickPulse
              ? 'bg-white scale-125 shadow-[0_0_16px_rgba(255,255,255,1)]'
              : 'bg-white/40 scale-100 shadow-[0_0_6px_rgba(255,255,255,0.3)]'
          }`}
          style={{
            borderColor: theme.separatorColor,
            backgroundColor: isTickPulse ? '#ffffff' : theme.separatorColor,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-4 z-10 w-full max-w-7xl mx-auto pointer-events-none">
      {/* Event Header Banner (Liquid glass card, clickable to edit) */}
      <div
        onClick={onOpenCustomizer}
        className={`mb-4 sm:mb-8 animate-fade-in pointer-events-auto transition-all duration-300 ${
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 backdrop-blur-xl shadow-lg mb-2 sm:mb-3 transition-all duration-300 group-hover:scale-105">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-100">
            Liquid Glass • iOS 27
          </span>
          {onOpenCustomizer && (
            <span className="text-[9px] text-neutral-400 group-hover:text-emerald-300 ml-1 font-mono transition-colors">
              • Edit
            </span>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <h1
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wider uppercase mb-1 transition-all"
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
            <span className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-xl bg-white/10 border border-white/20 text-cyan-300 hover:text-white shadow-lg -mt-1 backdrop-blur-md">
              <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          )}
        </div>

        <p
          className="text-[11px] sm:text-xs md:text-sm font-bold tracking-widest uppercase max-w-2xl mx-auto transition-all group-hover:opacity-90"
          style={{
            fontFamily: theme.titleFontFamily || theme.fontFamily,
            color: theme.primaryColor,
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

      {/* Main Countdown Display — Floating Liquid Glass Dock Container */}
      <div className="relative p-2.5 sm:p-4 md:p-6 rounded-[2rem] sm:rounded-[3rem] bg-black/25 sm:bg-black/35 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] max-w-full overflow-x-auto pointer-events-auto">
        <div className="flex flex-nowrap items-center justify-center gap-1.5 sm:gap-3 md:gap-4 select-none">
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
