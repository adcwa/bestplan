import React, { useState, useEffect } from 'react';
import type { Goal, GoalType, Event } from '../types/goals';
import { GoalList, AddGoalModal, EventForm } from './index';
import { getStorageService } from '../services/storage';
import { motion } from 'framer-motion';

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
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 初始加载数据
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const storage = getStorageService();
        const savedGoals = await storage.getGoals();
        setGoals(savedGoals);
      } catch (error) {
        console.error('Failed to load goals:', error);
      }
    };
    loadGoals();
  }, []);

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setSelectedGoalType(goal.type);
    setIsAddModalOpen(true);
  };

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
          const updatedGoal = {
            ...goal,
            events: [...goal.events, {
              id: generateId(),
              ...event
            }]
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
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleEventModalOpen = (goalId: string, date: Date) => {
    setSelectedGoalId(goalId);
    setSelectedDate(date);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (goalId: string, eventId: string) => {
    try {
      const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
          const updatedGoal = {
            ...goal,
            events: goal.events.filter(event => event.id !== eventId)
          };
          // 异步更新存储
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

  const achievementGoals = goals.filter(goal => goal.type === 'achievement');
  const habitGoals = goals.filter(goal => goal.type === 'habit');

  const handleAddGoalClick = (type: GoalType) => {
    setSelectedGoalType(type);
    setIsAddModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 mt-1">
      <div className="flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold mx-auto"
        >
          The Best Year of My Life
        </motion.h1>
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
        />
        <GoalList 
          title="习惯型目标" 
          goals={habitGoals} 
          type="habit"
          onAddEvent={handleEventModalOpen}
          onEditGoal={handleEditGoal}
          onDeleteEvent={handleDeleteEvent}
          onAddGoal={handleAddGoalClick}
        />
      </div>

      {isAddModalOpen && selectedGoalType && (
        <AddGoalModal
          type={selectedGoalType}
          goal={editingGoal}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedGoalType(null);
            setEditingGoal(null);
          }}
          onSubmit={handleAddGoal}
        />
      )}

      {isEventModalOpen && selectedGoalId && selectedDate && (
        <EventForm
          goalId={selectedGoalId}
          initialDate={selectedDate}
          onSubmit={handleAddEvent}
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedGoalId(null);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};

export default GoalTracker; 