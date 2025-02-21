'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 类型定义
export interface DBGoal {
  id: string;
  user_id: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface DBSettings {
  user_id: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface DBReview {
  id: string;
  user_id: string;
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface DBUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
} 