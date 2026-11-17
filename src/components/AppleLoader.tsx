import { useState, useEffect } from 'react';

interface AppleLoaderProps {
  onComplete?: () => void;
  duration?: number;
}

export default function AppleLoader({ onComplete, duration = 1400 }: AppleLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      // Apple cubic-bezier style easing (slow start, rapid smooth acceleration, gentle deceleration)
      const easeProgress = rawProgress < 0.5 
        ? 2 * rawProgress * rawProgress 
        : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

      setProgress(Math.round(easeProgress * 100));

      if (rawProgress >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsMounted(false);
            if (onComplete) onComplete();
          }, 600); // 600ms exit fade
        }, 150);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fbfbfd] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFadingOut ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Apple Soft Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#0071e3]/8 via-purple-500/5 to-transparent blur-3xl pointer-events-none -translate-y-8" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Apple-grade Minimal Athena Logo Glyph */}
        <div className="relative mb-8 group">
          <div className="w-16 h-16 rounded-[22px] bg-[#1d1d1f] flex items-center justify-center shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-transform duration-500">
            {/* Geometric Modern Minimal Icon */}
            <svg
              className="w-8 h-8 text-white stroke-[2.2] transition-transform duration-700 group-hover:scale-105"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          {/* Micro breathing ring */}
          <div className="absolute -inset-1 rounded-[26px] bg-[#0071e3]/20 blur-sm -z-10 animate-pulse" />
        </div>

        {/* Brand Wordmark with Hairline Dot */}
        <div className="text-2xl font-bold tracking-[-0.04em] text-[#1d1d1f] flex items-center justify-center mb-6">
          <span>Athena</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] ml-1 mt-1.5 animate-pulse" />
        </div>

        {/* Apple Hairline Minimal Progress Bar */}
        <div className="w-48 sm:w-56 h-[2px] bg-black/[0.06] rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[#1d1d1f] rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtext Status */}
        <div className="mt-4 flex items-center space-x-1.5 text-[11px] font-medium tracking-tight text-[#86868b]">
          <span>{progress < 40 ? 'Initializing core…' : progress < 80 ? 'Connecting workspace…' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
}
