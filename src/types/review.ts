export interface Review {
  id: string;
  year: number;
  content: string;
  generatedAt: Date;
  goals: Goal[];
} 