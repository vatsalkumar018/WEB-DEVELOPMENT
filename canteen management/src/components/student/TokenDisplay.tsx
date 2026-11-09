import React from 'react';
import { Order } from '@/types';
import { playChime } from '@/lib/sound';
import { Volume2, User, QrCode, Timer, Bell, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TokenDisplayProps {
  order: Order;
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ order }) => {
  const isReady = order.status === 'READY';
  const isCooking = order.status === 'PREPARING';
  const isCollected = order.status === 'COLLECTED';

  const handleTestRing = () => {
    playChime('orderReady');
  };

  return (
    <div className="flex flex-col gap-space-md">
      {/* Ready Alert Callout Ping Banner */}
      {isReady && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-secondary p-space-md text-on-secondary shadow-lg transition-all duration-300 flex flex-col gap-space-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-fixed" />
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed font-bold">
                {order.counterId} Call-Out Alert
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping" />
              <span className="font-label-sm text-[10px] text-secondary-fixed uppercase">
                Haptic Active
              </span>
            </div>
          </div>

          <div className="flex items-start gap-space-sm pt-1">
            <div className="p-2.5 bg-secondary-fixed text-on-secondary-fixed rounded-xl flex items-center justify-center shadow-sm">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="font-headline-sm text-headline-sm text-on-secondary leading-tight">
                Order Ready for Collection!
              </h2>
              <p className="font-body-sm text-body-sm text-on-secondary/90 pt-0.5">
                Please head over to{' '}
                <span className="font-bold underline decoration-secondary-fixed">
                  {order.counterBay || 'Pickup Bay 2'}
                </span>{' '}
                and flash your digital token.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t-0 bg-black/10 -mx-space-md -mb-space-md px-space-md py-2">
            <span className="font-label-sm text-label-sm text-secondary-fixed">
              Token Call: Audio Chime Synced
            </span>
            <button
              type="button"
              onClick={handleTestRing}
              className="flex items-center gap-1.5 text-on-secondary hover:text-secondary-fixed font-label-sm text-label-sm transition-colors bg-white/10 px-2.5 py-1 rounded-full active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Ring</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Giant Ticket Token Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-2xl shadow-md p-space-md flex flex-col gap-space-md overflow-hidden border border-surface-container-high/80 dark:border-white/10"
      >
        {/* Subtle Top Ticket Notches */}
        <div className="flex justify-between items-center pb-1">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 uppercase tracking-wider font-semibold">
              Campus Live Token
            </span>
            <span className="font-body-sm text-body-sm text-tertiary dark:text-neutral-500">
              Session: #{order.orderNumber}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-secondary-container/70 dark:bg-emerald-950/60 border border-secondary/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary dark:bg-emerald-400 animate-pulse" />
            <span className="font-label-sm text-label-sm text-on-secondary-container dark:text-emerald-300 font-semibold">
              Priority Fast-Track
            </span>
          </div>
        </div>

        {/* Massive Token Number & Monospace Centerpiece */}
        <div
          className={`flex flex-col items-center justify-center py-6 px-space-md rounded-2xl relative border-2 border-dashed ${
            isReady
              ? 'bg-secondary-container/20 border-secondary'
              : 'bg-surface-container-low dark:bg-[#242424] border-primary/30'
          }`}
        >
          <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400 uppercase font-bold tracking-wider">
            Digital Token Display
          </span>

          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="flex items-baseline justify-center gap-1 my-2"
          >
            <span
              className={`font-sora text-6xl sm:text-7xl font-black tracking-tight ${
                isReady
                  ? 'text-secondary dark:text-emerald-400'
                  : 'text-primary dark:text-[#f08344]'
              }`}
            >
              {order.tokenNumber}
            </span>
          </motion.div>

          <div className="flex items-center gap-space-xs text-on-surface-variant dark:text-neutral-300 font-body-sm text-body-sm">
            <User className="w-4 h-4 text-primary" />
            <span className="font-semibold text-on-surface dark:text-white">{order.userName}</span>
            <span className="text-tertiary dark:text-neutral-400">
              ({order.userStudentId || 'Campus Student'})
            </span>
          </div>

          {/* Security QR Stamp Code Graphic */}
          <div className="mt-4 p-2.5 bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-xl shadow-sm flex items-center gap-3 border border-surface-container-high/60 dark:border-white/5">
            <div className="w-12 h-12 bg-on-surface dark:bg-white text-surface dark:text-black flex items-center justify-center rounded-lg p-1">
              <QrCode className="w-9 h-9" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-label-sm text-label-sm text-on-surface dark:text-white font-semibold">
                Self-Service Counter Kiosk QR
              </span>
              <span className="font-body-sm text-[11px] text-tertiary dark:text-neutral-400">
                Scan at pickup gantry to confirm receipt
              </span>
            </div>
          </div>
        </div>

        {/* Live Preparation Progress Meter */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-primary" />
              <span className="font-label-md text-label-md text-on-surface dark:text-neutral-200 font-semibold">
                Estimated Kitchen Prep
              </span>
            </div>
            <span className="font-numeric-data text-numeric-data text-primary dark:text-[#f08344] font-bold">
              {isReady
                ? 'Ready for pickup!'
                : isCollected
                ? 'Order Collected'
                : `~${order.estimatedTimeMinutes} mins remaining`}
            </span>
          </div>

          <div className="w-full bg-surface-container-high dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: isCollected ? '100%' : isReady ? '100%' : isCooking ? '70%' : '25%',
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${isReady ? 'bg-secondary' : 'bg-primary-container'}`}
            />
          </div>

          <div className="flex justify-between items-center text-tertiary dark:text-neutral-400 font-body-sm text-[11px]">
            <span>Assigned to {order.counterId}</span>
            <span>Average Wait: ~8 mins</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

