import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { INITIAL_MENU_ITEMS } from '@/data/menuItems';
import { MenuItem } from '@/types';
import { ActiveTicketBanner } from '@/components/student/ActiveTicketBanner';
import { MenuCard } from '@/components/student/MenuCard';
import { ProductDetailModal } from '@/components/student/ProductDetailModal';
import { FloatingCartTray } from '@/components/student/FloatingCartTray';
import {
  UtensilsCrossed,
  Ticket,
  History,
  Bell,
  Wallet,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  Plus,
} from 'lucide-react';
import { formatCurrency, formatTime } from '@/lib/utils';

export const StudentHomePage: React.FC = () => {
  const { user } = useAuth();
  const { orders, activeOrder, metrics } = useOrders();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const favorites = INITIAL_MENU_ITEMS.slice(0, 4);

  const handleOpenDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col w-full pb-36 max-w-5xl mx-auto">
      {/* Active Order Highlight Banner */}
      {activeOrder && <ActiveTicketBanner order={activeOrder} />}

      {/* Greeting & Wallet Header (from Stitch Section 1) */}
      <section className="px-gutter pt-space-sm pb-space-xs">
        <div className="bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl p-space-md shadow-sm border border-surface-container-high/60 dark:border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
                Good afternoon, {user?.name.split(' ')[0] || 'Student'}
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

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
            <div className="flex items-center gap-1.5 bg-surface-container-lowest dark:bg-[#242424] px-3 py-1 rounded-full shadow-sm shrink-0 border border-surface-container-high/60 dark:border-white/5">
              <Clock className="w-3.5 h-3.5 text-secondary dark:text-emerald-400" />
              <span className="font-numeric-data text-on-surface dark:text-neutral-200">
                11:00 AM – 4:00 PM
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-lowest dark:bg-[#242424] px-3 py-1 rounded-full shadow-sm shrink-0 border border-surface-container-high/60 dark:border-white/5">
              <Sparkles className="w-3.5 h-3.5 text-primary dark:text-[#f08344]" />
              <span className="font-numeric-data text-on-surface dark:text-neutral-200">
                {metrics.prepCount} cooking now
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-lowest dark:bg-[#242424] px-3 py-1 rounded-full shadow-sm shrink-0 border border-surface-container-high/60 dark:border-white/5">
              <span className="font-numeric-data text-on-surface dark:text-neutral-200 font-semibold">
                Avg ~{metrics.averageWaitMinutes}m wait
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Navigation Grid (Required by prompt) */}
      <section className="px-gutter py-space-sm">
        <h2 className="font-label-sm text-xs font-bold text-tertiary dark:text-neutral-400 uppercase tracking-wider mb-2.5">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Action 1: Order Food */}
          <Link
            to="/menu"
            className="p-3.5 rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-label-md font-bold text-on-surface dark:text-white block">
                Order Food
              </span>
              <span className="text-[11px] text-on-surface-variant dark:text-neutral-400">
                Explore campus menu
              </span>
            </div>
          </Link>

          {/* Action 2: Track Order */}
          <Link
            to={activeOrder ? `/orders/${activeOrder.id}` : '/orders'}
            className="p-3.5 rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="font-label-md font-bold text-on-surface dark:text-white block">
                Track Order
              </span>
              <span className="text-[11px] text-on-surface-variant dark:text-neutral-400">
                {activeOrder ? `Token #${activeOrder.tokenNumber}` : 'Live kitchen status'}
              </span>
            </div>
          </Link>

          {/* Action 3: Order History */}
          <Link
            to="/orders"
            className="p-3.5 rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-[#242424] text-primary dark:text-[#f08344] flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="font-label-md font-bold text-on-surface dark:text-white block">
                Order History
              </span>
              <span className="text-[11px] text-on-surface-variant dark:text-neutral-400">
                Receipts &amp; reorder
              </span>
            </div>
          </Link>

          {/* Action 4: Notifications */}
          <Link
            to="/notifications"
            className="p-3.5 rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-[#242424] text-secondary dark:text-emerald-400 flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="font-label-md font-bold text-on-surface dark:text-white block">
                Notifications
              </span>
              <span className="text-[11px] text-on-surface-variant dark:text-neutral-400">
                Alerts &amp; notices
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Wallet Balance Strip & Add Fund Pill */}
      {user && (
        <section className="px-gutter py-space-xs">
          <div className="p-4 rounded-2xl bg-surface-container-low dark:bg-[#1A1A1A] border border-surface-container-high/60 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary dark:text-[#f08344] flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-[10px] text-on-surface-variant dark:text-neutral-400 uppercase tracking-wider font-semibold">
                  Student Wallet Balance
                </span>
                <span className="font-numeric-data text-lg font-black text-on-surface dark:text-white">
                  {formatCurrency(user.walletBalance)}
                </span>
              </div>
            </div>
            <Link
              to="/profile"
              className="px-3.5 py-1.5 rounded-full bg-secondary-container dark:bg-emerald-950/60 text-secondary dark:text-emerald-300 font-label-sm text-xs font-bold shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cash</span>
            </Link>
          </div>
        </section>
      )}

      {/* Favorite & Trending Items */}
      <section className="px-gutter py-space-sm">
        <div className="flex items-center justify-between mb-space-sm">
          <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-primary dark:text-[#f08344]" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
              Canteen Favorites
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
          {favorites.map((item) => (
            <MenuCard key={item.id} item={item} onOpenDetails={handleOpenDetails} />
          ))}
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

