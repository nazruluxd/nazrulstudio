/**
 * Dynamic client-side SEO metadata manager for SPA views.
 * Updates document title, meta description, OpenGraph tags, Twitter tags, and canonical URL
 * when navigating between the Portfolio ('home'), Product Shop ('shop'), and Download Vault ('thank-you').
 */

export type SeoViewMode = 'home' | 'shop' | 'thank-you';

interface SeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
}

const SEO_CONFIGS: Record<SeoViewMode, SeoConfig> = {
  home: {
    title: 'Nazrul Studio – Packaging Design & Serial Placer for Illustrator',
    description:
      'Nazrul Studio – Structural Packaging Design, Brand Identity & Serial Placer v4 Adobe Illustrator Plugin for automated ticket, voucher, and print serial numbering.',
    canonicalPath: '/',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  },
  shop: {
    title: 'Serial Placer v4 for Adobe Illustrator – Ticket & Serial Numbering Plugin | Nazrul Studio',
    description:
      'Automate sequential serial numbers, raffle tickets, coupons, and custom CSV lists across Adobe Illustrator artboards in seconds. One-time $20 lifetime license.',
    canonicalPath: '/?view=shop',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  },
  'thank-you': {
    title: 'Verified License & Download Vault – Serial Placer v4 | Nazrul Studio',
    description:
      'Access your verified Serial Placer v4 Adobe Illustrator extension (.zxp), standalone script (.jsx), and user documentation.',
    canonicalPath: '/?view=thank-you',
    robots: 'noindex, nofollow',
  },
};

function setMetaTag(selector: string, attribute: string, value: string) {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute(attribute, value);
  }
}

export function applyDynamicSeo(view: SeoViewMode): void {
  if (typeof document === 'undefined') return;
  const cfg = SEO_CONFIGS[view] || SEO_CONFIGS.home;

  document.title = cfg.title;
  setMetaTag('meta[name="description"]', 'content', cfg.description);
  setMetaTag('meta[name="robots"]', 'content', cfg.robots);
  setMetaTag('meta[property="og:title"]', 'content', cfg.title);
  setMetaTag('meta[property="og:description"]', 'content', cfg.description);
  setMetaTag('meta[name="twitter:title"]', 'content', cfg.title);
  setMetaTag('meta[name="twitter:description"]', 'content', cfg.description);

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://nazrulstudio.uk';
  const canonicalUrl = `${origin}${cfg.canonicalPath}`;

  setMetaTag('link[rel="canonical"]', 'href', canonicalUrl);
  setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
}
