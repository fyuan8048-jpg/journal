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

  // Pure Transparent Floating Digit Block - Fixed slot width, ZERO drift/jitter
  const renderUnitCard = (value: number, label: string) => {
    return (
      <div
        className="flex flex-col items-center justify-center select-none w-20 sm:w-28 md:w-36 lg:w-44 shrink-0 text-center transition-opacity duration-300"
        style={{
          opacity: theme.transparency,
        }}
      >
        {/* Transparent Stationary Numerals */}
        <div
          className="flex items-center justify-center w-full"
          style={{
            transform: `scale(${theme.scale})`,
            transformOrigin: 'center center',
          }}
        >
          <span
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight tabular-nums block w-full text-center"
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

        {/* Floating Unit Label */}
        <div className="mt-1 sm:mt-2 w-full text-center">
          <span
            className="text-[10px] sm:text-xs md:text-sm font-black tracking-widest uppercase px-2 py-0.5 rounded inline-block"
            style={{
              fontFamily: theme.fontFamily,
              color: theme.primaryColor,
              textShadow: buildTextShadow(
                theme.primaryColor,
                Math.min(1.0, theme.brightness),
                'deep',
                8,
                0.9
              ),
            }}
          >
            {label}
          </span>
        </div>
      </div>
    );
  };

  // Fixed Stationary Separator (Zero scale movement, steady alignment)
  const renderSeparator = () => (
    <div
      className="flex flex-col justify-center items-center pb-4 sm:pb-6 w-3 sm:w-5 md:w-6 shrink-0 text-center select-none"
      style={{ opacity: theme.transparency }}
    >
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <span
          className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full inline-block transition-opacity duration-150"
          style={{
            backgroundColor: theme.separatorColor,
            opacity: isTickPulse ? 1.0 : 0.6,
            boxShadow: `0 0 ${12 * theme.brightness}px ${theme.separatorColor}, 0 2px 4px rgba(0,0,0,0.9)`,
          }}
        />
        <span
          className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full inline-block transition-opacity duration-150"
          style={{
            backgroundColor: theme.separatorColor,
            opacity: isTickPulse ? 1.0 : 0.6,
            boxShadow: `0 0 ${12 * theme.brightness}px ${theme.separatorColor}, 0 2px 4px rgba(0,0,0,0.9)`,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-4 z-10 w-full max-w-7xl mx-auto pointer-events-none">
      {/* Event Header Banner (Fully transparent, floating text, clickable to edit) */}
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
        {onOpenCustomizer && (
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 mb-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-emerald-500/50 shadow-[0_0_15px_rgba(0,255,136,0.3)] backdrop-blur-md">
            <Edit3 className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-300">
              Journal Entry • Click to Edit Title &amp; Style
            </span>
          </div>
        )}

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
            <span className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-black/60 border border-white/20 text-emerald-400 hover:text-emerald-300 shadow-lg -mt-1 backdrop-blur-sm">
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

      {/* Main Countdown Display - Rock-solid stationary alignment, 0px shift */}
      <div className="flex flex-nowrap items-center justify-center gap-0.5 sm:gap-1.5 md:gap-2 p-2 select-none overflow-x-auto max-w-full">
        {/* Optional Years */}
        {includeYears && (
          <>
            {renderUnitCard(time.years, 'Years')}
            {renderSeparator()}
          </>
        )}

        {/* Months */}
        {renderUnitCard(time.months, 'Months')}
        {renderSeparator()}

        {/* Days */}
        {renderUnitCard(time.days, 'Days')}
        {renderSeparator()}

        {/* Hours */}
        {renderUnitCard(time.hours, 'Hours')}
        {renderSeparator()}

        {/* Minutes */}
        {renderUnitCard(time.minutes, 'Minutes')}
        {renderSeparator()}

        {/* Seconds */}
        {renderUnitCard(time.seconds, 'Seconds')}
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
