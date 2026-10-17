import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';
import { processSteps } from '../data/initialData';

export const Approach = () => {
  return (
    <section id="approach" className="scroll-mt-24 md:scroll-mt-32">
      <SectionHeading title="Design Approach" subtitle="Work Process" />
      <div className="max-w-4xl mb-16">
        <FadeIn delay={100}>
          <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
            Design is a{' '}
            <span className="text-teal-400 underline decoration-teal-400/30 underline-offset-4">
              strategic tool
            </span>{' '}
            for growth. I bridge vision and reality with clarity and conversion-driven thinking.
          </p>
        </FadeIn>
      </div>

      <div className="relative">
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-teal-500/20 via-white/5 to-[#FF6F61]/20 -translate-y-1/2 z-0" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          {processSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <FadeIn key={step.id} delay={index * 150} direction="up">
                <div className="group h-full p-8 rounded-[2.5rem] bg-[#131C31] border border-white/10 hover:border-teal-400/40 transition-all duration-500 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="mb-6 relative">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}
                    >
                      <IconComponent size={26} aria-hidden="true" />
                    </div>
                    <span
                      className="absolute -top-3 -right-3 text-4xl font-black text-white/5 select-none transition-colors group-hover:text-teal-400/10"
                      aria-hidden="true"
                    >
                      {step.id}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.desc}
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
