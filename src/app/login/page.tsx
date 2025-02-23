'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { OnlineStatusBanner } from '@/components/ui/OnlineStatusBanner'

export default function LoginPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录到 BestPlan
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            开始规划你的最佳人生
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <LoginForm />
        </div>
        {/* <OnlineStatusBanner /> */}
      </div>
    </PublicRoute>
  )
} 