import React from 'react';
import { useState } from 'react';
import type { Goal } from '../types/goals';
import { 
  AchievementGoal,
  HabitGoal,
  GoalProgress,
  RewardSection 
} from './index';

const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  
  const handleAddGoal = (newGoal: Goal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">成就型目标</h2>
          <AchievementGoal onAddGoal={handleAddGoal} />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">习惯型目标</h2>
          <HabitGoal onAddGoal={handleAddGoal} />
        </div>
      </div>
      
      <GoalProgress goals={goals} />
      <RewardSection goals={goals} />
    </div>
  );
};

export default GoalTracker; 