import { AppData, PortfolioItem, ShowcaseItem } from '../types';
import { initialData } from '../data/initialData';

export interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  title?: string;
  category?: string;
  image?: {
    loc: string;
    title: string;
    caption: string;
  };
}

export interface ShopProductItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  url: string;
}

export const SHOP_ITEMS: ShopProductItem[] = [
  {
    id: 'serial-placer',
    slug: 'serial-placer-illustrator-extension',
    name: 'Serial Placer for Adobe Illustrator (.zxp + .jsx)',
    category: 'Adobe Illustrator Extension & Print Automation Script',
    price: 20.0,
    currency: 'USD',
    description:
      'Automatically number coupons, tickets, vouchers, and labels in Adobe Illustrator. Includes .zxp extension panel and standalone .jsx script with lifetime license.',
    url: '/?view=shop&product=serial-placer',
  },
];

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates structured Sitemap URL entries dynamically from portfolio projects,
 * project showcase items, and shop products.
 */
export function buildSitemapEntries(
  data: Partial<AppData> = initialData,
  baseUrl: string = 'https://nazrulstudio.uk'
): SitemapUrlEntry[] {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  const showcaseItems: ShowcaseItem[] = data.showcase?.length
    ? data.showcase
    : initialData.showcase;
  const portfolioItems: PortfolioItem[] = data.portfolio?.length
    ? data.portfolio
    : initialData.portfolio;

  const entries: SitemapUrlEntry[] = [
    // Core Portfolio & Studio Pages
    {
      loc: `${cleanBase}/`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '1.0',
      title: 'Nazrul Studio | Branding, Packaging & Production Designer',
      category: 'Main Page',
    },
    {
      loc: `${cleanBase}/#about`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.8',
      title: 'About Nazrul Studio',
      category: 'Studio Section',
    },
    {
      loc: `${cleanBase}/#skills`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.8',
      title: 'Core Competencies & Design Skills',
      category: 'Studio Section',
    },
    {
      loc: `${cleanBase}/#projects`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.9',
      title: 'Featured Project Showcase',
      category: 'Showcase Section',
    },
    {
      loc: `${cleanBase}/#portfolio`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.9',
      title: 'Selected Works & Packaging Portfolio',
      category: 'Portfolio Section',
    },
    {
      loc: `${cleanBase}/#resume`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7',
      title: 'Experience & Education',
      category: 'Studio Section',
    },
    {
      loc: `${cleanBase}/#contact`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.8',
      title: 'Contact Nazrul Studio',
      category: 'Studio Section',
    },

    // Shop Landing & Product Items
    {
      loc: `${cleanBase}/?view=shop`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.95',
      title: 'Nazrul Studio Shop – Print & Illustrator Automation Tools',
      category: 'Shop',
    },
  ];

  // Dynamically add all Shop Items
  for (const product of SHOP_ITEMS) {
    entries.push({
      loc: `${cleanBase}${product.url}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.95',
      title: product.name,
      category: `Shop Item · ${product.category}`,
    });
  }

  // Dynamically add all Showcase Projects
  for (const item of showcaseItems) {
    const slug = slugify(`${item.id}-${item.title}`);
    const isExternalImage =
      item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'));

    entries.push({
      loc: `${cleanBase}/?project=${slug}#project-${item.id}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.85',
      title: `${item.title} – ${item.category}`,
      category: `Showcase Project · ${item.category}`,
      image: isExternalImage
        ? {
            loc: item.image,
            title: `${item.title} | ${item.category} – Nazrul Studio`,
            caption: item.desc,
          }
        : undefined,
    });
  }

  // Dynamically add all Portfolio Projects
  for (const item of portfolioItems) {
    const slug = slugify(`${item.id}-${item.title}`);
    const isExternalImage =
      item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'));

    entries.push({
      loc: `${cleanBase}/?portfolio=${slug}#portfolio-${item.id}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.80',
      title: `${item.title} (${item.category})`,
      category: `Portfolio Project · ${item.category}`,
      image: isExternalImage
        ? {
            loc: item.image,
            title: `${item.title} – ${item.category} | Nazrul Studio`,
            caption: item.desc,
          }
        : undefined,
    });
  }

  return entries;
}

/**
 * Generates a complete, Google-compliant XML Sitemap string (with Google Image Sitemap extension)
 */
export function generateSitemapXml(
  data: Partial<AppData> = initialData,
  baseUrl: string = 'https://nazrulstudio.uk'
): string {
  const entries = buildSitemapEntries(data, baseUrl);

  const urlBlocks = entries
    .map((entry) => {
      const imageBlock = entry.image
        ? `\n    <image:image>\n      <image:loc>${escapeXml(entry.image.loc)}</image:loc>\n      <image:title>${escapeXml(entry.image.title)}</image:title>\n      <image:caption>${escapeXml(entry.image.caption)}</image:caption>\n    </image:image>`
        : '';

      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>${imageBlock}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urlBlocks}
</urlset>
`;
}

/**
 * Generates robots.txt pointing search engine crawlers to sitemap.xml
 */
export function generateRobotsTxt(baseUrl: string = 'https://nazrulstudio.uk'): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `User-agent: *
Allow: /

Sitemap: ${cleanBase}/sitemap.xml
`;
}

/**
 * Generates Schema.org JSON-LD structured data for Google Rich Results
 * (Portfolio ItemList + Shop SoftwareApplication / Product)
 */
export function generateStructuredDataJsonLd(
  data: Partial<AppData> = initialData,
  baseUrl: string = 'https://nazrulstudio.uk'
): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const showcaseItems = data.showcase?.length ? data.showcase : initialData.showcase;
  const portfolioItems = data.portfolio?.length ? data.portfolio : initialData.portfolio;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': `${cleanBase}/#organization`,
        name: 'Nazrul Studio',
        url: cleanBase,
        email: data.global?.contactEmail || initialData.global.contactEmail,
        telephone: data.global?.contactPhone || initialData.global.contactPhone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.global?.location || 'Dubai, UAE',
        },
        description: data.global?.heroDesc || initialData.global.heroDesc,
      },
      ...SHOP_ITEMS.map((shopItem) => ({
        '@type': 'SoftwareApplication',
        name: shopItem.name,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'macOS, Windows (Adobe Illustrator)',
        description: shopItem.description,
        url: `${cleanBase}${shopItem.url}`,
        offers: {
          '@type': 'Offer',
          price: shopItem.price.toFixed(2),
          priceCurrency: shopItem.currency,
          availability: 'https://schema.org/InStock',
        },
      })),
      {
        '@type': 'ItemList',
        name: 'Nazrul Studio Portfolio & Featured Projects',
        numberOfItems: showcaseItems.length + portfolioItems.length,
        itemListElement: [
          ...showcaseItems.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            item: {
              '@type': 'CreativeWork',
              name: item.title,
              genre: item.category,
              description: item.desc,
              url: `${cleanBase}/?project=${slugify(`${item.id}-${item.title}`)}#project-${item.id}`,
            },
          })),
          ...portfolioItems.map((item, idx) => ({
            '@type': 'ListItem',
            position: showcaseItems.length + idx + 1,
            item: {
              '@type': 'CreativeWork',
              name: item.title,
              genre: item.category,
              description: item.desc,
              image: item.image,
              url: `${cleanBase}/?portfolio=${slugify(`${item.id}-${item.title}`)}#portfolio-${item.id}`,
            },
          })),
        ],
      },
    ],
  };

  return JSON.stringify(jsonLd);
}

/**
 * Triggers a browser download of the dynamically generated sitemap.xml
 */
export function downloadDynamicSitemapXml(data: Partial<AppData> = initialData) {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://nazrulstudio.uk';
  const xml = generateSitemapXml(data, origin);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
