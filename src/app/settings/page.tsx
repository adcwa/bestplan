'use client'

import { useState } from 'react'
import { SettingsForm } from '@/components/auth/SettingsForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/Header'

export default function SettingsPage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 主要内容区域 */}
          <main className="py-6">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-center">
                <SettingsForm />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 