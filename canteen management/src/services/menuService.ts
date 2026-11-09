import { INITIAL_MENU_ITEMS } from '@/data/menuItems';
import { MenuItem, ItemCategory, MealTimeSlot } from '@/types';
import { supabase, supabaseConfig } from './supabaseClient';

const MENU_STORAGE_KEY = 'tb_canteen_menu';

class MenuService {
  private getStoredItems(): MenuItem[] {
    const data = localStorage.getItem(MENU_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  }

  private saveItems(items: MenuItem[]): void {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('tb_menu_updated'));
  }

  async getAllItems(): Promise<MenuItem[]> {
    if (supabaseConfig.isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select(`
            id,
            name,
            description,
            ingredients,
            price,
            image_url,
            available,
            featured,
            is_veg,
            preparation_time_minutes,
            calories,
            serving_start,
            serving_end,
            menu_categories ( slug )
          `)
          .order('name');

        if (!error && data) {
          const mapped: MenuItem[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            ingredients: item.ingredients || [],
            price: Number(item.price),
            category: (item.menu_categories?.slug || 'meals') as ItemCategory,
            imageUrl: item.image_url || '',
            isAvailable: item.available,
            isFeatured: item.featured,
            isVeg: item.is_veg,
            preparationTimeMinutes: item.preparation_time_minutes,
            calories: item.calories || undefined,
            servingSlots: ['ALL_DAY'] as MealTimeSlot[],
            addOns: [],
            rating: 4.8,
            ratingCount: 42,
          }));

          localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase menu fetch failed, using local:', err);
      }
    }

    return this.getStoredItems();
  }

  async getItemById(id: string): Promise<MenuItem | null> {
    const items = await this.getAllItems();
    return items.find((item) => item.id === id) || null;
  }

  async getItemsByCategory(category: ItemCategory): Promise<MenuItem[]> {
    const items = await this.getAllItems();
    return items.filter((item) => item.category === category);
  }

  async getItemsBySlot(slot: MealTimeSlot): Promise<MenuItem[]> {
    const items = await this.getAllItems();
    return items.filter(
      (item) => item.servingSlots.includes(slot) || item.servingSlots.includes('ALL_DAY')
    );
  }

  async createItem(itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    if (supabaseConfig.isConfigured && supabase) {
      try {
        // Find category id
        const { data: cat } = await (supabase.from('menu_categories') as any)
          .select('id')
          .eq('slug', itemData.category)
          .single();

        if (cat) {
          const { data, error } = await (supabase.from('menu_items') as any)
            .insert({
              category_id: cat.id,
              name: itemData.name,
              description: itemData.description,
              ingredients: itemData.ingredients,
              price: itemData.price,
              image_url: itemData.imageUrl,
              available: itemData.isAvailable,
              featured: itemData.isFeatured || false,
              is_veg: itemData.isVeg,
              preparation_time_minutes: itemData.preparationTimeMinutes,
              calories: itemData.calories || null,
            })
            .select()
            .single();

          if (!error && data) {
            const newItem: MenuItem = {
              ...itemData,
              id: data.id,
              rating: 5.0,
              ratingCount: 1,
            };
            const current = this.getStoredItems();
            current.unshift(newItem);
            this.saveItems(current);
            return newItem;
          }
        }
      } catch (err) {
        console.warn('Supabase create item failed, using local storage:', err);
      }
    }

    const items = this.getStoredItems();
    const newItem: MenuItem = {
      ...itemData,
      id: 'item-' + Date.now(),
      rating: 5.0,
      ratingCount: 1,
    };
    items.unshift(newItem);
    this.saveItems(items);
    return newItem;
  }

  async updateItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    if (supabaseConfig.isConfigured && supabase) {
      try {
        await (supabase.from('menu_items') as any)
          .update({
            ...(updates.name && { name: updates.name }),
            ...(updates.description !== undefined && { description: updates.description }),
            ...(updates.price !== undefined && { price: updates.price }),
            ...(updates.imageUrl && { image_url: updates.imageUrl }),
            ...(updates.isAvailable !== undefined && { available: updates.isAvailable }),
            ...(updates.isVeg !== undefined && { is_veg: updates.isVeg }),
            ...(updates.preparationTimeMinutes !== undefined && { preparation_time_minutes: updates.preparationTimeMinutes }),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update item failed:', err);
      }
    }

    const items = this.getStoredItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Item not found');

    const updated = { ...items[index], ...updates };
    items[index] = updated;
    this.saveItems(items);
    return updated;
  }

  async deleteItem(id: string): Promise<boolean> {
    if (supabaseConfig.isConfigured && supabase) {
      try {
        await supabase.from('menu_items').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete item failed:', err);
      }
    }

    const items = this.getStoredItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    this.saveItems(filtered);
    return true;
  }

  async toggleAvailability(id: string): Promise<boolean> {
    const items = this.getStoredItems();
    const item = items.find((i) => i.id === id);
    if (!item) return false;
    const newAvail = !item.isAvailable;
    await this.updateItem(id, { isAvailable: newAvail });
    return newAvail;
  }
}

export const menuService = new MenuService();
