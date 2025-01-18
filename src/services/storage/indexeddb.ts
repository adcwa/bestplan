import Dexie, { Table } from 'dexie';
import type { Goal } from '../../types/goals';
import type { StorageService } from './types';

class GoalTrackerDB extends Dexie {
  goals!: Table<Goal>;

  constructor() {
    super('GoalTrackerDB');
    this.version(1).stores({
      goals: 'id, type, title, startDate, deadline, frequency'
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
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }
} 