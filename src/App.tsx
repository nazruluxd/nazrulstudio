import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { initialData, navItems } from './data/initialData';
import { AppData, NavMenuItem, PortfolioItem, ShowcaseItem } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Brands } from './components/Brands';
import { Skills } from './components/Skills';
import { Approach } from './components/Approach';
import { WhyUs } from './components/WhyUs';
import { ProjectShowcase } from './components/ProjectShowcase';
import { Portfolio } from './components/Portfolio';
import { Testimonials } from './components/Testimonials';
import { BonusPackage } from './components/BonusPackage';
import { Resume } from './components/Resume';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { ScrollNavigator } from './components/ScrollNavigator';
import { SitemapModal } from './components/SitemapModal';
import { AdminModal } from './components/AdminModal';
import { ShopPage } from './components/shop/ShopPage';
import { ThankYouPage } from './components/shop/ThankYouPage';
import {
  generateStructuredDataJsonLd,
  SHOP_ITEMS,
  ShopProductItem,
  slugify,
} from './utils/sitemapGenerator';
import { useDynamicSeo } from './utils/useDynamicSeo';

type ViewMode = 'home' | 'shop' | 'thank-you';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem('nazrul_studio_app_data_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialData,
          ...parsed,
          global: { ...initialData.global, ...(parsed.global || {}) },
          visibility: { ...initialData.visibility, ...(parsed.visibility || {}) },
          shopVideo: { ...initialData.shopVideo, ...(parsed.shopVideo || {}) },
        };
      }
    } catch {
      // ignore
    }
    return initialData;
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState('global');
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);

  // Active viewed project / product states for dynamic SEO & OpenGraph metadata
  const [activePortfolioItem, setActivePortfolioItem] = useState<PortfolioItem | null>(null);
  const [activeShowcaseItem, setActiveShowcaseItem] = useState<ShowcaseItem | null>(null);
  const [activeShopProduct, setActiveShopProduct] = useState<ShopProductItem | null>(null);

  // Dynamically update page-specific <title>, <meta name="description">, OpenGraph, Twitter Cards & JSON-LD
  useDynamicSeo({
    view: currentView,
    activeSection,
    activePortfolioItem,
    activeShowcaseItem,
    activeShopProduct,
    data,
  });

  // Real-time sync from Firestore siteConfig
  useEffect(() => {
    const configPath = 'siteConfig/main';
    const unsubscribe = onSnapshot(
      doc(db, 'siteConfig', 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          setData((prev) => ({
            ...prev,
            ...remoteData,
            global: { ...prev.global, ...(remoteData.global || {}) },
            visibility: { ...prev.visibility, ...(remoteData.visibility || {}) },
            shopVideo: { ...prev.shopVideo, ...(remoteData.shopVideo || {}) },
          }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, configPath);
      }
    );

    return () => unsubscribe();
  }, []);

  // Auto-persist changes to Firestore and localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        ...data,
        shopVideo: {
          ...data.shopVideo,
          // Avoid exceeding quota with huge data URLs
          videoUrl:
            data.shopVideo?.videoUrl?.startsWith('data:video') &&
            data.shopVideo.videoUrl.length > 2 * 1024 * 1024
              ? ''
              : data.shopVideo?.videoUrl,
        },
      };
      localStorage.setItem('nazrul_studio_app_data_v2', JSON.stringify(dataToSave));

      // Sync to Firestore if authenticated as authorized admin
      const isGoogleAdmin = auth.currentUser?.email?.toLowerCase() === 'nazrulcxd@gmail.com';
      if (isGoogleAdmin) {
        setDoc(
          doc(db, 'siteConfig', 'main'),
          {
            global: dataToSave.global,
            visibility: dataToSave.visibility,
            shopVideo: dataToSave.shopVideo,
          },
          { merge: true }
        ).catch((err) => {
          console.warn('Firestore sync background notice:', err);
        });
      }
    } catch {
      // quota or private browsing
    }

    // Dynamically update Schema.org JSON-LD for Google Search Indexing
    try {
      const origin = window.location.origin || 'https://nazrulstudio.uk';
      let scriptEl = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'dynamic-seo-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = generateStructuredDataJsonLd(data, origin);
    } catch {
      // ignore DOM error
    }
  }, [data]);

  // Order state for thank you page (verified against Firestore)
  const [orderInfo, setOrderInfo] = useState<{ orderId: string; users: number }>({
    orderId: '',
    users: 1,
  });

  // Check URL query parameters or hash to support direct linking / bookmarking & sitemap deep links
  useEffect(() => {
    const handleUrlChange = () => {
      const search = window.location.search;
      const hash = window.location.hash;

      const params = new URLSearchParams(search);
      const orderParam = params.get('order') || params.get('tx') || params.get('license');
      const usersParam = params.get('users');
      const portfolioParam = params.get('portfolio');
      const projectParam = params.get('project');
      const productParam = params.get('product');

      if (orderParam || hash === '#thank-you' || params.get('view') === 'thank-you') {
        if (orderParam) {
          setOrderInfo({
            orderId: orderParam,
            users: usersParam ? parseInt(usersParam, 10) || 1 : 1,
          });
        }
        setActivePortfolioItem(null);
        setActiveShowcaseItem(null);
        setCurrentView('thank-you');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#shop' || params.get('view') === 'shop' || productParam) {
        const matchedProduct =
          SHOP_ITEMS.find((p) => p.id === productParam || p.slug === productParam) ||
          SHOP_ITEMS[0];
        setActiveShopProduct(matchedProduct);
        setActivePortfolioItem(null);
        setActiveShowcaseItem(null);
        setCurrentView('shop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (portfolioParam || projectParam) {
        setCurrentView('home');
        setActiveShopProduct(null);

        if (portfolioParam) {
          const matchedPortfolio = data.portfolio.find(
            (item) =>
              slugify(`${item.id}-${item.title}`) === portfolioParam ||
              String(item.id) === portfolioParam
          );
          if (matchedPortfolio) {
            setActivePortfolioItem(matchedPortfolio);
            setActiveShowcaseItem(null);
          }
        } else if (projectParam) {
          const matchedShowcase = data.showcase.find(
            (item) =>
              slugify(`${item.id}-${item.title}`) === projectParam ||
              item.id === projectParam
          );
          if (matchedShowcase) {
            setActiveShowcaseItem(matchedShowcase);
            setActivePortfolioItem(null);
          }
        }

        setTimeout(() => {
          const targetId = hash
            ? hash.substring(1)
            : portfolioParam
            ? 'portfolio'
            : 'projects';
          const el =
            document.getElementById(targetId) ||
            document.getElementById(portfolioParam ? 'portfolio' : 'projects');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 250);
      }

      if (hash === '#sitemap' || params.get('sitemap') === '1') {
        setIsSitemapOpen(true);
      }

      // Secure direct URL admin trigger: #admin or ?admin=...
      if (
        hash === '#admin' ||
        params.has('admin') ||
        params.get('admin') === '1' ||
        params.get('admin') === 'login' ||
        params.get('admin') === 'true'
      ) {
        setAdminInitialTab('licenses');
        setIsAdminOpen(true);
      }
    };

    // Global helper for developer/owner console access
    (window as any).openAdmin = (tab = 'licenses') => {
      setAdminInitialTab(tab);
      setIsAdminOpen(true);
    };

    // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to securely open Admin Dashboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminInitialTab('licenses');
        setIsAdminOpen((prev) => !prev);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [data.portfolio, data.showcase]);

  const navigateToView = (view: ViewMode, orderId?: string, users?: number) => {
    if (orderId) {
      setOrderInfo({
        orderId,
        users: users || 1,
      });
    }
    if (view === 'shop') {
      setActiveShopProduct(SHOP_ITEMS[0]);
      setActivePortfolioItem(null);
      setActiveShowcaseItem(null);
    } else if (view === 'home') {
      setActiveShopProduct(null);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL hash cleanly without reload
    if (view === 'shop') {
      window.history.pushState(null, '', '#shop');
    } else if (view === 'thank-you') {
      window.history.pushState(null, '', '#thank-you');
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const updateData = (
    section: keyof AppData,
    id: string | number | null,
    field: string,
    value: any
  ) => {
    setData((prev) => {
      if (id === null) {
        return {
          ...prev,
          [section]: {
            ...(prev[section] as Record<string, any>),
            [field]: value,
          },
        };
      }
      return {
        ...prev,
        [section]: (prev[section] as any[]).map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      };
    });
  };

  const addArrayItem = (section: keyof AppData, item: any) => {
    setData((prev) => ({
      ...prev,
      [section]: [item, ...(prev[section] as any[])],
    }));
  };

  const removeArrayItem = (section: keyof AppData, id: string | number) => {
    setData((prev) => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item) => item.id !== id),
    }));
  };

  const toggleVisibility = (section: string) => {
    setData((prev) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [section]: !prev.visibility[section],
      },
    }));
  };

  const handleScroll = useCallback(() => {
    let ticking = false;
    return () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);

          if (currentView === 'home') {
            const sectionIds = navItems.map((item) => item.href.substring(1));
            let current = '';
            for (const id of sectionIds) {
              const el = document.getElementById(id);
              if (el && window.scrollY >= el.offsetTop - 300) {
                current = id;
              }
            }
            if (current) {
              setActiveSection(current);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [currentView]);

  useEffect(() => {
    const scrollListener = handleScroll();
    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [handleScroll]);

  // Filter navigation items by visibility
  const filteredNavItems: NavMenuItem[] = navItems.filter((item) => {
    if (item.key === 'home' || item.key === 'contact') return true;
    return data.visibility[item.key] !== false;
  });

  // Render Thank You Download Page
  if (currentView === 'thank-you') {
    return (
      <>
        <ThankYouPage
          orderId={orderInfo.orderId}
          userCount={orderInfo.users}
          onBackToShop={() => navigateToView('shop')}
          onBackToPortfolio={() => navigateToView('home')}
        />
        <ScrollNavigator accentColor="amber" />
      </>
    );
  }

  // Render Shop Page
  if (currentView === 'shop') {
    return (
      <div className="min-h-screen bg-[#0b0d12]">
        <ShopPage
          onBackToStudio={() => navigateToView('home')}
          onGoToThankYou={(orderId, users) =>
            navigateToView('thank-you', orderId, users)
          }
          shopVideo={data.shopVideo}
          onOpenAdmin={(tab) => {
            if (tab) setAdminInitialTab(tab);
            setIsAdminOpen(true);
          }}
        />

        <ScrollNavigator accentColor="amber" />
        <WhatsAppFloating phone={data.global.contactPhone} />

        {/* Advanced Admin CMS Modal (Accessible in Shop Page) */}
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          data={data}
          updateData={updateData}
          addArrayItem={addArrayItem}
          removeArrayItem={removeArrayItem}
          toggleVisibility={toggleVisibility}
          initialTab={adminInitialTab}
          onNavigateToShop={() => navigateToView('shop')}
        />
      </div>
    );
  }

  // Render Main Portfolio
  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-300 font-sans selection:bg-[#FF6F61] selection:text-white overflow-x-hidden relative">
      {/* Top Navbar & Floating Mobile Bottom Bar */}
      <Navbar
        activeSection={activeSection}
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        filteredNavItems={filteredNavItems}
        onOpenShop={() => navigateToView('shop')}
      />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-24 space-y-24 md:space-y-32">
        <Hero global={data.global} />

        {data.visibility.about && <About />}

        {data.visibility.brands && <Brands />}

        {data.visibility.skills && <Skills skills={data.skills} />}

        {data.visibility.approach && <Approach />}

        {data.visibility.whyUs && <WhyUs />}

        {data.visibility.projects && (
          <ProjectShowcase
            showcase={data.showcase}
            onActiveShowcaseChange={setActiveShowcaseItem}
          />
        )}

        {data.visibility.portfolio && (
          <Portfolio
            portfolio={data.portfolio}
            activePortfolioItem={activePortfolioItem}
            onSelectPortfolioItem={setActivePortfolioItem}
          />
        )}

        {data.visibility.testimonials && <Testimonials />}

        {data.visibility.bonus && <BonusPackage />}

        {data.visibility.resume && (
          <Resume experience={data.experience} education={data.education} />
        )}

        <Contact global={data.global} />
      </main>

      {/* Footer with CMS Admin & Dynamic Sitemap XML access */}
      <Footer
        navItems={filteredNavItems}
        onOpenAdmin={() => {
          setAdminInitialTab('global');
          setIsAdminOpen(true);
        }}
        onOpenSitemap={() => setIsSitemapOpen(true)}
      />

      {/* Bidirectional Top-to-Bottom & Bottom-to-Top Scroll Navigator */}
      <ScrollNavigator accentColor="coral" />

      {/* Floating WhatsApp Quick Action Button */}
      <WhatsAppFloating phone={data.global.contactPhone} />

      {/* Dynamic Sitemap XML Generator & Inspector Modal */}
      <SitemapModal
        isOpen={isSitemapOpen}
        onClose={() => setIsSitemapOpen(false)}
        data={data}
      />

      {/* Advanced Admin CMS Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        data={data}
        updateData={updateData}
        addArrayItem={addArrayItem}
        removeArrayItem={removeArrayItem}
        toggleVisibility={toggleVisibility}
        initialTab={adminInitialTab}
        onNavigateToShop={() => navigateToView('shop')}
      />
    </div>
  );
}

export default App;
