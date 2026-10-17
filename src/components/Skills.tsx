import { Layout, Database } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';
import { SkillItem } from '../types';
import { techStackList } from '../data/initialData';

interface SkillsProps {
  skills: SkillItem[];
}

export const Skills = ({ skills }: SkillsProps) => {
  return (
    <section id="skills" className="scroll-mt-24 md:scroll-mt-32">
      <SectionHeading title="Technical Arsenal" subtitle="Expertise" />
      <div className="grid lg:grid-cols-2 gap-12 md:gap-16">
        {/* Left Column: Primary Skills */}
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <Layout className="text-teal-400" size={24} aria-hidden="true" />
            Primary Skills
          </h3>
          {skills.map((skill, index) => (
            <FadeIn key={skill.id} delay={index * 40} direction="right">
              <div className="space-y-2 group">
                <div className="flex justify-between items-start gap-4 text-xs md:text-sm font-medium">
                  <span className="text-white group-hover:text-teal-400 transition-colors">
                    {skill.name}
                  </span>
                  <span className="text-slate-400 shrink-0">{skill.level}%</span>
                </div>
                <div
                  className="h-1.5 md:h-2 bg-[#131C31] rounded-full overflow-hidden border border-white/5"
                  role="progressbar"
                  aria-valuenow={skill.level}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full ${skill.color}`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Right Column: Technology Stack */}
        <div className="space-y-6 md:space-y-8">
          <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <Database className="text-[#FF6F61]" size={24} aria-hidden="true" />
            Technology Stack
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {techStackList.map((tech, index) => (
              <FadeIn key={index} delay={index * 30} direction="up">
                <span className="px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-[#131C31] border border-white/10 text-slate-300 text-xs md:text-sm hover:border-teal-500 hover:text-white transition-all cursor-default block text-center">
                  {tech}
                </span>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
