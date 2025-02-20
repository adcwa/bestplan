'use client';

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/Header'
import { GoalTracker } from '@/components'

export default function HomePage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      
        <div className="max-w-7xl  px-4 sm:px-2 ">
          <main >
            <div className="px-4 py-6 sm:px-0">
              <GoalTracker />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 