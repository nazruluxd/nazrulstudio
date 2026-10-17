import { useState } from 'react';
import { Check, Download, FileText, ArrowLeft, BookOpen, Mail, Phone, ExternalLink } from 'lucide-react';
import {
  downloadJsxScript,
  downloadZxpExtension,
  downloadUserGuide,
  downloadSampleSerials,
} from '../../utils/productDownloads';

interface ThankYouPageProps {
  orderId?: string;
  userCount?: number;
  onBackToShop: () => void;
  onBackToPortfolio: () => void;
}

export const ThankYouPage = ({
  orderId = 'PAYPAL-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
  userCount = 1,
  onBackToShop,
  onBackToPortfolio,
}: ThankYouPageProps) => {
  const [downloadedZxp, setDownloadedZxp] = useState(false);
  const [downloadedJsx, setDownloadedJsx] = useState(false);
  const [downloadedGuide, setDownloadedGuide] = useState(false);
  const [downloadedSamples, setDownloadedSamples] = useState(false);

  const handleDownloadZxp = () => {
    downloadZxpExtension();
    setDownloadedZxp(true);
  };

  const handleDownloadJsx = () => {
    downloadJsxScript();
    setDownloadedJsx(true);
  };

  const handleDownloadGuide = () => {
    downloadUserGuide();
    setDownloadedGuide(true);
  };

  const handleDownloadSamples = () => {
    downloadSampleSerials();
    setDownloadedSamples(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] text-[#e9edf5] font-sans selection:bg-[#ffa41b] selection:text-[#0b0d12] relative pb-20">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[420px] bg-gradient-to-b from-[#ffa41b]/15 to-transparent blur-[120px] pointer-events-none z-0" />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0b0d12]/80 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToShop}
              className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-[#9aa4b8] hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Back to Shop
            </button>
            <span className="text-white/20">|</span>
            <button
              onClick={onBackToPortfolio}
              className="text-xs md:text-sm font-semibold text-[#ffa41b] hover:text-[#ffcf4a] transition-colors"
            >
              Nazrul Studio
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] font-black text-xs flex items-center justify-center">
              01
            </span>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              Serial Placer
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-16 space-y-8">
        {/* Success Header */}
        <div className="text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-[#37d67a]/15 border border-[#37d67a]/40 text-[#37d67a] flex items-center justify-center text-3xl font-black mb-6 mx-auto sm:mx-0 shadow-[0_0_30px_rgba(55,214,122,0.2)]">
            <Check size={32} />
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Thank you for your purchase!
          </h1>
          <p className="text-[#9aa4b8] text-base md:text-lg mt-3">
            Your PayPal payment was received. Your downloads are ready below, and PayPal has emailed you a transaction receipt.
          </p>

          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 border border-dashed border-[#232a38] rounded-xl text-xs md:text-sm text-[#9aa4b8] bg-[#12161f]/50">
            <span>Order Reference:</span>
            <b className="font-mono text-white tracking-wider">{orderId}</b>
            <span className="text-white/20">·</span>
            <span>Licenses:</span>
            <b className="text-[#ffa41b]">{userCount} User{userCount > 1 ? 's' : ''} Lifetime License</b>
          </div>
        </div>

        {/* Card 1: Downloads */}
        <div className="bg-[#12161f] border border-[#232a38] rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Download className="text-[#ffa41b]" size={20} /> 1. Download Product Files
            </h2>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20">
              Ready for Download
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={handleDownloadZxp}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                downloadedZxp
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] font-bold shadow-lg shadow-[#ffa41b]/20 hover:scale-[1.02]'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <Download size={20} />
                <div>
                  <div className="font-bold text-sm">Illustrator Extension</div>
                  <div className="text-[11px] opacity-80">SerialPlacer.zxp</div>
                </div>
              </div>
              {downloadedZxp && <Check size={18} className="text-emerald-400" />}
            </button>

            <button
              onClick={handleDownloadJsx}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                downloadedJsx
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-[#232a38] text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <FileText size={20} className="text-[#ffa41b]" />
                <div>
                  <div className="font-bold text-sm">Standalone Script</div>
                  <div className="text-[11px] text-[#9aa4b8]">Serial_Placer_v4.jsx</div>
                </div>
              </div>
              {downloadedJsx ? (
                <Check size={18} className="text-emerald-400" />
              ) : (
                <Download size={16} className="text-[#9aa4b8]" />
              )}
            </button>

            <button
              onClick={handleDownloadGuide}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                downloadedGuide
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-[#232a38] text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <BookOpen size={20} className="text-[#5b9bff]" />
                <div>
                  <div className="font-bold text-sm">User Guide & Setup</div>
                  <div className="text-[11px] text-[#9aa4b8]">Documentation (.txt)</div>
                </div>
              </div>
              {downloadedGuide ? (
                <Check size={18} className="text-emerald-400" />
              ) : (
                <Download size={16} className="text-[#9aa4b8]" />
              )}
            </button>

            <button
              onClick={handleDownloadSamples}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                downloadedSamples
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-[#232a38] text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <FileText size={20} className="text-[#37d67a]" />
                <div>
                  <div className="font-bold text-sm">Sample Serials List</div>
                  <div className="text-[11px] text-[#9aa4b8]">200 Test Numbers (.txt)</div>
                </div>
              </div>
              {downloadedSamples ? (
                <Check size={18} className="text-emerald-400" />
              ) : (
                <Download size={16} className="text-[#9aa4b8]" />
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#5b9bff]/10 border border-[#5b9bff]/25 text-[#cfe0ff] text-xs md:text-sm">
            💡 <b>Pro tip:</b> Save your order reference (<span className="font-mono text-white">{orderId}</span>) and files. If you ever switch computers or need a fresh download, email us with your order reference and we will resend everything immediately.
          </div>
        </div>

        {/* Card 2: Install the extension */}
        <div className="bg-[#12161f] border border-[#232a38] rounded-2xl p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-white">2. How to Install the Extension</h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-sm md:text-base text-[#cdd4e3]">
            <li>
              Install a free ZXP installer such as{' '}
              <a
                href="https://zxpinstaller.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ffa41b] hover:underline font-semibold inline-flex items-center gap-1"
              >
                ZXPInstaller <ExternalLink size={12} />
              </a>{' '}
              or the aescripts + aeplugins manager.
            </li>
            <li>
              Drag <b>SerialPlacer.zxp</b> into the installer. If it shows a notice about the certificate, that is normal: the extension is signed with our own developer certificate.
            </li>
            <li>
              <b>Quit and restart Adobe Illustrator.</b>
            </li>
            <li>
              Open the panel from:{' '}
              <span className="font-mono bg-black/40 text-[#ffa41b] px-2 py-0.5 rounded border border-white/5">
                Window → Extensions (Legacy) → Serial Placer
              </span>
            </li>
          </ol>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs md:text-sm text-[#9aa4b8]">
            <b>Prefer not to install extensions?</b> You can use the standalone script instead! In Adobe Illustrator, simply choose{' '}
            <span className="font-mono text-white">File → Scripts → Other Script…</span> and choose <span className="font-mono text-[#ffa41b]">Serial_Placer_v4.jsx</span>. It runs directly with zero installation needed.
          </div>
        </div>

        {/* Card 3: Quick Start */}
        <div className="bg-[#12161f] border border-[#232a38] rounded-2xl p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-white">3. Your First Job in One Minute</h2>
          <ol className="list-decimal pl-5 space-y-2.5 text-sm md:text-base text-[#cdd4e3]">
            <li>
              Press <b>Load TXT file…</b> and choose your serial numbers list (one number per line, or use our provided Sample_Serials.txt).
            </li>
            <li>
              Select your serial placeholder boxes or text boxes on the artboard with Illustrator's Selection Tool (V).
            </li>
            <li>
              Press <b>Fill All Selected Boxes</b>. Or press <b>Build pages + fill all</b> to automatically duplicate artboards and fill the entire sequence in order.
            </li>
          </ol>

          <p className="text-xs text-[#9aa4b8]">
            Tip: Try it on a duplicate copy of your artwork the first time to get familiar with the automated layout.
          </p>
        </div>

        {/* Customer Review Invitation */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#ffa41b]/15 via-[#ffcf4a]/5 to-[#12161f] border border-[#ffa41b]/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <span>⭐</span> Loved Your Experience with Serial Placer?
            </h3>
            <p className="text-xs md:text-sm text-[#9aa4b8]">
              Your feedback helps other print shops and designers make confident decisions. Leave a rating and review on the shop page!
            </p>
          </div>
          <button
            onClick={() => {
              onBackToShop();
              setTimeout(() => {
                const el = document.getElementById('reviews');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#ffa41b] to-[#ffcf4a] text-[#1a1204] font-bold text-xs md:text-sm rounded-full shrink-0 shadow-lg shadow-[#ffa41b]/20 hover:scale-105 transition-all"
          >
            Leave a Customer Review
          </button>
        </div>

        {/* Help footer */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs md:text-sm text-[#9aa4b8]">
          <div>
            Need help or custom printing automation?
            <br />
            Email <a href="mailto:hello@nazrulstudio.uk" className="text-[#ffa41b] font-semibold hover:underline">hello@nazrulstudio.uk</a> or message us on WhatsApp with your order reference.
          </div>
          <div className="flex gap-2">
            <a
              href={`mailto:hello@nazrulstudio.uk?subject=${encodeURIComponent('Serial Placer Support – ' + orderId)}`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Mail size={14} /> Email Support
            </a>
            <a
              href="https://wa.me/971552178767"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};
