export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  updated_at?: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications_enabled: boolean
  updated_at?: string
} 