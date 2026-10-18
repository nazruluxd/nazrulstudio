import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useIntersectionLazyLoad } from '../utils/useIntersectionLazyLoad';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  wrapperClassName?: string;
  /** Pre-fetch margin before entering the viewport */
  rootMargin?: string;
  /** Set true for above-the-fold or first-card assets */
  priority?: boolean;
  /** Optional fallback label if image fails to load */
  fallbackLabel?: string;
}

/**
 * Intersection Observer-powered lazy image component with intrinsic dimensions,
 * async decoding, zero-CLS placeholder shimmer, and resilient error fallback.
 */
export const LazyImage = ({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  wrapperClassName = '',
  rootMargin = '300px 0px',
  priority = false,
  fallbackLabel,
}: LazyImageProps) => {
  const { ref, hasIntersected } = useIntersectionLazyLoad<HTMLDivElement>({
    rootMargin,
    threshold: 0.01,
    triggerOnce: true,
    priority,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      ref={ref}
      className={`relative w-full h-full overflow-hidden ${wrapperClassName}`}
    >
      {/* Zero-CLS Skeleton Placeholder while waiting for Intersection / Network load */}
      {!isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#131C31] via-[#1b2642] to-[#0B1121] animate-pulse flex items-center justify-center"
        >
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#FF6F61]/60 animate-spin" />
        </div>
      )}

      {/* Resilient Fallback UI if external image fails */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#131C31] to-[#0B1121] flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <ImageIcon size={28} className="text-slate-500 mb-2" />
          <span className="text-xs font-semibold text-slate-300">
            {fallbackLabel || alt}
          </span>
        </div>
      )}

      {/* Render <img> only when intersected (or priority) to defer offscreen network requests */}
      {hasIntersected && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...({ fetchpriority: priority ? 'high' : 'low' } as Record<string, string>)}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
