import React, { useState, useEffect } from 'react';
import { MenuItem, ProductAddOn } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Check, Flame, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProductDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddOns, setSelectedAddOns] = useState<ProductAddOn[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAddOns([]);
      setSpecialInstructions('');
    }
  }, [isOpen, item]);

  if (!item) return null;

  const toggleAddOn = (addOn: ProductAddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addOn.id);
      if (exists) {
        return prev.filter((a) => a.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const totalItemPrice = (item.price + addOnsTotal) * quantity;

  const handleAddToCart = () => {
    addToCart(item, quantity, selectedAddOns, specialInstructions);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-lg bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 border border-surface-container-high/80 dark:border-white/10"
          >
            {/* Sheet Handle */}
            <div className="relative w-full pt-3 pb-2 flex flex-col items-center sm:hidden">
              <div className="w-12 h-1 rounded-full bg-surface-container-highest dark:bg-neutral-700" />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-surface-container/80 dark:bg-neutral-800/80 backdrop-blur-md text-on-surface dark:text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-gutter pb-6 flex flex-col gap-space-md pt-2">
              {/* Food Image with Badges */}
              <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-surface-container dark:bg-neutral-800 shadow-sm">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  {item.isVeg && (
                    <span className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-bold shadow-sm">
                      100% Pure Veg
                    </span>
                  )}
                  {item.calories && (
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 dark:bg-[#121212]/90 backdrop-blur-md text-on-surface dark:text-neutral-200 font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-primary" />
                      <span>{item.calories} kcal</span>
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 dark:bg-[#121212]/90 backdrop-blur-md text-on-surface dark:text-neutral-200 font-label-sm text-label-sm font-semibold shadow-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span>~{item.preparationTimeMinutes}m prep</span>
                  </span>
                </div>
              </div>

              {/* Title & Price */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white">
                    {item.name}
                  </h2>
                  <span className="font-token-callout-mobile text-token-callout-mobile text-primary dark:text-[#f08344] font-bold">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-neutral-300">
                  {item.description}
                </p>
              </div>

              {/* Ingredients / Includes */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 uppercase tracking-wider font-bold">
                    Platter Includes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-surface-container dark:bg-[#242424] text-on-surface dark:text-neutral-200 font-body-sm text-body-sm border border-surface-container-high/60 dark:border-white/5"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-on Customisation */}
              {item.addOns && item.addOns.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 uppercase tracking-wider font-bold">
                      Customize Platter
                    </span>
                    <span className="font-body-sm text-body-sm text-tertiary dark:text-neutral-400">
                      Optional
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {item.addOns.map((addOn) => {
                      const isSelected = selectedAddOns.some((a) => a.id === addOn.id);
                      return (
                        <label
                          key={addOn.id}
                          onClick={() => toggleAddOn(addOn)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary-fixed/30 dark:bg-primary-fixed-dim/20 border-primary text-on-surface dark:text-white'
                              : 'bg-surface-container-low dark:bg-[#242424] border-surface-container-high dark:border-white/5 text-on-surface dark:text-neutral-300 hover:bg-surface-container dark:hover:bg-[#2a2a2a]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'border-2 border-surface-container-highest dark:border-neutral-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="font-body-md text-body-md font-medium">
                              {addOn.name}
                            </span>
                          </div>
                          <span className="font-numeric-data text-label-md font-semibold text-primary dark:text-[#f08344]">
                            +{formatCurrency(addOn.price)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Instructions Note */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 uppercase tracking-wider font-bold">
                  Kitchen Notes
                </span>
                <input
                  type="text"
                  placeholder="e.g. less spicy, no sugar, extra crispy"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white placeholder:text-tertiary dark:placeholder:text-neutral-500 border border-surface-container-high dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>

              {/* Quantity Selector & Action Button */}
              <div className="pt-2 flex items-center gap-3 sticky bottom-0 bg-surface-container-lowest dark:bg-[#1A1A1A] py-2 border-t border-surface-container-high dark:border-white/5">
                {/* Compact Pill Quantity Selector */}
                <div className="flex items-center bg-surface-container dark:bg-[#242424] rounded-full p-1 shadow-inner border border-surface-container-high dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 rounded-full flex items-center justify-center font-headline-sm text-on-surface dark:text-white hover:bg-surface-container-highest dark:hover:bg-neutral-700 transition-colors active:scale-90"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-numeric-data text-headline-sm text-on-surface dark:text-white font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="w-10 h-10 rounded-full flex items-center justify-center font-headline-sm text-primary dark:text-[#f08344] hover:bg-surface-container-highest dark:hover:bg-neutral-700 transition-colors active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Order Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-full bg-primary-container text-on-primary-container hover:brightness-105 active:scale-[0.98] font-label-lg text-label-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Add to Order</span>
                  <span>•</span>
                  <span className="font-numeric-data">{formatCurrency(totalItemPrice)}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

