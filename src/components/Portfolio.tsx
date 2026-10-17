import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';
import { PortfolioItem } from '../types';

interface PortfolioProps {
  portfolio: PortfolioItem[];
}

export const Portfolio = ({ portfolio }: PortfolioProps) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(portfolio.map((item) => item.category))];
  const filteredPortfolio =
    selectedCategory === 'All'
      ? portfolio
      : portfolio.filter((item) => item.category === selectedCategory);

  return (
    <section id="portfolio" className="scroll-mt-24 md:scroll-mt-32">
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

      {/* Portfolio Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredPortfolio.map((item, index) => (
          <FadeIn key={item.id} delay={index * 50} direction="up">
            <div className="group relative rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#131C31] border border-white/5 aspect-[4/3] transition-all duration-500 hover:border-[#FF6F61]/30 hover:shadow-2xl">
              <img
                src={item.image}
                alt={`Project: ${item.title}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
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
    </section>
  );
};
