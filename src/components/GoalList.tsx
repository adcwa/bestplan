import React, { useState } from 'react';
import type { Goal, GoalType, Event } from '../types/goals';
import { GoalCalendar } from './index';

interface Props {
  title: string;
  goals: Goal[];
  type: GoalType;
  onAddEvent: (goalId: string, event: Omit<Event, 'id'>) => void;
}

const GoalList: React.FC<Props> = ({ title, goals, type, onAddEvent }) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      {goals.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          还没有{type === 'achievement' ? '成就型' : '习惯型'}目标，
          点击上方按钮添加新目标
        </p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {goals.map(goal => (
              <div 
                key={goal.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-lg">{goal.title}</h3>
                  <span className="text-sm text-gray-500">
                    频率: {goal.frequency}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>开始时间: {goal.startDate.toLocaleDateString('zh-CN')}</p>
                  <p>截止时间: {goal.deadline.toLocaleDateString('zh-CN')}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {goal.domains.map(domain => (
                      <span 
                        key={domain}
                        className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>

                  {goal.motivations.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">主要动机：</p>
                      <ul className="list-disc list-inside">
                        {goal.motivations.map((motivation, index) => (
                          <li key={index}>{motivation}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {goal.nextSteps.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">下一步计划：</p>
                      <ul className="list-disc list-inside">
                        {goal.nextSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                    onClick={() => setSelectedGoal(goal)}
                    aria-label="查看进展"
                  >
                    查看进展
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedGoal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {selectedGoal.title} - 进展追踪
                    </h3>
                    <button
                      onClick={() => setSelectedGoal(null)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="关闭"
                    >
                      ✕
                    </button>
                  </div>
                  <GoalCalendar
                    goal={selectedGoal}
                    onAddEvent={onAddEvent}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalList; 