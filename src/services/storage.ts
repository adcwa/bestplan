import { Goal } from '@/types/goals';
import { AISettings } from '@/types/command';
import { Review, ReviewPeriod } from '@/types/review';
import { getStorageService } from './storage/index';

export interface StorageService {
  getGoals: () => Promise<Goal[]>;
  saveGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  saveGoals: (goals: Goal[]) => Promise<void>;
  getSettings: () => Promise<AISettings>;
  saveSettings: (settings: AISettings) => Promise<void>;
  getReview: (period: ReviewPeriod, year: number, month?: number, quarter?: number) => Promise<Review | null>;
  saveReview: (review: Review) => Promise<void>;
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

  async getReview(period: ReviewPeriod, year: number, month?: number, quarter?: number): Promise<Review | null> {
    try {
      const review = localStorage.getItem(`review-${period}-${year}-${month}-${quarter}`);
      return review ? JSON.parse(review) : null;
    } catch (error) {
      console.error('Failed to get review:', error);
      return null;
    }
  }

  async saveReview(review: Review): Promise<void> {
    try {
      localStorage.setItem(`review-${review.period}-${review.year}-${review.month}-${review.quarter}`, JSON.stringify(review));
    } catch (error) {
      console.error('Failed to save review:', error);
      throw error;
    }
  }
}

class IndexedDBService implements StorageService {
  private dbName = 'goalTrackerDB';
  private version = 2;
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
          const goalsStore = db.createObjectStore('goals', { keyPath: 'id' });
          goalsStore.createIndex('type', 'type', { unique: false });
          goalsStore.createIndex('domains', 'domains', { unique: false, multiEntry: true });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('reviews')) {
          const reviewsStore = db.createObjectStore('reviews', { keyPath: 'year' });
          reviewsStore.createIndex('year', 'year', { unique: true });
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
      
      store.clear();
      
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

  async getReview(period: ReviewPeriod, year: number, month?: number, quarter?: number): Promise<Review | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reviews'], 'readonly');
      const store = transaction.objectStore('reviews');
      const key = this.generateReviewKey(period, year, month, quarter);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async saveReview(review: Review): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reviews'], 'readwrite');
      const store = transaction.objectStore('reviews');
      const key = this.generateReviewKey(review.period, review.year, review.month, review.quarter);
      const request = store.put({ ...review, id: key });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private generateReviewKey(period: ReviewPeriod, year: number, month?: number, quarter?: number): string {
    switch (period) {
      case 'month':
        return `${period}-${year}-${month}`;
      case 'quarter':
        return `${period}-${year}-${quarter}`;
      case 'year':
        return `${period}-${year}`;
    }
  }
}

export const storage = getStorageService(); 