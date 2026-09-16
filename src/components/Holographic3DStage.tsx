import React, { useState, useEffect, useRef } from 'react';

interface Holographic3DStageProps {
  children: React.ReactNode;
  enabled: boolean;
  themeColor?: string;
}

export const Holographic3DStage: React.FC<Holographic3DStageProps> = ({
  children,
  enabled,
  themeColor = '#00ff88',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      currentRef.current = { x: 0, y: 0 };
      targetRef.current = { x: 0, y: 0 };
      setCoords({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      targetRef.current = { x: nx, y: ny };
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Clamp gamma (-30 to 30) and beta (-30 to 30)
        const gx = Math.max(-30, Math.min(30, e.gamma)) / 30;
        const gy = Math.max(-30, Math.min(30, e.beta - 45)) / 30;
        targetRef.current = { x: gx, y: gy };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    }

    // Smooth Damping Animation Loop
    const updateMotion = () => {
      // Lerp with 0.08 factor for smooth cinematic glide
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;

      setCoords({
        x: Math.round(currentRef.current.x * 1000) / 1000,
        y: Math.round(currentRef.current.y * 1000) / 1000,
      });

      animFrameRef.current = requestAnimationFrame(updateMotion);
    };

    animFrameRef.current = requestAnimationFrame(updateMotion);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled]);

  // Max 3D Tilt Angles
  const maxTilt = 12; // degrees
  const rotateX = enabled ? -coords.y * maxTilt : 0;
  const rotateY = enabled ? coords.x * maxTilt : 0;
  const shadowX = enabled ? -coords.x * 20 : 0;
  const shadowY = enabled ? coords.y * 20 + 10 : 0;

  // Light reflection position across the glass
  const lightX = 50 + coords.x * 40;
  const lightY = 50 + coords.y * 40;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center pointer-events-auto select-none"
      style={{
        perspective: '1200px',
      }}
    >
      {/* 3D Hologram Floating Platform */}
      <div
        className="relative w-full max-w-6xl flex flex-col items-center justify-center transition-[transform] duration-75 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          filter: enabled
            ? `drop-shadow(${shadowX}px ${shadowY}px 30px rgba(0, 0, 0, 0.75))`
            : undefined,
        }}
      >
        {/* Layer 1: Holographic Chrono Compass & Gyro Rings (Background Depth: translateZ(-25px)) */}
        {enabled && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: 'translateZ(-25px)',
              opacity: 0.45,
            }}
          >
            {/* Outer Slow-Spin Tachyon Gyro Ring */}
            <div
              className="w-[360px] h-[360px] sm:w-[580px] sm:h-[580px] rounded-full border border-dashed animate-[spin_60s_linear_infinite]"
              style={{
                borderColor: themeColor,
                boxShadow: `0 0 40px ${themeColor}22, inset 0 0 40px ${themeColor}11`,
              }}
            />

            {/* Inner Counter-Spin Gyro Ring */}
            <div
              className="absolute w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] rounded-full border border-dotted animate-[spin_35s_linear_infinite_reverse]"
              style={{
                borderColor: `${themeColor}66`,
              }}
            />

            {/* Crosshair Laser Lines */}
            <div
              className="absolute w-full max-w-2xl h-[1px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${themeColor}44, transparent)`,
              }}
            />
            <div
              className="absolute h-full max-h-[380px] w-[1px]"
              style={{
                background: `linear-gradient(180deg, transparent, ${themeColor}44, transparent)`,
              }}
            />
          </div>
        )}

        {/* Layer 2: Subtle Tactical Corner Brackets (Depth: translateZ(10px)) */}
        {enabled && (
          <div
            className="absolute inset-x-2 sm:inset-x-8 inset-y-0 pointer-events-none flex flex-col justify-between"
            style={{ transform: 'translateZ(10px)', opacity: 0.6 }}
          >
            <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-400">
              <span className="flex items-center gap-1.5" style={{ color: themeColor }}>
                ┌─ [3D_HUD_STAGE: ACTIVE]
              </span>
              <span className="flex items-center gap-1.5" style={{ color: themeColor }}>
                [ROT_X: {rotateX.toFixed(1)}° | ROT_Y: {rotateY.toFixed(1)}°] ─┐
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-400">
              <span className="flex items-center gap-1.5" style={{ color: themeColor }}>
                └─ [QUANTUM_DEPTH: 3D]
              </span>
              <span className="flex items-center gap-1.5" style={{ color: themeColor }}>
                [OPTICAL_TRACKING] ─┘
              </span>
            </div>
          </div>
        )}

        {/* Layer 3: Dynamic Optical Sheen (Cursor-following glass reflection) */}
        {enabled && (
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none mix-blend-screen transition-opacity duration-300"
            style={{
              transform: 'translateZ(20px)',
              background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)`,
            }}
          />
        )}

        {/* Layer 4: Primary Countdown Component (Floating at translateZ(35px)) */}
        <div
          className="relative z-10 w-full flex items-center justify-center transition-transform duration-100"
          style={{
            transform: enabled ? 'translateZ(35px)' : 'none',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
