import { useState, useEffect, useRef, RefObject } from 'react';

export interface IntersectionLazyLoadOptions {
  /** Margin around the viewport to start pre-loading before the element is visible */
  rootMargin?: string;
  /** Visibility ratio required to trigger intersection */
  threshold?: number | number[];
  /** Disconnect observer after first intersection (default: true) */
  triggerOnce?: boolean;
  /** Immediately mark as intersected (e.g. for priority above-the-fold items) */
  priority?: boolean;
}

export interface IntersectionLazyLoadResult<T extends HTMLElement> {
  ref: RefObject<T>;
  /** Whether the element is currently within the observer rootMargin/threshold */
  isInView: boolean;
  /** Whether the element has intersected at least once */
  hasIntersected: boolean;
}

/**
 * High-performance Intersection Observer hook for lazy-loading images,
 * heavy media cards, and deferred animation timelines to optimize
 * Google Lighthouse Core Web Vitals (LCP, TBT/INP, CLS).
 */
export function useIntersectionLazyLoad<T extends HTMLElement = HTMLDivElement>({
  rootMargin = '250px 0px',
  threshold = 0.01,
  triggerOnce = true,
  priority = false,
}: IntersectionLazyLoadOptions = {}): IntersectionLazyLoadResult<T> {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState<boolean>(priority);
  const [hasIntersected, setHasIntersected] = useState<boolean>(priority);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      setHasIntersected(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    // Fallback for environments or bots without IntersectionObserver support
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      setHasIntersected(true);
      return;
    }

    // If triggerOnce is enabled and we already intersected, skip observing again
    if (triggerOnce && hasIntersected) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsInView(true);
          setHasIntersected(true);
          if (triggerOnce) {
            observer.unobserve(node);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce, priority, hasIntersected]);

  return { ref, isInView, hasIntersected };
}
