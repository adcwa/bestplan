'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { PublicRoute } from '@/components/auth/PublicRoute'

export default function RegisterPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            注册 BestPlan
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            创建账号，开始规划你的最佳人生
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <RegisterForm />
        </div>
      </div>
    </PublicRoute>
  )
} 