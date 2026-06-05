'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MarkReadButton({ messageId }: { messageId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function markRead() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/messages/${messageId}/read`, { method: 'PATCH' })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={markRead}
      disabled={loading}
      className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50"
    >
      {loading ? '...' : 'Mark read'}
    </button>
  )
}
