'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/generated/prisma/client'
import { VALID_TRANSITIONS } from '@/lib/order-transitions'
import { Loader2, RotateCcw, X, CheckCircle2, AlertCircle } from 'lucide-react'

const statusLabels: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirm',
  PROCESSING: 'Start Processing',
  SHIPPED: 'Mark Shipped',
  DELIVERED: 'Mark Delivered',
  CANCELLED: 'Cancel',
  REFUNDED: 'Refund',
}

// Statuses for which the "Process Refund" button should appear
const REFUNDABLE_STATUSES: OrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const REFUND_REASONS = [
  { value: 'requested_by_customer', label: 'Requested by customer' },
  { value: 'duplicate', label: 'Duplicate order' },
  { value: 'fraudulent', label: 'Fraudulent transaction' },
] as const

type RefundReason = typeof REFUND_REASONS[number]['value']

interface RefundResult {
  refundId: string
  orderStatus: string
  paymentStatus: string
  amount: number
}

interface OrderActionsProps {
  orderId: string
  currentStatus: OrderStatus
  orderTotal: number
  currency: string
}

export function OrderActions({ orderId, currentStatus, orderTotal, currency }: OrderActionsProps) {
  const router = useRouter()

  // Status transition state
  const [loading, setLoading] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const [note, setNote] = useState('')

  // Refund modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState(orderTotal.toFixed(2))
  const [refundReason, setRefundReason] = useState<RefundReason>('requested_by_customer')
  const [refundLoading, setRefundLoading] = useState(false)
  const [refundError, setRefundError] = useState('')
  const [refundResult, setRefundResult] = useState<RefundResult | null>(null)

  const nextStatuses = VALID_TRANSITIONS[currentStatus] ?? []
  const canRefund = REFUNDABLE_STATUSES.includes(currentStatus)

  const hasAnyAction = nextStatuses.length > 0 || canRefund
  if (!hasAnyAction) return null

  async function updateStatus(newStatus: OrderStatus) {
    setLoading(true)
    setStatusError('')
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

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update status')

      router.refresh()
      setNote('')
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  function openRefundModal() {
    setRefundAmount(orderTotal.toFixed(2))
    setRefundReason('requested_by_customer')
    setRefundError('')
    setRefundResult(null)
    setModalOpen(true)
  }

  function closeRefundModal() {
    if (refundLoading) return
    setModalOpen(false)
    if (refundResult) {
      router.refresh()
    }
  }

  async function handleRefund() {
    const parsedAmount = parseFloat(refundAmount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setRefundError('Please enter a valid refund amount.')
      return
    }
    if (parsedAmount > orderTotal) {
      setRefundError(
        `Refund amount cannot exceed the order total (${currency} ${orderTotal.toFixed(2)}).`
      )
      return
    }

    setRefundLoading(true)
    setRefundError('')

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsedAmount, reason: refundReason }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Refund failed')
      }

      setRefundResult(data)
    } catch (err) {
      setRefundError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRefundLoading(false)
    }
  }

  const showShippingFields = currentStatus === 'PROCESSING'
  const parsedRefundAmount = parseFloat(refundAmount)
  const isPartialRefund =
    !isNaN(parsedRefundAmount) &&
    parsedRefundAmount > 0 &&
    parsedRefundAmount < orderTotal

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 space-y-4">
        <h3 className="font-medium text-gray-900">Actions</h3>

        {statusError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{statusError}</p>
          </div>
        )}

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

        {nextStatuses.length > 0 && (
          <>
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
          </>
        )}

        {canRefund && (
          <button
            onClick={openRefundModal}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 hover:border-red-300"
          >
            <RotateCcw className="h-4 w-4" />
            Process Refund
          </button>
        )}
      </div>

      {/* Refund modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeRefundModal}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-red-600" />
                <h2 className="text-base font-semibold text-gray-900">Process Refund</h2>
              </div>
              <button
                onClick={closeRefundModal}
                disabled={refundLoading}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {refundResult ? (
                /* Success state */
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">
                        Refund processed successfully
                      </p>
                      <p className="mt-1 text-xs text-emerald-700">
                        A confirmation email has been sent to the customer.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Stripe Refund ID</span>
                      <span className="font-mono text-xs text-gray-700">{refundResult.refundId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount Refunded</span>
                      <span className="font-medium text-gray-900">
                        {currency} {(refundResult.amount / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">New Order Status</span>
                      <span className="font-medium text-gray-900">
                        {refundResult.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closeRefundModal}
                    className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Form state */
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Refund Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        {currency}
                      </span>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        max={orderTotal}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-14 pr-3 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        disabled={refundLoading}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Order total: {currency} {orderTotal.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Reason
                    </label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value as RefundReason)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      disabled={refundLoading}
                    >
                      {REFUND_REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isPartialRefund && (
                    <div className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-800">
                      This is a <strong>partial refund</strong>. The order status will be set to
                      &ldquo;Partially Refunded&rdquo;.
                    </div>
                  )}

                  {refundError && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                      <p className="text-sm text-red-700">{refundError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={closeRefundModal}
                      disabled={refundLoading}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRefund}
                      disabled={refundLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {refundLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing&hellip;
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          Confirm Refund
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
