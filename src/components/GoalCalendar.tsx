'use client';

import React, { useState } from 'react';
import type { Goal, Event } from '@/types/goals';
import { EventForm } from './index';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onAddEvent(goal.id, date);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    onEditEvent(goal.id, event);
  };

  const handleDeleteEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    onDeleteEvent(eventId);
  };

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
          <div key={day} className="text-center text-sm text-neutral-500">
            {day}
          </div>
        ))}
      </div>

      {/* 日历格子 */}
      <div className="grid grid-cols-7 gap-2">
        {calendar.map((day, index) => {
          const events = day ? getEventsForDay(day) : [];
          const isToday = day && isSameDay(new Date(), new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`
                relative p-2 rounded-lg transition-colors
                ${day ? 'hover:bg-primary/5 cursor-pointer' : 'bg-neutral-50/50'}
                ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${events.length > 0 ? 'bg-primary/5' : ''}
              `}
              onClick={() => handleDayClick(day)}
            >
              {day && (
                <>
                  <span className="text-sm text-neutral-600">
                    {day}
                  </span>
                  {/* 默认显示事件标题 */}
                  {events.length > 0 && (
                    <div className="mt-1">
                      {events.map(event => (
                        <div 
                          key={event.id}
                          className="text-xs text-neutral-600 truncate"
                        >
                          {event.content}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Hover 时显示详细信息和操作按钮 */}
                  {events.length > 0 && (
                    <div 
                      className="absolute inset-0 p-2 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg overflow-y-auto"
                      style={{ zIndex: 100 }}
                    >
                      <ul className="text-xs space-y-1">
                        {events.map(event => (
                          <li 
                            key={event.id} 
                            className="flex items-center justify-between group/event relative"
                          >
                            <div 
                              className="flex-grow cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                            >
                              <span className="line-clamp-2 text-neutral-600">
                                {event.content}
                              </span>
                              {event.note && (
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {event.note}
                                </div>
                              )}
                            </div>
                            <button
                              className="text-red-500 opacity-0 group-hover/event:opacity-100 transition-opacity ml-2"
                              onClick={(e) => handleDeleteEvent(e, event.id)}
                              aria-label="删除事件"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {showEventForm && selectedDate && (
        <EventForm
          goalId={goal.id}
          initialDate={selectedDate}
          event={selectedEvent}
          onSubmit={(event) => {
            onEditEvent(goal.id, event);
            setShowEventForm(false);
            setSelectedDate(null);
            closeModal();
            setActiveModalId(null);
          }}
          onClose={() => {
            setShowEventForm(false);
            setSelectedDate(null);
            closeModal();
            setActiveModalId(null);
          }}
        />
      )}
    </div>
  );
};

export default GoalCalendar; 