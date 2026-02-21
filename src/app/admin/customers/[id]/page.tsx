import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatPrice } from '@/lib/utils'
import { format } from 'date-fns'
import { ArrowLeft, Mail, MapPin, ShoppingCart } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params

  const customer = await db.user.findUnique({
    where: { id, role: 'CUSTOMER' },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true } } },
      },
      addresses: true,
    },
  })

  if (!customer) notFound()

  const totalSpent = customer.orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="rounded-lg p-2 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {customer.name || customer.email}
          </h2>
          <p className="text-sm text-gray-500">
            Customer since {format(customer.createdAt, 'dd MMM yyyy')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-semibold text-gray-900">{customer.orders.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-semibold text-gray-900">{formatPrice(totalSpent)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Avg Order Value</p>
          <p className="text-2xl font-semibold text-gray-900">
            {customer.orders.length > 0
              ? formatPrice(totalSpent / customer.orders.length)
              : '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="flex items-center gap-2 font-medium text-gray-900">
                <ShoppingCart className="h-4 w-4" />
                Order History
              </h3>
            </div>
            {customer.orders.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-500">
                No orders yet
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(order.createdAt, 'dd MMM yyyy')} &middot;{' '}
                        {order._count.items} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="text-sm font-medium">
                        {formatPrice(Number(order.total))}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact & Addresses */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="flex items-center gap-2 font-medium text-gray-900">
                <Mail className="h-4 w-4" />
                Contact
              </h3>
            </div>
            <div className="px-6 py-4 text-sm">
              <p className="text-gray-900">{customer.email}</p>
              {customer.phone && (
                <p className="text-gray-500">{customer.phone}</p>
              )}
              <p className="mt-1 text-gray-500">
                Locale: {customer.locale} &middot; Currency: {customer.currency}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="flex items-center gap-2 font-medium text-gray-900">
                <MapPin className="h-4 w-4" />
                Addresses ({customer.addresses.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {customer.addresses.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-500">No saved addresses</p>
              ) : (
                customer.addresses.map((addr) => (
                  <div key={addr.id} className="px-6 py-3 text-sm">
                    {addr.label && (
                      <p className="font-medium text-gray-900">{addr.label}</p>
                    )}
                    <p className="text-gray-700">
                      {addr.firstName} {addr.lastName}
                    </p>
                    <p className="text-gray-500">{addr.line1}</p>
                    <p className="text-gray-500">
                      {addr.city}, {addr.postalCode} {addr.country}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
