'use client'

import { Menu, Bell } from 'lucide-react'

interface AdminHeaderProps {
  onMenuClick: () => void
  title: string
}

export function AdminHeader({ onMenuClick, title }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
