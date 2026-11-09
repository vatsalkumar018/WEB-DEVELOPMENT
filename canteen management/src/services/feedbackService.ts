import { FeedbackRating } from '@/types';

const FEEDBACK_STORAGE_KEY = 'tb_canteen_feedback';

class FeedbackService {
  private getStored(): FeedbackRating[] {
    const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private save(items: FeedbackRating[]): void {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('tb_feedback_updated'));
  }

  async submitFeedback(data: Omit<FeedbackRating, 'id' | 'createdAt'>): Promise<FeedbackRating> {
    const items = this.getStored();
    const newFeedback: FeedbackRating = {
      ...data,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    items.unshift(newFeedback);
    this.save(items);
    return newFeedback;
  }

  async getFeedbackForOrder(orderId: string): Promise<FeedbackRating | null> {
    const items = this.getStored();
    return items.find((f) => f.orderId === orderId) || null;
  }

  async getAllFeedback(): Promise<FeedbackRating[]> {
    return this.getStored();
  }
}

export const feedbackService = new FeedbackService();

