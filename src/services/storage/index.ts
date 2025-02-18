import type { StorageService } from './types';
import type { AISettings } from '../../types/command';
import { IndexedDBStorage } from './indexeddb';

let storageInstance: StorageService | null = null;

const defaultSettings: AISettings = {
  openApiKey: '',
  baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  modelName: 'deepseek-chat'
};

import { R2Storage } from './R2Storage';

const r2Config = {
  accountId: process.env.NEXT_PUBLIC_R2_ACCOUNT_ID || '',
  accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.NEXT_PUBLIC_R2_BUCKET_NAME || ''
};

export function getStorageService(): StorageService {
  if (typeof window === 'undefined') {
    // 服务器端返回一个空的实现
    return {
      getGoals: async () => [],
      saveGoal: async () => {},
      updateGoal: async () => {},
      deleteGoal: async () => {},
      exportData: async () => '[]',
      importData: async () => {},
      clearAll: async () => {},
      getSettings: async () => defaultSettings,
      saveSettings: async () => {},
      getReview: async () => null,
      saveReview: async () => {},
    };
  }

  try {
    if (!storageInstance) {
      // 如果配置了 R2，则使用 R2Storage
      if (r2Config.accountId && r2Config.accessKeyId && r2Config.secretAccessKey && r2Config.bucketName) {
        storageInstance = new R2Storage(
          r2Config.accountId,
          r2Config.accessKeyId,
          r2Config.secretAccessKey,
          r2Config.bucketName
        );
      } else {
        storageInstance = new IndexedDBStorage();
      }
    }
    return storageInstance;
  } catch (error) {
    console.error('Failed to create storage instance:', error);
    // 返回一个基于 localStorage 的备用实现
    return {
      getGoals: async () => {
        const goals = localStorage.getItem('goals');
        return goals ? JSON.parse(goals) : [];
      },
      saveGoal: async (goal) => {
        const goals = await storageInstance?.getGoals() || [];
        localStorage.setItem('goals', JSON.stringify([...goals, goal]));
      },
      updateGoal: async (goal) => {
        const goals = await storageInstance?.getGoals() || [];
        localStorage.setItem('goals', JSON.stringify(goals.map(g => g.id === goal.id ? goal : g)));
      },
      deleteGoal: async (goalId) => {
        const goals = await storageInstance?.getGoals() || [];
        localStorage.setItem('goals', JSON.stringify(goals.filter(g => g.id !== goalId)));
      },
      exportData: async () => {
        const goals = await storageInstance?.getGoals() || [];
        return JSON.stringify(goals);
      },
      importData: async (data) => {
        localStorage.setItem('goals', data);
      },
      clearAll: async () => {
        localStorage.clear();
      },
      getSettings: async () => {
        const settings = localStorage.getItem('aiSettings');
        return settings ? JSON.parse(settings) : defaultSettings;
      },
      saveSettings: async (settings) => {
        localStorage.setItem('aiSettings', JSON.stringify(settings));
      },
      getReview: async () => null,
      saveReview: async () => {},
    };
  }
}