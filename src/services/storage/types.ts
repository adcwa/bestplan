import type { Goal } from '../../types/goals';

export interface StorageService {
  // 基础 CRUD 操作
  getGoals(): Promise<Goal[]>;
  saveGoal(goal: Goal): Promise<void>;
  updateGoal(goal: Goal): Promise<void>;
  deleteGoal(goalId: string): Promise<void>;
  
  // 数据导出导入
  exportData(): Promise<string>;
  importData(data: string): Promise<void>;
  
  // 清理数据
  clearAll(): Promise<void>;
} 