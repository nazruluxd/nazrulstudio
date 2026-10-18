import { useEffect } from 'react';
import { AppData, PortfolioItem, ShowcaseItem } from '../types';
import { SHOP_ITEMS, ShopProductItem, slugify } from './sitemapGenerator';

export interface DynamicSeoTarget {
  view: 'home' | 'shop' | 'thank-you';
  activeSection?: string;
  activePortfolioItem?: PortfolioItem | null;
  activeShowcaseItem?: ShowcaseItem | null;
  activeShopProduct?: ShopProductItem | null;
  data: AppData;
}

interface ResolvedSeoMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogType: 'website' | 'article' | 'product';
  ogImage: string;
  priceAmount?: string;
  priceCurrency?: string;
  itemJsonLd?: Record<string, any> | null;
}

function setOrCreateMeta(
  attrName: 'name' | 'property',
  attrValue: string,
  content: string
) {
  let el = document.head.querySelector(
    `meta[${attrName}="${attrValue}"]`
  ) as HTMLMetaElement | null;

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOrCreateCanonical(url: string) {
  let link = document.head.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Resolves the most specific SEO metadata based on the currently viewed
 * portfolio project, showcase project, shop product, or active section.
 */
export function resolveSeoMetadata(target: DynamicSeoTarget): ResolvedSeoMetadata {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://nazrulstudio.uk';

  const defaultImage = target.data.global?.heroImage || '';

  // 1. Currently viewed Shop Product / Shop View
  if (target.view === 'shop' || target.activeShopProduct) {
    const product = target.activeShopProduct || SHOP_ITEMS[0];
    const canonicalUrl = `${origin}${product.url}`;
    const title = `${product.name} | Nazrul Studio Shop`;
    const description = `${product.description} One-time payment of $${product.price.toFixed(
      2
    )} ${product.currency} for a lifetime license.`;

    return {
      title,
      description,
      keywords:
        'Serial Placer, Adobe Illustrator extension, coupon numbering script, ticket numbering Illustrator, ZXP, JSX automation, Nazrul Studio',
      canonicalUrl,
      ogType: 'product',
      ogImage: target.data.shopVideo?.posterImage || defaultImage,
      priceAmount: product.price.toFixed(2),
      priceCurrency: product.currency,
      itemJsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        category: product.category,
        brand: {
          '@type': 'Brand',
          name: 'Nazrul Studio',
        },
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: product.currency,
          price: product.price.toFixed(2),
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }

  // 2. Thank You / Verified Download Page
  if (target.view === 'thank-you') {
    const product = SHOP_ITEMS[0];
    return {
      title: `Download ${product.name} | Nazrul Studio`,
      description: `Verified license download page for ${product.name}. Download your .zxp extension, standalone .jsx script, and user guide.`,
      keywords: 'Serial Placer download, Adobe Illustrator extension download, Nazrul Studio',
      canonicalUrl: `${origin}/#thank-you`,
      ogType: 'website',
      ogImage: defaultImage,
      itemJsonLd: null,
    };
  }

  // 3. Specific Portfolio Item currently viewed
  if (target.activePortfolioItem) {
    const item = target.activePortfolioItem;
    const slug = slugify(`${item.id}-${item.title}`);
    const canonicalUrl = `${origin}/?portfolio=${slug}#portfolio-${item.id}`;
    const title = `${item.title} – ${item.category} | Nazrul Studio Portfolio`;
    const description = `${item.title} (${item.category}): ${item.desc} Designed by Nazrul Studio – Precision in Branding, Packaging & Production.`;
    const ogImage =
      item.image && !item.image.startsWith('data:') ? item.image : defaultImage;

    return {
      title,
      description,
      keywords: `${item.title}, ${item.category}, packaging design, branding portfolio, Nazrul Studio`,
      canonicalUrl,
      ogType: 'article',
      ogImage,
      itemJsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: item.title,
        genre: item.category,
        description: item.desc,
        image: ogImage,
        url: canonicalUrl,
        creator: {
          '@type': 'Organization',
          name: 'Nazrul Studio',
        },
      },
    };
  }

  // 4. Specific Showcase Project currently viewed
  if (target.activeShowcaseItem) {
    const item = target.activeShowcaseItem;
    const slug = slugify(`${item.id}-${item.title}`);
    const canonicalUrl = `${origin}/?project=${slug}#project-${item.id}`;
    const title = `${item.title} – ${item.category} | Nazrul Studio`;
    const tagList = item.tags?.length ? ` (${item.tags.join(', ')})` : '';
    const description = `${item.title} – ${item.category}${tagList}: ${item.desc} Explore specialized design and production expertise at Nazrul Studio.`;
    const ogImage =
      item.image && !item.image.startsWith('data:') ? item.image : defaultImage;

    return {
      title,
      description,
      keywords: `${item.title}, ${item.category}, ${(item.tags || []).join(', ')}, Nazrul Studio`,
      canonicalUrl,
      ogType: 'article',
      ogImage,
      itemJsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: item.title,
        genre: item.category,
        description: item.desc,
        keywords: (item.tags || []).join(', '),
        image: ogImage,
        url: canonicalUrl,
        creator: {
          '@type': 'Organization',
          name: 'Nazrul Studio',
        },
      },
    };
  }

  // 5. Section-specific SEO metadata when browsing the main portfolio
  const sectionMeta: Record<string, { title: string; description: string }> = {
    about: {
      title: 'About Nazrul | Branding, Packaging & Production Designer',
      description:
        'Learn how Nazrul Studio bridges multidisciplinary visual identity, structural packaging design, and high-precision print production in Dubai, UAE.',
    },
    skills: {
      title: 'Design & Production Capabilities | Nazrul Studio',
      description:
        'Core expertise in product design for the printing industry, structural packaging, 3D visualization, conversion-focused web design, and UI/UX.',
    },
    approach: {
      title: '5-Step Design & Production Process | Nazrul Studio',
      description:
        'Explore our structured workflow from Discovery and Strategy to High-Fidelity Design, Refinement, and Print-Ready Delivery.',
    },
    projects: {
      title: 'Featured Project Showcase | Nazrul Studio',
      description:
        'Explore specialized expertise across Brand Identity, Structural Packaging Design, Conversion-Focused Websites, and Digital Product Interfaces.',
    },
    portfolio: {
      title: 'Selected Works & Packaging Portfolio | Nazrul Studio',
      description:
        'Browse 15+ selected works across food packaging, luxury rigid boxes, cosmetics jars, beverage cans, labels, and brand identity systems.',
    },
    resume: {
      title: 'Experience & Academic Background | Nazrul Studio',
      description:
        'Over a decade of professional leadership in product design, visual identity systems, and print production engineering.',
    },
    contact: {
      title: 'Contact Nazrul Studio | Start Your Design Project',
      description: `Get in touch with Nazrul Studio in ${
        target.data.global?.location || 'Dubai, UAE'
      } (${target.data.global?.contactEmail || 'hello@nazrulstudio.uk'}) for custom packaging, branding, and print automation.`,
    },
  };

  if (target.activeSection && sectionMeta[target.activeSection]) {
    const sec = sectionMeta[target.activeSection];
    return {
      title: sec.title,
      description: sec.description,
      keywords:
        'Nazrul Studio, packaging designer Dubai, branding designer, print production, UI/UX designer',
      canonicalUrl: `${origin}/#${target.activeSection}`,
      ogType: 'website',
      ogImage: defaultImage,
      itemJsonLd: null,
    };
  }

  // Default Home metadata
  return {
    title: 'Nazrul Studio | Precision in Design & Production',
    description:
      target.data.global?.heroDesc ||
      'Portfolio of Nazrul – Precision in Design & Production, specializing in structural packaging, branding, and digital products.',
    keywords:
      'Nazrul Studio, branding, structural packaging design, print production, UI/UX design, Serial Placer, Dubai designer',
    canonicalUrl: `${origin}/`,
    ogType: 'website',
    ogImage: defaultImage,
    itemJsonLd: null,
  };
}

/**
 * Custom React Hook that dynamically updates page-specific `<title>`, `<meta name="description">`,
 * OpenGraph (`og:*`), Twitter Card (`twitter:*`), canonical link, and active item JSON-LD
 * based on the currently viewed project, product, or section.
 */
export function useDynamicSeo(target: DynamicSeoTarget) {
  useEffect(() => {
    const meta = resolveSeoMetadata(target);

    // Document Title
    document.title = meta.title;

    // Standard SEO Meta Tags
    setOrCreateMeta('name', 'description', meta.description);
    setOrCreateMeta('name', 'keywords', meta.keywords);

    // Canonical Link
    setOrCreateCanonical(meta.canonicalUrl);

    // OpenGraph Meta Tags
    setOrCreateMeta('property', 'og:title', meta.title);
    setOrCreateMeta('property', 'og:description', meta.description);
    setOrCreateMeta('property', 'og:type', meta.ogType);
    setOrCreateMeta('property', 'og:url', meta.canonicalUrl);
    setOrCreateMeta('property', 'og:site_name', 'Nazrul Studio');
    if (meta.ogImage) {
      setOrCreateMeta('property', 'og:image', meta.ogImage);
    }

    // Product-specific OpenGraph tags when viewing a shop product
    if (meta.priceAmount && meta.priceCurrency) {
      setOrCreateMeta('property', 'product:price:amount', meta.priceAmount);
      setOrCreateMeta('property', 'product:price:currency', meta.priceCurrency);
    }

    // Twitter Card Meta Tags
    setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    setOrCreateMeta('name', 'twitter:title', meta.title);
    setOrCreateMeta('name', 'twitter:description', meta.description);
    if (meta.ogImage) {
      setOrCreateMeta('name', 'twitter:image', meta.ogImage);
    }

    // Dynamic Item-Specific Schema.org JSON-LD
    let itemScript = document.getElementById(
      'dynamic-item-seo-jsonld'
    ) as HTMLScriptElement | null;

    if (meta.itemJsonLd) {
      if (!itemScript) {
        itemScript = document.createElement('script');
        itemScript.id = 'dynamic-item-seo-jsonld';
        itemScript.type = 'application/ld+json';
        document.head.appendChild(itemScript);
      }
      itemScript.textContent = JSON.stringify(meta.itemJsonLd);
    } else if (itemScript) {
      itemScript.remove();
    }
  }, [
    target.view,
    target.activeSection,
    target.activePortfolioItem,
    target.activeShowcaseItem,
    target.activeShopProduct,
    target.data,
  ]);
}
