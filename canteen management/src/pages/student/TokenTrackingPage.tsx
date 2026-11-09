import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { orderService } from '@/services/orderService';
import { Order } from '@/types';
import { TokenDisplay } from '@/components/student/TokenDisplay';
import { StatusStepper } from '@/components/student/StatusStepper';
import { FeedbackModal } from '@/components/student/FeedbackModal';
import {
  ChevronDown,
  Receipt,
  Star,
  RotateCcw,
  ArrowLeft,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const TokenTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderById, activeOrder } = useOrders();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  useEffect(() => {
    // If specific order ID provided in route
    const targetId = id || activeOrder?.id || 'ord-142';
    const unsub = orderService.subscribeToOrder(targetId, (updated) => {
      setOrder(updated);
    });

    return () => {
      unsub();
    };
  }, [id, activeOrder]);

  if (!order) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-tertiary mb-3 opacity-50" />
        <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
          Order Not Found
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 mt-1">
          We could not locate this active token. Check your order history.
        </p>
        <Link
          to="/orders"
          className="mt-4 px-4 py-2 rounded-full bg-primary text-white font-label-sm font-bold shadow-sm"
        >
          View Order History
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-36 max-w-xl mx-auto px-gutter pt-space-sm gap-space-md">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/student')}
          className="w-9 h-9 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container-highest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex flex-col text-center">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant dark:text-neutral-400 font-bold">
            Live Ticket Status
          </span>
          <span className="font-numeric-data text-xs text-primary dark:text-[#f08344] font-semibold">
            Token #{order.tokenNumber}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Token ${order.tokenNumber} - Token & Bite`,
                text: `My campus meal token is ${order.tokenNumber} at ${order.counterId}`,
                url: window.location.href,
              });
            }
          }}
          className="w-9 h-9 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container-highest transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Dominant Token Display Component (Matching Stitch) */}
      <TokenDisplay order={order} />

      {/* Real-time Order Journey Stepper (Matching Stitch) */}
      <StatusStepper order={order} />

      {/* Order Items & Receipt Drawer Accordion */}
      <div className="bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-surface-container-high/60 dark:border-white/5 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="w-full p-space-md flex items-center justify-between text-left hover:bg-surface-container-low dark:hover:bg-[#242424] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary dark:text-[#f08344]" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface dark:text-white font-bold">
                Order Summary ({order.items.length} Items)
              </span>
              <span className="font-body-sm text-body-sm text-tertiary dark:text-neutral-400">
                Total: {formatCurrency(order.totalAmount)} • Txn ID #{order.orderNumber}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-on-surface-variant dark:text-neutral-400 transition-transform duration-300 ${
              isSummaryOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isSummaryOpen && (
          <div className="px-space-md pb-space-md flex flex-col gap-space-sm border-t border-surface-container-high/40 dark:border-white/5 pt-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 bg-surface-container-low dark:bg-[#242424] p-3 rounded-xl border border-surface-container-high/40 dark:border-white/5"
              >
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface dark:text-white font-medium">
                    {item.quantity}× {item.name}
                  </span>
                  {item.selectedAddOns.length > 0 && (
                    <span className="font-body-sm text-[12px] text-primary-container dark:text-[#f08344] font-medium">
                      Custom: {item.selectedAddOns.map((a) => a.name).join(', ')}
                    </span>
                  )}
                  {item.specialInstructions && (
                    <span className="text-[11px] text-tertiary dark:text-neutral-400 italic">
                      "{item.specialInstructions}"
                    </span>
                  )}
                </div>
                <span className="font-numeric-data text-numeric-data text-on-surface dark:text-white font-semibold">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}

            {/* Price Calculations */}
            <div className="pt-2 flex flex-col gap-1 text-on-surface-variant dark:text-neutral-300 font-body-sm text-body-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary dark:text-emerald-400">
                <span>Campus Subsidy Discount</span>
                <span>-₹0.00 (Standard)</span>
              </div>
              <div className="flex justify-between font-bold text-on-surface dark:text-white pt-2 border-t border-surface-container-high dark:border-white/10 text-base">
                <span>Total Paid ({order.paymentMethod})</span>
                <span className="font-numeric-data text-primary dark:text-[#f08344]">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post-Meal Rating & Feedback Preview (from Stitch) */}
      <div className="bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-2xl shadow-sm p-space-md flex flex-col gap-space-sm border border-surface-container-high/60 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary dark:text-[#f08344] fill-current" />
            <h4 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
              Experience Rating
            </h4>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary dark:text-neutral-400">
            Pre-fill anytime
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400">
          Help our Block 4 kitchen team serve campus faster and better!
        </p>

        <button
          type="button"
          onClick={() => setIsFeedbackOpen(true)}
          className="mt-2 w-full py-2.5 px-4 rounded-xl bg-surface-container dark:bg-[#242424] text-on-surface dark:text-white hover:bg-surface-container-high font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Leave Order Feedback</span>
        </button>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        orderId={order.id}
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};

