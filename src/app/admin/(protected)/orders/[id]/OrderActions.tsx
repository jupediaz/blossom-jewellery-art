'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/generated/prisma/client'
import { Loader2 } from 'lucide-react'

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirm',
  PROCESSING: 'Start Processing',
  SHIPPED: 'Mark Shipped',
  DELIVERED: 'Mark Delivered',
  CANCELLED: 'Cancel',
  REFUNDED: 'Refund',
}

interface OrderActionsProps {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const [note, setNote] = useState('')

  const nextStatuses = statusTransitions[currentStatus]

  if (nextStatuses.length === 0) return null

  async function updateStatus(newStatus: OrderStatus) {
    setLoading(true)
    try {
      const body: Record<string, string> = { status: newStatus }
      if (note) body.note = note
      if (newStatus === 'SHIPPED') {
        if (trackingNumber) body.trackingNumber = trackingNumber
        if (carrier) body.carrier = carrier
      }

      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Failed to update status')

      router.refresh()
      setNote('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showShippingFields = currentStatus === 'PROCESSING'

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 space-y-4">
      <h3 className="font-medium text-gray-900">Actions</h3>

      {showShippingFields && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
          <input
            type="text"
            placeholder="Carrier (e.g., Correos, DHL)"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
        </div>
      )}

      <textarea
        placeholder="Add a note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
      />

      <div className="flex flex-col gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            onClick={() => updateStatus(status)}
            disabled={loading}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              status === 'CANCELLED' || status === 'REFUNDED'
                ? 'border border-red-200 text-red-700 hover:bg-red-50'
                : 'bg-charcoal text-white hover:bg-charcoal/90'
            } disabled:opacity-50`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {statusLabels[status]}
          </button>
        ))}
      </div>
    </div>
  )
}
