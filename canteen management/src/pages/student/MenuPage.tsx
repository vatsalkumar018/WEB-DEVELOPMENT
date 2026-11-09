import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { INITIAL_MENU_ITEMS } from '@/data/menuItems';
import { MenuItem, ItemCategory, MealTimeSlot } from '@/types';
import { MenuCard } from '@/components/student/MenuCard';
import { ProductDetailModal } from '@/components/student/ProductDetailModal';
import { FloatingCartTray } from '@/components/student/FloatingCartTray';
import { TIME_SLOTS, getCurrentMealSlot, isItemAvailableInSlot } from '@/lib/timeSchedule';
import { Search, Sparkles, Filter, Check } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { t } = useLanguage();

  // Active meal slot (defaults to current real-time slot)
  const [selectedSlot, setSelectedSlot] = useState<MealTimeSlot>(() => getCurrentMealSlot());
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnlyFilter, setVegOnlyFilter] = useState<boolean>(false);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenDetails = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return INITIAL_MENU_ITEMS.filter((item) => {
      // Slot availability check
      const matchesSlot = isItemAvailableInSlot(item.servingSlots, selectedSlot);
      // Category check
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      // Search query check
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameHi && item.nameHi.includes(searchQuery)) ||
        (item.nameGu && item.nameGu.includes(searchQuery));
      // Veg filter
      const matchesVeg = !vegOnlyFilter || item.isVeg;

      return matchesSlot && matchesCategory && matchesSearch && matchesVeg;
    });
  }, [selectedSlot, selectedCategory, searchQuery, vegOnlyFilter]);

  const categoryCounts = useMemo(() => {
    return {
      ALL: INITIAL_MENU_ITEMS.filter((i) => isItemAvailableInSlot(i.servingSlots, selectedSlot)).length,
      MEALS: INITIAL_MENU_ITEMS.filter(
        (i) => i.category === 'MEALS' && isItemAvailableInSlot(i.servingSlots, selectedSlot)
      ).length,
      BEVERAGES: INITIAL_MENU_ITEMS.filter(
        (i) => i.category === 'BEVERAGES' && isItemAvailableInSlot(i.servingSlots, selectedSlot)
      ).length,
      SNACKS: INITIAL_MENU_ITEMS.filter(
        (i) => i.category === 'SNACKS' && isItemAvailableInSlot(i.servingSlots, selectedSlot)
      ).length,
      DESSERTS: INITIAL_MENU_ITEMS.filter(
        (i) => i.category === 'DESSERTS' && isItemAvailableInSlot(i.servingSlots, selectedSlot)
      ).length,
    };
  }, [selectedSlot]);

  const activeSlotConfig = TIME_SLOTS[selectedSlot];

  return (
    <div className="flex flex-col w-full pb-36 max-w-5xl mx-auto">
      {/* Meal Period Banner & Quick Schedule Track (from Stitch) */}
      <div className="px-gutter pt-space-sm pb-space-md flex flex-col gap-space-sm">
        <div className="p-space-md rounded-2xl bg-surface-container-low dark:bg-[#1A1A1A] shadow-sm border border-surface-container-high/60 dark:border-white/5 flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
                Good afternoon 👋
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container dark:bg-emerald-950/60 border border-secondary/20 text-on-secondary-container dark:text-emerald-300 font-label-sm text-label-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary dark:bg-emerald-400 animate-ping" />
              Live Kitchen
            </span>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant dark:text-neutral-300">
            {activeSlotConfig.label} is currently serving{' '}
            <span className="font-semibold text-primary dark:text-[#f08344]">
              ({activeSlotConfig.timeRange})
            </span>
          </p>

          {/* Horizontal Service Times Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pt-space-xs -mx-1 px-1 no-scrollbar">
            {(['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'] as MealTimeSlot[]).map((slotKey) => {
              const cfg = TIME_SLOTS[slotKey];
              const isCurrent = selectedSlot === slotKey;
              return (
                <button
                  key={slotKey}
                  type="button"
                  onClick={() => setSelectedSlot(slotKey)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-label-sm text-label-sm transition-all ${
                    isCurrent
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'bg-surface-container dark:bg-[#242424] text-tertiary dark:text-neutral-400 hover:text-on-surface'
                  }`}
                >
                  {cfg.label}{' '}
                  <span className="opacity-80 text-[11px] font-normal">
                    {slotKey === 'BREAKFAST'
                      ? '7–11am'
                      : slotKey === 'LUNCH'
                      ? '11–4pm'
                      : slotKey === 'SNACKS'
                      ? '4–7pm'
                      : '7–9pm'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Dietary Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-tertiary dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search thalis, rolls, coffee, samosa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container-lowest dark:bg-[#1A1A1A] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setVegOnlyFilter(!vegOnlyFilter)}
            className={`px-3 py-2 rounded-full font-label-sm text-label-sm flex items-center gap-1.5 border transition-all ${
              vegOnlyFilter
                ? 'bg-secondary text-white border-secondary shadow-sm font-bold'
                : 'bg-surface-container-lowest dark:bg-[#1A1A1A] text-on-surface dark:text-neutral-300 border-surface-container-high dark:border-white/10 hover:bg-surface-container'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-secondary-fixed" />
            <span>Veg Only</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
              selectedCategory === 'ALL'
                ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black font-bold'
                : 'bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300 hover:bg-surface-container-high'
            }`}
          >
            {t('all')} <span className="opacity-70 text-xs">({categoryCounts.ALL})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('MEALS')}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
              selectedCategory === 'MEALS'
                ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black font-bold'
                : 'bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300 hover:bg-surface-container-high'
            }`}
          >
            {t('meals')} <span className="opacity-70 text-xs">({categoryCounts.MEALS})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('BEVERAGES')}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
              selectedCategory === 'BEVERAGES'
                ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black font-bold'
                : 'bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300 hover:bg-surface-container-high'
            }`}
          >
            {t('beverages')} <span className="opacity-70 text-xs">({categoryCounts.BEVERAGES})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('SNACKS')}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
              selectedCategory === 'SNACKS'
                ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black font-bold'
                : 'bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300 hover:bg-surface-container-high'
            }`}
          >
            {t('quickSnacks')} <span className="opacity-70 text-xs">({categoryCounts.SNACKS})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('DESSERTS')}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
              selectedCategory === 'DESSERTS'
                ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black font-bold'
                : 'bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300 hover:bg-surface-container-high'
            }`}
          >
            {t('desserts')} <span className="opacity-70 text-xs">({categoryCounts.DESSERTS})</span>
          </button>
        </div>
      </div>

      {/* Food Menu Items Grid */}
      <div className="px-gutter flex flex-col gap-space-md">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl flex flex-col items-center justify-center">
            <Sparkles className="w-10 h-10 text-tertiary mb-2 opacity-50" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
              No items found in this meal slot
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-1 max-w-sm">
              Try switching the meal timing (e.g. Lunch or All Day) or clear your search filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedSlot('LUNCH');
                setSelectedCategory('ALL');
                setSearchQuery('');
                setVegOnlyFilter(false);
              }}
              className="mt-4 px-4 py-2 rounded-full bg-primary text-white font-label-sm text-label-sm font-bold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} onOpenDetails={handleOpenDetails} />
          ))
        )}
      </div>

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

