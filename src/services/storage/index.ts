import type { StorageService } from './types';
import type { AISettings } from '../../types/command';
import { IndexedDBStorage } from './indexeddb';
import { R2Storage } from './R2Storage';
import { SupabaseStorage } from './SupabaseStorage';

let storageInstance: StorageService | null = null;

const defaultSettings: AISettings = {
  openApiKey: '',
  baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  modelName: 'deepseek-chat'
};

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
      getCurrentUser: async () => null,
      setCurrentUser: async () => {},
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
      // 优先使用 Supabase
      storageInstance = new SupabaseStorage();
      
      // 如果配置了 R2，则使用 R2Storage 作为备选
      if (r2Config.accountId && r2Config.accessKeyId && r2Config.secretAccessKey && r2Config.bucketName) {
        console.log('R2 storage is configured but using Supabase instead');
      }
    }
    return storageInstance;
  } catch (error) {
    console.error('Failed to initialize storage service:', error);
    // 如果 Supabase 初始化失败，尝试使用 R2
    if (!storageInstance && r2Config.accountId && r2Config.accessKeyId && r2Config.secretAccessKey && r2Config.bucketName) {
      storageInstance = new R2Storage(
        r2Config.accountId,
        r2Config.accessKeyId,
        r2Config.secretAccessKey,
        r2Config.bucketName
      );
      return storageInstance;
    }
    // 最后使用 IndexedDB
    storageInstance = new IndexedDBStorage();
    return storageInstance;
  }
}