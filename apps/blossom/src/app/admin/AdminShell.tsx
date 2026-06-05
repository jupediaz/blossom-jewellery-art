'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/admin/Sidebar'

interface AdminShellProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email: string
    role: string
  }
  unreadMessages?: number
  pendingReviews?: number
  pendingReturns?: number
}

export function AdminShell({ children, user, unreadMessages = 0, pendingReviews = 0, pendingReturns = 0 }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        unreadMessages={unreadMessages}
        pendingReviews={pendingReviews}
        pendingReturns={pendingReturns}
      />
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex items-center gap-4 bg-gray-50 px-6 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-200"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium text-gray-700">Blossom Admin</span>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
