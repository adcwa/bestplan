import type { Goal } from '../../types/goals';
import type { Review, ReviewPeriod } from '../../types/review';
import type { AISettings } from '../../types/command';

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

  // AI 设置
  getSettings(): Promise<AISettings>;
  saveSettings(settings: AISettings): Promise<void>;

  // 回顾相关
  getReview(period: ReviewPeriod, year: number, month?: number, quarter?: number): Promise<Review | null>;
  saveReview(review: Review): Promise<void>;
} 