import React, { useState } from 'react';
import type { Event } from '../types/goals';
import { Modal } from './ui/Modal';
import { formatDate } from '@/utils/date';

interface Props {
  goalId: string;
  initialDate: Date;
  onSubmit: (goalId: string, event: Omit<Event, 'id'>) => void;
  onClose: () => void;
}

export const EventForm: React.FC<Props> = ({ goalId, initialDate, onSubmit, onClose }) => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date(initialDate);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventDate = new Date(date);
    eventDate.setHours(12, 0, 0, 0);
    
    onSubmit(goalId, {
      date: eventDate,
      description
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      {/* 主容器：白色背景，圆角，内边距12，最大宽度6xl，最小高度600px，flex布局 */}
      <div className="bg-white rounded-lg p-12 w-full max-w-10xl min-h-[600px] flex flex-col">
        {/* 顶部标题栏：flex布局，两端对齐，底部外边距10 */}
        <div className="flex justify-between items-center mb-10">
          <div>
            {/* 标题文本：2xl大小，加粗，深灰色 */}
            <h3 className="text-2xl font-semibold text-gray-900">记录进展</h3>
          </div>
          {/* 关闭按钮：灰色，hover时颜色变深，带过渡动画 */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="关闭"
          >
            {/* 关闭图标：6x6大小，描边样式 */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单：垂直间距8，flex布局，占满剩余空间 */}
        <form onSubmit={handleSubmit} className="space-y-8 flex-grow flex flex-col">
          {/* 日期输入区域 */}
          <div>
            {/* 日期标签：基础文本大小，中等粗细，深灰色，底部外边距3 */}
            <label htmlFor="date" className="block text-base font-medium text-gray-700 mb-3">
              日期
            </label>
            {/* 日期输入框：全宽，内边距5/4，大号文本，灰色边框，圆角，聚焦时显示主题色环 */}
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          {/* 描述输入区域：flex布局，占满剩余空间 */}
          <div className="flex-grow flex flex-col">
            {/* 描述标签：基础文本大小，中等粗细，深灰色，底部外边距3 */}
            <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-3">
              进展描述
            </label>
            {/* 描述文本框：占满剩余空间，全宽，内边距5/4，大号文本，灰色边框，圆角，聚焦时显示主题色环，禁用调整大小 */}
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-grow w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="请详细描述你的进展..."
              required
            />
          </div>

          {/* 按钮区域：flex布局，右对齐，按钮间距6，顶部内边距6 */}
          <div className="flex justify-end space-x-6 pt-6">
            {/* 取消按钮：内边距8/4，大号文本，灰色边框和文字，圆角，hover时背景变浅灰，带过渡动画 */}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            {/* 保存按钮：内边距8/4，大号文本，主题色背景，白色文字，圆角，hover时背景变深，带过渡动画 */}
            <button
              type="submit"
              
              className="px-6 py-3 text-base bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EventForm; 