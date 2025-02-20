import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserProfile } from '@/types/user'
import { useRouter } from 'next/navigation'
import { CogIcon } from '@heroicons/react/24/outline'

export const ProfileForm = () => {
  const { profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
        <button
          onClick={() => router.push('/settings')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <CogIcon className="h-4 w-4 mr-2" />
          更多设置
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {profile?.avatar_url && (
          <div className="flex justify-center mb-6">
            <img
              src={profile.avatar_url}
              alt={profile.full_name || '用户头像'}
              className="h-24 w-24 rounded-full"
            />
          </div>
        )}

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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>

        {profile && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">账号信息</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">邮箱：{profile.email}</p>
              <p className="text-sm text-gray-500">
                最后更新：{profile.updated_at ? new Date(profile.updated_at).toLocaleString() : '未知'}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
} 