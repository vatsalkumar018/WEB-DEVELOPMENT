import React from 'react';
import { Order } from '@/types';
import { Check, CookingPot, Utensils, CheckCheck, Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface StatusStepperProps {
  order: Order;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({ order }) => {
  const isPlaced = order.status === 'PLACED';
  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';
  const isCollected = order.status === 'COLLECTED';

  // Determine stage levels: 1 = Placed, 2 = Paid, 3 = Preparing, 4 = Ready, 5 = Collected
  const currentStage = isCollected ? 5 : isReady ? 4 : isPreparing ? 3 : 1;

  return (
    <div className="bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-2xl shadow-sm p-space-md flex flex-col gap-space-md border border-surface-container-high/60 dark:border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">
          Live Order Journey
        </h3>
        <span className="px-2.5 py-0.5 bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300 font-label-sm text-label-sm rounded-full">
          Automated Realtime Link
        </span>
      </div>

      <div className="flex flex-col gap-space-md relative pl-2">
        {/* Step 1: Placed */}
        <div className="flex items-start gap-space-md relative">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm z-10">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="w-0.5 h-10 bg-secondary mt-1" />
          </div>
          <div className="flex flex-col pt-0.5">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface dark:text-white font-bold">
                Order Received
              </span>
              <span className="font-body-sm text-body-sm text-tertiary dark:text-neutral-400">
                {formatTime(order.createdAt)}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400">
              Ticket assigned to Kitchen Display Counter 2
            </span>
          </div>
        </div>

        {/* Step 2: Payment Done */}
        <div className="flex items-start gap-space-md relative">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-sm z-10">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div
              className={`w-0.5 h-10 mt-1 ${
                currentStage >= 3 ? 'bg-secondary' : 'bg-surface-container-highest dark:bg-neutral-800'
              }`}
            />
          </div>
          <div className="flex flex-col pt-0.5">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface dark:text-white font-bold">
                Paid via {order.paymentMethod === 'CAMPUS_PAY' ? 'Campus Pay' : order.paymentMethod}
              </span>
              <span className="font-body-sm text-body-sm text-secondary dark:text-emerald-400 font-semibold">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400">
              Student digital authentication confirmed
            </span>
          </div>
        </div>

        {/* Step 3: Active Prep Step */}
        <div
          className={`flex items-start gap-space-md relative ${
            currentStage < 3 && 'opacity-60'
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm z-10 ${
                currentStage > 3
                  ? 'bg-secondary text-on-secondary'
                  : currentStage === 3
                  ? 'bg-primary-container text-on-primary-container ring-4 ring-primary-fixed dark:ring-primary-fixed/20 animate-bounce'
                  : 'bg-surface-container-high dark:bg-neutral-800 text-on-surface-variant dark:text-neutral-400'
              }`}
            >
              {currentStage > 3 ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <CookingPot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`w-0.5 h-12 mt-1 ${
                currentStage >= 4 ? 'bg-secondary' : 'bg-surface-container-highest dark:bg-neutral-800'
              }`}
            />
          </div>
          <div className="flex flex-col pt-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`font-label-md text-label-md font-bold ${
                  currentStage === 3
                    ? 'text-primary dark:text-[#f08344]'
                    : 'text-on-surface dark:text-white'
                }`}
              >
                Preparing in Kitchen
              </span>
              {currentStage === 3 && (
                <span className="px-2 py-0.2 rounded-full bg-primary-fixed dark:bg-primary-fixed/20 text-on-primary-fixed-variant dark:text-amber-300 font-label-sm text-[10px] font-bold">
                  In Progress
                </span>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-neutral-400 pt-0.5">
              Kitchen team is currently cooking and assembling your items with fresh ingredients.
            </p>
          </div>
        </div>

        {/* Step 4: Ready at Bay */}
        <div
          className={`flex items-start gap-space-md relative ${
            currentStage < 4 && 'opacity-50'
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                currentStage > 4
                  ? 'bg-secondary text-on-secondary'
                  : currentStage === 4
                  ? 'bg-secondary text-on-secondary ring-4 ring-secondary-fixed animate-pulse'
                  : 'bg-surface-container-high dark:bg-neutral-800 text-on-surface-variant dark:text-neutral-400'
              }`}
            >
              {currentStage > 4 ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Utensils className="w-4 h-4" />
              )}
            </div>
            <div
              className={`w-0.5 h-10 mt-1 ${
                currentStage >= 5 ? 'bg-secondary' : 'bg-surface-container-highest dark:bg-neutral-800'
              }`}
            />
          </div>
          <div className="flex flex-col pt-0.5">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface dark:text-white font-semibold">
                Ready for Pickup
              </span>
              <span className="font-body-sm text-body-sm text-tertiary dark:text-neutral-400">
                {order.counterBay}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-tertiary dark:text-neutral-400">
              {currentStage === 4
                ? 'Your hot tray is ready at the dispatch counter! Flash token to collect.'
                : 'Awaiting completion and counter placement'}
            </span>
          </div>
        </div>

        {/* Step 5: Collected */}
        <div
          className={`flex items-start gap-space-md ${
            currentStage < 5 && 'opacity-40'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
              currentStage === 5
                ? 'bg-secondary text-on-secondary'
                : 'bg-surface-container-high dark:bg-neutral-800 text-on-surface-variant dark:text-neutral-400'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
          </div>
          <div className="flex flex-col pt-0.5">
            <span className="font-label-md text-label-md text-on-surface dark:text-white font-medium">
              Collected &amp; Redeemed
            </span>
            <span className="font-body-sm text-body-sm text-tertiary dark:text-neutral-400">
              {order.collectedAt
                ? `Collected at ${formatTime(order.collectedAt)}`
                : 'Final meal counter verification'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

