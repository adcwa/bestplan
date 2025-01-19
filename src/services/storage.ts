import { Goal } from '@/types/goals';
import { AISettings } from '@/types/command';

export interface StorageService {
  getGoals: () => Promise<Goal[]>;
  saveGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  saveGoals: (goals: Goal[]) => Promise<void>;
  getSettings: () => Promise<AISettings>;
  saveSettings: (settings: AISettings) => Promise<void>;
}

class LocalStorageService implements StorageService {
  async getGoals(): Promise<Goal[]> {
    try {
      const goals = localStorage.getItem('goals');
      return goals ? JSON.parse(goals) : [];
    } catch (error) {
      console.error('Failed to get goals:', error);
      return [];
    }
  }

  async saveGoal(goal: Goal): Promise<void> {
    try {
      const goals = await this.getGoals();
      goals.push(goal);
      localStorage.setItem('goals', JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goal:', error);
      throw error;
    }
  }

  async updateGoal(goal: Goal): Promise<void> {
    try {
      const goals = await this.getGoals();
      const index = goals.findIndex(g => g.id === goal.id);
      if (index !== -1) {
        goals[index] = goal;
        localStorage.setItem('goals', JSON.stringify(goals));
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  }

  async saveGoals(goals: Goal[]): Promise<void> {
    try {
      localStorage.setItem('goals', JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals:', error);
      throw error;
    }
  }

  async getSettings(): Promise<AISettings> {
    try {
      const settings = localStorage.getItem('aiSettings');
      if (!settings) {
        const defaultSettings: AISettings = {
          openApiKey: '',
          baseUrl: 'https://api.deepseek.com/v1/chat/completions',
          modelName: 'deepseek-chat'
        };
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
      return JSON.parse(settings);
    } catch (error) {
      console.error('Failed to get settings:', error);
      throw error;
    }
  }

  async saveSettings(settings: AISettings): Promise<void> {
    try {
      localStorage.setItem('aiSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }
}

class IndexedDBService implements StorageService {
  private dbName = 'goalTrackerDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  async getGoals(): Promise<Goal[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['goals'], 'readonly');
      const store = transaction.objectStore('goals');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async saveGoal(goal: Goal): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['goals'], 'readwrite');
      const store = transaction.objectStore('goals');
      const request = store.put(goal);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateGoal(goal: Goal): Promise<void> {
    await this.saveGoal(goal);
  }

  async saveGoals(goals: Goal[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['goals'], 'readwrite');
      const store = transaction.objectStore('goals');
      
      // 清除现有数据
      store.clear();
      
      // 添加新数据
      goals.forEach(goal => {
        store.add(goal);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getSettings(): Promise<AISettings> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('aiSettings');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const settings = request.result?.settings;
        if (!settings) {
          const defaultSettings: AISettings = {
            openApiKey: '',
            baseUrl: 'https://api.deepseek.com/v1/chat/completions',
            modelName: 'deepseek-chat'
          };
          this.saveSettings(defaultSettings)
            .then(() => resolve(defaultSettings))
            .catch(reject);
        } else {
          resolve(settings);
        }
      };
    });
  }

  async saveSettings(settings: AISettings): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ id: 'aiSettings', settings });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// 导出获取存储服务的函数
export const getStorageService = (): StorageService => {
  // 根据环境或配置选择存储服务
  if (typeof window !== 'undefined' && window.indexedDB) {
    return new IndexedDBService();
  }
  return new LocalStorageService();
}; 