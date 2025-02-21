import type { Goal } from '../../types/goals';
import type { Review, ReviewPeriod } from '../../types/review';
import type { AISettings } from '../../types/command';

export interface StorageService {
  // 用户相关操作
  getCurrentUser(): Promise<{ id: string; email: string; name: string } | null>;
  setCurrentUser(user: { id: string; email: string; name: string }): Promise<void>;
  
  // 基础 CRUD 操作
  getGoals(userId: string): Promise<Goal[]>;
  saveGoal(goal: Goal): Promise<void>;
  updateGoal(goal: Goal): Promise<void>;
  deleteGoal(userId: string, goalId: string): Promise<void>;
  
  // 数据导出导入
  exportData(userId: string): Promise<string>;
  importData(userId: string, data: string): Promise<void>;
  
  // 清理数据
  clearAll(userId: string): Promise<void>;

  // AI 设置
  getSettings(userId: string): Promise<AISettings>;
  saveSettings(userId: string, settings: AISettings): Promise<void>;

  // 回顾相关
  getReview(userId: string, period: ReviewPeriod, year: number, month?: number, quarter?: number): Promise<Review | null>;
  saveReview(userId: string, review: Review): Promise<void>;
} 