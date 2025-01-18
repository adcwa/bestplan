import React, { useState } from 'react';
import type { Goal } from '../types/goals';

interface Props {
  onAddGoal: (goal: Goal) => void;
}

const AchievementGoal: React.FC<Props> = ({ onAddGoal }) => {
  const [steps, setSteps] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [newStep, setNewStep] = useState('');
  
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    
    setSteps(prev => [...prev, newStep.trim()]);
    setNewStep('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="输入目标标题"
          aria-label="目标标题"
        />
        
        <div className="flex flex-wrap gap-2">
          {['智力', '情感', '职业', '娱乐', '财务'].map(category => (
            <button
              key={category}
              type="button"
              className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
              aria-label={`选择${category}类别`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddStep} className="space-y-2">
        <h3 className="font-medium">下一步</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="添加步骤"
            aria-label="添加新步骤"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            aria-label="添加步骤"
          >
            添加
          </button>
        </div>
        <ul className="space-y-2">
          {steps.map((step, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </form>
    </div>
  );
};

export default AchievementGoal; 