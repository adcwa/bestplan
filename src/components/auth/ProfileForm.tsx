import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserProfile } from '@/types/user'

export const ProfileForm = () => {
  const { profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await updateProfile(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">个人信息</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
            姓名
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
            头像 URL
          </label>
          <input
            id="avatar_url"
            name="avatar_url"
            type="url"
            value={formData.avatar_url}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存修改'}
        </button>
      </form>

      {profile && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">当前信息</h3>
          <div className="mt-2 flex items-center space-x-4">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || '用户头像'}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">{profile.full_name || '未设置姓名'}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 