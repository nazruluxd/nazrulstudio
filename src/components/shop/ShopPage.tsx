import { useState, useEffect, FormEvent } from 'react';
import {
  Shield,
  ArrowRight,
  ExternalLink,
  Check,
  X,
  Play,
  ArrowLeft,
  Lock,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { CustomerReviews } from './CustomerReviews';
import { ShopVideoConfig } from '../../types';
import { parseVideoUrl } from '../../utils/videoUtils';
import {
  recordPayPalCheckoutLaunch,
  submitPayPalTransactionVerification,
} from '../../utils/licenseSecurity';

interface ShopPageProps {
  onBackToStudio: () => void;
  onGoToThankYou: (orderId?: string, users?: number) => void;
  shopVideo?: ShopVideoConfig;
  onOpenAdmin?: (tab?: string) => void;
}

const PAYPAL_PAYMENT_URL = 'https://www.paypal.com/ncp/payment/LHVS6M8P3X4WY';
const UNIT_PRICE = 20.0;

export const ShopPage = ({
  onBackToStudio,
  onGoToThankYou,
  shopVideo,
  onOpenAdmin,
}: ShopPageProps) => {
  const [usersCount, setUsersCount] = useState(1);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // PayPal Transaction ID verification state
  const [txIdInput, setTxIdInput] = useState('');
  const [txError, setTxError] = useState('');
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoViewMode] = useState<'video' | 'simulation'>('video');

  // Live Coupon Grid simulation
  const [mockCount, setMockCount] = useState(0);
  const [mockStart, setMockStart] = useState(1);
  const totalSerials = 200;
  const cellsPerPage = 12;

  useEffect(() => {
    let n = 0;
    const interval = setInterval(() => {
      if (n < cellsPerPage) {
        n++;
        setMockCount(n);
      } else if (n === cellsPerPage || n === cellsPerPage + 1) {
        // Hold full page briefly
        n++;
      } else {
        setMockStart((prev) => {
          const nextStart = prev + cellsPerPage;
          return nextStart > totalSerials ? 1 : nextStart;
        });
        n = 0;
        setMockCount(0);
      }
    }, 280);

    return () => clearInterval(interval);
  }, []);

  const pad = (num: number) => String(num).padStart(4, '0');
  const totalPrice = (usersCount * UNIT_PRICE).toFixed(2);

  const handlePaypalClick = () => {
    recordPayPalCheckoutLaunch(usersCount, Number(totalPrice));
    setTxError('');

    // Open PayPal Payment Link in new tab
    window.open(PAYPAL_PAYMENT_URL, '_blank', 'noopener,noreferrer');
    setShowCheckoutModal(true);
  };

  const handleVerifyCheckoutTx = async (e: FormEvent) => {
    e.preventDefault();
    setTxError('');
    setIsSubmittingTx(true);
    try {
      const result = await submitPayPalTransactionVerification({
        paypalTxId: txIdInput,
        users: usersCount,
        amount: Number(totalPrice),
      });

      if (!result.success) {
        setTxError(result.error || 'Payment verification failed.');
        return;
      }

      setShowCheckoutModal(false);
      onGoToThankYou(result.orderId, usersCount);
    } finally {
      setIsSubmittingTx(false);
    }
  };

  const faqs = [
    {
      q: 'Which computers and Illustrator versions does it work with?',
      a: 'It is built and tested on macOS and Windows with modern Adobe Illustrator versions (CC 2019 up to current 2026+). If you use an older version, the included plain .jsx script will run directly from File → Scripts.',
    },
    {
      q: 'How do I install it?',
      a: 'After you pay you get a .zxp file. Open it with a free installer such as ZXPInstaller, restart Illustrator, then open Window → Extensions (Legacy) → Serial Placer. A standalone script (.jsx) is also included for zero-install usage.',
    },
    {
      q: 'I see a certificate warning when installing. Is that normal?',
      a: 'Yes. The extension is signed with our own developer certificate rather than one from a third-party certificate authority, so some installers show a standard notice. You can safely accept it, or use the plain .jsx script file.',
    },
    {
      q: 'What format should my serial list be?',
      a: 'A plain text (.txt) file with one serial number on each line (e.g. 0001, 0002, 0003). Blank lines are ignored, and you can add prefixes or suffixes inside the panel.',
    },
    {
      q: 'Will it change my artwork?',
      a: 'It only adds the serial text to the boxes you select. When you build pages, it copies your selected artboards beside each other. You can undo anytime with Cmd/Ctrl + Z. We recommend working on a copy of your file the first time.',
    },
    {
      q: 'How many serial numbers can it handle?',
      a: 'Thousands per list. Illustrator itself allows around 1,000 artboards in a single document, and the tool processes entire lists effortlessly.',
    },
    {
      q: 'How does the license work?',
      a: 'One license per user. You pay $20 once and it is yours for life with no monthly or yearly subscriptions. Each license covers one person on up to two computers. Select the number of users at checkout for your team.',
    },
    {
      q: 'Can I get a custom version for my print workflow?',
      a: 'Yes! Send us your coupon layout and workflow requirements at hello@nazrulstudio.uk and we will prepare a custom automation setup.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0d12] text-[#e9edf5] font-sans selection:bg-[#ffa41b] selection:text-[#0b0d12] overflow-x-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-[15%] w-[800px] h-[450px] bg-gradient-to-b from-[#ffa41b]/15 via-[#ffa41b]/5 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[5%] w-[600px] h-[400px] bg-gradient-to-b from-[#5b9bff]/10 to-transparent blur-[140px] pointer-events-none z-0" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#0b0d12]/80 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="#top" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight text-white">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] font-black text-xs flex items-center justify-center">
                01
              </span>
              Serial Placer
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#9aa4b8]">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how" className="hover:text-white transition-colors">How it works</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onBackToStudio}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#9aa4b8] hover:text-[#ffa41b] transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft size={14} /> Nazrul Studio
            </button>
            <a
              href="#pricing"
              className="px-5 py-2 rounded-full font-bold text-xs md:text-sm bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] shadow-lg shadow-[#ffa41b]/20 hover:scale-105 transition-all"
            >
              Buy now · ${UNIT_PRICE}
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="top" className="relative z-10 max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-24 space-y-24 md:space-y-32">
        {/* HERO SECTION */}
        <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-4">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ffa41b]/35 bg-[#ffa41b]/10 text-[#ffcf4a] text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#ffa41b]" />
              Extension for Adobe Illustrator
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Number every coupon, ticket and voucher{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a]">
                automatically.
              </span>
            </h1>

            <p className="text-base md:text-lg text-[#9aa4b8] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Load your serial list, select your boxes, press one button. Serial Placer fills every box in order, perfectly centered, and builds all the pages for you.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#pricing"
                className="px-7 py-3.5 rounded-full font-bold text-sm md:text-base bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] shadow-[0_10px_30px_rgba(255,164,27,0.3)] hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(255,164,27,0.45)] transition-all"
              >
                Get Serial Placer
              </a>
              <a
                href="#how"
                className="px-6 py-3.5 rounded-full font-bold text-sm md:text-base border border-[#232a38] bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all"
              >
                See how it works
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs md:text-sm text-[#9aa4b8]">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#37d67a]" /> One-time payment
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#37d67a]" /> Secure checkout with PayPal
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#37d67a]" /> 14-day guarantee
              </span>
            </div>
          </div>

          {/* Interactive Illustrator Mockup */}
          <div className="w-full max-w-lg mx-auto bg-[#12161f] border border-[#232a38] rounded-2xl shadow-2xl overflow-hidden">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0e121a] border-b border-[#232a38]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2c3446]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2c3446]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2c3446]" />
              <span className="ml-2 text-xs text-[#9aa4b8] font-mono">
                Illustrator · coupons.ai
              </span>
            </div>

            {/* Mockup Body */}
            <div className="grid sm:grid-cols-[1.35fr_1fr]">
              {/* Sheet with coupon cells */}
              <div className="p-4 bg-[#1b2030] flex items-center justify-center">
                <div className="w-full bg-white rounded-lg p-3 grid grid-cols-3 gap-2 shadow-inner">
                  {Array.from({ length: cellsPerPage }).map((_, idx) => {
                    const isFilled = idx < mockCount;
                    const cellNum = pad(mockStart + idx);
                    return (
                      <div
                        key={idx}
                        className={`aspect-[2.1/1] rounded flex items-center justify-center font-mono font-bold text-xs transition-all duration-200 ${
                          isFilled
                            ? 'border-2 border-[#14161c] text-[#14161c] bg-[#fffdf7] scale-100 shadow-sm'
                            : 'border-2 border-dashed border-[#b9bfcc] text-[#c4c9d4] bg-white'
                        }`}
                      >
                        {isFilled ? cellNum : '0000'}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Illustrator Panel */}
              <div className="p-4 bg-[#141925] border-t sm:border-t-0 sm:border-l border-[#232a38] flex flex-col justify-between text-xs space-y-3">
                <div>
                  <h4 className="text-[10px] tracking-wider uppercase font-bold text-[#9aa4b8] mb-1">
                    Serial Placer
                  </h4>
                  <div className="text-base font-extrabold font-mono text-white">
                    Next: {pad(mockStart + mockCount)}
                  </div>
                  <div className="text-[#9aa4b8] text-[11px] mt-0.5">
                    Remaining: {Math.max(0, totalSerials - (mockStart - 1) - mockCount)} / {totalSerials}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="p-2 rounded-full text-center font-bold text-[11px] border border-[#2f3850] bg-[#1c2332] text-slate-300">
                    Place Next in Selected Box
                  </div>
                  <div className="p-2 rounded-full text-center font-bold text-[11px] bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] shadow-[0_0_15px_rgba(255,164,27,0.4)] animate-pulse">
                    Fill All Selected Boxes
                  </div>
                  <div className="p-2 rounded-full text-center font-bold text-[11px] border border-[#2f3850] bg-[#1c2332] text-slate-300">
                    Build pages + fill all
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STRIP METRICS */}
        <section className="py-8 bg-[#0f121a] border-y border-[#232a38] -mx-6 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <b className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a]">
                1 click
              </b>
              <span className="text-sm text-[#9aa4b8]">fills a whole page of boxes</span>
            </div>
            <div>
              <b className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a]">
                Auto pages
              </b>
              <span className="text-sm text-[#9aa4b8]">copies your design for every serial</span>
            </div>
            <div>
              <b className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a]">
                Resume anytime
              </b>
              <span className="text-sm text-[#9aa4b8]">remembers which numbers are used</span>
            </div>
          </div>
        </section>

        {/* PROBLEM / SOLUTION */}
        <section className="space-y-10">
          <div>
            <div className="text-[#ffcf4a] font-bold text-xs uppercase tracking-widest mb-2">
              Why it exists
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight max-w-2xl">
              Typing serial numbers by hand is slow, and one mistake can ruin a print run.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Doing it by hand */}
            <div className="bg-[#12161f] border border-red-500/25 rounded-2xl p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-red-400 font-bold">✕</span> Doing it by hand
              </h3>
              <ul className="space-y-3 text-sm text-[#9aa4b8]">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  Copy and paste hundreds of numbers, one box at a time
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  Skipped or repeated numbers that you find after printing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  Duplicating pages and re-checking every single artboard
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  Losing your place when you close the file
                </li>
              </ul>
            </div>

            {/* With Serial Placer */}
            <div className="bg-gradient-to-b from-[#37d67a]/[0.06] to-[#12161f] border border-[#37d67a]/40 rounded-2xl p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-[#37d67a] font-bold">✓</span> With Serial Placer
              </h3>
              <ul className="space-y-3 text-sm text-[#cdd4e3]">
                <li className="flex items-start gap-2">
                  <span className="text-[#37d67a] font-bold">✓</span>
                  Numbers go in your file's order, first to last
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#37d67a] font-bold">✓</span>
                  Every number perfectly centered in its box
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#37d67a] font-bold">✓</span>
                  Pages built automatically for your entire list
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#37d67a] font-bold">✓</span>
                  Undo, skip and resume right where you stopped
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="space-y-10 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="text-[#ffcf4a] font-bold text-xs uppercase tracking-widest">
              Features
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Everything you need to number a print job
            </h2>
            <p className="text-sm md:text-base text-[#9aa4b8]">
              Built for coupons, tickets, vouchers and labels, and designed to fit the way print shops already work in Illustrator.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '📄',
                title: 'Load from a text file',
                desc: 'One serial per line. Export from Excel or write it in Notepad. Duplicates are removed for you.',
              },
              {
                icon: '🎯',
                title: 'Perfectly centered',
                desc: 'Each number is centered in its box using the shape of the digits, so it looks crisp on press.',
              },
              {
                icon: '🗂️',
                title: 'Auto page building',
                desc: 'Select your boxes and press Build. It counts pages needed, copies your artwork, and fills every page in order.',
              },
              {
                icon: '🔤',
                title: 'Your font and size',
                desc: 'Search any installed font by name, or copy font and size from a sample number you already styled.',
              },
              {
                icon: '↩️',
                title: 'Undo, skip, resume',
                desc: 'Undo the last fill or a whole page build. Skip a number. Close Illustrator and pick up where you left off.',
              },
              {
                icon: '🧩',
                title: 'Lives inside Illustrator',
                desc: 'Installs as a panel, so it is always one click away. A standalone script version is included too.',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="bg-[#12161f] border border-[#232a38] rounded-2xl p-6 space-y-3 hover:-translate-y-1 hover:border-[#ffa41b]/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#ffa41b]/10 text-2xl flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="text-sm text-[#9aa4b8] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="space-y-12 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-[#ffcf4a] font-bold text-xs uppercase tracking-widest">
              How it works
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Three steps. Done in minutes.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              {
                step: '1',
                title: 'Load your list',
                desc: 'Choose a text file with one serial number per line. The panel shows how many you have and which comes next.',
              },
              {
                step: '2',
                title: 'Select your boxes',
                desc: 'Click the serial boxes on your coupon with the Selection tool (V). They can be vector shapes or existing text frames.',
              },
              {
                step: '3',
                title: 'Press one button',
                desc: 'Fill the selected boxes, or build and fill every page for the whole list automatically. Done.',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="relative bg-[#12161f] border border-[#232a38] rounded-2xl p-6 pt-8 space-y-2"
              >
                <div className="absolute -top-4 left-6 w-9 h-9 rounded-full bg-gradient-to-br from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] font-black text-sm flex items-center justify-center shadow-lg">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-sm text-[#9aa4b8] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Demo Video Container / Interactive Player */}
          {(() => {
            const parsedVideo = parseVideoUrl(shopVideo?.videoUrl, shopVideo?.autoplay);
            const hasVideo = parsedVideo.type !== 'none';
            const effectiveMode = hasVideo ? demoViewMode : 'simulation';
            const demoTitle = shopVideo?.title || 'Watch Serial Placer in Action';
            const demoSubtitle =
              shopVideo?.subtitle || 'Watch it number 200 coupons in a few clicks';

            return (
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Header bar above the demo container */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-2">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#ffa41b]/35 bg-[#ffa41b]/10 text-[#ffcf4a] text-xs font-bold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-[#ffa41b] animate-ping" />
                      Interactive Demo Active
                    </span>

                    {hasVideo && (
                      <span className="text-xs text-[#9aa4b8] hidden sm:inline-flex items-center gap-1">
                        <Check size={12} className="text-[#37d67a]" /> {parsedVideo.providerName || 'Video Loaded'}
                      </span>
                    )}
                  </div>

                  {/* Clean badge indicator without any exposed admin or action buttons */}
                  <div className="flex items-center gap-2">
                    {hasVideo && (
                      <span className="text-xs text-[#9aa4b8] font-mono">
                        HD Walkthrough Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Player Box */}
                <div className="aspect-video w-full rounded-3xl overflow-hidden border border-[#232a38] bg-[#0e121a] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative group">
                  {effectiveMode === 'video' && hasVideo ? (
                    isPlayingDemo ? (
                      /* Active Video Player */
                      <div className="w-full h-full relative bg-black flex flex-col">
                        {parsedVideo.type === 'youtube' && parsedVideo.embedUrl && (
                          <iframe
                            src={parsedVideo.embedUrl}
                            title="Serial Placer Video Walkthrough"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        )}

                        {parsedVideo.type === 'vimeo' && parsedVideo.embedUrl && (
                          <iframe
                            src={parsedVideo.embedUrl}
                            title="Serial Placer Video Walkthrough"
                            className="w-full h-full border-0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        )}

                        {(parsedVideo.type === 'loom' || parsedVideo.type === 'gdrive') &&
                          parsedVideo.embedUrl && (
                            <iframe
                              src={parsedVideo.embedUrl}
                              title="Serial Placer Video Walkthrough"
                              className="w-full h-full border-0"
                              allowFullScreen
                            />
                          )}

                        {parsedVideo.type === 'html5' && parsedVideo.directUrl && (
                          <video
                            src={parsedVideo.directUrl}
                            poster={shopVideo?.posterImage}
                            controls
                            autoPlay={true}
                            loop={shopVideo?.loop}
                            muted={shopVideo?.muted}
                            playsInline
                            className="w-full h-full object-contain bg-black"
                          />
                        )}

                        {/* Top close floating button */}
                        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setIsPlayingDemo(false)}
                            className="p-2 rounded-full bg-black/70 hover:bg-black text-white text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1"
                            title="Close video preview"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Video Poster / Play Trigger */
                      <div
                        onClick={() => setIsPlayingDemo(true)}
                        className="w-full h-full cursor-pointer relative flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#ffa41b]/10 via-[#12161f] to-[#0b0d12] overflow-hidden"
                      >
                        {/* Custom poster image background if provided */}
                        {shopVideo?.posterImage && (
                          <img
                            src={shopVideo.posterImage}
                            alt="Video Poster"
                            className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 transition-opacity"
                          />
                        )}

                        {/* Ambient glow effect */}
                        <div className="absolute w-72 h-72 rounded-full bg-[#ffa41b]/15 blur-3xl pointer-events-none group-hover:bg-[#ffa41b]/25 transition-all" />

                        {/* Illustrator decorative accents */}
                        <div className="absolute top-4 left-5 flex items-center gap-2 text-xs font-mono text-[#9aa4b8]">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Interactive Video Demo</span>
                        </div>

                        <div className="relative z-10 space-y-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(255,164,27,0.5)] group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(255,164,27,0.7)] transition-all">
                            <Play size={32} className="ml-1 text-[#1a1204]" />
                          </div>

                          <div className="space-y-1.5 max-w-lg mx-auto">
                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                              {demoTitle}
                            </h3>
                            <p className="text-xs md:text-sm text-[#9aa4b8]">
                              {demoSubtitle}
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all">
                            <Play size={12} /> Click to Play Video ({parsedVideo.providerName || 'HD'})
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Interactive Coupon Generator Simulation */
                    <div className="w-full h-full p-4 md:p-6 flex flex-col justify-between bg-gradient-to-b from-[#12161f] to-[#0b0d12]">
                      <div className="flex items-center justify-between border-b border-[#232a38] pb-3 text-xs">
                        <div className="flex items-center gap-2 text-white font-mono font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#ffa41b] animate-pulse" />
                          <span>Adobe Illustrator · Live Serial Placer Engine</span>
                        </div>
                        <div className="text-[#9aa4b8] font-mono text-[11px]">
                          Speed: 200 coupons / min
                        </div>
                      </div>

                      {/* Interactive Sheet with Coupons */}
                      <div className="py-2 flex items-center justify-center flex-1">
                        <div className="w-full max-w-lg bg-white rounded-xl p-3.5 grid grid-cols-4 gap-2 shadow-2xl">
                          {Array.from({ length: cellsPerPage }).map((_, idx) => {
                            const isFilled = idx < mockCount;
                            const cellNum = pad(mockStart + idx);
                            return (
                              <div
                                key={idx}
                                className={`aspect-[2/1] rounded flex items-center justify-center font-mono font-bold text-xs md:text-sm transition-all duration-200 ${
                                  isFilled
                                    ? 'border-2 border-[#14161c] text-[#14161c] bg-[#fffdf7] scale-100 shadow-sm'
                                    : 'border-2 border-dashed border-[#b9bfcc] text-[#c4c9d4] bg-white'
                                }`}
                              >
                                {isFilled ? cellNum : '0000'}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Control Panel Footer */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#232a38] text-xs">
                        <div className="text-[#9aa4b8]">
                          Next serial: <b className="text-white font-mono">{pad(mockStart + mockCount)}</b> / {totalSerials}
                        </div>

                        <div className="text-[11px] text-[#9aa4b8] font-mono">
                          Auto-centering & page layout active
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Made for chips */}
          <div className="text-center space-y-4 pt-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#9aa4b8]">
              Engineered For
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[
                'Coupons',
                'Event tickets',
                'Raffle tickets',
                'Vouchers',
                'Gift cards',
                'Numbered labels',
                'Certificates',
                'Security prints',
              ].map((chip, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-full border border-[#232a38] bg-[#12161f] text-xs md:text-sm font-semibold text-white"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="scroll-mt-24 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="text-[#ffcf4a] font-bold text-xs uppercase tracking-widest">
              Pricing
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              One price. Yours for life.
            </h2>
            <p className="text-sm md:text-base text-[#9aa4b8]">
              Pay once per user and keep it forever. No subscription. Secure checkout with PayPal, and your download is ready immediately.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative bg-[#12161f] border-2 border-[#ffa41b]/60 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_rgba(255,164,27,0.12)] space-y-6">
              {/* Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                LIFETIME LICENSE
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Serial Placer</h3>
                <p className="text-xs text-[#9aa4b8] mt-1">
                  For designers, print shops and studios. One license per user.
                </p>
              </div>

              {/* Price display */}
              <div>
                <div className="text-5xl font-black text-white tracking-tight">
                  ${UNIT_PRICE.toFixed(2)}{' '}
                  <small className="text-sm text-[#9aa4b8] font-semibold tracking-normal">
                    per user
                  </small>
                </div>
                <div className="text-xs text-[#9aa4b8] mt-1 font-medium">
                  one-time payment · yours for life
                </div>
              </div>

              {/* Points list */}
              <ul className="space-y-2.5 text-xs md:text-sm text-[#cdd4e3] border-t border-b border-white/5 py-4">
                {[
                  'Lifetime license: pay once, no subscription',
                  '1 user, installs on up to 2 of your computers',
                  'Extension (.zxp) and script file (.jsx) included',
                  'Free updates included',
                  'Email support',
                ].map((point, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check size={16} className="text-[#37d67a] shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* Quantity selector */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#232a38] bg-white/[0.03]">
                <label className="text-xs md:text-sm font-bold text-white">
                  Number of users
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setUsersCount((c) => Math.max(1, c - 1))}
                    disabled={usersCount <= 1}
                    className="w-8 h-8 rounded-full border border-[#232a38] bg-[#171c27] text-white font-bold flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Decrease users"
                  >
                    −
                  </button>
                  <span className="font-mono font-bold text-base min-w-[2ch] text-center text-white">
                    {usersCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUsersCount((c) => Math.min(10, c + 1))}
                    disabled={usersCount >= 10}
                    className="w-8 h-8 rounded-full border border-[#232a38] bg-[#171c27] text-white font-bold flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Increase users"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-between items-baseline text-sm text-[#9aa4b8]">
                <span>Total ({usersCount} user{usersCount > 1 ? 's' : ''})</span>
                <b className="text-xl font-bold text-white">${totalPrice} USD</b>
              </div>

              {/* Primary PayPal Checkout Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handlePaypalClick}
                  className="w-full py-4 rounded-full font-bold text-base bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] shadow-[0_10px_30px_rgba(255,164,27,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Pay with PayPal · ${totalPrice}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[11px] text-center text-[#9aa4b8]">
                  🔒 Enter your PayPal Transaction ID after checkout to immediately unlock your download.
                </p>
              </div>

              {/* Already paid? Open PayPal Transaction ID verification directly */}
              <div className="pt-3 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setTxError('');
                    setShowCheckoutModal(true);
                  }}
                  className="w-full text-xs text-[#9aa4b8] hover:text-[#ffa41b] transition-colors font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={13} className="text-[#37d67a]" />
                  <span>Already completed payment? Enter PayPal Transaction ID</span>
                </button>
              </div>
            </div>

            {/* Guarantee */}
            <div className="flex items-center gap-4 bg-[#12161f] border border-[#232a38] rounded-2xl p-5 mt-6 text-xs md:text-sm">
              <div className="w-10 h-10 rounded-xl bg-[#ffa41b]/10 text-[#ffa41b] flex items-center justify-center shrink-0">
                <Shield size={22} />
              </div>
              <p className="text-[#9aa4b8]">
                <b className="text-white">14-day money-back guarantee.</b> If Serial Placer doesn't work for your files, email us within 14 days and we'll refund you.
              </p>
            </div>
          </div>
        </section>

        {/* CUSTOMER REVIEWS SECTION */}
        <CustomerReviews />

        {/* FAQ SECTION */}
        <section id="faq" className="max-w-2xl mx-auto space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <div className="text-[#ffcf4a] font-bold text-xs uppercase tracking-widest">
              FAQ
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">
              Questions before you buy
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#12161f] border border-[#232a38] rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 md:p-5 flex justify-between items-center text-left font-bold text-sm md:text-base text-white hover:text-[#ffa41b] transition-colors gap-4"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#ffa41b] text-xl shrink-0">
                      {isOpen ? '–' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-[#9aa4b8] leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-gradient-to-b from-[#ffa41b]/10 to-[#0f121a] border border-[#232a38] rounded-3xl p-8 md:p-14 text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Stop typing serial numbers. Start printing.
          </h2>
          <p className="text-base text-[#9aa4b8] max-w-xl mx-auto">
            Get Serial Placer today and number your next coupon or ticket job in minutes.
          </p>
          <div>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] shadow-xl hover:scale-105 transition-all"
            >
              Get Serial Placer · ${UNIT_PRICE}
            </a>
          </div>
          <p className="text-xs text-[#9aa4b8]">
            Questions? Email us at{' '}
            <a href="mailto:hello@nazrulstudio.uk" className="text-[#ffa41b] font-bold hover:underline">
              hello@nazrulstudio.uk
            </a>{' '}
            or chat via{' '}
            <a href="https://wa.me/971552178767" target="_blank" rel="noopener noreferrer" className="text-[#ffa41b] font-bold hover:underline">
              WhatsApp
            </a>
          </p>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#232a38] py-8 text-xs text-[#9aa4b8]">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <span
              onClick={() => {
                // Secret triple click trigger for owner
                const now = Date.now();
                if ((window as any).__lastAdminClick && now - (window as any).__lastAdminClick < 500) {
                  (window as any).__adminClickCount = ((window as any).__adminClickCount || 0) + 1;
                  if ((window as any).__adminClickCount >= 3) {
                    (window as any).__adminClickCount = 0;
                    if (onOpenAdmin) onOpenAdmin('shopVideo');
                  }
                } else {
                  (window as any).__adminClickCount = 1;
                }
                (window as any).__lastAdminClick = now;
              }}
              className="select-none cursor-default"
            >
              © {new Date().getFullYear()} Nazrul Studio. All rights reserved.
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Serial Placer is an independent product developed by Nazrul Studio and is not affiliated with or endorsed by Adobe. Adobe and Illustrator are registered trademarks of Adobe Inc.
          </div>
        </div>
      </footer>

      {/* PayPal Transaction ID Verification Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#131C31] border border-[#232a38] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-left relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#ffa41b]/15 border border-[#ffa41b]/30 text-[#ffa41b] flex items-center justify-center shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#ffa41b]">
                  Payment Verification Gate
                </div>
                <h3 className="text-xl font-bold text-white">Complete & Verify Payment</h3>
              </div>
            </div>

            <form onSubmit={handleVerifyCheckoutTx} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#0B1121] border border-white/10 text-xs text-slate-300 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amount Due ({usersCount} user{usersCount > 1 ? 's' : ''}):</span>
                  <span className="font-bold text-[#ffa41b]">${totalPrice} USD</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white block">
                  Enter PayPal Transaction ID
                </label>
                <p className="text-[11px] text-[#9aa4b8] leading-relaxed">
                  After completing checkout in the PayPal tab, paste your <b className="text-white">17-character PayPal Transaction ID</b> from your receipt below:
                </p>
                <input
                  type="text"
                  required
                  value={txIdInput}
                  onChange={(e) => {
                    setTxIdInput(e.target.value.toUpperCase());
                    setTxError('');
                  }}
                  placeholder="e.g. 8XL9283746192837K"
                  className="w-full px-4 py-3 rounded-xl bg-[#0B1121] border border-white/15 focus:border-[#ffa41b] text-sm font-mono text-white placeholder-slate-600 outline-none"
                />
              </div>

              {txError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <span>{txError}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isSubmittingTx}
                  className="w-full py-3.5 bg-gradient-to-r from-[#37d67a] to-emerald-500 text-[#0b0d12] font-black rounded-xl hover:scale-[1.01] shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSubmittingTx ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Verify Payment & Unlock Download</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.open(PAYPAL_PAYMENT_URL, '_blank', 'noopener,noreferrer')}
                  className="w-full py-2.5 text-xs text-[#9aa4b8] hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={13} /> Re-open PayPal checkout page (${totalPrice} USD)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
