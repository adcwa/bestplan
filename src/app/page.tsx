'use client';

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Header } from '@/components/Header'
import { OnlineStatusBanner } from '@/components/ui/OnlineStatusBanner'
import { CalendarDaysIcon, ChartBarIcon, ListTodoIcon, StarIcon } from 'lucide-react'
import { GoalTracker } from '@/components'

export default function HomePage() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} /> */}
        
        <GoalTracker/>
         <OnlineStatusBanner />
        
        
      </div>
    </ProtectedRoute>
  )
} 