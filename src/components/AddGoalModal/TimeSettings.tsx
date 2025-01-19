import React from 'react';

interface TimeSettingsProps {
  type: GoalType;
  startDate: string;
  setStartDate: (date: string) => void;
  deadline: string;
  setDeadline: (date: string) => void;
  frequency: string;
  setFrequency: (frequency: string) => void;
}

export const TimeSettings: React.FC<TimeSettingsProps> = ({
  type,
  startDate,
  setStartDate,
  deadline,
  setDeadline,
  frequency,
  setFrequency
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          开始时间
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          截止时间
        </label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary focus:border-primary"
        />
      </div>

      {type === 'habit' && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            执行频率
          </label>
          <input
            type="text"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="例如：每天、每周三次、每月5次等"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary focus:border-primary"
          />
          <p className="mt-1 text-xs text-neutral-500">
            请输入具体的执行频率，如：每天、每周三次、每月5次等
          </p>
        </div>
      )}
    </div>
  );
}; 