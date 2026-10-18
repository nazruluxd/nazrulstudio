import { useState, useEffect, FormEvent } from 'react';
import {
  Check,
  Download,
  FileText,
  ArrowLeft,
  BookOpen,
  Mail,
  Phone,
  ExternalLink,
  Lock,
  ShieldAlert,
  Loader2,
  ShieldCheck,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import {
  downloadJsxScript,
  downloadZxpExtension,
  downloadUserGuide,
  downloadSampleSerials,
} from '../../utils/productDownloads';
import {
  getVerifiedSessionToken,
  verifyExistingLicenseOrOrder,
} from '../../utils/licenseSecurity';
import { auth } from '../../firebase';
import { AUTHORIZED_ADMIN_EMAIL } from '../AdminModal';

interface ThankYouPageProps {
  orderId?: string;
  userCount?: number;
  onBackToShop: () => void;
  onBackToPortfolio: () => void;
}

export const ThankYouPage = ({
  orderId,
  userCount = 1,
  onBackToShop,
  onBackToPortfolio,
}: ThankYouPageProps) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verifiedTxId, setVerifiedTxId] = useState('');
  const [verifiedUsers, setVerifiedUsers] = useState(userCount);
  const [copiedKey, setCopiedKey] = useState(false);

  // PayPal Transaction ID gatekeeper state when user lands here directly
  const [gateCode, setGateCode] = useState(orderId || '');
  const [gateError, setGateError] = useState('');
  const [isCheckingGate, setIsCheckingGate] = useState(false);

  const [downloadedZxp, setDownloadedZxp] = useState(false);
  const [downloadedJsx, setDownloadedJsx] = useState(false);
  const [downloadedGuide, setDownloadedGuide] = useState(false);
  const [downloadedSamples, setDownloadedSamples] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let active = true;

    const verifyAccess = async () => {
      setIsVerifying(true);

      // 1. Check if signed in as Authorized Admin (nazrulcxd@gmail.com)
      if (
        auth.currentUser?.email?.toLowerCase() ===
        AUTHORIZED_ADMIN_EMAIL.toLowerCase()
      ) {
        if (active) {
          setIsAuthorized(true);
          setVerifiedTxId('ADMIN-VERIFIED');
          setVerifiedUsers(userCount);
          setIsVerifying(false);
        }
        return;
      }

      // 2. Check active session token or PayPal Transaction ID
      const session = getVerifiedSessionToken();
      const codeToCheck = orderId || session?.orderId || session?.licenseKey || '';

      if (!codeToCheck) {
        if (active) {
          setIsAuthorized(false);
          setIsVerifying(false);
        }
        return;
      }

      const res = await verifyExistingLicenseOrOrder(codeToCheck);
      if (active) {
        if (res.verified) {
          setIsAuthorized(true);
          setVerifiedTxId(res.orderId || codeToCheck);
          setVerifiedUsers(res.users || userCount);
        } else {
          setIsAuthorized(false);
        }
        setIsVerifying(false);
      }
    };

    verifyAccess();
    return () => {
      active = false;
    };
  }, [orderId, userCount]);

  const handleGateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGateError('');
    setIsCheckingGate(true);
    try {
      const res = await verifyExistingLicenseOrOrder(gateCode);
      if (!res.verified) {
        setGateError(
          res.error ||
            'Verification Failed: Please enter a valid 17-character PayPal Transaction ID.'
        );
        return;
      }
      setIsAuthorized(true);
      setVerifiedTxId(res.orderId || gateCode);
      setVerifiedUsers(res.users || 1);
    } finally {
      setIsCheckingGate(false);
    }
  };

  const handleDownloadZxp = async () => {
    setDownloadError('');
    const ok = await downloadZxpExtension();
    if (ok) {
      setDownloadedZxp(true);
    } else {
      setDownloadError('Download blocked: Please verify your PayPal Transaction ID first.');
    }
  };

  const handleDownloadJsx = async () => {
    setDownloadError('');
    const ok = await downloadJsxScript();
    if (ok) {
      setDownloadedJsx(true);
    } else {
      setDownloadError('Download blocked: Please verify your PayPal Transaction ID first.');
    }
  };

  const handleDownloadGuide = async () => {
    setDownloadError('');
    const ok = await downloadUserGuide();
    if (ok) {
      setDownloadedGuide(true);
    } else {
      setDownloadError('Download blocked: Please verify your PayPal Transaction ID first.');
    }
  };

  const handleDownloadSamples = async () => {
    setDownloadError('');
    const ok = await downloadSampleSerials();
    if (ok) {
      setDownloadedSamples(true);
    } else {
      setDownloadError('Download blocked: Please verify your PayPal Transaction ID first.');
    }
  };

  const handleCopyKey = () => {
    if (!verifiedTxId) return;
    navigator.clipboard.writeText(verifiedTxId);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
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
        {isVerifying ? (
          <div className="bg-[#12161f] border border-[#232a38] rounded-3xl p-12 text-center space-y-4">
            <Loader2 size={36} className="animate-spin text-[#ffa41b] mx-auto" />
            <h2 className="text-xl font-bold text-white">
              Verifying PayPal Transaction...
            </h2>
            <p className="text-sm text-[#9aa4b8]">
              Confirming your PayPal Transaction ID and unlocking your download files.
            </p>
          </div>
        ) : !isAuthorized ? (
          /* PAYPAL TRANSACTION ID VERIFICATION GATE */
          <div className="bg-[#131C31] border border-[#232a38] rounded-3xl p-6 md:p-10 shadow-2xl space-y-6 max-w-lg mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffa41b]/15 border border-[#ffa41b]/30 text-[#ffa41b] flex items-center justify-center shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#ffa41b]">
                  Payment Verification Gate
                </div>
                <h1 className="text-xl md:text-2xl font-black text-white">
                  Complete & Verify Payment
                </h1>
              </div>
            </div>

            <form onSubmit={handleGateSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white block">
                  Enter PayPal Transaction ID
                </label>
                <p className="text-xs text-[#9aa4b8] leading-relaxed">
                  After completing checkout in PayPal, paste your <b className="text-white">17-character PayPal Transaction ID</b> from your receipt below:
                </p>
                <input
                  type="text"
                  required
                  value={gateCode}
                  onChange={(e) => {
                    setGateCode(e.target.value.toUpperCase());
                    setGateError('');
                  }}
                  placeholder="e.g. 8XL9283746192837K"
                  className="w-full px-4 py-3 rounded-xl bg-[#0B1121] border border-white/15 focus:border-[#ffa41b] text-sm font-mono text-white placeholder-slate-600 outline-none"
                />
              </div>

              {gateError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                  <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <span>{gateError}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isCheckingGate}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#37d67a] to-emerald-500 text-[#0b0d12] font-black text-sm hover:scale-[1.01] shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCheckingGate ? (
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
                  onClick={onBackToShop}
                  className="w-full py-2.5 rounded-xl text-xs text-[#9aa4b8] hover:text-white transition-colors"
                >
                  Return to Pricing & Checkout
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHORIZED & VERIFIED DOWNLOAD VAULT */
          <>
            {/* Success Header */}
            <div className="text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-[#37d67a]/15 border border-[#37d67a]/40 text-[#37d67a] flex items-center justify-center text-3xl font-black mb-6 mx-auto sm:mx-0 shadow-[0_0_30px_rgba(55,214,122,0.2)]">
                <ShieldCheck size={32} />
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
                Payment Verified — Downloads Unlocked!
              </h1>
              <p className="text-[#9aa4b8] text-base md:text-lg mt-3">
                Your PayPal Transaction ID has been verified. Your licensed files are ready for immediate download below.
              </p>

              <div className="mt-4 p-4 border border-[#37d67a]/30 rounded-2xl bg-[#12161f] flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 text-xs md:text-sm">
                  <div className="text-[#9aa4b8]">
                    License: <b className="text-[#ffa41b]">{verifiedUsers} User{verifiedUsers > 1 ? 's' : ''} Lifetime License</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#9aa4b8]">PayPal Transaction ID:</span>
                    <b className="font-mono text-[#37d67a] tracking-wider bg-[#37d67a]/10 px-2.5 py-0.5 rounded-lg border border-[#37d67a]/30">
                      {verifiedTxId}
                    </b>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey ? (
                    <>
                      <Check size={14} className="text-[#37d67a]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {downloadError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-400 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            {/* Card 1: Downloads */}
            <div className="bg-[#12161f] border border-[#232a38] rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Download className="text-[#ffa41b]" size={20} /> 1. Download Licensed Product Files
                </h2>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                  Verified & Unlocked
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
                💡 <b>Pro tip:</b> Save your PayPal Transaction ID (<span className="font-mono text-white">{verifiedTxId}</span>) and downloaded files. You can re-enter this PayPal Transaction ID anytime on the Shop page to download your files again.
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
                Email <a href="mailto:hello@nazrulstudio.uk" className="text-[#ffa41b] font-semibold hover:underline">hello@nazrulstudio.uk</a> or message us on WhatsApp with your PayPal Transaction ID.
              </div>
              <div className="flex gap-2">
                <a
                  href={`mailto:hello@nazrulstudio.uk?subject=${encodeURIComponent('Serial Placer Support – ' + verifiedTxId)}`}
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
          </>
        )}
      </main>
    </div>
  );
};
