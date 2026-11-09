import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Minus, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const CartPage: React.FC = () => {
  const { items, totalQuantity, subtotal, total, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full pb-28 max-w-2xl mx-auto px-gutter pt-space-sm">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container-highest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">
          {t('inYourTray')}
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl border border-surface-container-high/60 dark:border-white/5 flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container dark:bg-[#242424] flex items-center justify-center text-tertiary mb-3">
            <ShoppingBag className="w-8 h-8 opacity-40" />
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white font-bold">
            {t('cartEmpty')}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-neutral-400 mt-1 max-w-sm">
            {t('cartEmptySub')}
          </p>
          <Link
            to="/menu"
            className="mt-6 px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-md hover:brightness-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span>{t('exploreMenu')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Cart Items List */}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3.5 rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex gap-3 relative"
              >
                <img
                  src={item.menuItem.imageUrl}
                  alt={item.menuItem.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-surface-container"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-label-lg text-label-lg font-bold text-on-surface dark:text-white truncate">
                        {item.menuItem.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-tertiary hover:text-error transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.selectedAddOns.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {item.selectedAddOns.map((addon) => (
                          <span
                            key={addon.id}
                            className="text-[11px] text-primary-container dark:text-[#f08344] font-medium"
                          >
                            + {addon.name} ({formatCurrency(addon.price)})
                          </span>
                        ))}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <p className="text-[11px] text-tertiary dark:text-neutral-400 italic mt-0.5 truncate">
                        "{item.specialInstructions}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 dark:border-white/5 mt-1">
                    <span className="font-numeric-data text-label-lg font-bold text-on-surface dark:text-white">
                      {formatCurrency(item.itemTotal)}
                    </span>

                    <div className="flex items-center bg-surface-container dark:bg-[#242424] rounded-full p-0.5 shadow-sm border border-surface-container-highest dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, -1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface dark:text-white hover:bg-surface-container-highest transition-colors active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-numeric-data text-sm font-bold text-on-surface dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-primary dark:text-[#f08344] hover:bg-surface-container-highest transition-colors active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing & Checkout Tray */}
          <div className="p-space-md rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-3">
            <h4 className="font-label-lg font-bold text-on-surface dark:text-white">
              Price Breakdown
            </h4>
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

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={clearCart}
                className="px-4 py-3 rounded-xl border border-surface-container-highest dark:border-white/10 text-tertiary hover:text-error text-xs font-semibold"
              >
                Clear Tray
              </button>
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="flex-1 py-3.5 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

