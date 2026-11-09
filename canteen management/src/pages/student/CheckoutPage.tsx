import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PaymentMethod, DiningType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  CreditCard,
  Banknote,
  UtensilsCrossed,
  Package,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, total, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [diningType, setDiningType] = useState<DiningType>('DINE_IN');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CAMPUS_PAY');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const packagingFee = diningType === 'TAKEAWAY' ? 5 : 0;
  const finalTotal = total + packagingFee;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setErrorMsg('Your tray is empty. Please add items before checking out.');
      return;
    }

    if (paymentMethod === 'CAMPUS_PAY' && user && user.walletBalance < finalTotal) {
      setErrorMsg(
        `Insufficient Campus Wallet balance (Current: ₹${user.walletBalance.toFixed(
          2
        )}). Please select UPI or Cash, or top up your wallet in Profile.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const order = await placeOrder({
        items,
        paymentMethod,
        diningType,
        notes: notes.trim() || undefined,
      });

      // Clear cart
      clearCart();

      // Navigate to live token experience
      navigate(`/orders/${order.id}`);
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="flex flex-col w-full pb-32 max-w-xl mx-auto px-gutter pt-space-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container-highest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">
          Review &amp; Checkout
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3.5 mb-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-start gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-error mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Dining Type Preference */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-2.5">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant dark:text-neutral-400 font-bold">
            Dining Preference
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDiningType('DINE_IN')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                diningType === 'DINE_IN'
                  ? 'bg-primary-container text-on-primary-container border-primary-container font-bold shadow-sm'
                  : 'bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-neutral-300 border-surface-container-high dark:border-white/5'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('dineIn')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDiningType('TAKEAWAY')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                diningType === 'TAKEAWAY'
                  ? 'bg-primary-container text-on-primary-container border-primary-container font-bold shadow-sm'
                  : 'bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-neutral-300 border-surface-container-high dark:border-white/5'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('takeaway')}</span>
            </button>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant dark:text-neutral-400 font-bold">
              {t('paymentMethod')}
            </span>
            {paymentMethod === 'CAMPUS_PAY' && user && (
              <span className="text-xs font-numeric-data text-secondary dark:text-emerald-400 font-semibold">
                Balance: ₹{user.walletBalance.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              onClick={() => setPaymentMethod('CAMPUS_PAY')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'CAMPUS_PAY'
                  ? 'bg-primary-fixed/20 dark:bg-primary-fixed-dim/20 border-primary text-on-surface dark:text-white'
                  : 'bg-surface-container-low dark:bg-[#242424] border-surface-container-high dark:border-white/5 text-on-surface dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary dark:text-[#f08344]" />
                <div>
                  <p className="font-label-md text-label-md font-bold">{t('campusPay')}</p>
                  <p className="font-body-sm text-[11px] text-tertiary dark:text-neutral-400">
                    Instant deduction • Zero processing fees
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'CAMPUS_PAY'
                    ? 'border-primary bg-primary text-white'
                    : 'border-surface-container-highest dark:border-neutral-600'
                }`}
              >
                {paymentMethod === 'CAMPUS_PAY' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </label>

            <label
              onClick={() => setPaymentMethod('UPI')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'UPI'
                  ? 'bg-primary-fixed/20 dark:bg-primary-fixed-dim/20 border-primary text-on-surface dark:text-white'
                  : 'bg-surface-container-low dark:bg-[#242424] border-surface-container-high dark:border-white/5 text-on-surface dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-secondary dark:text-emerald-400" />
                <div>
                  <p className="font-label-md text-label-md font-bold">{t('upi')}</p>
                  <p className="font-body-sm text-[11px] text-tertiary dark:text-neutral-400">
                    Google Pay, PhonePe, Paytm QR
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'UPI'
                    ? 'border-primary bg-primary text-white'
                    : 'border-surface-container-highest dark:border-neutral-600'
                }`}
              >
                {paymentMethod === 'UPI' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </label>

            <label
              onClick={() => setPaymentMethod('CASH_AT_COUNTER')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'CASH_AT_COUNTER'
                  ? 'bg-primary-fixed/20 dark:bg-primary-fixed-dim/20 border-primary text-on-surface dark:text-white'
                  : 'bg-surface-container-low dark:bg-[#242424] border-surface-container-high dark:border-white/5 text-on-surface dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-tertiary dark:text-neutral-400" />
                <div>
                  <p className="font-label-md text-label-md font-bold">{t('cashAtCounter')}</p>
                  <p className="font-body-sm text-[11px] text-tertiary dark:text-neutral-400">
                    Pay currency notes directly at Cashier POS
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'CASH_AT_COUNTER'
                    ? 'border-primary bg-primary text-white'
                    : 'border-surface-container-highest dark:border-neutral-600'
                }`}
              >
                {paymentMethod === 'CASH_AT_COUNTER' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </label>
          </div>
        </div>

        {/* Cooking Notes */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-2">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant dark:text-neutral-400 font-bold">
            {t('specialInstructions')}
          </span>
          <input
            type="text"
            placeholder="e.g. deliver to Table 14, less ice in coffee"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Order Items Summary Drawer */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-2.5">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant dark:text-neutral-400 font-bold">
            Items in Order ({items.length})
          </span>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center justify-between text-sm py-1 border-b border-surface-container-high/40 dark:border-white/5 last:border-none"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-on-surface dark:text-white">
                    {item.quantity}× {item.menuItem.name}
                  </span>
                  {item.selectedAddOns.length > 0 && (
                    <span className="text-[11px] text-tertiary dark:text-neutral-400">
                      Add-ons: {item.selectedAddOns.map((a) => a.name).join(', ')}
                    </span>
                  )}
                </div>
                <span className="font-numeric-data font-semibold text-on-surface dark:text-white">
                  {formatCurrency(item.itemTotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-2 border-t border-surface-container-high dark:border-white/10 flex flex-col gap-1 text-xs text-on-surface-variant dark:text-neutral-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-numeric-data font-medium text-on-surface dark:text-white">
                {formatCurrency(subtotal)}
              </span>
            </div>
            {packagingFee > 0 && (
              <div className="flex justify-between">
                <span>Takeaway Packaging</span>
                <span className="font-numeric-data font-medium text-on-surface dark:text-white">
                  +₹5.00
                </span>
              </div>
            )}
            <div className="flex justify-between text-secondary dark:text-emerald-400">
              <span>Campus Subsidy Discount</span>
              <span>-₹0.00</span>
            </div>
            <div className="flex justify-between font-bold text-base text-on-surface dark:text-white pt-2 border-t border-surface-container-high dark:border-white/10">
              <span>Total to Pay</span>
              <span className="font-numeric-data text-primary dark:text-[#f08344]">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Order Button */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handlePlaceOrder}
          className="w-full py-4 px-6 rounded-2xl bg-primary-container text-on-primary-container font-sora font-bold text-base shadow-xl hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Campus Token...</span>
            </>
          ) : (
            <>
              <span>Confirm &amp; Generate Token</span>
              <span>•</span>
              <span className="font-numeric-data">{formatCurrency(finalTotal)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

