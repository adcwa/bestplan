import React, { useState, useEffect } from 'react';
import type { Goal, GoalType, Event } from '../types/goals';
import { GoalList, AddGoalModal } from './index';
import { getStorageService } from '../services/storage';

const storage = getStorageService();

// 添加 UUID 生成函数
const generateId = (): string => {
  // 生成一个基于时间戳和随机数的唯一ID
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};

const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState<GoalType | null>(null);

  // 初始加载数据
  useEffect(() => {
    const loadGoals = async () => {
      const savedGoals = await storage.getGoals();
      setGoals(savedGoals);
    };
    loadGoals();
  }, []);

  const handleAddGoal = async (newGoal: Goal) => {
    await storage.saveGoal(newGoal);
    setGoals(prev => [...prev, newGoal]);
    setIsAddModalOpen(false);
    setSelectedGoalType(null);
  };

  const handleAddEvent = async (goalId: string, event: Omit<Event, 'id'>) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = {
          ...goal,
          events: [...goal.events, {
            id: generateId(),
            ...event
          }]
        };
        // 异步更新存储
        storage.updateGoal(updatedGoal);
        return updatedGoal;
      }
      return goal;
    });
    setGoals(updatedGoals);
  };

  const achievementGoals = goals.filter(goal => goal.type === 'achievement');
  const habitGoals = goals.filter(goal => goal.type === 'habit');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">目标追踪器</h1>
        <div className="space-x-4">
          <button
            onClick={() => {
              setSelectedGoalType('achievement');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            aria-label="添加成就型目标"
          >
            添加成就型目标
          </button>
          <button
            onClick={() => {
              setSelectedGoalType('habit');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            aria-label="添加习惯型目标"
          >
            添加习惯型目标
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <GoalList 
          title="成就型目标" 
          goals={achievementGoals} 
          type="achievement"
          onAddEvent={handleAddEvent}
        />
        <GoalList 
          title="习惯型目标" 
          goals={habitGoals} 
          type="habit"
          onAddEvent={handleAddEvent}
        />
      </div>

      {isAddModalOpen && selectedGoalType && (
        <AddGoalModal
          type={selectedGoalType}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedGoalType(null);
          }}
          onSubmit={handleAddGoal}
        />
      )}
    </div>
  );
};

export default GoalTracker; 