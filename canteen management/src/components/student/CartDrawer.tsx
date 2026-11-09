import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const CartDrawer: React.FC = () => {
  const { items, totalQuantity, subtotal, total, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-surface-container-lowest dark:bg-[#1A1A1A] h-full shadow-2xl flex flex-col z-10 border-l border-surface-container-high dark:border-white/10"
          >
            {/* Header */}
            <div className="p-space-md border-b border-surface-container-high dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
                    {t('inYourTray')}
                  </h2>
                  <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400">
                    {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container dark:bg-neutral-800 text-on-surface-variant dark:text-neutral-300 flex items-center justify-center hover:bg-surface-container-highest transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container dark:bg-neutral-800 flex items-center justify-center text-tertiary mb-3">
                    <ShoppingBag className="w-8 h-8 opacity-40" />
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
                    {t('cartEmpty')}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-1">
                    {t('cartEmptySub')}
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3 rounded-xl bg-surface-container-low dark:bg-[#242424] border border-surface-container-high/60 dark:border-white/5 flex gap-3 relative group"
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={item.menuItem.imageUrl}
                      alt={item.menuItem.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-surface-container"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-label-md text-label-md font-bold text-on-surface dark:text-white truncate">
                            {item.menuItem.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="text-tertiary hover:text-error transition-colors p-0.5"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Add-ons list if any */}
                        {item.selectedAddOns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.selectedAddOns.map((addon) => (
                              <span
                                key={addon.id}
                                className="text-[10px] text-primary-container dark:text-[#f08344] font-medium"
                              >
                                + {addon.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.specialInstructions && (
                          <p className="text-[10px] text-tertiary dark:text-neutral-400 italic truncate mt-0.5">
                            "{item.specialInstructions}"
                          </p>
                        )}
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-container-high/40 dark:border-white/5">
                        <span className="font-numeric-data text-label-md font-bold text-on-surface dark:text-white">
                          {formatCurrency(item.itemTotal)}
                        </span>

                        <div className="flex items-center bg-surface-container dark:bg-[#1A1A1A] rounded-full p-0.5 shadow-sm border border-surface-container-highest dark:border-white/5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface dark:text-white hover:bg-surface-container-highest transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-numeric-data text-xs font-bold text-on-surface dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-primary dark:text-[#f08344] hover:bg-surface-container-highest transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="p-space-md border-t border-surface-container-high dark:border-white/10 bg-surface-container-low dark:bg-[#1f1f1f] flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 text-body-sm text-on-surface-variant dark:text-neutral-300">
                  <div className="flex justify-between">
                    <span>{t('subtotal')}</span>
                    <span className="font-numeric-data font-semibold text-on-surface dark:text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-secondary dark:text-emerald-400">
                    <span>{t('discount')}</span>
                    <span>-₹0.00 (Standard)</span>
                  </div>
                  <div className="flex justify-between font-bold text-on-surface dark:text-white pt-2 border-t border-surface-container-high dark:border-white/10 text-base">
                    <span>{t('total')}</span>
                    <span className="font-numeric-data text-primary dark:text-[#f08344]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="px-3 py-3 rounded-xl border border-surface-container-highest dark:border-white/10 text-tertiary hover:text-error text-xs font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all"
                  >
                    <span>{t('checkout')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

