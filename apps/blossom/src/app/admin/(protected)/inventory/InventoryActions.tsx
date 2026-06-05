'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Loader2 } from 'lucide-react'

interface InventoryActionsProps {
  inventoryId: string
  currentTotal: number
}

export function InventoryActions({ inventoryId, currentTotal }: InventoryActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [adjusting, setAdjusting] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  async function handleAdjust(type: 'RESTOCK' | 'ADJUSTMENT') {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId,
          type,
          quantity: type === 'ADJUSTMENT' ? -quantity : quantity,
          reason: reason || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to adjust inventory')
      }
      setAdjusting(false)
      setQuantity(1)
      setReason('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust inventory')
    } finally {
      setLoading(false)
    }
  }

  if (!adjusting) {
    return (
      <button
        onClick={() => setAdjusting(true)}
        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        Adjust
      </button>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm"
        />
        <button
          onClick={() => handleAdjust('RESTOCK')}
          disabled={loading}
          className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 disabled:opacity-50"
          title="Add stock"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => handleAdjust('ADJUSTMENT')}
          disabled={loading || currentTotal < quantity}
          className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-50"
          title="Remove stock"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => { setAdjusting(false); setError('') }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
