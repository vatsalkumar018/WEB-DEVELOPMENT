import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const FloatingCartTray: React.FC = () => {
  const { totalQuantity, total, setIsCartOpen } = useCart();
  const { t } = useLanguage();

  if (totalQuantity === 0) return null;

  return (
    <AnimatePresence>
      <aside
        aria-label="Order Cart Summary"
        className="fixed bottom-20 left-0 right-0 px-gutter z-30 pointer-events-none"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="max-w-md mx-auto pointer-events-auto bg-inverse-surface dark:bg-[#1A1A1A] text-inverse-on-surface dark:text-white rounded-2xl p-space-sm shadow-2xl flex items-center justify-between gap-space-sm border border-white/10"
        >
          <div className="flex items-center gap-space-sm pl-2">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-numeric-data text-label-md font-bold shadow-sm">
              {totalQuantity}
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-surface-variant dark:text-neutral-400 font-medium">
                {t('inYourTray')}
              </span>
              <span className="font-headline-sm text-headline-sm text-inverse-on-surface dark:text-white leading-tight font-bold">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:brightness-105 active:scale-95 font-label-md text-label-md font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>{t('viewCart')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </aside>
    </AnimatePresence>
  );
};

