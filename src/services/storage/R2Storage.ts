import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { StorageService } from './types';
import type { Goal } from '../../types/goals';
import type { AISettings } from '../../types/command';
import type { Review, ReviewPeriod } from '../../types/review';

export class R2Storage implements StorageService {
  private client: S3Client;
  private bucketName: string;
 
  constructor(accountId: string, accessKeyId: string, secretAccessKey: string, bucketName: string) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    this.bucketName = bucketName;
     
  }

  private async uploadToR2(key: string, data: any): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      ACL: 'public-read',
      CacheControl: 'no-cache',
       
    });
    await this.client.send(command);
  }

  private async downloadFromR2(key: string): Promise<any> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });
      const response = await this.client.send(command);
      const data = await response.Body?.transformToString();
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if ((error as any).name === 'NoSuchKey') {
        return null;
      }
      console.error('Error downloading from R2:', error);
      throw error;
    }
  }

  private async deleteFromR2(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });
    await this.client.send(command);
  }

  async getGoals(): Promise<Goal[]> {
    const goals = await this.downloadFromR2('goals.json');
    return goals || [];
  }

  async saveGoal(goal: Goal): Promise<void> {
    const goals = await this.getGoals();
    goals.push(goal);
    await this.uploadToR2('goals.json', goals);
  }

  async updateGoal(goal: Goal): Promise<void> {
    const goals = await this.getGoals();
    const index = goals.findIndex(g => g.id === goal.id);
    if (index !== -1) {
      goals[index] = goal;
      await this.uploadToR2('goals.json', goals);
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
    const goals = await this.getGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    await this.uploadToR2('goals.json', filteredGoals);
  }

  async exportData(): Promise<string> {
    const goals = await this.getGoals();
    return JSON.stringify(goals, null, 2);
  }

  async importData(data: string): Promise<void> {
    const goals = JSON.parse(data);
    await this.uploadToR2('goals.json', goals);
  }

  async clearAll(): Promise<void> {
    await this.uploadToR2('goals.json', []);
    await this.uploadToR2('settings.json', null);
  }

  async getSettings(): Promise<AISettings> {
    const settings = await this.downloadFromR2('settings.json');
    if (!settings) {
      const defaultSettings: AISettings = {
        openApiKey: '',
        baseUrl: 'https://api.deepseek.com/v1/chat/completions',
        modelName: 'deepseek-chat'
      };
      await this.saveSettings(defaultSettings);
      return defaultSettings;
    }
    return settings;
  }

  async saveSettings(settings: AISettings): Promise<void> {
    await this.uploadToR2('settings.json', settings);
  }

  async getReview(period: ReviewPeriod, year: number, month?: number, quarter?: number): Promise<Review | null> {
    const key = `review-${period}-${year}-${month}-${quarter}.json`;
    return await this.downloadFromR2(key);
  }

  async saveReview(review: Review): Promise<void> {
    const key = `review-${review.period}-${review.year}-${review.month}-${review.quarter}.json`;
    await this.uploadToR2(key, review);
  }
}