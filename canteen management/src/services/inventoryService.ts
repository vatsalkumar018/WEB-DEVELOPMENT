import { INITIAL_INVENTORY_ITEMS } from '@/data/inventoryItems';
import { InventoryItem } from '@/types';

const INVENTORY_STORAGE_KEY = 'tb_canteen_inventory';

class InventoryService {
  private getStored(): InventoryItem[] {
    const data = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
      return INITIAL_INVENTORY_ITEMS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_INVENTORY_ITEMS;
    }
  }

  private save(items: InventoryItem[]): void {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('tb_inventory_updated'));
  }

  async getAllItems(): Promise<InventoryItem[]> {
    return this.getStored();
  }

  async updateStock(id: string, newStock: number): Promise<InventoryItem> {
    const items = this.getStored();
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error('Inventory item not found');

    item.currentStock = Math.max(0, newStock);
    if (item.currentStock === 0) {
      item.status = 'OUT_OF_STOCK';
    } else if (item.currentStock <= item.minStock) {
      item.status = 'LOW_STOCK';
    } else {
      item.status = 'HEALTHY';
    }
    item.lastRestocked = new Date().toISOString();

    this.save(items);
    return item;
  }

  async restockItem(id: string, addQuantity: number): Promise<InventoryItem> {
    const items = this.getStored();
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error('Inventory item not found');

    return this.updateStock(id, item.currentStock + addQuantity);
  }
}

export const inventoryService = new InventoryService();

