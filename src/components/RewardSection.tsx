import React from 'react';
import type { Goal } from '../types/goals';

interface Props {
  goals: Goal[];
}

const RewardSection: React.FC<Props> = ({ goals }) => {
  const completedGoals = goals.filter(goal => goal.completed).length;
  const hasReward = completedGoals >= 5; // 完成5个目标获得奖励

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">奖励</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium">
              已完成 {completedGoals} 个目标
            </p>
            <p className="text-sm text-gray-500">
              再完成 {Math.max(0, 5 - completedGoals)} 个目标获得奖励
            </p>
          </div>
          
          <div className={`
            p-4 rounded-full 
            ${hasReward 
              ? 'bg-yellow-100 text-yellow-700' 
              : 'bg-gray-100 text-gray-400'
            }
          `}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" 
              />
            </svg>
          </div>
        </div>

        {hasReward && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700">
              恭喜！你已经完成了5个目标，获得了奖励！
            </p>
            <button
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              onClick={() => {/* TODO: 实现领取奖励功能 */}}
              aria-label="领取奖励"
            >
              领取奖励
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardSection; 