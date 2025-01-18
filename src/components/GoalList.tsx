import React from 'react';
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
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {goals.map(goal => (
        <div key={goal.id} className="bg-white rounded-lg shadow-md min-h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-10 h-full">
            {/* 左侧：目标详情 (2/10) */}
            <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold line-clamp-2">{goal.title}</h3>
                <button
                  onClick={() => onEditGoal(goal)}
                  className="text-blue-500 hover:text-blue-700 flex-shrink-0 ml-2"
                  aria-label="编辑目标"
                >
                  编辑
                </button>
              </div>
              
              <div className="space-y-3">
                {/* 时间信息 */}
                <div className="text-sm text-gray-600">
                  <div className="mb-1">开始：{formatDate(goal.startDate)}</div>
                  <div className="mb-1">截止：{formatDate(goal.deadline)}</div>
                  <div>频率：{goal.frequency}</div>
                </div>

                {/* 领域标签 */}
                <div className="flex flex-wrap gap-1">
                  {goal.domains.map(domain => (
                    <span 
                      key={domain} 
                      className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                    >
                      {domain}
                    </span>
                  ))}
                </div>

                {/* 动机列表 */}
                {goal.motivations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">主要动机：</h4>
                    <ul className="list-disc list-inside text-xs text-gray-600">
                      {goal.motivations.map((motivation, index) => (
                        <li key={index} className="line-clamp-1">{motivation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 下一步计划 */}
                {goal.nextSteps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">行动计划：</h4>
                    <ul className="list-decimal list-inside text-xs text-gray-600">
                      {goal.nextSteps.map((step, index) => (
                        <li key={index} className="line-clamp-1">{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 奖励设置 */}
                {goal.rewards.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">奖励设置：</h4>
                    <ul className="list-disc list-inside text-xs text-gray-600">
                      {goal.rewards.map((reward, index) => (
                        <li key={index} className="line-clamp-1">{reward}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 触发器 */}
                {goal.triggers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">触发器：</h4>
                    <div className="space-y-1">
                      {goal.triggers.map(trigger => (
                        <div 
                          key={trigger.id} 
                          className="bg-gray-50 p-1.5 rounded text-xs"
                        >
                          <div className="line-clamp-1">当：{trigger.when}</div>
                          <div className="line-clamp-1">则：{trigger.then}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 最后修改时间 */}
                <div className="text-xs text-gray-500 pt-2">
                  最后更新：{formatDate(goal.lastModified)}
                </div>
              </div>
            </div>

            {/* 右侧：进展日历 (8/10) */}
            <div className="md:col-span-8 p-4 h-full overflow-y-auto">
              <GoalCalendar goal={goal} onAddEvent={onAddEvent} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GoalList; 