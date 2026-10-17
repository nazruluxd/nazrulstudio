import { Mail, Menu, X, ShoppingBag } from 'lucide-react';
import { NavMenuItem } from '../types';

interface NavbarProps {
  activeSection: string;
  isScrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  filteredNavItems: NavMenuItem[];
  onOpenShop: () => void;
}

export const Navbar = ({
  activeSection,
  isScrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  filteredNavItems,
  onOpenShop,
}: NavbarProps) => {
  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[90] transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? 'bg-[#0B1121]/90 backdrop-blur-md border-b border-white/5 py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <a
            href="#home"
            className="text-xl md:text-2xl font-bold text-white tracking-tighter"
            aria-label="Home"
          >
            nazrul<span className="text-[#FF6F61]">studio</span>
            <span className="text-teal-400">.</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6 border border-white/10 bg-white/5 rounded-full px-6 py-2 backdrop-blur-sm">
              {filteredNavItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    activeSection === item.href.substring(1)
                      ? 'text-[#FF6F61]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Shop button */}
            <button
              onClick={onOpenShop}
              className="px-4 py-2 rounded-full border border-[#ffa41b]/40 bg-[#ffa41b]/10 hover:bg-[#ffa41b]/20 text-[#ffcf4a] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-[#ffa41b]/10 hover:scale-105"
            >
              <ShoppingBag size={14} className="text-[#ffa41b]" />
              <span>Shop</span>
              <span className="bg-[#ffa41b] text-[#1a1204] text-[9px] font-black px-1.5 py-0.2 rounded-full">
                NEW
              </span>
            </button>

            <a
              href="#contact"
              className="relative group overflow-hidden rounded-full p-[1px]"
              aria-label="Hire Me"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#FF6F61] to-teal-400 rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-[#0B1121] px-6 py-2.5 rounded-full flex items-center gap-2 transition-all group-hover:bg-opacity-0">
                <span className="text-sm font-semibold text-white">Hire Me</span>
                <Mail size={14} className="text-white" aria-hidden="true" />
              </div>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden p-2 text-white hover:text-teal-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu when toggled */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pt-4 pb-6 bg-[#0B1121] border-b border-white/10 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenShop();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-[#ffa41b]/40 bg-[#ffa41b]/10 text-[#ffcf4a] font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={16} /> Product Shop (Serial Placer)
              </span>
              <span className="bg-[#ffa41b] text-[#1a1204] text-[10px] font-black px-2 py-0.5 rounded-full">
                HOT
              </span>
            </button>

            {filteredNavItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-base font-semibold transition-colors ${
                  activeSection === item.href.substring(1)
                    ? 'text-[#FF6F61]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-3 bg-[#FF6F61] text-white font-bold rounded-xl"
              >
                Hire Me
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Floating Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-[90]">
        <div className="flex items-center bg-[#1c1c1e]/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl overflow-x-auto hide-scrollbar p-2">
          <div className="flex items-center gap-1 md:gap-2 mx-auto">
            <button
              onClick={onOpenShop}
              className="whitespace-nowrap px-3 py-2 rounded-full text-xs font-bold bg-[#ffa41b]/20 text-[#ffcf4a] border border-[#ffa41b]/40 flex items-center gap-1"
            >
              <ShoppingBag size={12} /> Shop
            </button>
            {filteredNavItems.map((item) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <a
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-[inset_0_0_20px_rgba(168,85,247,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
