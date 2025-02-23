'use client';

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/Header'
import { GoalTracker } from '@/components'

export default function HomePage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div suppressHydrationWarning>
          <h1 className="text-4xl font-bold">首页</h1>
        </div>
      </main>
    </ProtectedRoute>
  )
} 