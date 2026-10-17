import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { FadeIn } from './FadeIn';
import { GlobalContent } from '../types';

interface ContactProps {
  global: GlobalContent;
}

export const Contact = ({ global }: ContactProps) => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');
    const form = e.currentTarget;
    setTimeout(() => {
      setFormState('success');
      form.reset();
      setTimeout(() => setFormState('idle'), 3000);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: global.contactEmail,
      href: `mailto:${global.contactEmail}`,
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      value: global.contactPhone,
      href: `https://wa.me/${global.contactPhone.replace(/[^0-9]/g, '')}`,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: global.location,
      href: '#',
    },
  ];

  return (
    <section id="contact" className="scroll-mt-24 md:scroll-mt-32 pb-12 md:pb-24">
      <FadeIn>
        <div className="bg-[#131C31] border border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-16 relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 relative z-10">
            {/* Left Info Column */}
            <div>
              <SectionHeading
                title="Let's build something iconic."
                subtitle="Connect"
              />
              <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 leading-relaxed max-w-md">
                Ready to elevate your brand presence? Reach out for collaborations or project inquiries.
              </p>

              <div className="space-y-4 md:space-y-6">
                {contactMethods.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <FadeIn key={idx} delay={idx * 100} direction="right">
                      <a
                        href={item.href}
                        target={item.href.includes('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all w-max pr-6 md:pr-10 group block"
                      >
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#0B1121] flex items-center justify-center text-[#FF6F61] group-hover:bg-[#FF6F61] group-hover:text-white transition-all">
                          <IconComponent size={20} aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5 md:mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm md:text-white md:font-medium group-hover:text-teal-400 transition-colors">
                            {item.value}
                          </p>
                        </div>
                      </a>
                    </FadeIn>
                  );
                })}
              </div>
            </div>

            {/* Right Form Column */}
            <FadeIn direction="left">
              <div className="bg-[#0B1121]/50 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-xs md:text-sm font-semibold text-slate-400 ml-1"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        className="w-full bg-[#131C31] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6F61] transition-colors"
                        placeholder="Nazrul"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-xs md:text-sm font-semibold text-slate-400 ml-1"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full bg-[#131C31] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6F61] transition-colors"
                        placeholder={global.contactEmail}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="whatsapp"
                        className="text-xs md:text-sm font-semibold text-slate-400 ml-1"
                      >
                        WhatsApp
                      </label>
                      <input
                        id="whatsapp"
                        type="tel"
                        className="w-full bg-[#131C31] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6F61] transition-colors"
                        placeholder={global.contactPhone}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="budget"
                        className="text-xs md:text-sm font-semibold text-slate-400 ml-1"
                      >
                        Project Budget
                      </label>
                      <input
                        id="budget"
                        type="text"
                        className="w-full bg-[#131C31] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6F61] transition-colors"
                        placeholder="1000 usd"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="vision"
                      className="text-xs md:text-sm font-semibold text-slate-400 ml-1"
                    >
                      Your Vision
                    </label>
                    <textarea
                      id="vision"
                      rows={4}
                      required
                      className="w-full bg-[#131C31] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FF6F61] resize-none transition-colors"
                      placeholder="Describe your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className={`w-full py-4 font-bold rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                      formState === 'success'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gradient-to-r from-[#FF6F61] to-orange-500 text-white'
                    }`}
                  >
                    {formState === 'submitting' ? (
                      'Sending...'
                    ) : formState === 'success' ? (
                      <>
                        <CheckCircle2 size={20} /> Message Sent
                      </>
                    ) : (
                      'Submit Inquiry'
                    )}
                  </button>
                </form>
              </div>
            </FadeIn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
};
