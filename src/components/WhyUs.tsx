import { Check, X } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { comparisonData } from '../data/initialData';

export const WhyUs = () => {
  return (
    <section id="why-us" className="scroll-mt-24 md:scroll-mt-32 relative z-10 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        <FadeIn direction="up" className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-teal-500/30 text-teal-400 text-sm font-semibold tracking-wide mb-8 bg-teal-500/5 backdrop-blur-sm">
            Why Choose Me
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            <span className="font-serif italic mr-2 text-slate-200">Nazrul Studio's</span>
            Alternative? <br className="hidden md:block" />
            <span className="font-serif italic mr-2 text-slate-200">Think</span>
            One More Time!
          </h2>
        </FadeIn>

        <div className="w-full overflow-x-auto hide-scrollbar pb-8 px-4">
          <div className="min-w-[900px] w-full flex flex-col gap-4">
            {/* Header */}
            <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-8 py-4 text-white font-bold text-base md:text-lg">
              <div className="pl-4">Platform</div>
              <div className="text-center">Speed</div>
              <div className="text-center">Flexibility</div>
              <div className="text-center">Quality</div>
              <div className="text-center">Scalability</div>
              <div className="text-center">Affordability</div>
            </div>

            {/* Rows */}
            {comparisonData.map((row, index) => {
              const IconComponent = row.icon;
              return (
                <FadeIn key={index} delay={index * 100} direction="up">
                  <div
                    className={`grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 md:px-8 py-6 rounded-[2rem] items-center transition-all duration-500 ${
                      row.highlight
                        ? 'bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-[#3b1c7a] via-[#1a0e35] to-transparent border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.15)] relative overflow-hidden'
                        : 'bg-[#131C31]/40 border border-white/5 hover:bg-[#131C31]/80 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-5 md:gap-6 pr-4 relative z-10">
                      <div
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 ${
                          row.highlight
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'bg-[#1e293b] text-slate-400'
                        }`}
                      >
                        <IconComponent size={28} aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="text-lg md:text-xl font-bold text-white mb-1.5">
                          {row.name}
                        </h4>
                        <p className="text-xs md:text-sm text-slate-400 leading-relaxed pr-4">
                          {row.desc}
                        </p>
                      </div>
                    </div>

                    {row.features.map((feature, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex justify-center items-center relative z-10"
                      >
                        {feature ? (
                          <Check className="text-white" size={28} aria-label="Yes" />
                        ) : (
                          <X className="text-red-500/90" size={28} aria-label="No" />
                        )}
                      </div>
                    ))}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
