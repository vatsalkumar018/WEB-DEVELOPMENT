import React, { useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { MetricStrip } from '@/components/staff/MetricStrip';
import { KitchenTicketCard } from '@/components/staff/KitchenTicketCard';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Soup,
  Volume2,
  ChevronDown,
  Timer,
} from 'lucide-react';
import { playChime } from '@/lib/sound';

export const StaffDashboardPage: React.FC = () => {
  const { orders, metrics, toggleRushMode, simulateIncomingOrder } = useOrders();
  const { role, switchRole } = useAuth();
  const [filter, setFilter] = useState<string>('ALL');

  const preparingOrders = orders.filter((o) => o.status === 'PREPARING' || o.status === 'PLACED');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  const handleTestChime = () => {
    playChime('orderReady');
  };

  return (
    <div className="flex flex-col w-full pb-36 max-w-5xl mx-auto">
      {/* Operations Control & Role Bar (from Stitch) */}
      <div className="px-gutter pt-2 pb-3 flex flex-col gap-space-sm bg-surface-container-low dark:bg-[#1A1A1A] border-b border-surface-container-high/60 dark:border-white/5">
        <div className="flex items-center justify-between gap-space-xs flex-wrap">
          {/* Mode Switcher Pill Group */}
          <div className="inline-flex p-1 bg-surface-container-highest dark:bg-[#242424] rounded-full">
            <button
              type="button"
              onClick={() => switchRole('STAFF')}
              className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-bold transition-all ${
                role === 'STAFF'
                  ? 'bg-surface dark:bg-[#121212] text-on-surface dark:text-white shadow-sm'
                  : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface'
              }`}
            >
              Kitchen KDS
            </button>
            <button
              type="button"
              onClick={() => switchRole('STAFF')}
              className="px-3 py-1 rounded-full font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 hover:text-on-surface transition-all"
            >
              Cashier POS
            </button>
            <button
              type="button"
              onClick={() => switchRole('ADMIN')}
              className="px-3 py-1 rounded-full font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 hover:text-on-surface transition-all"
            >
              Admin
            </button>
          </div>

          {/* Rush / State Toggle Button */}
          <button
            type="button"
            onClick={toggleRushMode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-transform active:scale-95 shadow-sm border ${
              metrics.rushMode
                ? 'bg-error-container text-on-error-container border-error/30'
                : 'bg-secondary-container dark:bg-emerald-950/60 text-on-secondary-container dark:text-emerald-300 border-secondary/20'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                metrics.rushMode ? 'bg-error animate-ping' : 'bg-secondary dark:bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="font-label-sm text-label-sm font-bold">
              {metrics.rushMode ? 'High Rush (Paused)' : 'Accepting Orders'}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Station Callout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Soup className="w-5 h-5 text-primary dark:text-[#f08344]" />
            <span className="font-label-md text-label-md text-on-surface dark:text-white font-bold tracking-tight">
              Counter 2 • Hot Meals &amp; Beverages
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-tertiary dark:text-neutral-400">
            Live Dispatch Active
          </span>
        </div>

        {/* High Density Metric Strip */}
        <MetricStrip />
      </div>

      {/* Low Stock Alert Banner (from Stitch) */}
      <div className="px-gutter pt-3">
        <div className="flex items-center justify-between gap-space-sm p-3 rounded-2xl bg-error-container text-on-error-container shadow-sm border border-error/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 animate-bounce" />
            <div className="flex flex-col min-w-0">
              <p className="font-label-md text-label-md font-bold truncate">
                Low Stock: Cold Brew Beans &amp; Samosa
              </p>
              <p className="font-body-sm text-body-sm text-on-error-container/80 truncate">
                8 coffee servings remaining • Samosa: 14 pcs • Rice: 45kg (Healthy)
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-error text-on-error font-label-sm text-label-sm font-bold shadow-sm transition-transform active:scale-95"
          >
            Manage Stock
          </button>
        </div>
      </div>

      {/* Quick Kitchen Filter Bar */}
      <div className="px-gutter pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold shadow-sm transition-colors ${
              filter === 'ALL'
                ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black'
                : 'bg-surface-container-high dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300'
            }`}
          >
            All Tickets ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PREP')}
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold shadow-sm transition-colors ${
              filter === 'PREP'
                ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black'
                : 'bg-surface-container-high dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300'
            }`}
          >
            In Preparation ({preparingOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('READY')}
            className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold shadow-sm transition-colors ${
              filter === 'READY'
                ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black'
                : 'bg-surface-container-high dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300'
            }`}
          >
            Ready at Counter ({readyOrders.length})
          </button>
        </div>

        <button
          type="button"
          onClick={handleTestChime}
          title="Test Kitchen Bell Chime"
          className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-[#242424] flex items-center justify-center text-on-surface dark:text-white hover:bg-surface-container-highest"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Stream Kitchen Lanes (from Stitch) */}
      <div className="px-gutter flex flex-col md:grid md:grid-cols-2 gap-space-lg pt-2">
        {/* LANE 1: IN PREPARATION */}
        {(filter === 'ALL' || filter === 'PREP') && (
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-container" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white tracking-tight">
                  In Preparation
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed dark:bg-primary-fixed/20 text-on-primary-fixed-variant dark:text-amber-300 font-label-sm text-label-sm font-bold">
                {preparingOrders.length} Active
              </span>
            </div>

            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl text-sm text-tertiary dark:text-neutral-400">
                No orders currently in prep queue.
              </div>
            ) : (
              preparingOrders.map((order) => (
                <KitchenTicketCard key={order.id} order={order} />
              ))
            )}
          </section>
        )}

        {/* LANE 2: READY FOR COLLECTION */}
        {(filter === 'ALL' || filter === 'READY') && (
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white tracking-tight">
                  Ready for Collection
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed dark:bg-emerald-950/40 text-on-secondary-fixed-variant dark:text-emerald-300 font-label-sm text-label-sm font-bold">
                {readyOrders.length} At Counter
              </span>
            </div>

            {readyOrders.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low dark:bg-[#1A1A1A] rounded-2xl text-sm text-tertiary dark:text-neutral-400">
                No tickets waiting at dispatch bay.
              </div>
            ) : (
              readyOrders.map((order) => (
                <KitchenTicketCard key={order.id} order={order} />
              ))
            )}
          </section>
        )}
      </div>

      {/* Operational Floating Action Bar for Fast Operations (from Stitch) */}
      <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto pointer-events-none">
        <div className="p-2.5 rounded-2xl bg-inverse-surface/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md shadow-2xl flex items-center justify-between text-inverse-on-surface dark:text-white pointer-events-auto border border-white/10">
          <div className="flex items-center gap-2.5 px-2">
            <Timer className="w-5 h-5 text-primary-fixed-dim" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-bold leading-tight">
                Average Lead Time
              </span>
              <span className="font-numeric-data text-[12px] text-tertiary-fixed">
                5m 42s per order
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={simulateIncomingOrder}
            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow-md hover:brightness-105 active:scale-95 flex items-center gap-1.5 transition-transform"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

