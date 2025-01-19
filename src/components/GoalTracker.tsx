import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Goal, GoalType, Event } from '../types/goals';
import { GoalList, AddGoalModal, EventForm } from './index';
import { getStorageService } from '../services/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from './CommandPalette';
import { AISettings } from '@/types/command';
import { createPortal } from 'react-dom';

const storage = getStorageService();

// 添加 UUID 生成函数
const generateId = (): string => {
  // 生成一个基于时间戳和随机数的唯一ID
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};

export const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState<GoalType | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [aiSettings, setAISettings] = useState<AISettings>({
    openApiKey: '',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    modelName: 'deepseek-chat'
  });
  const [isMounted, setIsMounted] = useState(false);

  // 在客户端挂载后设置 isMounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 初始加载数据
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const savedGoals = await storage.getGoals();
        setGoals(savedGoals);
      } catch (error) {
        console.error('Failed to load goals:', error);
      }
    };
    loadGoals();
  }, []);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await storage.getSettings();
        setAISettings(settings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  // 处理全局快捷键
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      setIsCommandPaletteOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 处理设置更新
  const handleUpdateAISettings = async (newSettings: AISettings) => {
    try {
      await storage.saveSettings(newSettings);
      setAISettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // 处理数据导出
  const handleExport = () => {
    const dataStr = JSON.stringify(goals, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `goals-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 处理数据导入
  const handleImport = (importedGoals: Goal[]) => {
    setGoals(importedGoals);
    storage.saveGoals(importedGoals);
  };

  // 优化事件处理函数，防止冒泡
  const handleEventModalOpen = useCallback((goalId: string, date: Date, e?: React.MouseEvent) => {
    e?.stopPropagation(); // 阻止事件冒泡
    setSelectedGoalId(goalId);
    setSelectedDate(date);
    setIsEventModalOpen(true);
  }, []);

  // 优化添加目标点击事件
  const handleAddGoalClick = useCallback((type: GoalType, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedGoalType(type);
    setIsAddModalOpen(true);
  }, []);

  // 优化编辑目标事件
  const handleEditGoal = useCallback((goal: Goal, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingGoal(goal);
    setSelectedGoalType(goal.type);
    setIsAddModalOpen(true);
  }, []);

  // 使用 useMemo 缓存目标列表
  const achievementGoals = useMemo(() => 
    goals.filter(goal => goal.type === 'achievement'),
    [goals]
  );
  
  const habitGoals = useMemo(() => 
    goals.filter(goal => goal.type === 'habit'),
    [goals]
  );

  const handleAddGoal = async (newGoal: Goal) => {
    try {
      if (editingGoal) {
        await storage.updateGoal(newGoal);
      } else {
        await storage.saveGoal(newGoal);
      }
      
      setGoals(prev => 
        editingGoal
          ? prev.map(g => g.id === newGoal.id ? newGoal : g)
          : [...prev, newGoal]
      );
      
      setIsAddModalOpen(false);
      setSelectedGoalType(null);
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleAddEvent = async (goalId: string, event: Omit<Event, 'id'>) => {
    try {
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          let updatedEvents;
          
          if (editingEvent) {
            // 编辑现有事件
            updatedEvents = goal.events.map(e => 
              e.id === editingEvent.id 
                ? { ...e, ...event }
                : e
            );
          } else {
            // 添加新事件
            updatedEvents = [...goal.events, {
              id: generateId(),
              ...event
            }];
          }

          const updatedGoal = {
            ...goal,
            events: updatedEvents
          };
          storage.updateGoal(updatedGoal);
          return updatedGoal;
        }
        return goal;
      });

      setGoals(updatedGoals);
      setIsEventModalOpen(false);
      setSelectedGoalId(null);
      setSelectedDate(null);
      setEditingEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const updatedGoals = goals.map(goal => {
        const hasEvent = goal.events.some(e => e.id === eventId);
        if (hasEvent) {
          const updatedGoal = {
            ...goal,
            events: goal.events.filter(e => e.id !== eventId)
          };
          storage.updateGoal(updatedGoal);
          return updatedGoal;
        }
        return goal;
      });
      
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleEditEvent = (goalId: string, event: Event) => {
    setSelectedGoalId(goalId);
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

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

  // 统一处理模态框关闭
  const handleModalClose = useCallback(() => {
    setIsAddModalOpen(false);
    setSelectedGoalType(null);
    setEditingGoal(null);
  }, []);

  const handleEventModalClose = useCallback(() => {
    setIsEventModalOpen(false);
    setSelectedGoalId(null);
    setSelectedDate(null);
    setEditingEvent(null);
  }, []);

  const handleCommandPaletteClose = useCallback(() => {
    setIsCommandPaletteOpen(false);
  }, []);

  // 处理目标搜索和滚动
  const handleGoalSearch = useCallback((goal: Goal) => {
    const goalElement = document.getElementById(`goal-${goal.id}`);
    if (goalElement) {
      // 计算目标元素的位置
      const rect = goalElement.getBoundingClientRect();
      const absoluteTop = window.pageYOffset + rect.top;
      const windowHeight = window.innerHeight;
      const scrollTo = absoluteTop - (windowHeight / 2) + (rect.height / 2);

      // 平滑滚动到目标位置
      window.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      });

      // 添加高亮效果
      goalElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        goalElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 mt-1">
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          {/* 装饰性元素 */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full opacity-75" />
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4]">
              The Best Year
            </span>
            <br />
            <span className="text-neutral-800 mt-2 block font-light">
              of My Life
            </span>
          </h1>

          {/* 激励性副标题 */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-neutral-600 text-lg max-w-md mx-auto"
          >
            每一个目标都是通向理想生活的阶梯
          </motion.p>
        </motion.div>

        {/* 互动元素 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center gap-2 text-sm text-neutral-500 mt-6"
        >
          <button 
            className="px-4 py-2 rounded-full border border-neutral-200 hover:border-[#4ECDC4] hover:text-[#4ECDC4] transition-all duration-300"
            onClick={() => {/* 可以添加查看年度总结等功能 */}}
          >
            年度回顾
          </button>
          <button 
            className="px-4 py-2 rounded-full border border-neutral-200 hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all duration-300"
            onClick={() => {/* 可以添加分享功能 */}}
          >
            分享我的目标
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <GoalList 
          title="成就型目标" 
          goals={achievementGoals} 
          type="achievement"
          onAddEvent={handleEventModalOpen}
          onEditGoal={handleEditGoal}
          onDeleteEvent={handleDeleteEvent}
          onAddGoal={handleAddGoalClick}
          onEditEvent={handleEditEvent}
          onUpdateNextSteps={handleUpdateNextSteps}
        />
        <GoalList 
          title="习惯型目标" 
          goals={habitGoals} 
          type="habit"
          onAddEvent={handleEventModalOpen}
          onEditGoal={handleEditGoal}
          onDeleteEvent={handleDeleteEvent}
          onAddGoal={handleAddGoalClick}
          onEditEvent={handleEditEvent}
          onUpdateNextSteps={handleUpdateNextSteps}
        />
      </div>

      {/* 只在客户端渲染模态框 */}
      {isMounted && (
        <>
          {isAddModalOpen && selectedGoalType && (
            <AddGoalModal
              type={selectedGoalType}
              goal={editingGoal}
              onClose={handleModalClose}
              onSubmit={handleAddGoal}
            />
          )}

          {isEventModalOpen && selectedGoalId && (
            <EventForm
              goalId={selectedGoalId}
              initialDate={editingEvent?.date || selectedDate!}
              event={editingEvent}
              onSubmit={handleAddEvent}
              onClose={handleEventModalClose}
            />
          )}

          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={handleCommandPaletteClose}
            goals={goals}
            aiSettings={aiSettings}
            onUpdateAISettings={handleUpdateAISettings}
            onExport={handleExport}
            onImport={handleImport}
            onSearch={handleGoalSearch}
          />
        </>
      )}
    </div>
  );
};

export default GoalTracker; 