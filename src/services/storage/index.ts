import type { StorageService } from './types';
import { IndexedDBStorage } from './indexeddb';

let storageInstance: StorageService | null = null;

export const getStorageService = (): StorageService => {
  if (!storageInstance) {
    storageInstance = new IndexedDBStorage();
  }
  return storageInstance;
}; 