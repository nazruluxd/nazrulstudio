import { useState, useRef, useEffect, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeIn = ({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: FadeInProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  let offset = '';
  switch (direction) {
    case 'up':
      offset = 'translate-y-12';
      break;
    case 'down':
      offset = '-translate-y-12';
      break;
    case 'left':
      offset = 'translate-x-12';
      break;
    case 'right':
      offset = '-translate-x-12';
      break;
    default:
      offset = 'translate-y-0';
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${offset}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
