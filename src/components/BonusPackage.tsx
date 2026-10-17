import { Package, Palette, Layers } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';

export const BonusPackage = () => {
  const bonuses = [
    {
      title: 'Packaging Concepts',
      icon: Package,
      desc: 'Professional packaging mockups, dieline inspirations, and product presentation samples designed for premium marketing.',
    },
    {
      title: 'Branding Assets',
      icon: Palette,
      desc: 'Complete branding examples including logo systems, typography pairings, color palettes, and identity concepts.',
    },
    {
      title: 'UX/UI Systems',
      icon: Layers,
      desc: 'Advanced UX/UI prototype samples, responsive interface systems, and modern app layouts optimized for engagement.',
    },
  ];

  return (
    <section id="bonus" className="scroll-mt-24 md:scroll-mt-32 relative py-12 md:py-24">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[60%] bg-gradient-to-r from-teal-500/5 via-indigo-500/5 to-[#FF6F61]/5 blur-[100px] pointer-events-none rounded-full z-0" />
      <div className="relative z-10">
        <SectionHeading
          title="Unlock a Complete Prototype Bonus Package"
          subtitle="Design Resources"
        />
        <div className="max-w-4xl mb-12 md:mb-16">
          <FadeIn delay={100} direction="up">
            <p className="text-lg md:text-2xl text-slate-300 font-medium leading-relaxed">
              Access premium creative assets, modern layouts, wireframes, and high quality visual inspiration to accelerate your project workflow.
            </p>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {bonuses.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <FadeIn key={index} delay={index * 100} direction="up">
                <div className="group h-full p-8 rounded-[2rem] bg-[#131C31]/80 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:bg-[#FF6F61] transition-all">
                    <IconComponent size={26} aria-hidden="true" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed flex-grow">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};
