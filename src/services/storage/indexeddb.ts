import { Goal, Event, GoalHistory } from '../../types/goals';
import { Review, ReviewPeriod } from '../../types/review';
import { AISettings } from '../../types/command';
import { StorageService } from './types';
import Dexie, { Table } from 'dexie';

class GoalTrackerDB extends Dexie {
  goals!: Table<Goal & { userId: string }>;
  reviews!: Table<Review & { id: string; userId: string }>;
  settings!: Table<{ id: string; userId: string; settings: AISettings }>;
  users!: Table<{ id: string; email: string; name: string; createdAt: Date }>;

  constructor() {
    super('GoalTrackerDB');
    
    // // 删除旧的数据库
    // Dexie.delete('GoalTrackerDB').then(() => {
    //   console.log('Database successfully deleted');
    // }).catch((err) => {
    //   console.error('Could not delete database:', err);
    // });

    // 创建新的数据库结构
    this.version(2).stores({
      goals: 'id, userId, type, title, startDate, deadline, frequency',
      reviews: 'id, userId, period, year, month, quarter',
      settings: 'id, userId',
      users: 'id, email'
    });
  }
}

export class IndexedDBStorage implements StorageService {
  private db: GoalTrackerDB;
  private currentUser: { id: string; email: string; name: string } | null = null;

  constructor() {
    this.db = new GoalTrackerDB();
  }

  async getCurrentUser(): Promise<{ id: string; email: string; name: string } | null> {
    return this.currentUser;
  }

  async setCurrentUser(user: { id: string; email: string; name: string }): Promise<void> {
    this.currentUser = user;
    try {
      await this.db.users.put({
        ...user,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  }

  async getGoals(userId: string): Promise<Goal[]> {
    try {
      return await this.db.goals.where('userId').equals(userId).toArray();
    } catch (error) {
      console.error('Failed to get goals:', error);
      throw error;
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

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    try {
      await this.db.goals.where('[userId+id]').equals([userId, goalId]).delete();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      throw error;
    }
  }

  async exportData(userId: string): Promise<string> {
    try {
      const goals = await this.getGoals(userId);
      return JSON.stringify(goals, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(userId: string, data: string): Promise<void> {
    try {
      const goals = JSON.parse(data) as Goal[];
      await this.db.transaction('rw', this.db.goals, async () => {
        await this.db.goals.where('userId').equals(userId).delete();
        await this.db.goals.bulkAdd(goals.map(goal => ({ ...goal, userId })));
      });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid import data format');
    }
  }

  async clearAll(userId: string): Promise<void> {
    try {
      await this.db.transaction('rw', this.db.goals, this.db.reviews, this.db.settings, async () => {
        await this.db.goals.where('userId').equals(userId).delete();
        await this.db.reviews.where('userId').equals(userId).delete();
        await this.db.settings.where('userId').equals(userId).delete();
      });
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  async getSettings(userId: string): Promise<AISettings> {
    try {
      const settings = await this.db.settings.where('userId').equals(userId).first();
      return settings?.settings || {
        openApiKey: '',
        baseUrl: 'https://api.deepseek.com/v1/chat/completions',
        modelName: 'deepseek-chat'
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      throw error;
    }
  }

  async saveSettings(userId: string, settings: AISettings): Promise<void> {
    try {
      await this.db.settings.put({ id: 'default', userId, settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async getReview(userId: string, period: ReviewPeriod, year: number, month?: number, quarter?: number): Promise<Review | null> {
    try {
      const id = this.generateReviewId(period, year, month, quarter);
      const review = await this.db.reviews
        .where('[userId+id]')
        .equals([userId, id])
        .first();

      if (!review) return null;

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

  async saveReview(userId: string, review: Review): Promise<void> {
    try {
      const id = this.generateReviewId(review.period, review.year, review.month, review.quarter);
      const reviewToSave = {
        ...review,
        id,
        userId,
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
    return `${period}-${year}${month ? `-${month}` : ''}${quarter ? `-${quarter}` : ''}`;
  }
} 