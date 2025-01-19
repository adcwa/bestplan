import React from 'react';

interface Props {
  startDate: string;
  setStartDate: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  frequency: string;
  setFrequency: (value: string) => void;
}

export const TimeSettings: React.FC<Props> = ({
  startDate,
  setStartDate,
  deadline,
  setDeadline,
  frequency,
  setFrequency
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 mb-1">
            开始时间
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-neutral-700 mb-1">
            截止时间
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-neutral-700 mb-1">
          执行频率
        </label>
        <input
          id="frequency"
          type="text"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="例如：每天、每周3次等"
          required
        />
      </div>
    </div>
  );
}; 