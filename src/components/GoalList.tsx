import React, { useState } from 'react';
import type { Goal, GoalType, Event } from '../types/goals';
import { GoalCalendar } from './index';

interface Props {
  title: string;
  goals: Goal[];
  type: GoalType;
  onAddEvent: (goalId: string, event: Omit<Event, 'id'>) => void;
  onEditGoal: (goal: Goal) => void;
}

export const GoalList: React.FC<Props> = ({ 
  title, 
  goals, 
  type, 
  onAddEvent,
  onEditGoal 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {goals.map(goal => (
        <div key={goal.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{goal.title}</h3>
              <div className="flex gap-2 mt-2">
                {goal.domains.map(domain => (
                  <span key={domain} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onEditGoal(goal)}
              className="text-blue-500 hover:text-blue-700"
              aria-label="编辑目标"
            >
              编辑
            </button>
          </div>
          <GoalCalendar goal={goal} onAddEvent={onAddEvent} />
        </div>
      ))}
    </div>
  );
};

export default GoalList; 