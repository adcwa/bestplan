'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Event } from '@/types/goals';

interface Props {
  goalId: string;
  initialDate: string | Date;
  event?: Event;  // 新增，用于编辑模式
  onSubmit: (goalId: string, event: Omit<Event, 'id'>) => void;
  onClose: () => void;  // 简化为无参数函数
}

export const EventForm: React.FC<Props> = ({
  goalId,
  initialDate,
  event,
  onSubmit,
  onClose
}) => {
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (event) {
      setContent(event.content);
      setNote(event.note || '');
      setIsCompleted(event.isCompleted);
    }
  }, [event]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(goalId, {
      date: initialDate,
      content: content.trim(),
      note: note.trim(),
      isCompleted
    });
  }, [goalId, initialDate, content, note, isCompleted, onSubmit]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      onClose();
    }
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          {event ? '编辑事件' : '添加事件'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              事件内容
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              备注
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCompleted"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="isCompleted" className="text-sm">
              已完成
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {event ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}; 
export default EventForm; 