import { ArrowRight, Mail } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { GlobalContent } from '../types';
import { socialLinks } from '../data/initialData';

interface HeroProps {
  global: GlobalContent;
}

export const Hero = ({ global }: HeroProps) => {
  return (
    <section
      id="home"
      className="min-h-[80vh] flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 pt-8 md:pt-10"
    >
      <div className="flex-1 space-y-6 md:space-y-8 order-2 lg:order-1 text-center lg:text-left">
        <FadeIn delay={100} direction="down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs md:text-sm font-medium backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            Available for new projects
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight whitespace-pre-line">
            {global.heroTitle} <br />
            <span className="block text-2xl md:text-5xl lg:text-6xl mt-4 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                {global.heroGradient}
              </span>
              <span className="italic font-light text-slate-400"> </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F61] to-orange-400">
                {global.heroSub}
              </span>
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={300}>
          <p className="text-base md:text-xl text-slate-400 max-w-2xl leading-relaxed mx-auto lg:mx-0 whitespace-pre-line">
            {global.heroDesc}
          </p>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 pt-4">
            <a
              href="#portfolio"
              className="relative px-6 md:px-8 py-3.5 md:py-4 bg-[#FF6F61] hover:bg-[#ff8073] text-white font-semibold rounded-full shadow-[0_0_20px_rgba(255,111,97,0.3)] transition-all group"
            >
              <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
                View Portfolio <ArrowRight size={18} aria-hidden="true" />
              </span>
            </a>

            <a
              href="#contact"
              className="px-6 md:px-8 py-3.5 md:py-4 bg-transparent border border-white/20 hover:border-teal-400 text-white font-semibold rounded-full transition-all flex items-center gap-2 group"
            >
              <Mail size={18} className="text-teal-400 group-hover:animate-pulse" aria-hidden="true" />
              <span className="text-sm md:text-base">Hire Me</span>
            </a>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              {socialLinks.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="relative group">
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-[#FF6F61] to-teal-400 rounded-full blur-md opacity-0 group-hover:opacity-80 transition-all duration-500 z-0" />
                    <a
                      href={item.href}
                      aria-label={item.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-10 h-10 md:w-11 md:h-11 rounded-full border border-white/10 bg-[#0B1121] flex items-center justify-center text-slate-400 hover:text-white hover:border-[#FF6F61] hover:bg-[#FF6F61]/10 transition-all hover:-translate-y-1 z-10"
                    >
                      <IconComponent size={18} aria-hidden="true" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="flex-1 relative flex flex-col justify-center items-center order-1 lg:order-2 w-full max-w-[280px] sm:max-w-md mx-auto lg:mx-0">
        <FadeIn delay={500} direction="left" className="relative w-full aspect-square">
          <div className="absolute inset-[-15px] md:inset-[-25px] rounded-full bg-gradient-to-tr from-teal-400 via-blue-500 to-[#FF6F61] opacity-60 animate-neon-breathe z-0" />
          <div className="absolute inset-[-2px] md:inset-[-3px] rounded-full bg-gradient-to-r from-teal-400 to-[#FF6F61] opacity-100 z-0 shadow-[0_0_30px_rgba(20,184,166,0.6)]" />
          <div className="relative w-full h-full rounded-full bg-[#131C31] shadow-2xl overflow-hidden z-10 flex justify-center border border-white/10">
            <img
              src={global.heroImage}
              alt="Portrait"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute -bottom-6 md:-bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-gradient-to-r from-teal-500/0 via-teal-400/50 to-[#FF6F61]/0 blur-xl md:blur-2xl animate-neon-floor z-0" />
        </FadeIn>
      </div>
    </section>
  );
};
