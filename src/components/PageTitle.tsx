'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface PageTitleProps {
  title: string
  showBack?: boolean
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, showBack = true }) => {
  const router = useRouter()

  return (
    <div className="flex items-center mb-6">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="返回"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
      )}
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    </div>
  )
} 