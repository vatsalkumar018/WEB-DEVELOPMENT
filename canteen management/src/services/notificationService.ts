import { INITIAL_NOTIFICATIONS } from '@/data/mockNotifications';
import { Notification } from '@/types';

const NOTIFICATIONS_STORAGE_KEY = 'tb_canteen_notifications';

class NotificationService {
  private getStored(): Notification[] {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  private save(items: Notification[]): void {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('tb_notifications_updated'));
  }

  async getNotifications(userId?: string): Promise<Notification[]> {
    const items = this.getStored();
    if (!userId) return items;
    return items.filter((n) => !n.userId || n.userId === userId);
  }

  async markAsRead(id: string): Promise<void> {
    const items = this.getStored();
    const item = items.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      this.save(items);
    }
  }

  async markAllAsRead(userId?: string): Promise<void> {
    const items = this.getStored();
    items.forEach((n) => {
      if (!userId || !n.userId || n.userId === userId) {
        n.isRead = true;
      }
    });
    this.save(items);
  }

  async sendNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const items = this.getStored();
    const newItem: Notification = {
      ...data,
      id: 'notif-' + Date.now(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    items.unshift(newItem);
    this.save(items);
    return newItem;
  }
}

export const notificationService = new NotificationService();

