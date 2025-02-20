import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { UserSettings } from '@/types/user'

export const SettingsForm = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) throw error
      setSettings(data)
    } catch (err) {
      console.error('获取设置失败:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存设置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (name: keyof UserSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [name]: value } : null)
  }

  if (!settings) return null

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">用户设置</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            主题
          </label>
          <select
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="system">跟随系统</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            语言
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="notifications"
            type="checkbox"
            checked={settings.notifications_enabled}
            onChange={(e) => handleChange('notifications_enabled', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700">
            启用通知
          </label>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存设置'}
        </button>
      </form>
    </div>
  )
} 