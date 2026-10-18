import { useState } from 'react';
import {
  X,
  Globe,
  Download,
  Copy,
  Check,
  ExternalLink,
  FileCode,
  Layers,
} from 'lucide-react';
import { AppData } from '../types';
import {
  buildSitemapEntries,
  generateSitemapXml,
  downloadDynamicSitemapXml,
  SHOP_ITEMS,
} from '../utils/sitemapGenerator';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
}

export const SitemapModal = ({ isOpen, onClose, data }: SitemapModalProps) => {
  const [viewTab, setViewTab] = useState<'visual' | 'xml'>('visual');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://nazrulstudio.uk';

  const entries = buildSitemapEntries(data, origin);
  const rawXml = generateSitemapXml(data, origin);

  const handleCopyXml = () => {
    navigator.clipboard.writeText(rawXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0B1121] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#131C31] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Dynamic Sitemap.xml Generator & SEO Index
              </h3>
              <p className="text-xs text-slate-400">
                {entries.length} total indexed URLs · {data.portfolio.length} Portfolio Projects ·{' '}
                {data.showcase.length} Showcase Projects · {SHOP_ITEMS.length} Shop Product
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink size={14} /> Open /sitemap.xml
            </a>
            <button
              type="button"
              onClick={() => downloadDynamicSitemapXml(data)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6F61] to-[#ff8a75] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:opacity-95 transition-all"
            >
              <Download size={14} /> Download sitemap.xml
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close Sitemap Generator"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub-navigation bar */}
        <div className="px-6 py-3 bg-[#0e1526] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewTab('visual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewTab === 'visual'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              <Layers size={14} /> Indexed Routes ({entries.length})
            </button>
            <button
              type="button"
              onClick={() => setViewTab('xml')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewTab === 'xml'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              <FileCode size={14} /> Raw XML Output
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyXml}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" /> Copied XML!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy XML
              </>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {viewTab === 'visual' ? (
            <div className="space-y-2.5">
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#131C31] border border-white/5 hover:border-white/15 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">{entry.title || entry.loc}</span>
                      {entry.category && (
                        <span className="text-slate-400">· {entry.category}</span>
                      )}
                    </div>
                    <a
                      href={entry.loc}
                      onClick={() => onClose()}
                      className="font-mono text-[11px] text-teal-400 hover:underline block truncate"
                    >
                      {entry.loc}
                    </a>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-[11px] text-slate-400">
                    <span>Priority: {entry.priority}</span>
                    <span>·</span>
                    <span>{entry.changefreq}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="p-4 rounded-2xl bg-[#070b14] border border-white/10 text-xs font-mono text-teal-300 overflow-x-auto leading-relaxed select-all">
              {rawXml}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
