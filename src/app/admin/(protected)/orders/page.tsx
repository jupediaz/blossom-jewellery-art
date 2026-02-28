import Link from 'next/link'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EmptyState } from '@/components/admin/EmptyState'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import type { OrderStatus } from '@/generated/prisma/client'

interface Props {
  searchParams: Promise<{
    status?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 20

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const statusFilter = params.status as OrderStatus | undefined
  const page = Math.max(1, Number(params.page ?? 1))

  const where = statusFilter ? { status: statusFilter } : {}

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      include: {
        customer: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const statuses: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            !statusFilter
              ? 'bg-charcoal text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              statusFilter === s
                ? 'bg-charcoal text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={
            statusFilter
              ? `No orders with status "${statusFilter.toLowerCase()}"`
              : 'Orders will appear here once customers start purchasing'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Items
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-charcoal hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {order.customer?.name || order.guestName || '—'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer?.email || order.guestEmail}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {order._count.items}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                    {format(order.createdAt, 'dd MMM yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/orders?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/orders?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
