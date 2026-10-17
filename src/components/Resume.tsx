import { Briefcase, GraduationCap } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';
import { ExperienceItem, EducationItem } from '../types';

interface ResumeProps {
  experience: ExperienceItem[];
  education: EducationItem[];
}

export const Resume = ({ experience, education }: ResumeProps) => {
  return (
    <section id="resume" className="scroll-mt-24 md:scroll-mt-32">
      <SectionHeading title="Professional Odyssey" subtitle="Resume" />
      <div className="grid lg:grid-cols-2 gap-12 md:gap-16">
        {/* Experience Column */}
        <div className="space-y-10 md:space-y-12 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-teal-400 before:via-white/10 before:to-transparent">
          <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-9 h-9 rounded-xl bg-teal-400/10 flex items-center justify-center text-teal-400 border border-teal-400/20">
              <Briefcase size={20} aria-hidden="true" />
            </div>
            Experience
          </h3>
          {experience.map((item, index) => (
            <FadeIn
              key={item.id}
              delay={index * 150}
              direction="right"
              className="relative pl-12 group"
            >
              <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-[#131C31] border-2 border-teal-400 z-10 transition-transform group-hover:scale-110" />
              <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:border-teal-400/30 group-hover:-translate-y-1">
                <span className="text-teal-400 font-mono text-[11px] md:text-sm font-bold block mb-2">
                  {item.year}
                </span>
                <h4 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-teal-400 transition-colors leading-tight">
                  {item.role}
                </h4>
                <p className="text-[#FF6F61] font-semibold mb-3 text-xs tracking-wide uppercase">
                  {item.company}
                </p>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                  {item.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Education Column */}
        <div className="space-y-10 md:space-y-12 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-[#FF6F61] before:via-white/10 before:to-transparent">
          <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#FF6F61]/10 flex items-center justify-center text-[#FF6F61] border border-[#FF6F61]/20">
              <GraduationCap size={20} aria-hidden="true" />
            </div>
            Education
          </h3>
          {education.map((item, index) => (
            <FadeIn
              key={item.id}
              delay={index * 150}
              direction="left"
              className="relative pl-12 group"
            >
              <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-[#131C31] border-2 border-[#FF6F61] z-10 transition-transform group-hover:scale-110" />
              <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.08] group-hover:border-[#FF6F61]/30 group-hover:-translate-y-1">
                <span className="text-[#FF6F61] font-mono text-[11px] md:text-sm font-bold block mb-2">
                  {item.year}
                </span>
                <h4 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-[#FF6F61] transition-colors leading-tight">
                  {item.degree}
                </h4>
                <p className="text-teal-400 font-semibold mb-3 text-xs tracking-wide uppercase">
                  {item.institution}
                </p>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                  {item.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
