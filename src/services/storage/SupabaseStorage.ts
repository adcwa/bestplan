import { supabase } from '../../lib/supabase';
import type { StorageService } from './types';
import type { Goal } from '../../types/goals';
import type { AISettings } from '../../types/command';
import type { Review, ReviewPeriod } from '../../types/review';

export class SupabaseStorage implements StorageService {
  private currentUser: { id: string; email: string; name: string } | null = null;

  constructor() {
    // 初始化时检查用户会话
    this.initializeUser();
  }

  private async initializeUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return;
    }
    
    if (session?.user) {
      await this.createOrUpdateUser(session.user);
    }

    // 监听认证状态变化
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.createOrUpdateUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      }
    });
  }

  private async createOrUpdateUser(user: any) {
    // 尝试创建或更新用户记录
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating/updating user:', error);
      return;
    }

    this.currentUser = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || ''
    };
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      if (session?.user) {
        await this.createOrUpdateUser(session.user);
      }
    }
    return this.currentUser;
  }

  async setCurrentUser(user: { id: string; email: string; name: string }) {
    await this.createOrUpdateUser({
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.name }
    });
  }

  private async ensureAuthenticated(): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.id;
  }

  async getGoals(userId?: string): Promise<Goal[]> {
    const authenticatedUserId = await this.ensureAuthenticated();
    // 如果没有提供 userId，使用当前认证用户的 ID
    const targetUserId = userId || authenticatedUserId;

    const { data, error } = await supabase
      .from('goals')
      .select('data')
      .eq('user_id', targetUserId);

    if (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }

    return data?.map(item => item.data) || [];
  }

  async saveGoal(goal: Goal): Promise<void> {
    const userId = await this.ensureAuthenticated();

    const { error } = await supabase
      .from('goals')
      .insert({
        id: goal.id,
        user_id: userId,
        data: goal,
      });

    if (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  }

  async updateGoal(goal: Goal): Promise<void> {
    const userId = await this.ensureAuthenticated();

    const { error } = await supabase
      .from('goals')
      .update({ data: goal })
      .eq('id', goal.id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    await this.ensureAuthenticated();

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  async exportData(userId?: string): Promise<string> {
    const authenticatedUserId = await this.ensureAuthenticated();
    const targetUserId = userId || authenticatedUserId;
    const goals = await this.getGoals(targetUserId);
    return JSON.stringify(goals, null, 2);
  }

  async importData(userId: string, data: string): Promise<void> {
    await this.ensureAuthenticated();

    const goals = JSON.parse(data);
    const { error } = await supabase
      .from('goals')
      .insert(
        goals.map((goal: Goal) => ({
          id: goal.id,
          user_id: userId,
          data: goal,
        }))
      );

    if (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  async clearAll(userId?: string): Promise<void> {
    const authenticatedUserId = await this.ensureAuthenticated();
    const targetUserId = userId || authenticatedUserId;

    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', targetUserId);

    if (goalsError) {
      console.error('Error clearing goals:', goalsError);
      throw goalsError;
    }

    const { error: settingsError } = await supabase
      .from('settings')
      .delete()
      .eq('user_id', targetUserId);

    if (settingsError) {
      console.error('Error clearing settings:', settingsError);
      throw settingsError;
    }
  }

  async getSettings(userId?: string): Promise<AISettings> {
    const authenticatedUserId = await this.ensureAuthenticated();
    const targetUserId = userId || authenticatedUserId;

    const { data, error } = await supabase
      .from('settings')
      .select('settings')
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // 没有找到记录
        const defaultSettings: AISettings = {
          openApiKey: '',
          baseUrl: 'https://api.deepseek.com/v1/chat/completions',
          modelName: 'deepseek-chat'
        };
        await this.saveSettings(targetUserId, defaultSettings);
        return defaultSettings;
      }
      console.error('Error fetching settings:', error);
      throw error;
    }

    return data?.settings;
  }

  async saveSettings(userId: string, settings: AISettings): Promise<void> {
    await this.ensureAuthenticated();

    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        settings,
      });

    if (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async getReview(userId: string, period: ReviewPeriod, year: number, month?: number, quarter?: number): Promise<Review | null> {
    await this.ensureAuthenticated();

    const { data, error } = await supabase
      .from('reviews')
      .select('data')
      .eq('user_id', userId)
      .eq('period', period)
      .eq('year', year)
      .eq('month', month || null)
      .eq('quarter', quarter || null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // 没有找到记录
        return null;
      }
      console.error('Error fetching review:', error);
      throw error;
    }

    return data?.data;
  }

  async saveReview(userId: string, review: Review): Promise<void> {
    await this.ensureAuthenticated();

    const { error } = await supabase
      .from('reviews')
      .upsert({
        user_id: userId,
        period: review.period,
        year: review.year,
        month: review.month,
        quarter: review.quarter,
        data: review,
      });

    if (error) {
      console.error('Error saving review:', error);
      throw error;
    }
  }
} 