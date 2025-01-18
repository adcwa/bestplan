import React, { useState, useEffect } from 'react';
import type { Goal, GoalType, GoalDomain, Trigger, GoalHistory } from '../types/goals';

interface Props {
  type: GoalType;
  goal?: Goal;
  onClose: () => void;
  onSubmit: (goal: Goal) => void;
}

const DOMAINS: GoalDomain[] = [
  '精神', '智力', '情感', '职业', '婚姻', 
  '亲子', '社交', '娱乐', '财务', '健康'
];

export const AddGoalModal: React.FC<Props> = ({ type, goal, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<GoalDomain[]>([]);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [newMotivation, setNewMotivation] = useState('');
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [rewards, setRewards] = useState<string[]>([]);
  const [newReward, setNewReward] = useState('');
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [newTriggerWhen, setNewTriggerWhen] = useState('');
  const [newTriggerThen, setNewTriggerThen] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setStartDate(goal.startDate.toISOString().split('T')[0]);
      setDeadline(goal.deadline.toISOString().split('T')[0]);
      setFrequency(goal.frequency);
      setSelectedDomains(goal.domains);
      setMotivations(goal.motivations);
      setNextSteps(goal.nextSteps);
      setRewards(goal.rewards);
      setTriggers(goal.triggers);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !deadline || !frequency) return;

    const now = new Date();
    const historyEntry: GoalHistory = {
      id: Date.now().toString(),
      date: now,
      type: goal ? 'update' : 'create',
      changes: []
    };

    if (goal) {
      if (goal.title !== title) {
        historyEntry.changes.push({
          field: 'title',
          oldValue: goal.title,
          newValue: title
        });
      }
    }

    const newGoal: Goal = {
      id: goal?.id || Date.now().toString(),
      type,
      title,
      startDate: new Date(startDate),
      deadline: new Date(deadline),
      frequency,
      domains: selectedDomains,
      motivations,
      nextSteps,
      rewards,
      triggers,
      events: goal?.events || [],
      history: [...(goal?.history || []), historyEntry],
      lastModified: now
    };

    onSubmit(newGoal);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {goal ? '编辑目标' : `添加${type === 'achievement' ? '成就型' : '习惯型'}目标`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">目标描述</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">开始时间</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">截止时间</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">频率</label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="每天/每周/每月"
                  required
                />
              </div>
            </div>
          </div>

          {/* 领域选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">领域（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(domain => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => {
                    setSelectedDomains(prev => 
                      prev.includes(domain)
                        ? prev.filter(d => d !== domain)
                        : [...prev, domain]
                    );
                  }}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    selectedDomains.includes(domain)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* 动态列表（动机、步骤、奖励） */}
          <div className="space-y-4">
            {/* 主要动机 */}
            <div>
              <label className="block text-sm font-medium mb-2">主要动机</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMotivation}
                  onChange={(e) => setNewMotivation(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="添加动机"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newMotivation.trim()) {
                      setMotivations(prev => [...prev, newMotivation.trim()]);
                      setNewMotivation('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
              <ul className="space-y-2">
                {motivations.map((motivation, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <span>{motivation}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMotivations(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 下一步计划 */}
            <div>
              <label className="block text-sm font-medium mb-2">下一步计划</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="添加计划步骤"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newStep.trim()) {
                      setNextSteps(prev => [...prev, newStep.trim()]);
                      setNewStep('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
              <ul className="space-y-2">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <span>{step}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNextSteps(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 奖励 */}
            <div>
              <label className="block text-sm font-medium mb-2">奖励设置</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="添加奖励"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newReward.trim()) {
                      setRewards(prev => [...prev, newReward.trim()]);
                      setNewReward('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  添加
                </button>
              </div>
              <ul className="space-y-2">
                {rewards.map((reward, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <span>{reward}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRewards(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 触发器 */}
            <div>
              <label className="block text-sm font-medium mb-2">触发器</label>
              <div className="space-y-2 mb-2">
                <input
                  type="text"
                  value={newTriggerWhen}
                  onChange={(e) => setNewTriggerWhen(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="当..."
                />
                <input
                  type="text"
                  value={newTriggerThen}
                  onChange={(e) => setNewTriggerThen(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="则..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTriggerWhen.trim() && newTriggerThen.trim()) {
                      setTriggers(prev => [...prev, {
                        id: Date.now().toString(),
                        when: newTriggerWhen.trim(),
                        then: newTriggerThen.trim()
                      }]);
                      setNewTriggerWhen('');
                      setNewTriggerThen('');
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  添加触发器
                </button>
              </div>
              <ul className="space-y-2">
                {triggers.map((trigger) => (
                  <li key={trigger.id} className="bg-gray-50 px-3 py-2 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p>当：{trigger.when}</p>
                        <p>则：{trigger.then}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTriggers(prev => 
                            prev.filter(t => t.id !== trigger.id)
                          );
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        删除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md ${
                goal 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {goal ? '保存修改' : '创建目标'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 