import { Quote, Star } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';
import { testimonialsData } from '../data/initialData';

export const Testimonials = () => {
  return (
    <section id="testimonials" className="scroll-mt-24 md:scroll-mt-32">
      <SectionHeading title="Referrals from People" subtitle="Testimonials" />
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {testimonialsData.map((item, index) => (
          <FadeIn key={index} delay={index * 100} direction="up">
            <div className="group h-full p-8 rounded-[2rem] bg-[#131C31] border border-white/5 hover:border-teal-400/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col">
              <Quote
                size={40}
                className="text-white/10 mb-6 group-hover:text-teal-400/20 transition-colors"
                aria-hidden="true"
              />
              <p className="text-slate-300 leading-relaxed mb-8 flex-grow text-sm md:text-base">
                "{item.text}"
              </p>
              <div className="mt-auto">
                <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      size={14}
                      className="fill-teal-400 text-teal-400"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm md:text-base">
                      {item.name}
                    </h4>
                    <p className="text-[#FF6F61] text-xs font-semibold uppercase tracking-wider">
                      {item.role}
                    </p>
                    <p className="text-slate-500 text-xs">{item.company}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
