import { Goal, Event, GoalHistory } from '../../types/goals';
import { Review, ReviewPeriod } from '../../types/review';
import { AISettings } from '../../types/command';
import { StorageService } from './types';
import Dexie, { Table } from 'dexie';

class GoalTrackerDB extends Dexie {
  goals!: Table<Goal>;
  reviews!: Table<Review & { id: string }>;
  settings!: Table<{ id: string; settings: AISettings }>;

  constructor() {
    super('GoalTrackerDB');
    
    // 删除旧的数据库
    Dexie.delete('GoalTrackerDB').then(() => {
      console.log('Database successfully deleted');
    }).catch((err) => {
      console.error('Could not delete database:', err);
    });

    // 创建新的数据库结构
    this.version(1).stores({
      goals: 'id, type, title, startDate, deadline, frequency',
      reviews: 'id, period, year, month, quarter',
      settings: 'id'
    });
  }
}

export class IndexedDBStorage implements StorageService {
  private db: GoalTrackerDB;

  constructor() {
    this.db = new GoalTrackerDB();
  }

  async getGoals(): Promise<Goal[]> {
    try {
      return await this.db.goals.toArray();
    } catch (error) {
      console.error('Failed to get goals:', error);
      return [];
    }
  }

  async saveGoal(goal: Goal): Promise<void> {
    try {
      await this.db.goals.add(goal);
    } catch (error) {
      console.error('Failed to save goal:', error);
      throw error;
    }
  }

  async updateGoal(goal: Goal): Promise<void> {
    try {
      await this.db.goals.put(goal);
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      await this.db.goals.delete(goalId);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      throw error;
    }
  }

  async exportData(): Promise<string> {
    try {
      const goals = await this.getGoals();
      return JSON.stringify(goals, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(data: string): Promise<void> {
    try {
      const goals = JSON.parse(data) as Goal[];
      await this.db.transaction('rw', this.db.goals, async () => {
        await this.db.goals.clear();
        await this.db.goals.bulkAdd(goals);
      });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid import data format');
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.db.goals.clear();
      await this.db.reviews.clear();
      await this.db.settings.clear();
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  async getSettings(): Promise<AISettings> {
    try {
      const result = await this.db.settings.get('aiSettings');
      if (!result) {
        const defaultSettings: AISettings = {
          openApiKey: '',
          baseUrl: 'https://api.deepseek.com/v1/chat/completions',
          modelName: 'deepseek-chat'
        };
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      return result.settings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      throw error;
    }
  }

  async saveSettings(settings: AISettings): Promise<void> {
    try {
      await this.db.settings.put({ id: 'aiSettings', settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async getReview(period: ReviewPeriod, year: number, month?: number, quarter?: number): Promise<Review | null> {
    try {
      const id = this.generateReviewId(period, year, month, quarter);
      const review = await this.db.reviews
        .where('id')
        .equals(id)
        .first();

      if (!review) return null;

      // 将字符串日期转换为 Date 对象
      return {
        ...review,
        generatedAt: new Date(review.generatedAt),
        goals: review.goals.map((goal: Goal) => ({
          ...goal,
          startDate: new Date(goal.startDate),
          deadline: new Date(goal.deadline),
          lastModified: new Date(goal.lastModified),
          events: goal.events.map((event: Event) => ({
            ...event,
            date: new Date(event.date)
          })),
          history: goal.history.map((h: GoalHistory) => ({
            ...h,
            date: new Date(h.date)
          }))
        }))
      };
    } catch (error) {
      console.error('Failed to get review:', error);
      return null;
    }
  }

  async saveReview(review: Review): Promise<void> {
    try {
      const id = this.generateReviewId(review.period, review.year, review.month, review.quarter);
      // 将 Date 对象转换为 ISO 字符串
      const reviewToSave: Review & { id: string } = {
        ...review,
        id,
        month: review.month || undefined,
        quarter: review.quarter || undefined,
        generatedAt: review.generatedAt instanceof Date ? review.generatedAt.toISOString() : review.generatedAt,
        goals: review.goals.map((goal: Goal) => ({
          ...goal,
          startDate: goal.startDate instanceof Date ? goal.startDate.toISOString() : goal.startDate,
          deadline: goal.deadline instanceof Date ? goal.deadline.toISOString() : goal.deadline,
          lastModified: goal.lastModified instanceof Date ? goal.lastModified.toISOString() : goal.lastModified,
          events: goal.events.map((event: Event) => ({
            ...event,
            date: event.date instanceof Date ? event.date.toISOString() : event.date
          })),
          history: goal.history.map((h: GoalHistory) => ({
            ...h,
            date: h.date instanceof Date ? h.date.toISOString() : h.date
          }))
        }))
      };

      await this.db.reviews.put(reviewToSave);
    } catch (error) {
      console.error('Failed to save review:', error);
      throw error;
    }
  }

  private generateReviewId(period: ReviewPeriod, year: number, month?: number, quarter?: number): string {
    const parts = [period, year.toString()];
    if (period === 'month' && month !== undefined) {
      parts.push(month.toString().padStart(2, '0'));
    } else if (period === 'quarter' && quarter !== undefined) {
      parts.push(quarter.toString());
    }
    return parts.join('-');
  }
} 