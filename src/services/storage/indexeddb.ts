import Dexie from 'dexie';
import type { Goal } from '../../types/goals';
import type { StorageService } from './types';

class GoalTrackerDB extends Dexie {
  goals!: Dexie.Table<Goal, string>;

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
    return await this.db.goals.toArray();
  }

  async saveGoal(goal: Goal): Promise<void> {
    await this.db.goals.add(goal);
  }

  async updateGoal(goal: Goal): Promise<void> {
    await this.db.goals.put(goal);
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.db.goals.delete(goalId);
  }

  async exportData(): Promise<string> {
    const goals = await this.getGoals();
    return JSON.stringify(goals, null, 2);
  }

  async importData(data: string): Promise<void> {
    try {
      const goals = JSON.parse(data) as Goal[];
      await this.db.transaction('rw', this.db.goals, async () => {
        await this.db.goals.clear();
        await this.db.goals.bulkAdd(goals);
      });
    } catch (error) {
      throw new Error('Invalid import data format');
    }
  }

  async clearAll(): Promise<void> {
    await this.db.goals.clear();
  }
} 