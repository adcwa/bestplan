'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/user'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (provider: 'google' | 'email', email?: string, password?: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 清理认证状态
  const clearAuthState = () => {
    setUser(null)
    setProfile(null)
    setLoading(false)
    // 清理本地存储
    window.localStorage.removeItem('supabase.auth.token')
    window.localStorage.removeItem('supabase.auth.expires_at')
    window.localStorage.removeItem('supabase.auth.refresh_token')
  }

  useEffect(() => {
    let mounted = true

    // 检查初始会话
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user)
            await fetchProfile(session.user.id)
          } else {
            clearAuthState()
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
        if (mounted) {
          clearAuthState()
        }
      }
    }

    initializeAuth()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('认证状态变化:', event, session?.user?.id)

      if (event === 'SIGNED_OUT') {
        clearAuthState()
        return
      }

      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        clearAuthState()
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('获取用户信息失败:', error)
        return
      }
      
      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const signIn = async (provider: 'google' | 'email', email?: string, password?: string) => {
    setLoading(true)
    try {
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
      } else if (email && password) {
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      }
    } catch (error) {
      console.error('登录错误:', error)
      clearAuthState()
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      if (!data.user) throw new Error('注册失败')

      // 注册成功后不需要立即设置用户状态，等待邮箱验证
    } catch (error) {
      console.error('注册错误:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // 确保清理所有状态
      clearAuthState()
      
      // 强制刷新页面以确保清理完全
      window.location.href = '/login'
    } catch (error) {
      console.error('退出错误:', error)
      throw error
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('用户未登录')

      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...data } : null)
    } catch (error) {
      console.error('更新个人信息错误:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 