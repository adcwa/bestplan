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
import { Disclosure } from '@/components/ui/disclosure';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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
      className="space-y-8 relative"
      variants={staggerChildren}
      initial="initial"
      animate="animate"
    >
      {/* 标题区域优化 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="text-sm text-neutral-500">
            共 {goals.length} 个目标
          </div>
        </div>
        {onAddGoal && (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgb(var(--color-primary))' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddGoal(type)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:text-white transition-all duration-300"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">添加目标</span>
          </motion.button>
        )}
      </div>

      {/* 目标卡片网格 */}
      <div className="grid gap-8">
        {goals.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-neutral-50/50 rounded-2xl"
          >
            <div className="text-neutral-400 mb-4">还没有{type === 'achievement' ? '成就' : '习惯'}目标</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddGoal?.(type)}
              className="text-primary hover:text-primary-dark"
            >
              立即添加 →
            </motion.button>
          </motion.div>
        ) : (
          goals.map((goal) => (
            <FadeInView
              key={goal.id}
              variants={slideUp}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200/50 overflow-hidden hover:border-primary/20"
            >
              {/* 目标卡片内容布局优化 */}
              <div className="grid grid-cols-1 md:grid-cols-10 h-full">
                {/* 左侧：目标详情 */}
                <div className="md:col-span-4 p-8 bg-gradient-to-br from-neutral-50/50 to-white relative">
                  {/* 目标类型标签 */}
                  <div className="absolute top-4 right-4">
                    <span className={`
                      px-3 py-1 text-xs font-medium rounded-full
                      ${goal.type === 'achievement' 
                        ? 'bg-secondary/10 text-secondary-dark' 
                        : 'bg-primary/10 text-primary-dark'}
                    `}>
                      {goal.type === 'achievement' ? '成就' : '习惯'}
                    </span>
                  </div>

                  {/* 目标标题和编辑按钮 */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary transition-colors duration-300">
                      {goal.title}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEditGoal(goal)}
                      className="mt-2 flex items-center gap-2 text-sm text-neutral-500 hover:text-primary"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>编辑目标</span>
                    </motion.button>
                  </div>

                  {/* 目标进度指示器 */}
                  <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600">目标进度</span>
                      <span className="font-medium text-primary">
                        {calculateProgress(goal)}%
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProgress(goal)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* 目标信息卡片化展示 */}
                  <div className="space-y-4">
                    {/* 时间信息卡片 */}
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <h4 className="text-sm font-medium text-neutral-900 mb-2">时间规划</h4>
                      <div className="space-y-1 text-sm text-neutral-600">
                        <div className="flex justify-between">
                          <span>开始时间</span>
                          <span>{formatDate(goal.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>截止时间</span>
                          <span>{formatDate(goal.deadline)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>执行频率</span>
                          <span>{goal.frequency}</span>
                        </div>
                      </div>
                    </div>

                    {/* 其他信息折叠面板 */}
                    <Disclosure>
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-neutral-900 bg-white rounded-lg hover:bg-neutral-50">
                            <span>查看更多信息</span>
                            <ChevronDownIcon
                              className={`${
                                open ? 'transform rotate-180' : ''
                              } w-5 h-5 text-neutral-500 transition-transform duration-200`}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel className="mt-2 space-y-4 text-sm text-neutral-600">
                            {/* 动机列表 */}
                            {goal.motivations.length > 0 && (
                              <div className="p-4 bg-white rounded-lg border border-neutral-200">
                                <h4 className="font-medium text-neutral-900 mb-2">动机列表</h4>
                                <ul className="space-y-2">
                                  {goal.motivations.map((motivation, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-primary">•</span>
                                      <span>{motivation}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* 下一步行动 */}
                            {goal.nextSteps.length > 0 && (
                              <div className="p-4 bg-white rounded-lg border border-neutral-200">
                                <h4 className="font-medium text-neutral-900 mb-2">下一步行动</h4>
                                <ul className="space-y-2">
                                  {goal.nextSteps.map((step, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        className="rounded border-neutral-300 text-primary focus:ring-primary"
                                      />
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* 触发器设置 */}
                            {goal.triggers.length > 0 && (
                              <div className="p-4 bg-white rounded-lg border border-neutral-200">
                                <h4 className="font-medium text-neutral-900 mb-2">触发器设置</h4>
                                <div className="space-y-3">
                                  {goal.triggers.map((trigger, index) => (
                                    <div 
                                      key={index} 
                                      className="grid grid-cols-[auto,1fr] gap-2 items-center text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-neutral-500">当</span>
                                        <span className="px-2 py-1 bg-neutral-50 rounded">
                                          {trigger.when}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-neutral-500">则</span>
                                        <span className="px-2 py-1 bg-neutral-50 rounded">
                                          {trigger.then}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 历史记录 */}
                            {goal.history.length > 0 && (
                              <div className="p-4 bg-white rounded-lg border border-neutral-200">
                                <h4 className="font-medium text-neutral-900 mb-2">修改历史</h4>
                                <div className="space-y-3">
                                  {goal.history.map((record, index) => (
                                    <div key={index} className="text-sm">
                                      <div className="flex items-center gap-2 text-neutral-500">
                                        <span>{formatDate(record.date)}</span>
                                        <span>·</span>
                                        <span>{record.type === 'create' ? '创建' : '更新'}</span>
                                      </div>
                                      {record.changes.length > 0 && (
                                        <ul className="mt-1 ml-4 space-y-1">
                                          {record.changes.map((change, changeIndex) => (
                                            <li key={changeIndex} className="text-neutral-600">
                                              修改了 {change.field}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 最后修改时间 */}
                            <div className="text-xs text-neutral-500 text-right">
                              最后更新：{formatDate(goal.lastModified)}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  </div>
                </div>

                {/* 右侧：进展日历 */}
                <div className="md:col-span-6 p-8 bg-white">
                  <GoalCalendar 
                    goal={goal} 
                    onAddEvent={onAddEvent} 
                    onDeleteEvent={onDeleteEvent}
                    onEditEvent={onEditEvent}
                  />
                </div>
              </div>
            </FadeInView>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default GoalList; 