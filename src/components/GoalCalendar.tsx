'use client';

import React, { useState } from 'react';
import type { Goal, Event } from '../types/goals';
import { EventForm } from './index';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, addMonths, subMonths } from 'date-fns';
import { motionConfig } from '@/utils/motion';
import { useModal } from '@/contexts/ModalContext';

interface Props {
  goal: Goal;
  onAddEvent: (goalId: string, date: Date) => void;
  onDeleteEvent: (goalId: string, eventId: string) => void;
}

export const GoalCalendar: React.FC<Props> = ({ goal, onAddEvent, onDeleteEvent }) => {
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

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation(); // 阻止事件冒泡到日期单元格
    setSelectedEvent(event);
  };

  const handleDeleteEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation(); // 阻止事件冒泡
    onDeleteEvent(goal.id, eventId);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-4 h-full flex flex-col relative isolate">
      <div className="flex items-center justify-between flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full hover:bg-primary-light text-primary-dark"
          onClick={handlePrevMonth}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </motion.button>
        
        <motion.h3 
          className="text-lg font-medium text-neutral-900"
          layout
        >
          {format(currentDate, 'yyyy年MM月')}
        </motion.h3>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full hover:bg-primary-light text-primary-dark"
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

      <div className="grid grid-cols-7 gap-1 flex-grow">
        {calendar.map((day, index) => {
          const events = day ? getEventsForDay(day) : [];
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`
                aspect-square p-2 rounded-lg relative group
                ${day ? 'hover:bg-primary-light cursor-pointer' : 'bg-neutral-50'}
                ${events.length > 0 ? 'bg-primary-light/30' : ''}
              `}
              onClick={() => handleDayClick(day)}
            >
              {day && (
                <>
                  <span className="text-sm text-neutral-600">
                    {day}
                  </span>
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
                            onClick={(e) => handleEventClick(e, event)}
                          >
                            <span className="line-clamp-2 text-neutral-600 flex-grow">
                              {event.description}
                            </span>
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
          onSubmit={(event) => {
            onAddEvent(goal.id, event);
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