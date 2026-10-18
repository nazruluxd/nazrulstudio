import React, { useEffect, useState } from 'react';

interface GlobalLoadingOverlayProps {
  /** Whether initial hydration or Firebase fetching is still in progress */
  isLoading: boolean;
  /** Current stage description shown to the user */
  statusText?: string;
  /** Optional callback to force-dismiss the overlay immediately */
  onBypass?: () => void;
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({
  isLoading,
  statusText = 'Synchronizing studio workspace...',
  onBypass,
}) => {
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(18);
  const [showBypassButton, setShowBypassButton] = useState(false);

  // Smooth simulated + real progress bar advancement
  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      setIsFadingOut(false);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 88) return prev;
          const step = prev < 50 ? 14 : prev < 75 ? 7 : 2;
          return Math.min(88, prev + step);
        });
      }, 140);

      const bypassTimer = setTimeout(() => {
        setShowBypassButton(true);
      }, 1600);

      return () => {
        clearInterval(interval);
        clearTimeout(bypassTimer);
      };
    } else {
      // Complete progress bar and smoothly fade out overlay
      setProgress(100);
      setIsFadingOut(true);
      const unmountTimer = setTimeout(() => {
        setShouldRender(false);
      }, 450);
      return () => clearTimeout(unmountTimer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B1121] text-slate-200 select-none transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Ambient Studio Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-teal-500/10 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-[#FF6F61]/10 blur-[90px]" />
      </div>

      {/* Precision Prepress Registration Marks (Corner Accents) */}
      <div className="pointer-events-none absolute inset-6 md:inset-10 border border-slate-800/50 rounded-2xl">
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-teal-400/60" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-teal-400/60" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-teal-400/60" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-teal-400/60" />
      </div>

      {/* Core Branded Identity Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Geometric Brand Monogram & Orbital Loader */}
        <div className="relative w-20 h-20 mb-7 flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-2xl border border-slate-700/70 bg-slate-900/80 shadow-2xl backdrop-blur-md" />
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 80 80"
          >
            <rect
              x="3"
              y="3"
              width="74"
              height="74"
              rx="16"
              fill="none"
              stroke="rgba(20, 184, 166, 0.18)"
              strokeWidth="2"
            />
            <rect
              x="3"
              y="3"
              width="74"
              height="74"
              rx="16"
              fill="none"
              stroke="url(#nazrulGradient)"
              strokeWidth="2.5"
              strokeDasharray="296"
              strokeDashoffset={296 - (296 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="nazrulGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FF6F61" />
              </linearGradient>
            </defs>
          </svg>

          {/* Studio Monogram */}
          <div className="relative flex flex-col items-center justify-center">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-br from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
              NS
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-teal-400/90 -mt-1">
              v4.0
            </span>
          </div>
        </div>

        {/* Brand Title & Subtitle */}
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-white mb-1">
          Nazrul Studio
        </h1>
        <p className="text-xs font-medium text-slate-400 tracking-wide mb-6">
          Structural Packaging Design &amp; Prepress Automation
        </p>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-900/90 border border-slate-800/80 h-1.5 rounded-full overflow-hidden mb-3 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 via-purple-500 to-[#FF6F61] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Telemetry / Hydration Status Line */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate pr-2">{statusText}</span>
          <span className="text-teal-400 font-semibold shrink-0">{progress}%</span>
        </div>

        {/* Manual Bypass Escape Hatch if network is slow */}
        {showBypassButton && onBypass && (
          <button
            type="button"
            onClick={onBypass}
            className="mt-6 px-4 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            Enter Studio Immediately
          </button>
        )}
      </div>
    </div>
  );
};
