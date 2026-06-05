'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReviewActionsProps {
  reviewId: string
  isApproved: boolean
}

export function ReviewActions({ reviewId, isApproved }: ReviewActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      {!isApproved && (
        <button
          onClick={() => handle('approve')}
          disabled={loading}
          title="Approve"
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition-colors"
        >
          <Check size={12} />
          Approve
        </button>
      )}
      <button
        onClick={() => handle('reject')}
        disabled={loading}
        title="Delete"
        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        <X size={12} />
        Delete
      </button>
    </div>
  )
}
