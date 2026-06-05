'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface Props {
  returnId: string
  currentStatus: string
}

const TRANSITIONS: Record<string, { label: string; status: string; resolution?: string }[]> = {
  REQUESTED: [
    { label: 'Review', status: 'UNDER_REVIEW' },
    { label: 'Reject', status: 'REJECTED' },
  ],
  UNDER_REVIEW: [
    { label: 'Approve (Refund)', status: 'APPROVED', resolution: 'REFUND' },
    { label: 'Approve (Exchange)', status: 'APPROVED', resolution: 'EXCHANGE' },
    { label: 'Approve (Store Credit)', status: 'APPROVED', resolution: 'STORE_CREDIT' },
    { label: 'Reject', status: 'REJECTED' },
  ],
  APPROVED: [
    { label: 'Mark Completed', status: 'COMPLETED' },
  ],
}

export function ReturnActions({ returnId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ status: string; resolution?: string } | null>(null)

  const transitions = TRANSITIONS[currentStatus] ?? []

  async function handleAction(action: { status: string; resolution?: string }) {
    if (action.status === 'REJECTED' && !showNote) {
      setPendingAction(action)
      setShowNote(true)
      return
    }

    setLoading(true)
    try {
      await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action.status,
          resolution: action.resolution,
          adminNote: adminNote || undefined,
        }),
      })
      router.refresh()
    } finally {
      setLoading(false)
      setShowNote(false)
      setPendingAction(null)
      setAdminNote('')
    }
  }

  if (transitions.length === 0) {
    return <span className="text-xs text-gray-400">—</span>
  }

  return (
    <div className="space-y-2">
      {showNote && pendingAction ? (
        <div className="space-y-2">
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Reason for rejection (optional)"
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-charcoal focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(pendingAction)}
              disabled={loading}
              className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Reject
            </button>
            <button
              onClick={() => { setShowNote(false); setPendingAction(null) }}
              className="rounded px-2.5 py-1 text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1">
          {transitions.map((t) => (
            <button
              key={`${t.status}-${t.resolution ?? ''}`}
              onClick={() => handleAction(t)}
              disabled={loading}
              className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                t.status === 'REJECTED'
                  ? 'border border-red-300 text-red-600 hover:bg-red-50'
                  : t.status === 'APPROVED' || t.status === 'COMPLETED'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
