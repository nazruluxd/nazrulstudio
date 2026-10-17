import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';

export const About = () => {
  const stats = [
    { label: 'Experience', value: '13+ Years' },
    { label: 'Projects', value: '250+' },
    { label: 'Based in', value: 'Dubai, UAE' },
    { label: 'Focus', value: 'Production' },
  ];

  return (
    <section id="about" className="scroll-mt-24 md:scroll-mt-32">
      <SectionHeading title="Behind the Design" subtitle="About Me" />
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn direction="right">
          <div className="space-y-6 text-base md:text-lg text-slate-400 leading-relaxed">
            <p>
              Since 2011, I have established myself as a designer focused on the delicate intersection of aesthetic branding and technical production.
            </p>
            <p>
              Expertise lies in structural packaging—not just beautiful, but production-ready concepts designed for modern brands and premium marketing.
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="left">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:border-teal-400/30 transition-colors group"
              >
                <p className="text-teal-400 font-bold text-2xl md:text-3xl mb-1 group-hover:scale-110 transition-transform">
                  {stat.value}
                </p>
                <p className="text-slate-500 text-xs md:text-sm uppercase font-bold tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
