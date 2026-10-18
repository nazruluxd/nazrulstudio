import { Code, Globe } from 'lucide-react';
import { NavMenuItem } from '../types';
import { socialLinks } from '../data/initialData';

interface FooterProps {
  navItems: NavMenuItem[];
  onOpenAdmin: () => void;
  onOpenSitemap?: () => void;
}

export const Footer = ({ navItems, onOpenAdmin, onOpenSitemap }: FooterProps) => {
  return (
    <footer className="border-t border-white/5 bg-[#080d18] pt-12 md:pt-16 pb-8 md:pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10 mb-12">
          {/* Logo */}
          <div
            className="text-2xl md:text-3xl font-bold text-white tracking-tighter"
            aria-label="Nazrul Studio"
          >
            nazrul<span className="text-[#FF6F61]">studio</span>
            <span className="text-teal-400">.</span>
          </div>

          {/* Nav links */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {navItems.slice(0, 4).map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-[11px] md:text-sm font-semibold text-slate-500 hover:text-white transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {navItems.slice(4).map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-[11px] md:text-sm font-semibold text-slate-500 hover:text-white transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Social icons */}
          <div className="flex gap-3 md:gap-4">
            {socialLinks.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="relative group">
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FF6F61] rounded-full blur-md opacity-0 group-hover:opacity-90 transition-all duration-500 z-0" />
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="relative w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#131C31] border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#FF6F61] transition-all z-10"
                  >
                    <IconComponent size={18} aria-hidden="true" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <p
              onClick={() => {
                const now = Date.now();
                if ((window as any).__adminClickTime && now - (window as any).__adminClickTime < 1500) {
                  (window as any).__adminClickCount = ((window as any).__adminClickCount || 1) + 1;
                  if ((window as any).__adminClickCount >= 3) {
                    (window as any).__adminClickCount = 0;
                    onOpenAdmin();
                  }
                } else {
                  (window as any).__adminClickCount = 1;
                }
                (window as any).__adminClickTime = now;
              }}
              className="text-slate-500 text-[10px] md:text-sm font-medium flex items-center gap-2 select-none"
            >
              © {new Date().getFullYear()} Nazrul Studio. All rights reserved.
              <span className="mx-1 text-white/10 hidden md:inline">|</span>
              <br className="md:hidden" />
              Based in Dubai, UAE
            </p>

            {onOpenSitemap && (
              <>
                <span className="text-white/10 hidden md:inline">|</span>
                <button
                  type="button"
                  onClick={onOpenSitemap}
                  className="text-[11px] md:text-xs font-semibold text-teal-400/90 hover:text-teal-300 flex items-center gap-1.5 transition-colors"
                >
                  <Globe size={13} />
                  <span>Sitemap XML</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-600 text-[10px] md:text-sm font-bold bg-white/5 px-3 md:px-4 py-1.5 rounded-lg">
            <Code size={14} className="text-teal-400" />
            <span className="uppercase tracking-widest text-[9px] md:text-[10px]">
              Precision in Design & Production
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

