import type { OrderStatus, PaymentStatus } from '@/generated/prisma/client'

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
  PROCESSING: { label: 'Processing', className: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' },
  SHIPPED: { label: 'Shipped', className: 'bg-purple-50 text-purple-700 ring-purple-600/20' },
  DELIVERED: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-50 text-gray-700 ring-gray-600/20' },
  REFUNDED: { label: 'Refunded', className: 'bg-red-50 text-red-700 ring-red-600/20' },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' },
  PAID: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  FAILED: { label: 'Failed', className: 'bg-red-50 text-red-700 ring-red-600/20' },
  REFUNDED: { label: 'Refunded', className: 'bg-gray-50 text-gray-700 ring-gray-600/20' },
  PARTIALLY_REFUNDED: { label: 'Partial Refund', className: 'bg-orange-50 text-orange-700 ring-orange-600/20' },
}

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus
  type?: 'order' | 'payment'
}

export function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const config =
    type === 'payment'
      ? paymentStatusConfig[status as PaymentStatus]
      : orderStatusConfig[status as OrderStatus]

  if (!config) return <span>{status}</span>

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
