import { FadeIn } from './FadeIn';

interface SectionHeadingProps {
  title: string;
  subtitle: string;
}

export const SectionHeading = ({ title, subtitle }: SectionHeadingProps) => {
  return (
    <div className="mb-12 md:mb-20">
      <FadeIn>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px w-8 md:w-12 bg-[#FF6F61]" />
          <span className="text-[#FF6F61] font-mono tracking-widest text-xs md:text-sm uppercase">
            {subtitle}
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          {title}
        </h2>
      </FadeIn>
    </div>
  );
};
