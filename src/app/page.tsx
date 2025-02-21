'use client';

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/Header'
import { GoalTracker } from '@/components'

export default function HomePage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  return (
    <ProtectedRoute>
      <main>
      <GoalTracker />
    </main>
    </ProtectedRoute>
  )
} 