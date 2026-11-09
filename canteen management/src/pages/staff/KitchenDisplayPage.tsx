import React, { useState } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { playChime } from '@/lib/sound';
import { Maximize2, Minimize2, Volume2, Sparkles, CheckCircle, Clock } from 'lucide-react';

export const KitchenDisplayPage: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const preparingOrders = orders.filter((o) => o.status === 'PREPARING' || o.status === 'PLACED');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAdvanceToReady = async (orderId: string) => {
    await updateOrderStatus(orderId, 'READY');
    playChime('orderReady');
  };

  const handleAdvanceToCollected = async (orderId: string) => {
    await updateOrderStatus(orderId, 'COLLECTED');
    playChime('click');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col p-4 sm:p-6 select-none">
      {/* Top KDS Header */}
      <header className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-sora font-extrabold text-xl shadow-lg">
            TB
          </div>
          <div>
            <h1 className="font-sora text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>CAMPUS KITCHEN DISPLAY</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-600/30 text-orange-400 border border-orange-500/30 font-bold">
                LIVE KDS
              </span>
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Counter 1 &amp; 2 • High Contrast Display Mode
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => playChime('orderReady')}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Test Chime</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
        </div>
      </header>

      {/* Main High-Contrast Split Grid (PREPARING vs READY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* PREPARING COLUMN */}
        <section className="flex flex-col bg-neutral-900/80 rounded-3xl p-5 border-2 border-orange-600/40 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-orange-500 animate-pulse" />
              <h2 className="font-sora text-2xl sm:text-3xl font-black tracking-wide text-orange-400">
                PREPARING ({preparingOrders.length})
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              TAP TO MARK READY
            </span>
          </div>

          <div className="flex flex-col gap-4 mt-4 overflow-y-auto flex-1 max-h-[75vh]">
            {preparingOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-neutral-500 font-mono text-sm">
                NO ORDERS CURRENTLY COOKING
              </div>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleAdvanceToReady(order.id)}
                  className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-orange-500/80 cursor-pointer transition-all active:scale-[0.99] group shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-sora text-4xl sm:text-5xl font-black text-orange-400 tracking-tight">
                        {order.tokenNumber}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">
                          {order.counterId} • {order.diningType}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">
                          {order.userName} ({order.userStudentId || 'STD'})
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-orange-950/80 text-orange-300 border border-orange-700/50 text-xs font-bold font-mono group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      DONE &rarr; READY
                    </div>
                  </div>

                  {/* Food Items in giant high-contrast typography */}
                  <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-col gap-1.5 font-mono">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-base sm:text-lg">
                        <span className="text-white font-bold">
                          <span className="text-orange-400 font-black">{item.quantity}×</span>{' '}
                          {item.name}
                        </span>
                        {item.specialInstructions && (
                          <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-700 font-bold">
                            MOD: {item.specialInstructions}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* READY COLUMN */}
        <section className="flex flex-col bg-neutral-900/80 rounded-3xl p-5 border-2 border-emerald-600/40 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="font-sora text-2xl sm:text-3xl font-black tracking-wide text-emerald-400">
                READY ({readyOrders.length})
              </h2>
            </div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              TAP TO DISPATCH
            </span>
          </div>

          <div className="flex flex-col gap-4 mt-4 overflow-y-auto flex-1 max-h-[75vh]">
            {readyOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-neutral-500 font-mono text-sm">
                NO TICKETS WAITING AT PICKUP COUNTER
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleAdvanceToCollected(order.id)}
                  className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/80 cursor-pointer transition-all active:scale-[0.99] group shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-sora text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                        {order.tokenNumber}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">
                          Ready @ {order.counterBay}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">
                          {order.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 text-xs font-bold font-mono group-hover:bg-neutral-800 group-hover:text-white transition-colors">
                      COLLECTED &check;
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

