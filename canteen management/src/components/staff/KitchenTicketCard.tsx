import React from 'react';
import { Order } from '@/types';
import { useOrders } from '@/contexts/OrderContext';
import { Printer, CheckCircle2, Flame, PackageCheck, Clock, AlertTriangle } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { playChime } from '@/lib/sound';

interface KitchenTicketCardProps {
  order: Order;
  onStatusChange?: () => void;
}

export const KitchenTicketCard: React.FC<KitchenTicketCardProps> = ({ order, onStatusChange }) => {
  const { updateOrderStatus } = useOrders();

  const isPlaced = order.status === 'PLACED';
  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';

  const handleStartPrep = async () => {
    await updateOrderStatus(order.id, 'PREPARING');
    onStatusChange?.();
  };

  const handleMarkReady = async () => {
    await updateOrderStatus(order.id, 'READY');
    playChime('orderReady');
    onStatusChange?.();
  };

  const handleCollected = async () => {
    await updateOrderStatus(order.id, 'COLLECTED');
    onStatusChange?.();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <article
      className={`p-3.5 rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] shadow-md flex flex-col gap-space-sm relative overflow-hidden transition-all duration-300 border ${
        isReady
          ? 'border-secondary/40 dark:border-emerald-500/30'
          : isPreparing
          ? 'border-primary/40 dark:border-[#f08344]/30'
          : 'border-surface-container-high/80 dark:border-white/5'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl ${
              isReady
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-inverse-surface dark:bg-black text-inverse-on-surface'
            }`}
          >
            <span className="font-label-sm text-[10px] tracking-widest uppercase opacity-75">
              {isReady ? 'READY' : 'TOKEN'}
            </span>
            <span className="font-token-callout-mobile text-token-callout-mobile font-bold tracking-tight">
              #{order.tokenNumber}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-label-sm text-label-sm font-bold ${
                  isReady ? 'text-secondary dark:text-emerald-400' : 'text-primary dark:text-[#f08344]'
                }`}
              >
                {order.counterId} • {order.counterBay}
              </span>
              <span className="w-1 h-1 rounded-full bg-tertiary-container" />
              <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 font-medium">
                {formatTime(order.createdAt)}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400">
              {order.userName} ({order.userStudentId || 'STD'}) • {order.diningType}
            </span>
          </div>
        </div>

        {isReady && <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />}
        {isPreparing && <Clock className="w-5 h-5 text-primary animate-pulse" />}
      </div>

      {/* Items Breakdown */}
      <div className="p-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] flex flex-col gap-2 border border-surface-container-high/40 dark:border-white/5">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between font-label-md text-label-md text-on-surface dark:text-neutral-200 font-semibold"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary dark:text-[#f08344] flex items-center justify-center font-bold text-xs">
                {item.quantity}
              </span>
              <span>{item.name}</span>
            </span>
            {item.specialInstructions ? (
              <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-label-sm text-[10px] font-bold">
                DIET MOD
              </span>
            ) : (
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 font-normal">
                Standard
              </span>
            )}
          </div>
        ))}

        {order.notes && (
          <div className="mt-1 pt-1.5 border-t border-surface-container-high/60 dark:border-white/5 text-xs text-primary dark:text-[#f08344] font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Note: {order.notes}</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handlePrint}
          aria-label="Print kitchen ticket slip"
          className="w-11 h-11 rounded-xl bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-neutral-300 flex items-center justify-center hover:bg-surface-container-highest transition-colors active:scale-95"
        >
          <Printer className="w-5 h-5" />
        </button>

        {isPlaced && (
          <button
            type="button"
            onClick={handleStartPrep}
            className="flex-1 h-11 px-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 hover:brightness-105"
          >
            <Flame className="w-5 h-5" />
            <span>START PREPARATION</span>
          </button>
        )}

        {isPreparing && (
          <button
            type="button"
            onClick={handleMarkReady}
            className="flex-1 h-11 px-4 rounded-xl bg-secondary text-on-secondary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 hover:brightness-105"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>MARK READY ({order.counterId})</span>
          </button>
        )}

        {isReady && (
          <button
            type="button"
            onClick={handleCollected}
            className="flex-1 h-11 px-4 rounded-xl bg-surface-variant dark:bg-[#2b2b2b] text-on-surface dark:text-white font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary hover:text-on-secondary transition-all active:scale-98"
          >
            <PackageCheck className="w-5 h-5" />
            <span>COLLECTED / DISPATCH</span>
          </button>
        )}
      </div>
    </article>
  );
};

