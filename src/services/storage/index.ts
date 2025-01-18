import type { StorageService } from './types';

let storageInstance: StorageService | null = null;

export const getStorageService = (): StorageService => {
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
    };
  }

  if (!storageInstance) {
    // 动态导入 IndexedDBStorage
    const { IndexedDBStorage } = require('./indexeddb');
    storageInstance = new IndexedDBStorage();
  }
  return storageInstance;
}; 