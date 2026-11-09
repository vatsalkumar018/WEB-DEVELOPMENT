import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrders } from '@/contexts/OrderContext';
import { INITIAL_MENU_ITEMS } from '@/data/menuItems';
import { MenuItem } from '@/types';
import { ProductDetailModal } from '@/components/student/ProductDetailModal';
import { MenuCard } from '@/components/student/MenuCard';
import { FloatingCartTray } from '@/components/student/FloatingCartTray';
import { ActiveTicketBanner } from '@/components/student/ActiveTicketBanner';
import {
  ArrowRight,
  Zap,
  Clock,
  QrCode,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  ChefHat,
  ChevronRight,
  TrendingUp,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const { metrics, activeOrder } = useOrders();
  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const featuredItems = INITIAL_MENU_ITEMS.slice(0, 4);

  const handleOpenDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Active Token Ticket Banner if active order exists */}
      {activeOrder && <ActiveTicketBanner order={activeOrder} />}

      {/* Operational Pulse & Status Banner (Section 1 from Stitch) */}
      <section className="px-gutter pt-space-sm pb-space-xs max-w-5xl mx-auto w-full">
        <div className="bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl p-space-md shadow-sm border border-surface-container-high/60 dark:border-white/5">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
                Good afternoon
              </span>
              <span className="text-xl">👋</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container dark:bg-emerald-950/60 border border-secondary/20">
              <span className="w-2 h-2 rounded-full bg-secondary dark:bg-emerald-400 animate-ping" />
              <span className="font-label-sm text-label-sm text-on-secondary-container dark:text-emerald-200 tracking-wide font-bold">
                {t('lunchIsLive')}
              </span>
            </div>
          </div>

          {/* Live metrics ticker line */}
          <div className="flex items-center gap-2 overflow-x-auto py-1.5 no-scrollbar">
            <div className="flex items-center gap-1.5 bg-surface-container-lowest dark:bg-[#242424] px-2.5 py-1 rounded-full shadow-sm shrink-0 border border-surface-container-high/60 dark:border-white/5">
              <Clock className="w-3.5 h-3.5 text-secondary dark:text-emerald-400" />
              <span className="font-numeric-data text-numeric-data text-on-surface dark:text-neutral-200">
                11:00 AM – 4:00 PM
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-lowest dark:bg-[#242424] px-2.5 py-1 rounded-full shadow-sm shrink-0 border border-surface-container-high/60 dark:border-white/5">
              <ChefHat className="w-3.5 h-3.5 text-primary dark:text-[#f08344]" />
              <span className="font-numeric-data text-numeric-data text-on-surface dark:text-neutral-200">
                {metrics.prepCount + 34} prepping
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-lowest dark:bg-[#242424] px-2.5 py-1 rounded-full shadow-sm shrink-0 border border-surface-container-high/60 dark:border-white/5">
              <Sparkles className="w-3.5 h-3.5 text-secondary dark:text-emerald-400" />
              <span className="font-numeric-data text-numeric-data text-on-surface dark:text-neutral-200 font-semibold">
                Avg ~{metrics.averageWaitMinutes}m wait
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Statement & Hero CTA Group (Section 3 from Stitch) */}
      <section className="px-gutter pt-space-md pb-space-sm max-w-5xl mx-auto w-full">
        <div className="bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-10 shadow-sm border border-surface-container-high/80 dark:border-white/10 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 text-primary dark:text-[#f08344] mb-2 font-bold">
            <Zap className="w-4 h-4 fill-current" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider">
              {t('zeroLineProtocol')}
            </span>
          </div>

          <h1 className="font-sora text-4xl sm:text-6xl font-extrabold text-on-surface dark:text-white tracking-tight leading-tight">
            {t('heroHeadline1')} <br />
            {t('heroHeadline2')} <br />
            <span className="text-primary-container dark:text-[#f08344]">
              {t('heroHeadline3')}
            </span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-neutral-300 mt-4 max-w-xl">
            {t('heroSubhead')}
          </p>

          {/* Quick Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="flex-1 h-14 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center gap-2 shadow-lg font-label-lg text-label-lg font-bold hover:brightness-105 active:scale-[0.98] transition-all"
            >
              <span>{t('orderNow')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/menu"
              className="h-14 px-6 bg-surface-container dark:bg-[#242424] text-on-surface dark:text-white rounded-2xl flex items-center justify-center gap-2 font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
            >
              <span>{t('exploreMenu')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Visual How It Works (Four-Step Compact Rail from Stitch) */}
      <section className="px-gutter py-space-md max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
              Campus Quick-Cycle
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400">
              How Token &amp; Bite saves you 20 mins every rush hour
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-primary dark:text-[#f08344] font-bold">
            4 STEPS
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Step 01 */}
          <div className="bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl p-4 flex flex-col justify-between border border-surface-container-high/60 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-numeric-data text-label-sm text-primary dark:text-[#f08344] font-bold">
                01
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-[#242424] flex items-center justify-center text-on-surface-variant dark:text-neutral-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="font-headline-sm text-label-md text-on-surface dark:text-white font-bold">
                CHOOSE
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-1 line-clamp-2">
                Filter live thalis, snacks &amp; diet tags in seconds.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl p-4 flex flex-col justify-between border border-surface-container-high/60 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-numeric-data text-label-sm text-primary dark:text-[#f08344] font-bold">
                02
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-[#242424] flex items-center justify-center text-on-surface-variant dark:text-neutral-300">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="font-headline-sm text-label-md text-on-surface dark:text-white font-bold">
                ORDER
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-1 line-clamp-2">
                Instant checkout via student wallet or UPI.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl p-4 flex flex-col justify-between border border-surface-container-high/60 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-numeric-data text-label-sm text-primary dark:text-[#f08344] font-bold">
                03
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-[#242424] flex items-center justify-center text-on-surface-variant dark:text-neutral-300">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="font-headline-sm text-label-md text-on-surface dark:text-white font-bold">
                GET TOKEN
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-1 line-clamp-2">
                Watch your live batch ping in real-time.
              </p>
            </div>
          </div>

          {/* Step 04 */}
          <div className="bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl p-4 flex flex-col justify-between border border-surface-container-high/60 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-numeric-data text-label-sm text-primary dark:text-[#f08344] font-bold">
                04
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container dark:bg-[#242424] flex items-center justify-center text-on-surface-variant dark:text-neutral-300">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="font-headline-sm text-label-md text-on-surface dark:text-white font-bold">
                COLLECT
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-1 line-clamp-2">
                Flash digital token at Counter 2 and eat hot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Canteen Favorites (Section 5 from Stitch) */}
      <section className="px-gutter py-space-sm max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary dark:text-[#f08344]" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white font-bold">
              Trending Today
            </h2>
          </div>
          <Link
            to="/menu"
            className="font-label-sm text-label-sm text-primary dark:text-[#f08344] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {featuredItems.map((item) => (
            <MenuCard key={item.id} item={item} onOpenDetails={handleOpenDetails} />
          ))}
        </div>
      </section>

      {/* Why Use the System Banner */}
      <section className="px-gutter py-space-md max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-br from-surface-container to-surface-container-high dark:from-[#1E1E1E] dark:to-[#161616] rounded-3xl p-6 sm:p-8 border border-surface-container-high dark:border-white/10">
          <div className="max-w-2xl">
            <h3 className="font-sora text-2xl font-bold text-on-surface dark:text-white">
              Why Campus Loves Token &amp; Bite
            </h3>
            <p className="font-body-md text-on-surface-variant dark:text-neutral-400 mt-2">
              Engineered with university student schedules in mind. Designed for zero-crush peak lunch hours, seamless digital payments, and instant meal tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-label-md font-bold text-on-surface dark:text-white">
                  Zero Line Queue
                </h4>
                <p className="text-xs text-on-surface-variant dark:text-neutral-400 mt-0.5">
                  Order from your lecture hall or hostel room before reaching Block 4.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-[#f08344] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-label-md font-bold text-on-surface dark:text-white">
                  Fresh Cook Guarantee
                </h4>
                <p className="text-xs text-on-surface-variant dark:text-neutral-400 mt-0.5">
                  Kitchen only prepares your rotis and coffee when your token is called.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-label-md font-bold text-on-surface dark:text-white">
                  Campus Subsidy Sync
                </h4>
                <p className="text-xs text-on-surface-variant dark:text-neutral-400 mt-0.5">
                  Automatic student identity verification with integrated wallet credits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Floating Cart Tray */}
      <FloatingCartTray />
    </div>
  );
};

