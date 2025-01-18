export type GoalType = 'achievement' | 'habit';

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  deadline: Date;
  category: string[];
  steps: string[];
  completed: boolean;
}

export interface HabitTracking {
  date: Date;
  completed: boolean;
} 