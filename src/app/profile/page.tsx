'use client'

import { useState } from 'react'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/Header'
import { PageTitle } from '@/components/PageTitle'

export default function ProfilePage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <PageTitle title="个人信息" />
          <div className="bg-white shadow rounded-lg">
            <ProfileForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 