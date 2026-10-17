import { FadeIn } from './FadeIn';
import { brandsData } from '../data/initialData';

export const Brands = () => {
  return (
    <section className="scroll-mt-24 py-12 md:py-20 border-y border-white/5">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <FadeIn direction="up">
          <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Trusted by Brands
          </h3>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            Worked with startups and growing brands across global industries.
          </p>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-16 items-center justify-items-center mt-12 px-4">
          {brandsData.map((brand, idx) => (
            <div key={idx} className="group relative flex flex-col items-center gap-3">
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-3xl md:text-4xl text-slate-600 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:text-teal-400 group-hover:scale-110 transition-all duration-500">
                <i className={brand.icon} aria-hidden="true" />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-700 group-hover:text-slate-400 transition-colors">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
