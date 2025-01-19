import { Goal } from './goals';

export type ReviewPeriod = 'month' | 'quarter' | 'year';

export interface Review {
  id: string;
  period: ReviewPeriod;
  year: number;
  month?: number;  // 月度回顾需要
  quarter?: number;  // 季度回顾需要
  content: string;
  generatedAt: string | Date;  // 支持字符串格式的日期
  goals: Goal[];
} 