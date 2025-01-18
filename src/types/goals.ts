export type GoalType = 'achievement' | 'habit';
export type GoalDomain = '精神' | '智力' | '情感' | '职业' | '婚姻' | '亲子' | '社交' | '娱乐' | '财务' | '健康';

export interface Trigger {
  id: string;
  when: string;
  then: string;
}

export interface Event {
  id: string;
  date: Date;
  description: string;
}

export interface GoalHistory {
  id: string;
  date: Date;
  type: 'create' | 'update';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  startDate: Date;
  deadline: Date;
  frequency: string;
  domains: GoalDomain[];
  motivations: string[];
  nextSteps: string[];
  rewards: string[];
  triggers: Trigger[];
  events: Event[];
  history: GoalHistory[];
  lastModified: Date;
}

export interface HabitTracking {
  date: Date;
  completed: boolean;
} 