import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeading } from './SectionHeading';
import { LazyImage } from './LazyImage';
import { ShowcaseItem } from '../types';
import { slugify } from '../utils/sitemapGenerator';
import { useIntersectionLazyLoad } from '../utils/useIntersectionLazyLoad';

interface ProjectShowcaseProps {
  showcase: ShowcaseItem[];
  onActiveShowcaseChange?: (item: ShowcaseItem | null) => void;
}

export const ProjectShowcase = ({
  showcase,
  onActiveShowcaseChange,
}: ProjectShowcaseProps) => {
  // Defer GSAP ScrollTrigger initialization & showcase image loading until section approaches viewport
  const { ref: sectionRef, hasIntersected: isShowcaseApproaching } =
    useIntersectionLazyLoad<HTMLElement>({
      rootMargin: '450px 0px',
      threshold: 0.01,
      triggerOnce: true,
    });

  useEffect(() => {
    if (!isShowcaseApproaching) return;

    let ctx: gsap.Context | undefined;
    let timer: ReturnType<typeof setTimeout>;

    try {
      gsap.registerPlugin(ScrollTrigger);

      timer = setTimeout(() => {
        ctx = gsap.context(() => {
          const cards = gsap.utils.toArray<HTMLElement>('.layered-card');
          if (cards.length === 0) return;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: '.layered-stack-container',
              start: 'top top',
              end: `+=${cards.length * 100}%`,
              pin: true,
              scrub: 1,
              onUpdate: (self) => {
                if (!onActiveShowcaseChange || showcase.length === 0) return;
                if (self.isActive) {
                  const idx = Math.min(
                    showcase.length - 1,
                    Math.max(0, Math.floor(self.progress * showcase.length))
                  );
                  onActiveShowcaseChange(showcase[idx]);
                }
              },
              onLeave: () => {
                if (onActiveShowcaseChange) onActiveShowcaseChange(null);
              },
              onLeaveBack: () => {
                if (onActiveShowcaseChange) onActiveShowcaseChange(null);
              },
            },
          });

          cards.forEach((card, i) => {
            if (i > 0) {
              gsap.set(card, {
                y: '150%',
                scale: 0.9,
                opacity: 0,
                transformOrigin: 'top center',
              });
            }
          });

          cards.forEach((card, i) => {
            if (i === 0) return;
            const prev = i - 1;
            tl.to(
              card,
              {
                y: `${i * 3}%`,
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: 'power2.out',
              },
              prev
            );

            for (let j = 0; j < i; j++) {
              tl.to(
                cards[j],
                {
                  scale: 1 - (i - j) * 0.05,
                  opacity: 1 - (i - j) * 0.3,
                  y: `-${(i - j) * 2}%`,
                  duration: 1,
                  ease: 'power2.out',
                },
                prev
              );
            }
          });
        });
      }, 60);
    } catch (err) {
      console.error('Failed to load GSAP', err);
    }

    return () => {
      clearTimeout(timer);
      ctx?.revert();
    };
  }, [isShowcaseApproaching, showcase, onActiveShowcaseChange]);

  const handleSelectShowcase = (item: ShowcaseItem) => {
    if (onActiveShowcaseChange) {
      onActiveShowcaseChange(item);
    }
    const slug = slugify(`${item.id}-${item.title}`);
    window.history.replaceState(null, '', `?project=${slug}#project-${item.id}`);
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="layered-stack-container relative w-full min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#0B1121]"
    >
      <div className="absolute top-12 md:top-24 w-full z-20 px-6">
        <div className="max-w-7xl mx-auto md:px-12">
          <SectionHeading title="Project Showcase" subtitle="Specialized Expertise" />
        </div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto h-[70vh] md:h-[75vh] mt-24 md:mt-16 px-6 md:px-12">
        {showcase.map((item, idx) => (
          <div
            key={item.id}
            id={`project-${item.id}`}
            onClick={() => handleSelectShowcase(item)}
            className={`layered-card absolute top-0 left-6 right-6 md:left-12 md:right-12 h-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden ${item.bg} ${item.border} shadow-2xl flex flex-col lg:flex-row border will-change-transform cursor-pointer`}
          >
            <div className="lg:w-[40%] p-8 md:p-14 flex flex-col justify-center space-y-6">
              <div>
                <span
                  className={`italic font-serif text-lg md:text-xl ${item.text} opacity-60 block mb-2`}
                >
                  {item.category}
                </span>
                <h3
                  className={`text-4xl md:text-6xl font-black ${item.text} tracking-tight leading-tight`}
                >
                  {item.title}
                </h3>
              </div>
              <p className={`text-base md:text-lg ${item.text} opacity-80 leading-relaxed`}>
                {item.desc}
              </p>
              {item.tags && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-4 py-2 rounded-full border border-black/10 text-xs font-bold uppercase tracking-wider ${item.text} bg-white/40`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:w-[60%] h-full bg-white relative group overflow-hidden flex items-center justify-center p-4 md:p-8">
              <LazyImage
                src={item.image}
                alt={item.title}
                width={1000}
                height={750}
                rootMargin="450px 0px"
                priority={isShowcaseApproaching && idx === 0}
                fallbackLabel={`${item.title} · ${item.category}`}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.05)] pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
