import React, { useState } from 'react';
import type { Goal, Event } from '../types/goals';
import { EventForm } from './index';

interface Props {
  goal: Goal;
  onAddEvent: (goalId: string, event: Omit<Event, 'id'>) => void;
}

const GoalCalendar: React.FC<Props> = ({ goal, onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const firstDayOfWeek = startOfMonth.getDay();

  const weeks = Math.ceil((daysInMonth + firstDayOfWeek) / 7);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">事件追踪日历</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="上个月"
          >
            ←
          </button>
          <span className="px-4 py-2">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </span>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="下个月"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center py-2 text-gray-500">
            {day}
          </div>
        ))}
        
        {calendar.map((day, index) => (
          <div
            key={index}
            className={`
              min-h-[100px] border p-2 
              ${day ? 'hover:bg-gray-50' : 'bg-gray-50'}
            `}
          >
            {day && (
              <>
                <div className="text-right text-gray-500 mb-1">{day}</div>
                <div className="space-y-1">
                  {getEventsForDay(day).map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-blue-100 text-blue-700 rounded"
                      title={event.description}
                    >
                      {event.description}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showEventForm && (
        <EventForm
          goalId={goal.id}
          onSubmit={(event) => {
            onAddEvent(goal.id, event);
            setShowEventForm(false);
          }}
          onClose={() => setShowEventForm(false)}
        />
      )}

      <button
        onClick={() => setShowEventForm(true)}
        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        添加新事件
      </button>
    </div>
  );
};

export default GoalCalendar; 