import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrders } from '@/contexts/OrderContext';
import { Store, UtensilsCrossed, Ticket, CookingPot, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { activeOrder } = useOrders();

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/90 dark:bg-[#121212]/90 backdrop-blur-xl border-t border-surface-container-high/70 dark:border-white/10 shadow-[0_-2px_12px_rgba(0,0,0,0.05)] md:hidden transition-colors">
      <div className="flex items-center justify-around h-16 px-gutter">
        <NavLink
          to="/student"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
              isActive
                ? 'text-primary dark:text-[#f08344] font-bold'
                : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
            }`
          }
        >
          <Store className="w-5 h-5" />
          <span className="font-label-sm text-[11px] leading-tight">{t('navHome')}</span>
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
              isActive
                ? 'text-primary dark:text-[#f08344] font-bold'
                : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
            }`
          }
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="font-label-sm text-[11px] leading-tight">{t('navMenu')}</span>
        </NavLink>

        <NavLink
          to={activeOrder ? `/orders/${activeOrder.id}` : '/orders'}
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
              isActive
                ? 'text-primary dark:text-[#f08344] font-bold'
                : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
            }`
          }
        >
          <Ticket className="w-5 h-5" />
          <span className="font-label-sm text-[11px] leading-tight">{t('navOrders')}</span>
          {activeOrder && (
            <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[10px] flex items-center justify-center font-bold">
              1
            </span>
          )}
        </NavLink>

        <NavLink
          to="/kitchen"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
              isActive
                ? 'text-primary dark:text-[#f08344] font-bold'
                : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
            }`
          }
        >
          <CookingPot className="w-5 h-5" />
          <span className="font-label-sm text-[11px] leading-tight">{t('navKitchen')}</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
              isActive
                ? 'text-primary dark:text-[#f08344] font-bold'
                : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="font-label-sm text-[11px] leading-tight">{t('navProfile')}</span>
        </NavLink>
      </div>
    </nav>
  );
};

