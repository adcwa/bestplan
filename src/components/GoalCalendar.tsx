'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { Goal, Event } from '@/types/goals';
import { EventForm } from './index';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { format, addMonths, subMonths, isSameDay } from 'date-fns';
import { motionConfig } from '@/utils/motion';
import { useModal } from '@/contexts/ModalContext';

interface Props {
  goal: Goal;
  onAddEvent: (goalId: string, date: Date) => void;
  onEditEvent: (goalId: string, event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const GoalCalendar: React.FC<Props> = ({
  goal,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}) => {
  const { openModal, closeModal, setActiveModalId } = useModal();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; content: string } | null>(null);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const firstDayOfWeek = startOfMonth.getDay();

  const calendar: (number | null)[] = [];

  // 填充日历数组
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendar.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendar.push(day);
  }

  // 获取某一天的事件
  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return goal.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = useCallback((date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddEvent(goal.id, date);
  }, [goal.id, onAddEvent]);

  const handleEventClick = useCallback((event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(new Date(event.date));
    setSelectedEvent(event);
    setShowEventForm(true);
  }, []);

  const handleDeleteEvent = (e: React.MouseEvent, eventId: string, content: string) => {
    e.stopPropagation();
    setEventToDelete({ id: eventId, content });
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };

  const handleEventSubmit = useCallback((goalId: string, eventData: Omit<Event, 'id'>) => {
    if (selectedEvent) {
      onEditEvent(goalId, { ...eventData, id: selectedEvent.id });
    } else {
      onAddEvent(goalId, new Date(eventData.date));
    }
    setShowEventForm(false);
    setSelectedDate(null);
    setSelectedEvent(undefined);
    closeModal();
    setActiveModalId(null);
  }, [selectedEvent, onEditEvent, onAddEvent, closeModal, setActiveModalId]);

  // 使用 useMemo 缓存事件数据
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    goal.events.forEach(event => {
      const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
      const dateEvents = map.get(dateStr) || [];
      dateEvents.push(event);
      map.set(dateStr, dateEvents);
    });
    return map;
  }, [goal.events]);

  return (
    <div className="space-y-4">
      {/* 日历头部 */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full hover:bg-neutral-100"
          onClick={handlePrevMonth}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </motion.button>
        
        <motion.h3 
          className="text-lg font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          layout
        >
          {format(currentDate, 'yyyy年MM月')}
        </motion.h3>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full hover:bg-neutral-100"
          onClick={handleNextMonth}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </motion.button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-1 flex-shrink-0">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-neutral-600">
            {day}
          </div>
        ))}
      </div>

      {/* 日历格子 */}
      <div className="grid grid-cols-7 gap-2">
        {calendar.map((day, index) => {
          const events = day ? getEventsForDay(day) : [];
          const isToday = day && isSameDay(new Date(), new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
          const isHovered = day === hoveredDay;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredDay(day)}
              onHoverEnd={() => setHoveredDay(null)}
              className={`
                relative p-2 rounded-lg transition-all duration-200
                ${day ? 'hover:bg-primary/10 cursor-pointer min-h-[80px]' : 'bg-neutral-50/50'}
                ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${events.length > 0 ? 'bg-primary/5' : ''}
              `}
              onClick={(e) => day && handleDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), e)}
            >
              {day && (
                <>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isToday ? 'font-bold text-primary' : 'text-neutral-600'}`}>
                      {day}
                    </span>
                    {isHovered && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-1 rounded-full hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), e);
                        }}
                      >
                        <PlusIcon className="w-3 h-3 text-primary" />
                      </motion.button>
                    )}
                  </div>
                  
                  {/* 事件列表 */}
                  <div className="mt-1 space-y-1">
                    {events.map(event => (
                      <motion.div
                        key={event.id}
                        className={`
                          relative group rounded-md p-1 text-xs
                          ${event.isCompleted ? 'bg-green-100' : 'bg-primary/10'}
                          hover:bg-primary/20 transition-colors
                        `}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`line-clamp-2 ${event.isCompleted ? 'text-green-800' : 'text-primary-800'}`}>
                            {event.content}
                          </span>
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-1 hover:bg-primary/20 rounded"
                              onClick={(e) => handleDeleteEvent(e, event.id, event.content)}
                            >
                              <TrashIcon className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                        {event.note && (
                          <div className="mt-0.5 text-[10px] text-neutral-500 line-clamp-1">
                            {event.note}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 删除确认对话框 */}
      <AnimatePresence>
        {eventToDelete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setEventToDelete(null)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                确认删除
              </h3>
              <p className="text-neutral-600 mb-4">
                确定要删除事件 "{eventToDelete.content}" 吗？
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
                  onClick={() => setEventToDelete(null)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                  onClick={handleConfirmDelete}
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showEventForm && selectedDate && (
        <EventForm
          goalId={goal.id}
          initialDate={selectedDate}
          event={selectedEvent}
          onSubmit={handleEventSubmit}
          onClose={() => {
            setShowEventForm(false);
            setSelectedDate(null);
            setSelectedEvent(undefined);
            closeModal();
            setActiveModalId(null);
          }}
        />
      )}
    </div>
  );
};

export default GoalCalendar; 