import { useState, useEffect } from 'react';
import { ExternalLink, X, Share2, Check } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';
import { LazyImage } from './LazyImage';
import { PortfolioItem } from '../types';
import { slugify } from '../utils/sitemapGenerator';
import { useIntersectionLazyLoad } from '../utils/useIntersectionLazyLoad';

interface PortfolioProps {
  portfolio: PortfolioItem[];
  activePortfolioItem?: PortfolioItem | null;
  onSelectPortfolioItem?: (item: PortfolioItem | null) => void;
}

export const Portfolio = ({
  portfolio,
  activePortfolioItem,
  onSelectPortfolioItem,
}: PortfolioProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedLink, setCopiedLink] = useState(false);

  // Observe when the Portfolio section approaches the viewport to pre-warm first row
  const { ref: sectionRef, hasIntersected: isSectionNear } =
    useIntersectionLazyLoad<HTMLElement>({
      rootMargin: '400px 0px',
      threshold: 0.01,
      triggerOnce: true,
    });

  const categories = ['All', ...new Set(portfolio.map((item) => item.category))];
  const filteredPortfolio =
    selectedCategory === 'All'
      ? portfolio
      : portfolio.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePortfolioItem && onSelectPortfolioItem) {
        onSelectPortfolioItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePortfolioItem, onSelectPortfolioItem]);

  const handleOpenProject = (item: PortfolioItem) => {
    if (onSelectPortfolioItem) {
      onSelectPortfolioItem(item);
    }
    const slug = slugify(`${item.id}-${item.title}`);
    window.history.replaceState(null, '', `?portfolio=${slug}#portfolio-${item.id}`);
  };

  const handleCloseProject = () => {
    if (onSelectPortfolioItem) {
      onSelectPortfolioItem(null);
    }
    window.history.replaceState(null, '', '#portfolio');
  };

  const handleCopyShareLink = (item: PortfolioItem) => {
    const slug = slugify(`${item.id}-${item.title}`);
    const shareUrl = `${window.location.origin}/?portfolio=${slug}#portfolio-${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className="scroll-mt-24 md:scroll-mt-32"
    >
      <SectionHeading title="Selected Works" subtitle="Portfolio" />

      {/* Filter Tabs */}
      <FadeIn delay={100}>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-8 md:mb-12" role="tablist">
          {categories.map((category, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 md:px-7 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#FF6F61] text-white shadow-xl scale-105'
                  : 'bg-[#131C31] text-slate-400 hover:text-white hover:bg-[#1e293b]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Portfolio Grid with IntersectionObserver Lazy Loading */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredPortfolio.map((item, index) => (
          <FadeIn key={item.id} delay={Math.min(index * 40, 240)} direction="up">
            <div
              id={`portfolio-${item.id}`}
              onClick={() => handleOpenProject(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenProject(item);
                }
              }}
              className="group relative rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#131C31] border border-white/5 aspect-[4/3] transition-all duration-500 hover:border-[#FF6F61]/30 hover:shadow-2xl scroll-mt-28 cursor-pointer"
            >
              <LazyImage
                src={item.image}
                alt={`Project: ${item.title}`}
                width={800}
                height={600}
                rootMargin="250px 0px"
                priority={isSectionNear && index < 3}
                fallbackLabel={`${item.title} · ${item.category}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-teal-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.category}
                </span>
                <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-[11px] md:text-sm mb-3 md:mb-5 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                  {item.desc}
                </p>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#FF6F61] hover:scale-110">
                  <ExternalLink size={16} aria-hidden="true" />
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Project Lightbox & SEO Detail Modal */}
      {activePortfolioItem && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={handleCloseProject}
        >
          <div
            className="bg-[#131C31] border border-white/10 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseProject}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-white border border-white/15 transition-colors"
              aria-label="Close project view"
            >
              <X size={18} />
            </button>

            <div className="aspect-[16/10] w-full bg-[#0B1121] overflow-hidden relative">
              <LazyImage
                src={activePortfolioItem.image}
                alt={activePortfolioItem.title}
                width={1200}
                height={750}
                priority={true}
                fallbackLabel={activePortfolioItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 md:p-8 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-teal-400 mb-1">
                    {activePortfolioItem.category} · Selected Works
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {activePortfolioItem.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyShareLink(activePortfolioItem)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share Project Link</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                {activePortfolioItem.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
