import React, { useState } from 'react';
import type { Goal } from '../types/goals';

interface Props {
  onAddGoal: (goal: Goal) => void;
}

const HabitGoal: React.FC<Props> = ({ onAddGoal }) => {
  const [title, setTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      type: 'habit',
      title,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60天后
      category: selectedCategories,
      steps: [],
      completed: false
    };

    onAddGoal(newGoal);
    setTitle('');
    setSelectedCategories([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="输入习惯目标"
          aria-label="习惯目标标题"
        />
        
        <div className="flex flex-wrap gap-2">
          {['神经', '亲子', '智力', '职业', '生理'].map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setSelectedCategories(prev => 
                  prev.includes(category) 
                    ? prev.filter(c => c !== category)
                    : [...prev, category]
                );
              }}
              className={`px-3 py-1 rounded-full transition-colors ${
                selectedCategories.includes(category)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label={`选择${category}类别`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!title}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        aria-label="添加习惯目标"
      >
        添加习惯
      </button>
    </form>
  );
};

export default HabitGoal; 