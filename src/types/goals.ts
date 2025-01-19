export type GoalType = 'achievement' | 'habit';
export type GoalDomain = '精神' | '智力' | '情感' | '职业' | '婚姻' | '亲子' | '社交' | '娱乐' | '财务' | '健康';

export interface Trigger {
  id: string;
  when: string;
  then: string;
}

export interface Event {
  id: string;
  content: string;
  date: string | Date;
  isCompleted: boolean;
  note?: string;
}

export interface GoalHistory {
  id: string;
  type: 'create' | 'update';
  date: string | Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface History {
  date: Date;
  value: number;
  note?: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description: string;
  startDate: string | Date;
  deadline: string | Date;
  lastModified: string | Date;
  frequency: string;
  status: string;
  progress: number;
  events: Event[];
  history: GoalHistory[];
  nextSteps: string[];
  nextStepStatus: Record<string, boolean>;
}

export interface HabitTracking {
  date: Date;
  completed: boolean;
} 