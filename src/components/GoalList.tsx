'use client';

import React from 'react';
import type { Goal, GoalType, Event } from '../types/goals';
import { GoalCalendar } from './index';
import { motion } from 'framer-motion';
import { FadeInView, slideUp, staggerChildren } from './ui/animations';
import { motionConfig } from '@/utils/motion';
import { formatDate } from '@/utils/date';
import { useModal } from '@/contexts/ModalContext';
import { PencilIcon, PlusIcon } from './icons';

interface Props {
  title: string;
  goals: Goal[];
  type: GoalType;
  onAddEvent: (goalId: string, date: Date) => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddGoal?: (type: GoalType) => void;
  onEditEvent: (goalId: string, event: Event) => void;
}

// 添加计算进度的函数
const calculateProgress = (goal: Goal): number => {
  try {
    if (!goal.events || !Array.isArray(goal.events)) return 0;
    if (goal.events.length === 0) return 0;
    
    const completedEvents = goal.events.filter(event => 
      event && typeof event === 'object' && event.isCompleted
    ).length;
    
    return Math.round((completedEvents / goal.events.length) * 100);
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 0;
  }
};

export const GoalList: React.FC<Props> = ({ 
  title, 
  goals, 
  type, 
  onAddEvent,
  onEditGoal,
  onDeleteEvent,
  onAddGoal,
  onEditEvent
}) => {
  return (
    <motion.div 
      className="space-y-6 relative"
      variants={staggerChildren}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h2>
        {onAddGoal && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddGoal(type)}
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label={`添加${type === 'achievement' ? '成就型' : '习惯型'}目标`}
          >
            <PlusIcon className="w-5 h-5 text-primary" />
          </motion.button>
        )}
      </div>

      <div className="grid gap-6">
        {goals.map((goal) => (
          <FadeInView
            key={goal.id}
            variants={slideUp}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-neutral-200/50 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-10 h-full">
              {/* 左侧：目标详情 */}
              <div className="md:col-span-4 p-6 bg-gradient-to-br from-neutral-50 to-white">
                <div className="flex items-start gap-3 mb-6">
                  <span className={`
                    px-3 py-1 text-xs font-medium rounded-full
                    ${goal.type === 'achievement' 
                      ? 'bg-secondary/10 text-secondary-dark' 
                      : 'bg-primary/10 text-primary-dark'}
                  `}>
                    {goal.type === 'achievement' ? '成就' : '习惯'}
                  </span>
                  <h3 className="text-lg font-semibold text-neutral-900 flex-grow">
                    {goal.title}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEditGoal(goal)}
                    className="p-1.5 rounded-full hover:bg-neutral-100"
                  >
                    <PencilIcon className="w-4 h-4 text-neutral-500" />
                  </motion.button>
                </div>

                {/* 目标进度指示器 */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">目标进度</span>
                    <span className="font-medium text-primary">
                      {calculateProgress(goal)}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(goal)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* 目标的详细信息，包括时间信息、领域标签、动机列表、下一步计划、奖励设置、触发器和最后修改时间 */}
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
                            <div className="flex gap-2">
                              <div className="line-clamp-1 flex-1">当：{trigger.when}</div>
                              <div className="line-clamp-1 flex-1">则：{trigger.then}</div>
                            </div>
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
              {/* 右侧：进展日历 */}
              <div className="md:col-span-6 p-6">
                <GoalCalendar 
                  goal={goal} 
                  onAddEvent={onAddEvent} 
                  onDeleteEvent={onDeleteEvent}
                  onEditEvent={onEditEvent}
                />
              </div>
            </div>
          </FadeInView>
        ))}
      </div>
    </motion.div>
  );
};

export default GoalList; 