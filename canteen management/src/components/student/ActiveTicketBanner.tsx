import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency, formatTime } from '@/lib/utils';

interface ActiveTicketBannerProps {
  order: Order | null;
}

export const ActiveTicketBanner: React.FC<ActiveTicketBannerProps> = ({ order }) => {
  if (!order) return null;

  const isCooking = order.status === 'PREPARING';
  const isReady = order.status === 'READY';
  const isPlaced = order.status === 'PLACED';

  const itemsSummary = order.items.map((i) => `${i.name} (${i.quantity})`).join(', ');

  return (
    <section className="px-gutter my-space-xs">
      <div className="relative overflow-hidden bg-inverse-surface dark:bg-[#1E1E1E] text-inverse-on-surface rounded-2xl p-space-md shadow-xl border border-white/10">
        {/* Glow Accent */}
        <div
          className={`absolute -right-8 -top-8 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 ${
            isReady ? 'bg-secondary' : 'bg-primary-container'
          }`}
        />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full font-label-sm text-[11px] tracking-wide font-bold uppercase shadow-sm ${
                  isReady
                    ? 'bg-secondary text-on-secondary animate-pulse'
                    : 'bg-primary-container text-on-primary-container'
                }`}
              >
                {isReady ? 'READY AT BAY' : 'ACTIVE TICKET'}
              </span>
              <span className="font-label-sm text-label-sm text-inverse-on-surface/70">
                {order.counterId} • {order.counterBay}
              </span>
            </div>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-token-callout-mobile text-token-callout-mobile text-inverse-on-surface tracking-tight font-extrabold">
                #{order.tokenNumber}
              </span>
              <span
                className={`font-label-sm text-label-sm font-semibold flex items-center gap-1 ${
                  isReady
                    ? 'text-secondary-fixed animate-bounce'
                    : isCooking
                    ? 'text-primary-fixed-dim animate-pulse'
                    : 'text-tertiary-fixed'
                }`}
              >
                ● {isReady ? 'Ready for Pickup' : isCooking ? 'Cooking in Kitchen' : 'Order Placed'}
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-inverse-on-surface/80 mt-1 line-clamp-1 max-w-xs">
              {itemsSummary}
            </p>
          </div>

          <div className="flex flex-col items-end justify-between self-stretch">
            <div className="text-right">
              <span className="font-label-sm text-[10px] uppercase text-inverse-on-surface/60 font-semibold">
                Est. Time
              </span>
              <p
                className={`font-numeric-data text-numeric-data font-bold leading-tight ${
                  isReady ? 'text-secondary-fixed' : 'text-primary-fixed'
                }`}
              >
                {isReady ? 'Now' : `~${order.estimatedTimeMinutes || 6} mins`}
              </p>
            </div>

            <Link
              to={`/orders/${order.id}`}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 active:scale-95 transition-all text-inverse-on-surface rounded-full font-label-md text-label-md border border-white/10"
            >
              <span>Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Perforated Tear-Line Illusion */}
        <div className="mt-space-sm pt-2 flex items-center justify-between opacity-30">
          <div className="h-[1px] w-full border-t border-dashed border-inverse-on-surface" />
        </div>

        <div className="mt-2 flex items-center justify-between text-inverse-on-surface/70 text-xs">
          <span className="font-label-sm text-label-sm">
            Placed at {formatTime(order.createdAt)} • {order.diningType}
          </span>
          <span className="font-numeric-data text-numeric-data font-bold text-white">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>
    </section>
  );
};

