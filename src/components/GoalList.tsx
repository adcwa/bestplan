'use client';

import React, { useState } from 'react';
import type { Goal, GoalType, Event } from '../types/goals';
import { GoalCalendar } from './index';
import { motion, AnimatePresence } from 'framer-motion';
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
  onUpdateNextSteps: (goalId: string, stepId: string, isCompleted: boolean) => void;
}

interface GoalCardProps {
  goal: Goal;
  onEditGoal: (goal: Goal) => void;
  onAddEvent: (goalId: string, date: Date) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditEvent: (goalId: string, event: Event) => void;
  onUpdateNextSteps: (goalId: string, stepId: string, isCompleted: boolean) => void;
}

interface NextStepProps {
  step: string;
  isCompleted: boolean;
  onToggle: () => void;
}

const NextStepItem = ({ step, isCompleted, onToggle }: NextStepProps) => (
  <div className="flex items-center gap-2 group">
    <input
      type="checkbox"
      checked={isCompleted}
      onChange={onToggle}
      className="rounded border-neutral-300 text-primary focus:ring-primary"
    />
    <span className={`flex-1 transition-colors ${
      isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-700'
    }`}>
      {step}
    </span>
  </div>
);

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

// 添加状态控制展开/折叠
const GoalCard = ({ 
  goal, 
  onEditGoal,
  onAddEvent,
  onDeleteEvent,
  onEditEvent,
  onUpdateNextSteps
}: GoalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 处理步骤状态更新
  const handleStepStatusChange = (step: string, isCompleted: boolean) => {
    onUpdateNextSteps(goal.id, step, isCompleted);
  };

  return (
    <div
      id={`goal-${goal.id}`}
      className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 space-y-4 transition-all duration-200"
    >
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

          {/* 目标标题和展开按钮 */}
          <div 
            className="mb-6 cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary transition-colors duration-300">
                {goal.title}
              </h3>
              <ChevronDownIcon
                className={`w-5 h-5 text-neutral-500 transform transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onEditGoal(goal);
              }}
              className="mt-2 flex items-center gap-2 text-sm text-neutral-500 hover:text-primary"
            >
              <PencilIcon className="w-4 h-4" />
              <span>编辑目标</span>
            </motion.button>
          </div>

          {/* 只在成就型目标中显示进度条 */}
          {goal.type === 'achievement' && (
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
          )}

          {/* 习惯型目标显示执行情况 */}
          {goal.type === 'habit' && (
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600">执行情况</span>
                <span className="font-medium text-primary">
                  {goal.frequency}
                </span>
              </div>
              <div className="text-sm text-neutral-500">
                已坚持 {Math.ceil((new Date().getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24))} 天
              </div>
            </div>
          )}

          {/* 基本信息卡片 - 始终显示 */}
          <div className="space-y-4">
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
                {goal.type === 'habit' && (
                  <div className="flex justify-between">
                    <span>执行频率</span>
                    <span>{goal.frequency}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 展开时显示的详细信息 */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
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
                      <h4 className="font-medium text-neutral-900 mb-3">下一步行动</h4>
                      <div className="space-y-2">
                        {goal.nextSteps.map((step, index) => (
                          <NextStepItem
                            key={index}
                            step={step}
                            isCompleted={goal.nextStepStatus[step] || false}
                            onToggle={() => handleStepStatusChange(step, !goal.nextStepStatus[step])}
                          />
                        ))}
                      </div>
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
                      <Disclosure>
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="w-full flex justify-between items-center">
                              <h4 className="font-medium text-neutral-900">修改历史</h4>
                              <ChevronDownIcon
                                className={`w-4 h-4 text-neutral-500 transform transition-transform duration-200 ${
                                  open ? 'rotate-180' : ''
                                }`}
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel className="mt-4">
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
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    </div>
                  )}

                  {/* 最后修改时间 */}
                  <div className="text-xs text-neutral-500 text-right">
                    最后更新：{formatDate(goal.lastModified)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
    </div>
  );
};

export const GoalList: React.FC<Props> = ({ 
  title, 
  goals, 
  type, 
  onAddEvent,
  onEditGoal,
  onDeleteEvent,
  onAddGoal,
  onEditEvent,
  onUpdateNextSteps
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div 
      className="space-y-8 relative"
      variants={staggerChildren}
      initial="initial"
      animate="animate"
    >
      {/* 标题区域优化 - 添加折叠功能 */}
      <div 
        className="flex items-center justify-between mb-8 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ChevronDownIcon 
              className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-0' : '-rotate-90'
              }`}
            />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <div className="text-sm text-neutral-500">
            共 {goals.length} 个目标
          </div>
        </div>
        {onAddGoal && (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgb(var(--color-primary))' }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation(); // 防止触发折叠
              onAddGoal(type);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:text-white transition-all duration-300"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">添加目标</span>
          </motion.button>
        )}
      </div>

      {/* 修改目标卡片网格的动画实现 */}
      <motion.div
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? '2rem' : 0
        }}
        initial={false}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
        className="overflow-hidden"
      >
        <div className="grid gap-8">
          {goals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-neutral-50/50 rounded-2xl"
            >
              <div className="text-neutral-400 mb-4">
                还没有{type === 'achievement' ? '成就' : '习惯'}目标
              </div>
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
              <GoalCard
                key={goal.id}
                goal={goal}
                onEditGoal={onEditGoal}
                onAddEvent={onAddEvent}
                onDeleteEvent={onDeleteEvent}
                onEditEvent={onEditEvent}
                onUpdateNextSteps={onUpdateNextSteps}
              />
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GoalList; 