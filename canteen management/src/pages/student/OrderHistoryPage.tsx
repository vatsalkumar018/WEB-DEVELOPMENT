import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Order } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import {
  Receipt,
  RotateCcw,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const { orders } = useOrders();
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  // Filter orders for current student or show campus orders
  const userOrders = orders.filter(
    (o) => !user || o.userId === user.id || o.userId === 'std-1'
  );

  const handleReorder = (order: Order) => {
    // Add all items from this order into cart
    order.items.forEach((item) => {
      // Find full menuItem or construct fallback
      addToCart(
        {
          id: item.menuItemId,
          name: item.name,
          category: 'MEALS',
          description: '',
          price: item.unitPrice,
          imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuARE2Qk8KYiO1LvTodv4jU9THsa_hYfTZKCowcbyVX_175LfDoc4DPhqtNL99OXDlHfzNz7mHtlWZbweruj9wLDPYZfd3Gs22DeStBq4Z1zcxkZHJJfFvvg3bzSPdhM-yt2egGt8FrSp5LwodQH1VzyWNKIFc_YV2S8Z3BgmaQFoALVD8jHqogks_VweR1W7_hLRinE2DfzHlNOQ2b9k6vfhefC7WcMZdFcdI27eUAg',
          isAvailable: true,
          servingSlots: ['ALL_DAY'],
          preparationTimeMinutes: 5,
          isVeg: true,
          rating: 4.8,
          ratingCount: 100,
          ingredients: [],
        },
        item.quantity,
        item.selectedAddOns
      );
    });
    setIsCartOpen(true);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'COLLECTED':
        return (
          <span className="px-2 py-0.5 rounded-full bg-secondary-container dark:bg-emerald-950/60 text-secondary dark:text-emerald-300 font-label-sm text-[11px] font-bold">
            Collected
          </span>
        );
      case 'READY':
        return (
          <span className="px-2 py-0.5 rounded-full bg-secondary text-white font-label-sm text-[11px] font-bold animate-pulse">
            Ready @ Counter
          </span>
        );
      case 'PREPARING':
        return (
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed dark:bg-primary-fixed/20 text-on-primary-fixed-variant dark:text-amber-300 font-label-sm text-[11px] font-bold">
            In Preparation
          </span>
        );
      case 'PLACED':
        return (
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-neutral-300 font-label-sm text-[11px] font-bold">
            Order Placed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-surface-container dark:bg-neutral-800 text-tertiary font-label-sm text-[11px]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full pb-32 max-w-2xl mx-auto px-gutter pt-space-sm gap-space-md">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">
          Order History
        </h1>
        <span className="text-xs font-semibold text-tertiary dark:text-neutral-400">
          {userOrders.length} records
        </span>
      </div>

      {userOrders.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl border border-surface-container-high/60 dark:border-white/5 flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container dark:bg-[#242424] flex items-center justify-center text-tertiary mb-3">
            <Receipt className="w-8 h-8 opacity-40" />
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white font-bold">
            No Orders Placed Yet
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-neutral-400 mt-1 max-w-sm">
            Once you order from the campus canteen, your digital tickets and receipts will appear here.
          </p>
          <Link
            to="/menu"
            className="mt-6 px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-md hover:brightness-105 transition-all inline-flex items-center gap-2"
          >
            <span>Explore Menu &amp; Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {userOrders.map((order) => (
            <article
              key={order.id}
              className="p-4 rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-inverse-surface dark:bg-black text-inverse-on-surface flex flex-col items-center justify-center">
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">
                      TOKEN
                    </span>
                    <span className="font-sora font-extrabold text-base tracking-tight">
                      #{order.tokenNumber}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md font-bold text-on-surface dark:text-white">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-xs text-on-surface-variant dark:text-neutral-400 mt-0.5">
                      {formatDate(order.createdAt)} at {formatTime(order.createdAt)} • {order.diningType}
                    </span>
                  </div>
                </div>

                <span className="font-numeric-data text-lg font-bold text-primary dark:text-[#f08344]">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>

              {/* Items List */}
              <div className="p-3 rounded-xl bg-surface-container-low dark:bg-[#242424] text-xs flex flex-col gap-1 border border-surface-container-high/40 dark:border-white/5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-on-surface dark:text-neutral-200">
                    <span className="font-medium">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-numeric-data text-tertiary dark:text-neutral-400">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-tertiary dark:text-neutral-400">
                  Paid via {order.paymentMethod}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container dark:bg-[#242424] text-on-surface dark:text-neutral-200 font-label-sm text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>
                  <Link
                    to={`/orders/${order.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-sm text-xs font-bold shadow-sm hover:brightness-105 transition-all flex items-center gap-1"
                  >
                    <span>View Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

