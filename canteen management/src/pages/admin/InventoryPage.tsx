import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventoryService';
import { InventoryItem } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [restockItemId, setRestockItemId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  const loadInventory = async () => {
    const list = await inventoryService.getAllItems();
    setItems(list);
  };

  useEffect(() => {
    loadInventory();
    const handleUpdate = () => loadInventory();
    window.addEventListener('tb_inventory_updated', handleUpdate);
    return () => window.removeEventListener('tb_inventory_updated', handleUpdate);
  }, []);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItemId) return;
    await inventoryService.restockItem(restockItemId, restockQty);
    setRestockItemId(null);
    loadInventory();
  };

  const filteredItems = items.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const healthyCount = items.filter((i) => i.status === 'HEALTHY').length;
  const lowStockCount = items.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStockCount = items.filter((i) => i.status === 'OUT_OF_STOCK').length;

  return (
    <div className="flex flex-col w-full pb-32 max-w-5xl mx-auto px-gutter pt-space-sm gap-space-md">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="w-9 h-9 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container-highest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">
              Inventory &amp; Ingredient Stock
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400">
              Track raw food supplies, minimum safety thresholds &amp; restock schedules
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadInventory()}
          className="px-3.5 py-2 rounded-xl bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-white text-xs font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Stock Health Badges Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div
          onClick={() => setStatusFilter('HEALTHY')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'HEALTHY'
              ? 'bg-secondary-container/40 border-secondary'
              : 'bg-surface-container-lowest dark:bg-[#1A1A1A] border-surface-container-high dark:border-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary dark:text-emerald-400" />
            <span className="text-xs font-bold text-on-surface dark:text-white uppercase">
              Healthy
            </span>
          </div>
          <span className="font-sora text-2xl font-black text-secondary dark:text-emerald-400 mt-1 block">
            {healthyCount}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'LOW_STOCK'
              ? 'bg-amber-500/20 border-amber-500'
              : 'bg-surface-container-lowest dark:bg-[#1A1A1A] border-surface-container-high dark:border-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-on-surface dark:text-white uppercase">
              Low Stock
            </span>
          </div>
          <span className="font-sora text-2xl font-black text-amber-500 mt-1 block">
            {lowStockCount}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'bg-error-container/40 border-error'
              : 'bg-surface-container-lowest dark:bg-[#1A1A1A] border-surface-container-high dark:border-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-error" />
            <span className="text-xs font-bold text-on-surface dark:text-white uppercase">
              Out of Stock
            </span>
          </div>
          <span className="font-sora text-2xl font-black text-error mt-1 block">
            {outOfStockCount}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-tertiary dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search raw ingredients by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container-lowest dark:bg-[#1A1A1A] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl border border-surface-container-high/80 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-container-low dark:bg-[#242424] text-on-surface-variant dark:text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-surface-container-high dark:border-white/5">
                <th className="p-4">Ingredient</th>
                <th className="p-4">Category</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Min. Required</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 dark:divide-white/5">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container-low/50 dark:hover:bg-[#222222] transition-colors"
                >
                  <td className="p-4">
                    <span className="font-bold text-on-surface dark:text-white block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-tertiary dark:text-neutral-400">
                      Restocked {formatDate(item.lastRestocked)}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-on-surface-variant dark:text-neutral-300">
                    {item.category}
                  </td>
                  <td className="p-4">
                    <span className="font-numeric-data font-bold text-base text-on-surface dark:text-white">
                      {item.currentStock} {item.unit}
                    </span>
                  </td>
                  <td className="p-4 font-numeric-data text-xs text-tertiary dark:text-neutral-400">
                    {item.minStock} {item.unit}
                  </td>
                  <td className="p-4">
                    {item.status === 'HEALTHY' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container dark:bg-emerald-950/60 text-secondary dark:text-emerald-300 text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        Healthy
                      </span>
                    )}
                    {item.status === 'LOW_STOCK' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Low Stock
                      </span>
                    )}
                    {item.status === 'OUT_OF_STOCK' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error" />
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setRestockItemId(item.id);
                        setRestockQty(10);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-surface-container dark:bg-[#242424] text-primary dark:text-[#f08344] hover:bg-primary-container hover:text-white font-label-sm text-xs font-bold transition-all shadow-sm"
                    >
                      + Refill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Dialog */}
      {restockItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setRestockItemId(null)}
          />
          <div className="relative w-full max-w-sm bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl z-10 border border-surface-container-high dark:border-white/10">
            <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-white mb-2">
              Refill Inventory Batch
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-neutral-400 mb-4">
              Add arrived supply quantity to stock ledger.
            </p>

            <form onSubmit={handleRestock} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant dark:text-neutral-300">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockItemId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-surface-container-high dark:border-white/10 text-xs font-semibold text-on-surface dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-bold shadow-md hover:brightness-105"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

