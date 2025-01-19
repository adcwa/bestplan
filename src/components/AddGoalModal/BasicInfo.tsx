import React from 'react';
import type { GoalDomain } from '@/types/goals';

interface Props {
  title: string;
  setTitle: (value: string) => void;
  selectedDomains: GoalDomain[];
  setSelectedDomains: (value: GoalDomain[]) => void;
  DOMAINS: GoalDomain[];
}

export const BasicInfo: React.FC<Props> = ({
  title,
  setTitle,
  selectedDomains,
  setSelectedDomains,
  DOMAINS
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
          目标标题
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          相关领域
        </label>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map(domain => (
            <button
              key={domain}
              type="button"
              onClick={() => {
                setSelectedDomains((prev: GoalDomain[]) =>
                  prev.includes(domain)
                    ? prev.filter((d: GoalDomain) => d !== domain)
                    : [...prev, domain]
                );
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedDomains.includes(domain)
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 