import React from 'react';
import type { Goal } from '../types/goals';

interface Props {
  goals: Goal[];
}

const GoalProgress: React.FC<Props> = ({ goals }) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.completed).length;
  const progressPercentage = totalGoals ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">习惯追踪</h2>
      
      <div className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => (
            <div 
              key={goal.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{goal.title}</h3>
                <span className="text-sm text-gray-500">
                  {goal.type === 'habit' ? '习惯' : '成就'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {goal.category.map(cat => (
                  <span 
                    key={cat}
                    className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  截止日期: {goal.deadline.toLocaleDateString('zh-CN')}
                </span>
                <button
                  onClick={() => {/* TODO: 实现完成功能 */}}
                  className={`px-3 py-1 rounded-full ${
                    goal.completed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  aria-label={`标记${goal.title}为${goal.completed ? '未完成' : '完成'}`}
                >
                  {goal.completed ? '已完成' : '完成'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalProgress; 