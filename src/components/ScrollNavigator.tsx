import { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface ScrollNavigatorProps {
  accentColor?: 'coral' | 'amber';
}

export const ScrollNavigator = ({ accentColor = 'coral' }: ScrollNavigatorProps) => {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const updateScrollMetrics = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (docHeight <= 0) {
      setScrollPercent(0);
      setAtTop(true);
      setAtBottom(true);
      return;
    }

    const rawPercent = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
    setScrollPercent(rawPercent);
    setAtTop(scrollTop <= 24);
    setAtBottom(scrollTop >= docHeight - 24);
  }, []);

  useEffect(() => {
    updateScrollMetrics();
    window.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('resize', updateScrollMetrics, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, [updateScrollMetrics]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    const maxScroll = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    window.scrollTo({
      top: maxScroll,
      behavior: 'smooth',
    });
  };

  const activeGradient =
    accentColor === 'amber'
      ? 'from-[#ffa41b] to-[#ffcf4a] text-[#1a1204]'
      : 'from-[#FF6F61] to-[#ff8a75] text-white';

  const progressBarColor =
    accentColor === 'amber'
      ? 'bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a]'
      : 'bg-gradient-to-r from-[#FF6F61] to-teal-400';

  return (
    <>
      {/* Top-of-Viewport Scroll Progress Line */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-white/5 z-[140] pointer-events-none"
        aria-hidden="true"
      >
        <div
          className={`h-full ${progressBarColor} transition-transform duration-150 origin-left`}
          style={{ transform: `scaleX(${scrollPercent / 100})` }}
        />
      </div>

      {/* Bidirectional Top-to-Bottom & Bottom-to-Top Floating Scroll Control */}
      <div
        className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[110] flex flex-col items-center bg-[#131C31]/90 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-2xl gap-1"
        role="region"
        aria-label="Page Scroll Navigation"
      >
        {/* Bottom-to-Top Scroll Button */}
        <button
          type="button"
          onClick={scrollToTop}
          disabled={atTop}
          title="Scroll to Top"
          aria-label="Scroll to top of page"
          className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            atTop
              ? 'text-slate-600 bg-white/[0.02] cursor-not-allowed opacity-40'
              : `bg-gradient-to-br ${activeGradient} shadow-md hover:scale-105 active:scale-95`
          }`}
        >
          <ArrowUp size={17} strokeWidth={2.5} />
        </button>

        {/* Live Scroll Percentage Readout */}
        <div
          className="px-1.5 py-0.5 text-[10px] font-mono tabular-nums font-bold text-slate-300 select-none text-center min-w-[36px]"
          title={`Page scrolled ${scrollPercent}%`}
        >
          {scrollPercent}%
        </div>

        {/* Top-to-Bottom Scroll Button */}
        <button
          type="button"
          onClick={scrollToBottom}
          disabled={atBottom}
          title="Scroll to Bottom"
          aria-label="Scroll to bottom of page"
          className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            atBottom
              ? 'text-slate-600 bg-white/[0.02] cursor-not-allowed opacity-40'
              : 'bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white border border-white/5 hover:scale-105 active:scale-95'
          }`}
        >
          <ArrowDown size={17} strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
};
