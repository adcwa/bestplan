'use client';

import { GoalTracker } from '@/components';

export default function Home() {
  const handleUpdateNextSteps = (goalId: string, stepId: string, isCompleted: boolean) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          nextStepStatus: {
            ...goal.nextStepStatus,
            [stepId]: isCompleted
          }
        };
      }
      return goal;
    }));
  };

  return (
    <main>
      <GoalTracker />
    </main>
  );
} 