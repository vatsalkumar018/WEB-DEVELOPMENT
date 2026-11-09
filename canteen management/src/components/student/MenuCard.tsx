import React from 'react';
import { MenuItem } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Plus, Minus, Flame, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MenuCardProps {
  item: MenuItem;
  onOpenDetails: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onOpenDetails }) => {
  const { items, addToCart, updateQuantity } = useCart();

  // Find if item is already in cart
  const cartEntries = items.filter((i) => i.menuItem.id === item.id);
  const totalQtyInCart = cartEntries.reduce((sum, i) => sum + i.quantity, 0);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartEntries.length > 0) {
      updateQuantity(cartEntries[0].cartItemId, 1);
    } else {
      addToCart(item, 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartEntries.length > 0) {
      updateQuantity(cartEntries[0].cartItemId, -1);
    }
  };

  return (
    <article
      onClick={() => onOpenDetails(item)}
      className="p-space-md rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/60 dark:border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-space-sm group"
    >
      <div className="flex gap-space-md">
        {/* Thumbnail Image */}
        <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container dark:bg-neutral-800">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {item.isVeg && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-[10px] tracking-wide font-bold uppercase shadow-sm">
              Veg
            </span>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-1 text-center">
              <span className="text-white font-label-sm text-[10px] font-bold uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0 justify-between">
          <div>
            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed dark:bg-primary-fixed/20 text-on-primary-fixed-variant dark:text-amber-300 font-label-sm text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
              {item.calories && (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-tertiary dark:text-neutral-400 font-medium">
                  <Flame className="w-3 h-3 text-primary" />
                  {item.calories} kcal
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white mt-1 truncate">
              {item.name}
            </h3>

            {/* Description */}
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 line-clamp-2 mt-0.5">
              {item.description}
            </p>
          </div>

          {/* Price & Add Trigger */}
          <div className="flex items-center justify-between pt-1 mt-1">
            <span className="font-numeric-data text-headline-sm text-on-surface dark:text-white font-bold">
              {formatCurrency(item.price)}
            </span>

            {item.isAvailable ? (
              totalQtyInCart > 0 ? (
                /* Interactive Counter Pill */
                <div
                  className="flex items-center bg-surface-container-high dark:bg-[#242424] rounded-full p-0.5 shadow-sm border border-surface-container-highest dark:border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleDecrement}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 rounded-full flex items-center justify-center font-headline-sm text-on-surface dark:text-white hover:bg-surface-container-highest dark:hover:bg-neutral-700 transition-colors active:scale-90"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-numeric-data text-label-md text-on-surface dark:text-white font-bold">
                    {totalQtyInCart}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    aria-label="Increase quantity"
                    className="w-8 h-8 rounded-full flex items-center justify-center font-headline-sm text-primary dark:text-[#f08344] hover:bg-surface-container-highest dark:hover:bg-neutral-700 transition-colors active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* "+ Add" Action Button */
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-4 py-1.5 rounded-full bg-surface-container-high dark:bg-[#242424] text-primary dark:text-[#f08344] font-label-md text-label-md font-bold hover:bg-primary hover:text-on-primary dark:hover:bg-primary-container dark:hover:text-white transition-all active:scale-95 shadow-sm border border-surface-container-highest dark:border-white/5"
                >
                  + Add
                </button>
              )
            ) : (
              <span className="font-label-sm text-label-sm text-tertiary dark:text-neutral-500 font-semibold">
                Unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

