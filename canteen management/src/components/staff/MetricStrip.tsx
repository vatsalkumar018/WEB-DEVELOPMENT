import React from 'react';
import { useOrders } from '@/contexts/OrderContext';

export const MetricStrip: React.FC = () => {
  const { metrics, orders } = useOrders();

  const total = metrics.totalTodayOrders;
  const queued = orders.filter((o) => o.status === 'PLACED').length;
  const prep = metrics.prepCount;
  const ready = metrics.readyCount;
  const done = orders.filter((o) => o.status === 'COLLECTED').length;

  return (
    <div className="grid grid-cols-5 gap-1.5 pt-1">
      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container dark:bg-[#1f1f1f] shadow-sm border border-surface-container-high/60 dark:border-white/5">
        <span className="font-label-sm text-[11px] text-on-surface-variant dark:text-neutral-400 uppercase tracking-wider font-semibold">
          Total
        </span>
        <span className="font-numeric-data text-base sm:text-lg text-on-surface dark:text-white font-bold">
          {total}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container dark:bg-[#1f1f1f] shadow-sm border border-surface-container-high/60 dark:border-white/5">
        <span className="font-label-sm text-[11px] text-tertiary dark:text-neutral-400 uppercase tracking-wider font-semibold">
          Queued
        </span>
        <span className="font-numeric-data text-base sm:text-lg text-primary dark:text-[#f08344] font-bold">
          {queued}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary-fixed dark:bg-primary-fixed/20 shadow-sm border border-primary/20">
        <span className="font-label-sm text-[11px] text-on-primary-fixed-variant dark:text-amber-300 uppercase tracking-wider font-bold">
          Prep
        </span>
        <span className="font-numeric-data text-base sm:text-lg text-primary dark:text-[#f08344] font-bold">
          {prep}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-secondary-fixed dark:bg-emerald-950/40 shadow-sm border border-secondary/20">
        <span className="font-label-sm text-[11px] text-on-secondary-fixed-variant dark:text-emerald-300 uppercase tracking-wider font-bold">
          Ready
        </span>
        <span className="font-numeric-data text-base sm:text-lg text-secondary dark:text-emerald-400 font-bold">
          {ready}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container dark:bg-[#1f1f1f] shadow-sm border border-surface-container-high/60 dark:border-white/5">
        <span className="font-label-sm text-[11px] text-on-surface-variant dark:text-neutral-400 uppercase tracking-wider font-semibold">
          Done
        </span>
        <span className="font-numeric-data text-base sm:text-lg text-on-surface dark:text-white font-bold">
          {done}
        </span>
      </div>
    </div>
  );
};

