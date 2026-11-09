import React, { useState, useEffect } from 'react';
import { menuService } from '@/services/menuService';
import { MenuItem, ItemCategory, MealTimeSlot } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
  AlertTriangle,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MenuManagementPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'ALL'>('ALL');

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Delete confirm dialog
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState<{
    name: string;
    category: ItemCategory;
    price: number;
    description: string;
    imageUrl: string;
    isAvailable: boolean;
    isVeg: boolean;
    preparationTimeMinutes: number;
    servingSlots: MealTimeSlot[];
  }>({
    name: '',
    category: 'MEALS',
    price: 60,
    description: '',
    imageUrl: '',
    isAvailable: true,
    isVeg: true,
    preparationTimeMinutes: 5,
    servingSlots: ['LUNCH'],
  });

  const loadItems = async () => {
    const list = await menuService.getAllItems();
    setItems(list);
  };

  useEffect(() => {
    loadItems();
    const handleUpdate = () => loadItems();
    window.addEventListener('tb_menu_updated', handleUpdate);
    return () => window.removeEventListener('tb_menu_updated', handleUpdate);
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'MEALS',
      price: 60,
      description: '',
      imageUrl:
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isVeg: true,
      preparationTimeMinutes: 5,
      servingSlots: ['LUNCH'],
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      isVeg: item.isVeg,
      preparationTimeMinutes: item.preparationTimeMinutes,
      servingSlots: item.servingSlots,
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await menuService.updateItem(editingItem.id, formData);
    } else {
      await menuService.createItem({
        ...formData,
        rating: 4.8,
        ratingCount: 1,
        ingredients: ['Fresh ingredients'],
      });
    }
    setIsEditModalOpen(false);
    loadItems();
  };

  const handleToggleAvailability = async (id: string) => {
    await menuService.toggleAvailability(id);
    loadItems();
  };

  const confirmDelete = async () => {
    if (deletingItemId) {
      await menuService.deleteItem(deletingItemId);
      setDeletingItemId(null);
      loadItems();
    }
  };

  const toggleServingSlot = (slot: MealTimeSlot) => {
    setFormData((prev) => {
      const exists = prev.servingSlots.includes(slot);
      if (exists) {
        if (prev.servingSlots.length === 1) return prev; // keep at least 1
        return { ...prev, servingSlots: prev.servingSlots.filter((s) => s !== slot) };
      } else {
        return { ...prev, servingSlots: [...prev.servingSlots, slot] };
      }
    });
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full pb-32 max-w-5xl mx-auto px-gutter pt-space-sm gap-space-md">
      {/* Top Bar */}
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
              Menu Management
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400">
              Create, edit prices, set meal timings &amp; toggle availability
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-sm font-bold shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-tertiary dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items to edit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container-lowest dark:bg-[#1A1A1A] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(['ALL', 'MEALS', 'BEVERAGES', 'SNACKS', 'DESSERTS'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-xs transition-colors ${
                categoryFilter === cat
                  ? 'bg-inverse-surface dark:bg-white text-inverse-on-surface dark:text-black font-bold'
                  : 'bg-surface-container dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table / Grid */}
      <div className="bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl border border-surface-container-high/80 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-container-low dark:bg-[#242424] text-on-surface-variant dark:text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-surface-container-high dark:border-white/5">
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Timing Slots</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/60 dark:divide-white/5">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container-low/50 dark:hover:bg-[#222222] transition-colors"
                >
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-surface-container"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-on-surface dark:text-white truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-on-surface-variant dark:text-neutral-400 truncate max-w-xs">
                        {item.description}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-surface-container dark:bg-[#242424] text-xs font-semibold text-on-surface dark:text-neutral-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 font-numeric-data font-bold text-on-surface dark:text-white">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {item.servingSlots.map((slot) => (
                        <span
                          key={slot}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-fixed/30 text-primary-container dark:text-[#f08344]"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-xs font-bold transition-colors ${
                        item.isAvailable
                          ? 'bg-secondary-container dark:bg-emerald-950/60 text-secondary dark:text-emerald-300'
                          : 'bg-error-container text-on-error-container'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.isAvailable ? 'bg-secondary' : 'bg-error'
                        }`}
                      />
                      <span>{item.isAvailable ? 'In Stock' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        aria-label="Edit item"
                        className="w-8 h-8 rounded-lg bg-surface-container dark:bg-[#242424] text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container-high transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItemId(item.id)}
                        aria-label="Delete item"
                        className="w-8 h-8 rounded-lg bg-surface-container dark:bg-[#242424] text-error flex items-center justify-center hover:bg-error-container transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl z-10 border border-surface-container-high dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high dark:border-white/5 mb-4">
              <h3 className="font-headline-sm text-lg font-bold text-on-surface dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container dark:bg-neutral-800 text-on-surface dark:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-xs text-on-surface-variant dark:text-neutral-300">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Special Deluxe Thali"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-xs text-on-surface-variant dark:text-neutral-300">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ItemCategory })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10"
                  >
                    <option value="MEALS">MEALS</option>
                    <option value="BEVERAGES">BEVERAGES</option>
                    <option value="SNACKS">SNACKS</option>
                    <option value="DESSERTS">DESSERTS</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-xs text-on-surface-variant dark:text-neutral-300">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-xs text-on-surface-variant dark:text-neutral-300">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-xs text-on-surface-variant dark:text-neutral-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe meal ingredients and taste..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10"
                />
              </div>

              {/* Serving Slots selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-on-surface-variant dark:text-neutral-300">
                  Serving Time Slots
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER', 'ALL_DAY'] as MealTimeSlot[]).map(
                    (slot) => {
                      const selected = formData.servingSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleServingSlot(slot)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            selected
                              ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                              : 'bg-surface-container dark:bg-[#242424] text-tertiary dark:text-neutral-400'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <span className="font-semibold text-xs text-on-surface dark:text-white">
                    100% Pure Veg
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-primary accent-primary"
                  />
                  <span className="font-semibold text-xs text-on-surface dark:text-white">
                    Active / In Stock
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-surface-container-high dark:border-white/5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-surface-container-high dark:border-white/10 text-on-surface dark:text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold shadow-md hover:brightness-105"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeletingItemId(null)}
          />
          <div className="relative w-full max-w-sm bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl z-10 border border-error/30 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-white">
              Delete Menu Item?
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400 mt-1">
              This action cannot be undone. Students will no longer see this item in the canteen catalog.
            </p>
            <div className="flex gap-2 w-full mt-5">
              <button
                type="button"
                onClick={() => setDeletingItemId(null)}
                className="flex-1 py-2.5 rounded-xl border border-surface-container-high dark:border-white/10 text-xs font-semibold text-on-surface dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-error text-on-error text-xs font-bold shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

