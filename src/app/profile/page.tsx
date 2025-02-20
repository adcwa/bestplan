'use client'

import { useState } from 'react'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/Header'

export default function ProfilePage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <main className="py-6">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-center">
                <ProfileForm />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 