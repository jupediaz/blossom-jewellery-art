'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/admin/Sidebar'

interface AdminShellProps {
  children: React.ReactNode
  user: {
    name?: string | null
    email: string
    role: string
  }
}

export function AdminShell({ children, user }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
